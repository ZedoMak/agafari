import hashlib
import io
import logging
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pypdf import PdfReader
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.ai.change_detector import detect_changes
from app.ai.indexer import delete_source_chunks, index_source
from app.config.settings import settings
from app.database.session import get_db
from app.models import AccessSession, AuditEvent, ChangeLog, Service, Source
from app.models.service import service_sources
from app.schemas.saas import DocumentCreate, DocumentStatusResponse
from app.security import require_access_session

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/admin/documents", tags=["Knowledge Documents"])


async def create_document(
    payload: DocumentCreate,
    session: AccessSession,
    db: AsyncSession,
) -> Source:
    service = None
    if payload.service_id:
        result = await db.execute(
            select(Service)
            .options(selectinload(Service.sources))
            .where(
                Service.id == payload.service_id,
                Service.agency_id == session.agency_id,
            )
        )
        service = result.scalar_one_or_none()
        if service is None:
            raise HTTPException(status_code=404, detail="Program or service not found")

    source = Source(
        id=str(uuid.uuid4()),
        agency_id=session.agency_id,
        source_type=payload.source_type,
        title=payload.title,
        source_url=payload.source_url,
        raw_text_content=payload.raw_text_content,
        visibility=payload.visibility,
        approval_status="PENDING",
        processing_status="PENDING_APPROVAL",
        department=payload.department,
        checksum=hashlib.sha256(payload.raw_text_content.encode()).hexdigest(),
    )
    db.add(source)
    if service is not None:
        service.sources.append(source)
    await db.flush()
    db.add(
        AuditEvent(
            agency_id=session.agency_id,
            event_type="DOCUMENT_UPLOADED",
            target_type="source",
            target_id=source.id,
            details={"visibility": source.visibility, "title": source.title},
        )
    )
    await db.commit()
    await db.refresh(source)
    return source


@router.post("", response_model=DocumentStatusResponse, status_code=201)
async def submit_text_document(
    payload: DocumentCreate,
    session: AccessSession = Depends(require_access_session),
    db: AsyncSession = Depends(get_db),
):
    return await create_document(payload, session, db)


def extract_file_text(content: bytes, content_type: str | None, filename: str) -> str:
    if content_type == "application/pdf" or filename.lower().endswith(".pdf"):
        reader = PdfReader(io.BytesIO(content))
        return "\n\n".join(page.extract_text() or "" for page in reader.pages).strip()
    allowed_suffixes = (".txt", ".md", ".csv", ".json")
    if not filename.lower().endswith(allowed_suffixes):
        raise HTTPException(
            status_code=415,
            detail="Supported uploads are PDF, TXT, Markdown, CSV, and JSON",
        )
    try:
        return content.decode("utf-8").strip()
    except UnicodeDecodeError as exc:
        raise HTTPException(status_code=400, detail="File must use UTF-8 text") from exc


@router.post("/upload", response_model=DocumentStatusResponse, status_code=201)
async def upload_document(
    title: str = Form(...),
    visibility: str = Form(...),
    service_id: str | None = Form(default=None),
    department: str | None = Form(default=None),
    file: UploadFile = File(...),
    session: AccessSession = Depends(require_access_session),
    db: AsyncSession = Depends(get_db),
):
    visibility = visibility.upper()
    if visibility not in {"PUBLIC", "INTERNAL"}:
        raise HTTPException(status_code=422, detail="Visibility must be PUBLIC or INTERNAL")
    content = await file.read(settings.MAX_UPLOAD_BYTES + 1)
    if len(content) > settings.MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Document exceeds the upload limit")
    raw_text = extract_file_text(content, file.content_type, file.filename or "upload")
    if not raw_text:
        raise HTTPException(status_code=422, detail="No readable text found in document")
    payload = DocumentCreate(
        service_id=service_id,
        title=title,
        source_type="PDF" if (file.filename or "").lower().endswith(".pdf") else "FILE",
        raw_text_content=raw_text,
        visibility=visibility,
        department=department,
    )
    return await create_document(payload, session, db)


@router.get("")
async def list_documents(
    session: AccessSession = Depends(require_access_session),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Source)
        .where(Source.agency_id == session.agency_id)
        .order_by(Source.created_at.desc())
    )
    return result.scalars().all()


async def record_detected_changes(source: Source, db: AsyncSession) -> bool:
    """Compare a freshly approved public document against the service it backs.

    Best effort by design: a model outage or a bad response must never undo an
    approval, so every failure is swallowed after logging.
    """
    if source.visibility != "PUBLIC" or not source.raw_text_content:
        return False
    try:
        result = await db.execute(
            select(Service)
            .options(selectinload(Service.requirements))
            .join(service_sources, service_sources.c.service_id == Service.id)
            .where(
                service_sources.c.source_id == source.id,
                Service.agency_id == source.agency_id,
            )
        )
        detected = False
        for service in result.scalars().unique().all():
            analysis = await detect_changes(source.raw_text_content, service)
            if not analysis["changes_detected"]:
                continue
            db.add(
                ChangeLog(
                    id=str(uuid.uuid4()),
                    agency_id=source.agency_id,
                    service_id=service.id,
                    title=f"Update to {service.title}",
                    source_title=source.title,
                    old_data_snapshot=analysis["old_snapshot"],
                    new_data_snapshot=analysis["new_snapshot"],
                    ai_change_summary=analysis["ai_change_summary"],
                    public_notice=analysis["public_notice"] or None,
                    origin="AI_DETECTED",
                    status="PENDING",
                )
            )
            service.verification_status = "NEEDS_REVIEW"
            detected = True
        return detected
    except Exception as exc:
        logger.warning("Change detection after approval failed: %s", exc)
        return False


@router.post("/{document_id}/approve")
async def approve_document(
    document_id: str,
    session: AccessSession = Depends(require_access_session),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Source).where(
            Source.id == document_id,
            Source.agency_id == session.agency_id,
        )
    )
    source = result.scalar_one_or_none()
    if source is None:
        raise HTTPException(status_code=404, detail="Document not found")
    source.approval_status = "APPROVED"
    source.processing_status = "INDEXING"
    try:
        chunk_count = await index_source(source.id, db)
    except Exception as exc:
        source.processing_status = "FAILED"
        await db.commit()
        raise HTTPException(status_code=502, detail="Document indexing failed") from exc
    changes_detected = await record_detected_changes(source, db)
    db.add(
        AuditEvent(
            agency_id=session.agency_id,
            event_type="DOCUMENT_APPROVED",
            target_type="source",
            target_id=source.id,
            details={"chunk_count": chunk_count, "changes_detected": changes_detected},
        )
    )
    await db.commit()
    return {
        "id": source.id,
        "approval_status": source.approval_status,
        "processing_status": source.processing_status,
        "chunk_count": chunk_count,
        "changes_detected": changes_detected,
    }


@router.post("/{document_id}/reject")
async def reject_document(
    document_id: str,
    session: AccessSession = Depends(require_access_session),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Source).where(
            Source.id == document_id,
            Source.agency_id == session.agency_id,
        )
    )
    source = result.scalar_one_or_none()
    if source is None:
        raise HTTPException(status_code=404, detail="Document not found")
    source.approval_status = "REJECTED"
    source.processing_status = "REJECTED"
    await delete_source_chunks(source.id, db)
    db.add(
        AuditEvent(
            agency_id=session.agency_id,
            event_type="DOCUMENT_REJECTED",
            target_type="source",
            target_id=source.id,
        )
    )
    await db.commit()
    return {"id": source.id, "approval_status": source.approval_status}
