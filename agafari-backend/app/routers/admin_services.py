import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.ai.summarizer import summarize_service
from app.database.session import get_db
from app.models import AccessSession, AuditEvent, Requirement, Service
from app.schemas.saas import (
    AdminServiceCreate,
    AdminServiceSchema,
    AdminServiceUpdate,
    RequirementInput,
    ServiceSummaryResponse,
)
from app.security import require_access_session
from app.utils import next_available_slug, slugify

router = APIRouter(prefix="/api/v1/admin", tags=["Admin Services"])


def service_payload(service: Service) -> AdminServiceSchema:
    requirements = sorted(
        service.requirements or [],
        key=lambda item: (item.order_index or 0, item.title),
    )
    return AdminServiceSchema(
        id=service.id,
        title=service.title,
        slug=service.slug,
        category=service.category,
        summary=service.ai_summary,
        processing_time=service.processing_time,
        fee_etb=float(service.fee_etb or 0),
        is_published=service.is_published,
        verification_status=service.verification_status,
        last_verified_at=service.last_verified_at,
        procedure_steps=service.procedure_steps,
        requirements=[
            {
                "id": item.id,
                "title": item.title,
                "description": item.description,
                "is_mandatory": item.is_mandatory,
                "order_index": item.order_index or 0,
            }
            for item in requirements
        ],
        document_count=len(service.sources or []),
    )


async def unique_slug(db: AsyncSession, title: str) -> str:
    base = slugify(title)
    result = await db.execute(
        select(Service.slug).where(
            or_(Service.slug == base, Service.slug.like(f"{base}-%"))
        )
    )
    return next_available_slug(base, result.scalars().all())


async def load_service(db: AsyncSession, service_id: str, agency_id: str) -> Service:
    result = await db.execute(
        select(Service)
        .options(selectinload(Service.requirements), selectinload(Service.sources))
        .where(Service.id == service_id, Service.agency_id == agency_id)
    )
    service = result.scalar_one_or_none()
    if service is None:
        raise HTTPException(status_code=404, detail="Program or service not found")
    return service


def replace_requirements(service: Service, requirements: List[RequirementInput]) -> None:
    service.requirements.clear()
    for index, item in enumerate(requirements, start=1):
        service.requirements.append(
            Requirement(
                id=str(uuid.uuid4()),
                title=item.title,
                description=item.description,
                is_mandatory=item.is_mandatory,
                order_index=float(index),
            )
        )


@router.get("/services", response_model=List[AdminServiceSchema])
async def list_services(
    session: AccessSession = Depends(require_access_session),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Service)
        .options(selectinload(Service.requirements), selectinload(Service.sources))
        .where(Service.agency_id == session.agency_id)
        .order_by(Service.title)
    )
    return [service_payload(service) for service in result.scalars().unique().all()]


@router.post("/services", response_model=AdminServiceSchema, status_code=201)
async def create_service(
    payload: AdminServiceCreate,
    session: AccessSession = Depends(require_access_session),
    db: AsyncSession = Depends(get_db),
):
    service = Service(
        id=str(uuid.uuid4()),
        agency_id=session.agency_id,
        title=payload.title,
        slug=await unique_slug(db, payload.title),
        category=payload.category,
        ai_summary=payload.summary,
        processing_time=payload.processing_time,
        fee_etb=payload.fee_etb,
        anti_broker_notice=payload.anti_broker_notice,
        is_published=payload.is_published,
        procedure_steps=payload.procedure_steps,
    )
    db.add(service)
    replace_requirements(service, payload.requirements or [])
    await db.flush()
    db.add(
        AuditEvent(
            agency_id=session.agency_id,
            event_type="SERVICE_CREATED",
            target_type="service",
            target_id=service.id,
            details={"title": service.title, "slug": service.slug},
        )
    )
    await db.commit()
    return service_payload(await load_service(db, service.id, session.agency_id))


@router.patch("/services/{service_id}", response_model=AdminServiceSchema)
async def update_service(
    service_id: str,
    payload: AdminServiceUpdate,
    session: AccessSession = Depends(require_access_session),
    db: AsyncSession = Depends(get_db),
):
    service = await load_service(db, service_id, session.agency_id)
    changes = payload.model_dump(exclude_unset=True)

    if "summary" in changes:
        service.ai_summary = changes.pop("summary")
    if "requirements" in changes:
        changes.pop("requirements")
        replace_requirements(service, payload.requirements or [])
    for field, value in changes.items():
        setattr(service, field, value)

    db.add(
        AuditEvent(
            agency_id=session.agency_id,
            event_type="SERVICE_UPDATED",
            target_type="service",
            target_id=service.id,
            details={"fields": sorted(payload.model_dump(exclude_unset=True))},
        )
    )
    await db.commit()
    return service_payload(await load_service(db, service_id, session.agency_id))


@router.delete("/services/{service_id}")
async def delete_service(
    service_id: str,
    session: AccessSession = Depends(require_access_session),
    db: AsyncSession = Depends(get_db),
):
    service = await load_service(db, service_id, session.agency_id)
    title = service.title
    service.sources.clear()
    await db.flush()
    await db.delete(service)
    db.add(
        AuditEvent(
            agency_id=session.agency_id,
            event_type="SERVICE_DELETED",
            target_type="service",
            target_id=service_id,
            details={"title": title},
        )
    )
    await db.commit()
    return {"id": service_id, "deleted": True}


@router.post("/services/{service_id}/summarize", response_model=ServiceSummaryResponse)
async def summarize(
    service_id: str,
    session: AccessSession = Depends(require_access_session),
    db: AsyncSession = Depends(get_db),
):
    service = await load_service(db, service_id, session.agency_id)
    result = await summarize_service(service)
    service.ai_summary = result["summary"]
    service.procedure_steps = result["procedure_steps"]
    await db.commit()
    return ServiceSummaryResponse(**result)
