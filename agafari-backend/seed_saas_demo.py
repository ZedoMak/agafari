"""Idempotent seed for the fictional NGO SaaS pilot.

Run with: python seed_saas_demo.py
Demo organization slug: hope-aid
Demo access code: ngo-demo
"""

import asyncio
import uuid

from sqlalchemy import insert, select
from sqlalchemy.orm import selectinload

from app.ai.insights import record_issue
from app.database.session import async_session, init_db
from app.models import Agency, Complaint, Requirement, Service, Source
from app.models.service import service_sources
from app.security import hash_access_code


async def seed_demo() -> None:
    await init_db()
    async with async_session() as db:
        result = await db.execute(
            select(Agency)
            .options(selectinload(Agency.services))
            .where(Agency.slug == "hope-aid")
        )
        organization = result.scalar_one_or_none()
        if organization is None:
            organization = Agency(
                id=str(uuid.uuid4()),
                name="Hope Aid Ethiopia",
                short_code="HOPE",
                slug="hope-aid",
                sector="NGO",
                description=(
                    "A fictional NGO supporting community livelihoods, youth learning, "
                    "and emergency assistance."
                ),
                primary_color="#175CD3",
                accent_color="#12B76A",
                contact={
                    "email": "info@hope-aid.example",
                    "phone": "+251 11 000 0000",
                    "website": "https://hope-aid.example",
                },
                access_code_hash=hash_access_code("ngo-demo"),
            )
            db.add(organization)
            await db.flush()
        else:
            organization.access_code_hash = hash_access_code("ngo-demo")

        service_result = await db.execute(
            select(Service)
            .options(selectinload(Service.sources))
            .where(
                Service.agency_id == organization.id,
                Service.slug == "community-livelihood-grant",
            )
        )
        service = service_result.scalar_one_or_none()
        if service is None:
            service = Service(
                id=str(uuid.uuid4()),
                agency_id=organization.id,
                title="Community Livelihood Grant",
                slug="community-livelihood-grant",
                category="Livelihoods",
                ai_summary=(
                    "Small grants and training for eligible community groups starting "
                    "or expanding sustainable livelihood projects."
                ),
                processing_time="Applications are reviewed within 20 working days",
                fee_etb=0,
                payment_channels={},
                anti_broker_notice="Applications are free. Do not pay an intermediary.",
                verification_status="VERIFIED",
            )
            db.add(service)
            await db.flush()
            db.add_all(
                [
                    Requirement(
                        service_id=service.id,
                        title="Community group registration",
                        description="A valid local registration or recognition letter.",
                        is_mandatory=True,
                        order_index=1,
                    ),
                    Requirement(
                        service_id=service.id,
                        title="Simple project plan and budget",
                        description="Explain the activity, beneficiaries, costs, and timeline.",
                        is_mandatory=True,
                        order_index=2,
                    ),
                ]
            )

        source_result = await db.execute(
            select(Source).where(
                Source.agency_id == organization.id,
                Source.title == "Community Grant Public Guide",
            )
        )
        if source_result.scalar_one_or_none() is None:
            public_source = Source(
                id=str(uuid.uuid4()),
                agency_id=organization.id,
                source_type="PUBLIC_GUIDE",
                title="Community Grant Public Guide",
                source_url="https://hope-aid.example/programs/community-grant",
                raw_text_content=(
                    "The Community Livelihood Grant supports registered community groups. "
                    "Applicants submit a recognition letter, project plan, and budget. "
                    "Applications are free and reviewed within 20 working days. Shortlisted "
                    "groups are contacted through the official phone number or email."
                ),
                visibility="PUBLIC",
                approval_status="APPROVED",
                processing_status="PENDING",
            )
            db.add(public_source)
            await db.flush()
            await db.execute(
                insert(service_sources).values(
                    service_id=service.id,
                    source_id=public_source.id,
                )
            )

        internal_result = await db.execute(
            select(Source).where(
                Source.agency_id == organization.id,
                Source.title == "Field Travel Approval SOP",
            )
        )
        if internal_result.scalar_one_or_none() is None:
            db.add(
                Source(
                    id=str(uuid.uuid4()),
                    agency_id=organization.id,
                    source_type="INTERNAL_SOP",
                    title="Field Travel Approval SOP",
                    raw_text_content=(
                        "Employees submit a travel request to their line manager at least "
                        "five working days before departure. The Operations Manager confirms "
                        "the security and vehicle plan. Finance approves the budget only after "
                        "both approvals are recorded. Emergency travel requires Country "
                        "Director approval and written justification."
                    ),
                    visibility="INTERNAL",
                    approval_status="APPROVED",
                    processing_status="PENDING",
                    department="Operations",
                )
            )

        complaint_count = await db.scalar(
            select(Complaint).where(Complaint.agency_id == organization.id).limit(1)
        )
        if complaint_count is None:
            examples = [
                "I submitted the grant form but did not receive a status update.",
                "Our group applied last week and cannot find where to track the application.",
            ]
            for text in examples:
                db.add(
                    Complaint(
                        agency_id=organization.id,
                        service_id=service.id,
                        category="BENEFICIARY_COMMUNICATION",
                        severity="MEDIUM",
                        description=text,
                    )
                )
                await record_issue(
                    db,
                    agency_id=organization.id,
                    service_id=service.id,
                    source_kind="COMPLAINT",
                    category="BENEFICIARY_COMMUNICATION",
                    example=text,
                )

        await db.commit()
        print("Seeded Hope Aid Ethiopia")
        print("Organization slug: hope-aid")
        print("Access code: ngo-demo")


if __name__ == "__main__":
    asyncio.run(seed_demo())
