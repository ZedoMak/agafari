from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.models import Agency, Service
from app.schemas.saas import OrganizationBootstrap

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
    result = await db.execute(
        select(Agency).where(
            or_(Agency.slug == slug, Agency.short_code == slug),
            Agency.is_active.is_(True),
        )
    )
    organization = result.scalar_one_or_none()
    if organization is None:
        raise HTTPException(status_code=404, detail="Organization not found")
    return organization_payload(organization)


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
