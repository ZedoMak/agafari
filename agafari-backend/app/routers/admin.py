import uuid
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.models import AccessSession, ChangeLog, Service
from app.schemas import ChangeLogSchema
from app.schemas.saas import AnnouncementCreate, ChangeLogPublishRequest
from app.security import require_access_session

router = APIRouter(prefix="/api/v1/admin", tags=["Admin Verification"])

CHANGE_LOG_STATUSES = {"PENDING", "APPROVED", "REJECTED", "PUBLISHED"}


def change_log_payload(log: ChangeLog, service_title: str | None) -> ChangeLogSchema:
    return ChangeLogSchema(
        id=log.id,
        service_id=log.service_id,
        service_title=service_title,
        source_title=log.source_title,
        title=log.title,
        old_data_snapshot=log.old_data_snapshot,
        new_data_snapshot=log.new_data_snapshot,
        ai_change_summary=log.ai_change_summary,
        public_notice=log.public_notice,
        status=log.status,
        origin=log.origin,
        detected_at=log.detected_at,
        published_at=log.published_at,
        effective_date=log.effective_date,
    )


async def load_change_log(
    log_id: str,
    session: AccessSession,
    db: AsyncSession,
) -> ChangeLog:
    result = await db.execute(
        select(ChangeLog).where(
            ChangeLog.id == log_id,
            ChangeLog.agency_id == session.agency_id,
        )
    )
    log = result.scalar_one_or_none()
    if not log:
        raise HTTPException(status_code=404, detail="Change log entry not found")
    return log


@router.get("/change-logs", response_model=List[ChangeLogSchema])
async def get_change_logs(
    status: str = Query(default="PENDING"),
    session: AccessSession = Depends(require_access_session),
    db: AsyncSession = Depends(get_db),
):
    """AI-detected policy changes and manual announcements for this organization."""
    status = status.upper()
    if status != "ALL" and status not in CHANGE_LOG_STATUSES:
        raise HTTPException(
            status_code=422,
            detail="Status must be PENDING, APPROVED, REJECTED, PUBLISHED, or ALL",
        )

    query = (
        select(ChangeLog, Service.title)
        .outerjoin(Service, ChangeLog.service_id == Service.id)
        .where(ChangeLog.agency_id == session.agency_id)
        .order_by(ChangeLog.detected_at.desc())
    )
    if status != "ALL":
        query = query.where(ChangeLog.status == status)

    result = await db.execute(query)
    return [change_log_payload(log, service_title) for log, service_title in result.all()]


@router.post("/change-logs/{log_id}/approve")
async def approve_change_log(
    log_id: str,
    session: AccessSession = Depends(require_access_session),
    db: AsyncSession = Depends(get_db),
):
    """
    The WOW Moment: Admin approves a detected change.
    Updates the change log status AND resets the service's verification timestamp.
    """
    log = await load_change_log(log_id, session, db)
    log.status = "APPROVED"

    service = await db.get(Service, log.service_id) if log.service_id else None
    if service:
        service.verification_status = "VERIFIED"
        service.last_verified_at = datetime.utcnow()

    await db.commit()
    return {
        "message": "Change approved. Service status restored to VERIFIED.",
        "service_slug": service.slug if service else None,
    }


@router.post("/change-logs/{log_id}/reject")
async def reject_change_log(
    log_id: str,
    session: AccessSession = Depends(require_access_session),
    db: AsyncSession = Depends(get_db),
):
    """
    Admin rejects a detected change (e.g., if a citizen submitted fake info).
    Updates the log status and restores the service status to VERIFIED.
    """
    log = await load_change_log(log_id, session, db)
    log.status = "REJECTED"

    service = await db.get(Service, log.service_id) if log.service_id else None
    if service:
        pending_result = await db.execute(
            select(ChangeLog.id).where(
                ChangeLog.service_id == service.id,
                ChangeLog.status == "PENDING",
                ChangeLog.id != log.id,
            )
        )
        if not pending_result.first():
            service.verification_status = "VERIFIED"

    await db.commit()
    return {"message": "Change rejected. Service status updated."}


@router.post("/change-logs/{log_id}/publish", response_model=ChangeLogSchema)
async def publish_change_log(
    log_id: str,
    payload: ChangeLogPublishRequest | None = None,
    session: AccessSession = Depends(require_access_session),
    db: AsyncSession = Depends(get_db),
):
    """Publish a notice to the organization's public updates feed."""
    log = await load_change_log(log_id, session, db)
    payload = payload or ChangeLogPublishRequest()

    if payload.title is not None:
        log.title = payload.title
    if payload.public_notice is not None:
        log.public_notice = payload.public_notice
    if payload.effective_date is not None:
        log.effective_date = payload.effective_date

    if not (log.public_notice or "").strip():
        raise HTTPException(
            status_code=422,
            detail="A public_notice is required before publishing this update",
        )

    log.status = "PUBLISHED"
    log.published_at = datetime.utcnow()
    await db.commit()

    service = await db.get(Service, log.service_id) if log.service_id else None
    return change_log_payload(log, service.title if service else None)


@router.post("/change-logs/{log_id}/unpublish", response_model=ChangeLogSchema)
async def unpublish_change_log(
    log_id: str,
    session: AccessSession = Depends(require_access_session),
    db: AsyncSession = Depends(get_db),
):
    log = await load_change_log(log_id, session, db)
    log.published_at = None
    log.status = "APPROVED"
    await db.commit()

    service = await db.get(Service, log.service_id) if log.service_id else None
    return change_log_payload(log, service.title if service else None)


@router.post("/announcements", response_model=ChangeLogSchema, status_code=201)
async def create_announcement(
    payload: AnnouncementCreate,
    session: AccessSession = Depends(require_access_session),
    db: AsyncSession = Depends(get_db),
):
    """A notice written by staff, sharing the review workflow of detected changes."""
    service = None
    if payload.service_id:
        result = await db.execute(
            select(Service).where(
                Service.id == payload.service_id,
                Service.agency_id == session.agency_id,
            )
        )
        service = result.scalar_one_or_none()
        if service is None:
            raise HTTPException(status_code=404, detail="Program or service not found")

    published = payload.publish
    log = ChangeLog(
        id=str(uuid.uuid4()),
        agency_id=session.agency_id,
        service_id=service.id if service else None,
        title=payload.title,
        source_title=payload.title,
        old_data_snapshot={},
        new_data_snapshot={},
        ai_change_summary=payload.public_notice,
        public_notice=payload.public_notice,
        status="PUBLISHED" if published else "PENDING",
        origin="MANUAL",
        effective_date=payload.effective_date,
        published_at=datetime.utcnow() if published else None,
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return change_log_payload(log, service.title if service else None)
