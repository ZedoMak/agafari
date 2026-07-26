from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.models import AccessSession, Agency, AuditEvent, ChangeLog, Service
from app.schemas.saas import (
    OrganizationBootstrap,
    OrganizationSettingsUpdate,
    OrganizationUpdateItem,
)
from app.security import require_access_session

router = APIRouter(prefix="/api/v1/organizations", tags=["Organizations"])


def organization_payload(organization: Agency) -> OrganizationBootstrap:
    slug = organization.slug or organization.short_code
    return OrganizationBootstrap(
        id=organization.id,
        slug=slug,
        name=organization.name,
        short_code=organization.short_code,
        sector=organization.sector,
        logo_url=organization.logo_url,
        description=organization.description,
        theme={
            "primary": organization.primary_color,
            "accent": organization.accent_color,
        },
        terminology=organization.terminology or {
            "service_singular": "Program",
            "service_plural": "Programs",
        },
        features=organization.features or {},
        contact=organization.contact or {},
    )


async def load_organization(slug: str, db: AsyncSession) -> Agency:
    result = await db.execute(
        select(Agency).where(
            or_(Agency.slug == slug, Agency.short_code == slug),
            Agency.is_active.is_(True),
        )
    )
    organization = result.scalar_one_or_none()
    if organization is None:
        raise HTTPException(status_code=404, detail="Organization not found")
    return organization


@router.get("")
async def list_organizations(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Agency).where(Agency.is_active.is_(True)).order_by(Agency.name)
    )
    return [organization_payload(item) for item in result.scalars().all()]


@router.get("/{slug}/bootstrap", response_model=OrganizationBootstrap)
async def get_organization_bootstrap(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    return organization_payload(await load_organization(slug, db))


@router.patch("/{slug}", response_model=OrganizationBootstrap)
async def update_organization(
    slug: str,
    payload: OrganizationSettingsUpdate,
    session: AccessSession = Depends(require_access_session),
    db: AsyncSession = Depends(get_db),
):
    organization = await load_organization(slug, db)
    if organization.id != session.agency_id:
        raise HTTPException(status_code=403, detail="Organization scope mismatch")

    changes = payload.model_dump(exclude_unset=True, exclude_none=True)
    for field in ("terminology", "features", "contact"):
        # Nested settings are patched key by key so a partial body cannot wipe
        # the values the dashboard did not send.
        incoming = changes.pop(field, None)
        if incoming:
            setattr(organization, field, {**(getattr(organization, field) or {}), **incoming})
    for field, value in changes.items():
        setattr(organization, field, value)

    db.add(
        AuditEvent(
            agency_id=session.agency_id,
            event_type="ORGANIZATION_UPDATED",
            target_type="agency",
            target_id=organization.id,
            details={"fields": sorted(payload.model_dump(exclude_unset=True))},
        )
    )
    await db.commit()
    await db.refresh(organization)
    return organization_payload(organization)


@router.get("/{slug}/updates", response_model=List[OrganizationUpdateItem])
async def list_organization_updates(
    slug: str,
    limit: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    organization = await load_organization(slug, db)
    result = await db.execute(
        select(ChangeLog, Service.title, Service.slug)
        .outerjoin(Service, ChangeLog.service_id == Service.id)
        .where(
            ChangeLog.agency_id == organization.id,
            ChangeLog.published_at.isnot(None),
        )
        .order_by(ChangeLog.published_at.desc())
        .limit(limit)
    )
    return [
        OrganizationUpdateItem(
            id=log.id,
            title=log.title,
            summary=log.public_notice or log.ai_change_summary,
            service_id=log.service_id,
            service_title=service_title,
            service_slug=service_slug,
            published_at=log.published_at,
            effective_date=log.effective_date,
            origin=log.origin,
        )
        for log, service_title, service_slug in result.all()
    ]


@router.get("/{slug}/services")
async def list_organization_services(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Service, Agency.short_code)
        .join(Agency, Service.agency_id == Agency.id)
        .where(
            or_(Agency.slug == slug, Agency.short_code == slug),
            Agency.is_active.is_(True),
        )
        .order_by(Service.title)
    )
    return [
        {
            "id": service.id,
            "title": service.title,
            "slug": service.slug,
            "category": service.category,
            "organization_code": short_code,
            "summary": service.ai_summary,
            "processing_time": service.processing_time,
            "verification_status": service.verification_status,
            "last_verified_at": service.last_verified_at,
        }
        for service, short_code in result.all()
    ]
