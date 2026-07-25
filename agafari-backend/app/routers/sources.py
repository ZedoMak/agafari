import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database.session import get_db
from app.models import AccessSession, Source, Agency, Service, ChangeLog
from app.schemas.source import SourceCreatePayload
from app.ai.indexer import index_source
from app.ai.change_detector import detect_changes
from app.security import require_access_session

router = APIRouter(prefix="/api/v1/sources", tags=["Sources & Ingestion"])


@router.post("")
async def ingest_new_source(
    payload: SourceCreatePayload,
    session: AccessSession = Depends(require_access_session),
    db: AsyncSession = Depends(get_db),
):
    """
    Receives a new official directive or notice from the frontend.
    Chunks + embeds the text into pgvector and triggers AI change detection.
    """
    # 1. Verify the agency exists
    if payload.agency_id != session.agency_id:
        raise HTTPException(status_code=403, detail="Organization scope mismatch")
    result = await db.execute(select(Agency).where(Agency.id == session.agency_id))
    agency = result.scalar_one_or_none()
    if not agency:
        raise HTTPException(status_code=404, detail="Agency not found")

    # 2. Save the new Source to the database
    new_source = Source(
        id=str(uuid.uuid4()),
        agency_id=payload.agency_id,
        source_type=payload.source_type,
        title=payload.title,
        source_url=payload.source_url,
        raw_text_content=payload.raw_text_content,
        visibility="PUBLIC",
        approval_status="APPROVED",
        processing_status="INDEXING",
    )
    db.add(new_source)
    await db.flush()  # Get the ID before indexing

    # 3. If linked to a service, trigger AI processing
    ai_summary = "Source ingested successfully."
    if payload.service_id:
        result = await db.execute(
            select(Service)
            .options(
                selectinload(Service.agency),
                selectinload(Service.requirements),
                selectinload(Service.sources),
            )
            .where(Service.id == payload.service_id)
        )
        service = result.scalar_one_or_none()
        if service:
            # Link source to service
            service.sources.append(new_source)
            await db.flush()

            # 4. Chunk + embed the source into pgvector
            chunk_count = await index_source(new_source.id, db)

            # 5. AI-powered change detection
            try:
                change_result = await detect_changes(
                    new_text=payload.raw_text_content,
                    service=service,
                )
                ai_summary = change_result["ai_change_summary"]

                # Create a ChangeLog with real AI analysis
                change_log = ChangeLog(
                    id=str(uuid.uuid4()),
                    service_id=service.id,
                    source_title=payload.title,
                    old_data_snapshot=change_result["old_snapshot"],
                    new_data_snapshot=change_result["new_snapshot"],
                    ai_change_summary=ai_summary,
                    status="PENDING"
                )
                db.add(change_log)

                # Flag service for review
                service.verification_status = "NEEDS_REVIEW"

            except Exception as e:
                # Graceful degradation — still save the source even if AI fails
                ai_summary = f"Source ingested but AI analysis failed: {str(e)}"
                change_log = ChangeLog(
                    id=str(uuid.uuid4()),
                    service_id=service.id,
                    source_title=payload.title,
                    old_data_snapshot={"fee_etb": float(service.fee_etb)},
                    new_data_snapshot={"raw_text": payload.raw_text_content[:500]},
                    ai_change_summary=ai_summary,
                    status="PENDING"
                )
                db.add(change_log)

    await db.commit()
    return {
        "message": ai_summary,
        "source_id": new_source.id
    }