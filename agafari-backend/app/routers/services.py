from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from app.database.session import get_db
from app.models import Service, Agency
from app.schemas import ServiceFeedSchema, ServiceDetailSchema

router = APIRouter(prefix="/api/v1/services", tags=["Services"])


@router.get("", response_model=List[ServiceFeedSchema])
async def get_services(
        category: Optional[str] = None,
        q: Optional[str] = None,
        db: AsyncSession = Depends(get_db)
):
    """
    Returns a lightweight list of services for the main app feed.
    Can be filtered by category or search query.
    """
    query = select(
        Service.id,
        Service.title,
        Service.slug,
        Service.category,
        Agency.short_code.label("agency_code"),
        Service.fee_etb,
        Service.processing_time,
        Service.verification_status,
        Service.last_verified_at
    ).join(Agency, Service.agency_id == Agency.id)

    if category:
        query = query.where(Service.category == category)
    if q:
        query = query.where(Service.title.ilike(f"%{q}%"))

    result = await db.execute(query)
    return result.all()


@router.get("/{slug}", response_model=ServiceDetailSchema)
async def get_service_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    """
    Returns the complete guide for a specific service, including requirements and sources.
    """
    result = await db.execute(
        select(Service)
        .options(
            selectinload(Service.agency),
            selectinload(Service.requirements),
            selectinload(Service.sources),
        )
        .where(Service.slug == slug)
    )
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Service guide not found")

    # Inject the agency short code dynamically for the frontend header
    service.agency_code = service.agency.short_code
    return service