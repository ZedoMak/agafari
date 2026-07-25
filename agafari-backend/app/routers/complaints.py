from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.insights import record_issue
from app.database.session import get_db
from app.models import AccessSession, Agency, AuditEvent, Complaint, Service
from app.schemas.saas import ComplaintCreate, ComplaintResponse, ComplaintUpdate
from app.security import require_access_session

router = APIRouter(tags=["Complaints and Feedback"])


@router.post(
    "/api/v1/public/complaints",
    response_model=ComplaintResponse,
    status_code=201,
)
async def submit_complaint(
    payload: ComplaintCreate,
    db: AsyncSession = Depends(get_db),
):
    organization = await db.get(Agency, payload.organization_id)
    if organization is None or not organization.is_active:
        raise HTTPException(status_code=404, detail="Organization not found")
    if payload.service_id:
        service_result = await db.execute(
            select(Service).where(
                Service.id == payload.service_id,
                Service.agency_id == payload.organization_id,
            )
        )
        if service_result.scalar_one_or_none() is None:
            raise HTTPException(status_code=404, detail="Program or service not found")

    complaint = Complaint(
        agency_id=payload.organization_id,
        service_id=payload.service_id,
        category=payload.category.upper(),
        severity=payload.severity,
        description=payload.description,
        contact=payload.contact.model_dump() if payload.contact else None,
        consent_to_contact=payload.consent_to_contact,
    )
    db.add(complaint)
    await db.flush()
    await record_issue(
        db,
        agency_id=payload.organization_id,
        service_id=payload.service_id,
        source_kind="COMPLAINT",
        category=complaint.category,
        example=payload.description,
    )
    await db.commit()
    await db.refresh(complaint)
    return complaint


@router.get("/api/v1/admin/complaints")
async def list_complaints(
    status: str | None = Query(default=None),
    severity: str | None = Query(default=None),
    session: AccessSession = Depends(require_access_session),
    db: AsyncSession = Depends(get_db),
):
    query = select(Complaint).where(Complaint.agency_id == session.agency_id)
    if status:
        query = query.where(Complaint.status == status.upper())
    if severity:
        query = query.where(Complaint.severity == severity.upper())
    result = await db.execute(query.order_by(Complaint.created_at.desc()))
    return result.scalars().all()


@router.patch("/api/v1/admin/complaints/{complaint_id}")
async def update_complaint(
    complaint_id: str,
    payload: ComplaintUpdate,
    session: AccessSession = Depends(require_access_session),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Complaint).where(
            Complaint.id == complaint_id,
            Complaint.agency_id == session.agency_id,
        )
    )
    complaint = result.scalar_one_or_none()
    if complaint is None:
        raise HTTPException(status_code=404, detail="Complaint not found")
    complaint.status = payload.status
    complaint.resolution_note = payload.resolution_note
    db.add(
        AuditEvent(
            agency_id=session.agency_id,
            event_type="COMPLAINT_UPDATED",
            target_type="complaint",
            target_id=complaint.id,
            details={"status": payload.status},
        )
    )
    await db.commit()
    return {"id": complaint.id, "status": complaint.status}
