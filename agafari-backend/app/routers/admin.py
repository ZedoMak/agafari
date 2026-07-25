from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from typing import List
from app.database.session import get_db
from app.models import AccessSession, ChangeLog, Service
from app.schemas import ChangeLogSchema
from app.security import require_access_session

router = APIRouter(prefix="/api/v1/admin", tags=["Admin Verification"])


@router.get("/change-logs", response_model=List[ChangeLogSchema])
async def get_pending_change_logs(
    session: AccessSession = Depends(require_access_session),
    db: AsyncSession = Depends(get_db),
):
    """
    Fetches all unapproved AI-detected policy changes.
    """
    result = await db.execute(
        select(ChangeLog)
        .join(Service, ChangeLog.service_id == Service.id)
        .where(
            ChangeLog.status == "PENDING",
            Service.agency_id == session.agency_id,
        )
    )
    logs = result.scalars().all()

    results = []
    for log in logs:
        # Fetch the related service title
        svc_result = await db.execute(select(Service.title).where(Service.id == log.service_id))
        svc_row = svc_result.first()
        log_dict = {
            "id": log.id,
            "service_id": log.service_id,
            "service_title": svc_row[0] if svc_row else "Unknown",
            "source_title": log.source_title,
            "old_data_snapshot": log.old_data_snapshot,
            "new_data_snapshot": log.new_data_snapshot,
            "ai_change_summary": log.ai_change_summary,
            "status": log.status,
            "detected_at": log.detected_at,
        }
        results.append(ChangeLogSchema(**log_dict))
    return results


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
    result = await db.execute(
        select(ChangeLog)
        .join(Service, ChangeLog.service_id == Service.id)
        .where(
            ChangeLog.id == log_id,
            Service.agency_id == session.agency_id,
        )
    )
    log = result.scalar_one_or_none()
    if not log:
        raise HTTPException(status_code=404, detail="Change log entry not found")

    # 1. Update ChangeLog Status
    log.status = "APPROVED"

    # 2. Update actual Service verification status
    svc_result = await db.execute(select(Service).where(Service.id == log.service_id))
    service = svc_result.scalar_one_or_none()
    if service:
        service.verification_status = "VERIFIED"
        service.last_verified_at = datetime.utcnow()

    await db.commit()
    return {
        "message": "Change approved. Service status restored to VERIFIED.",
        "service_slug": service.slug if service else None
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
    result = await db.execute(
        select(ChangeLog)
        .join(Service, ChangeLog.service_id == Service.id)
        .where(
            ChangeLog.id == log_id,
            Service.agency_id == session.agency_id,
        )
    )
    log = result.scalar_one_or_none()
    if not log:
        raise HTTPException(status_code=404, detail="Change log entry not found")

    # 1. Mark the log as REJECTED
    log.status = "REJECTED"

    # 2. Restore the service verification status
    svc_result = await db.execute(select(Service).where(Service.id == log.service_id))
    service = svc_result.scalar_one_or_none()
    if service:
        # Check if there are any other PENDING logs for this service
        pending_result = await db.execute(
            select(ChangeLog).where(
                ChangeLog.service_id == service.id,
                ChangeLog.status == "PENDING"
            )
        )
        pending_count = len(pending_result.scalars().all())

        if pending_count == 0:
            service.verification_status = "VERIFIED"

    await db.commit()
    return {"message": "Change rejected. Service status updated."}