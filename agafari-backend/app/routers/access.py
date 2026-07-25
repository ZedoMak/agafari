from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.settings import settings
from app.database.session import get_db
from app.models import AccessSession, Agency, AuditEvent
from app.schemas.saas import AccessSessionRequest, AccessSessionResponse
from app.security import issue_session_token, require_access_session, verify_access_code

router = APIRouter(prefix="/api/v1/access", tags=["Organization Access"])


@router.post("/session", response_model=AccessSessionResponse)
async def create_access_session(
    payload: AccessSessionRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Agency).where(
            or_(
                Agency.slug == payload.organization_slug,
                Agency.short_code == payload.organization_slug,
            ),
            Agency.is_active.is_(True),
        )
    )
    organization = result.scalar_one_or_none()
    if organization is None or not verify_access_code(
        payload.access_code, organization.access_code_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid organization or access code",
        )

    token, token_hash = issue_session_token()
    expires_at = datetime.utcnow() + timedelta(hours=settings.ACCESS_SESSION_TTL_HOURS)
    session = AccessSession(
        agency_id=organization.id,
        token_hash=token_hash,
        expires_at=expires_at,
    )
    db.add(session)
    await db.flush()
    db.add(
        AuditEvent(
            agency_id=organization.id,
            event_type="ACCESS_SESSION_CREATED",
            target_type="access_session",
            target_id=session.id,
        )
    )
    await db.commit()
    return AccessSessionResponse(
        access_token=token,
        expires_at=expires_at,
        organization_id=organization.id,
    )


@router.delete("/session", status_code=204)
async def revoke_access_session(
    session: AccessSession = Depends(require_access_session),
    db: AsyncSession = Depends(get_db),
):
    session.revoked_at = datetime.utcnow()
    db.add(
        AuditEvent(
            agency_id=session.agency_id,
            event_type="ACCESS_SESSION_REVOKED",
            target_type="access_session",
            target_id=session.id,
        )
    )
    await db.commit()
