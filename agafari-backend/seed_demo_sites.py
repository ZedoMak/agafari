"""Idempotent seed for additional Clarity demo tenants.

Each organization below runs the same Clarity template with different branding,
wording, and content — proving customization without a second template.

Run with: python seed_demo_sites.py

    metro-health  · access code care-demo
    lumen-city    · access code civic-demo
    northbridge   · access code campus-demo

All content is synthetic.
"""

import asyncio
import uuid
from typing import Any

from sqlalchemy import insert, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.ai.insights import record_issue
from app.database.session import async_session, init_db
from app.models import Agency, Complaint, Requirement, Service, Source
from app.models.service import service_sources
from app.security import hash_access_code

DEMO_TENANTS: list[dict[str, Any]] = [
    {
        "slug": "metro-health",
        "name": "Metro Health Clinic",
        "short_code": "METRO",
        "sector": "Healthcare",
        "description": (
            "A fictional community clinic explaining visits, preparation steps, "
            "and patient services."
        ),
        "primary_color": "#0d7490",
        "accent_color": "#14a2b8",
        "terminology": {"service_singular": "Service", "service_plural": "Services"},
        "contact": {
            "email": "care@metro-health.example",
            "phone": "+251 11 111 1111",
            "website": "https://metro-health.example",
        },
        "access_code": "care-demo",
        "services": [
            {
                "title": "New Patient Visit",
                "slug": "new-patient-visit",
                "category": "Outpatient",
                "summary": (
                    "Registration and first consultation for patients visiting the "
                    "clinic for the first time."
                ),
                "processing_time": "Same-day appointments close at 15:00",
                "requirements": [
                    ("Photo identification", "Any government-issued ID for registration."),
                    ("Referral or previous records", "Bring earlier test results if you have them."),
                ],
            },
            {
                "title": "Laboratory Results Access",
                "slug": "laboratory-results-access",
                "category": "Diagnostics",
                "summary": (
                    "How to collect laboratory results and who can request them on "
                    "a patient's behalf."
                ),
                "processing_time": "Most results are ready within 48 hours",
                "requirements": [
                    ("Laboratory receipt", "The slip issued when samples were taken."),
                ],
            },
        ],
        "public_doc": {
            "title": "Patient Visit Guide",
            "type": "PUBLIC_GUIDE",
            "url": "https://metro-health.example/visit-guide",
            "text": (
                "New patients register at the front desk with a photo ID. Registration "
                "closes at 15:00 for same-day consultations. Fasting is required for "
                "cholesterol and glucose tests, and patients should avoid food for eight "
                "hours before sampling. Laboratory results are normally ready within 48 "
                "hours and can be collected with the laboratory receipt. A family member "
                "may collect results only with a signed authorisation letter."
            ),
        },
        "internal_doc": {
            "title": "Triage Escalation SOP",
            "type": "INTERNAL_SOP",
            "department": "Clinical",
            "text": (
                "Reception assigns every walk-in patient a triage level within ten "
                "minutes of arrival. Level one cases go directly to the emergency bay and "
                "the duty physician is paged. Level two cases are reviewed by the senior "
                "nurse before queueing. Staff record every escalation in the shift log and "
                "the clinical lead reviews the log at handover."
            ),
        },
        "complaints": [
            (
                "I waited two hours for my lab results and nobody explained the delay.",
                "SERVICE_DELAY",
            ),
        ],
    },
    {
        "slug": "lumen-city",
        "name": "Lumen City Services",
        "short_code": "LUMEN",
        "sector": "Municipality",
        "description": (
            "A fictional city office publishing permits, collection schedules, and "
            "resident guidance."
        ),
        "primary_color": "#1f4d7a",
        "accent_color": "#2f6b3a",
        "terminology": {"service_singular": "Service", "service_plural": "City services"},
        "contact": {
            "email": "hello@lumen-city.example",
            "phone": "+251 11 222 2222",
            "website": "https://lumen-city.example",
        },
        "access_code": "civic-demo",
        "services": [
            {
                "title": "Business Permit Renewal",
                "slug": "business-permit-renewal",
                "category": "Permits",
                "summary": (
                    "Annual renewal of trade permits for businesses operating inside the "
                    "city boundary."
                ),
                "processing_time": "Decisions are issued within 10 working days",
                "requirements": [
                    ("Current permit number", "Printed on last year's certificate."),
                    ("Tax clearance", "Issued by the revenue office in the last 90 days."),
                ],
            },
            {
                "title": "Waste Collection Schedule",
                "slug": "waste-collection-schedule",
                "category": "Sanitation",
                "summary": (
                    "Collection days by district, plus how to report a missed pickup."
                ),
                "processing_time": "Missed collections are recovered within 2 working days",
                "requirements": [
                    ("District name", "Used to look up your collection day."),
                ],
            },
        ],
        "public_doc": {
            "title": "Permits and Collections Notice",
            "type": "PUBLIC_GUIDE",
            "url": "https://lumen-city.example/notices/permits",
            "text": (
                "Business permits are renewed annually before 30 June. Applicants provide "
                "their current permit number and a tax clearance issued within the last "
                "ninety days. Renewal decisions are issued within ten working days and no "
                "payment is made to an intermediary. Household waste is collected on "
                "Tuesdays in the north district and Thursdays in the south district. "
                "Missed collections reported before 16:00 are recovered within two working "
                "days."
            ),
        },
        "internal_doc": {
            "title": "Permit Review Checklist",
            "type": "INTERNAL_SOP",
            "department": "Licensing",
            "text": (
                "Officers verify the applicant's tax clearance date before opening a "
                "review file. Applications with clearances older than ninety days are "
                "returned the same day with a written reason. Any inspection finding is "
                "recorded against the permit number, and the licensing supervisor signs "
                "off before a certificate is printed."
            ),
        },
        "complaints": [
            (
                "Our district was skipped twice this month and the hotline never answered.",
                "SERVICE_DELAY",
            ),
        ],
    },
    {
        "slug": "northbridge",
        "name": "Northbridge University",
        "short_code": "NBU",
        "sector": "Education",
        "description": (
            "A fictional university explaining admissions, fees, and student services."
        ),
        "primary_color": "#4c3fa8",
        "accent_color": "#6d5ce0",
        "terminology": {
            "service_singular": "Programme",
            "service_plural": "Programmes",
        },
        "contact": {
            "email": "admissions@northbridge.example",
            "phone": "+251 11 333 3333",
            "website": "https://northbridge.example",
        },
        "access_code": "campus-demo",
        "services": [
            {
                "title": "Undergraduate Admission",
                "slug": "undergraduate-admission",
                "category": "Admissions",
                "summary": (
                    "Entry requirements, deadlines, and document checklist for "
                    "undergraduate applicants."
                ),
                "processing_time": "Offers are released within 3 weeks of the deadline",
                "requirements": [
                    ("Secondary school results", "Original transcript and certificate."),
                    ("Personal statement", "One page explaining your choice of programme."),
                ],
            },
            {
                "title": "Tuition Payment Plan",
                "slug": "tuition-payment-plan",
                "category": "Student finance",
                "summary": (
                    "How to split tuition across instalments and what happens if a "
                    "payment is late."
                ),
                "processing_time": "Plans are confirmed within 5 working days",
                "requirements": [
                    ("Student number", "Issued after registration."),
                ],
            },
        ],
        "public_doc": {
            "title": "Admissions and Fees Handbook",
            "type": "PUBLIC_GUIDE",
            "url": "https://northbridge.example/handbook",
            "text": (
                "Undergraduate applications close on 15 August. Applicants submit an "
                "original secondary school transcript, a certificate, and a one-page "
                "personal statement. Offers are released within three weeks of the "
                "deadline. Tuition may be split into three instalments due at the start of "
                "each term. A payment plan is confirmed within five working days, and late "
                "instalments carry a two-week grace period before registration is held."
            ),
        },
        "internal_doc": {
            "title": "Fee Waiver Review SOP",
            "type": "INTERNAL_SOP",
            "department": "Student finance",
            "text": (
                "Waiver requests are screened by the finance officer against household "
                "income evidence before reaching the committee. Incomplete files are "
                "returned within three working days with the missing item named. The "
                "committee meets fortnightly, and the registrar records every decision "
                "against the student number."
            ),
        },
        "complaints": [
            (
                "I asked about instalments twice and received two different answers.",
                "INCONSISTENT_INFORMATION",
            ),
        ],
    },
]


async def upsert_tenant(db: AsyncSession, spec: dict[str, Any]) -> None:
    result = await db.execute(
        select(Agency)
        .options(selectinload(Agency.services))
        .where(Agency.slug == spec["slug"])
    )
    organization = result.scalar_one_or_none()

    if organization is None:
        organization = Agency(
            id=str(uuid.uuid4()),
            name=spec["name"],
            short_code=spec["short_code"],
            slug=spec["slug"],
            sector=spec["sector"],
            description=spec["description"],
            primary_color=spec["primary_color"],
            accent_color=spec["accent_color"],
            terminology=spec["terminology"],
            features={
                "public_chat": True,
                "complaints": True,
                "employee_assistant": True,
                "insights": True,
            },
            contact=spec["contact"],
            access_code_hash=hash_access_code(spec["access_code"]),
        )
        db.add(organization)
        await db.flush()
    else:
        organization.name = spec["name"]
        organization.sector = spec["sector"]
        organization.description = spec["description"]
        organization.primary_color = spec["primary_color"]
        organization.accent_color = spec["accent_color"]
        organization.terminology = spec["terminology"]
        organization.contact = spec["contact"]
        organization.access_code_hash = hash_access_code(spec["access_code"])

    first_service: Service | None = None

    for service_spec in spec["services"]:
        service_result = await db.execute(
            select(Service).where(
                Service.agency_id == organization.id,
                Service.slug == service_spec["slug"],
            )
        )
        service = service_result.scalar_one_or_none()
        if service is None:
            service = Service(
                id=str(uuid.uuid4()),
                agency_id=organization.id,
                title=service_spec["title"],
                slug=service_spec["slug"],
                category=service_spec["category"],
                ai_summary=service_spec["summary"],
                processing_time=service_spec["processing_time"],
                fee_etb=0,
                payment_channels={},
                anti_broker_notice=(
                    "This service is handled directly by our office. "
                    "Do not pay an intermediary."
                ),
                verification_status="VERIFIED",
            )
            db.add(service)
            await db.flush()
            db.add_all(
                [
                    Requirement(
                        service_id=service.id,
                        title=title,
                        description=description,
                        is_mandatory=True,
                        order_index=index + 1,
                    )
                    for index, (title, description) in enumerate(
                        service_spec["requirements"]
                    )
                ]
            )
        if first_service is None:
            first_service = service

    public_spec = spec["public_doc"]
    public_result = await db.execute(
        select(Source).where(
            Source.agency_id == organization.id,
            Source.title == public_spec["title"],
        )
    )
    if public_result.scalar_one_or_none() is None:
        public_source = Source(
            id=str(uuid.uuid4()),
            agency_id=organization.id,
            source_type=public_spec["type"],
            title=public_spec["title"],
            source_url=public_spec.get("url"),
            raw_text_content=public_spec["text"],
            visibility="PUBLIC",
            approval_status="APPROVED",
            processing_status="PENDING",
        )
        db.add(public_source)
        await db.flush()
        if first_service is not None:
            await db.execute(
                insert(service_sources).values(
                    service_id=first_service.id,
                    source_id=public_source.id,
                )
            )

    internal_spec = spec["internal_doc"]
    internal_result = await db.execute(
        select(Source).where(
            Source.agency_id == organization.id,
            Source.title == internal_spec["title"],
        )
    )
    if internal_result.scalar_one_or_none() is None:
        internal_source = Source(
            id=str(uuid.uuid4()),
            agency_id=organization.id,
            source_type=internal_spec["type"],
            title=internal_spec["title"],
            raw_text_content=internal_spec["text"],
            visibility="INTERNAL",
            approval_status="APPROVED",
            processing_status="PENDING",
            department=internal_spec.get("department"),
        )
        db.add(internal_source)
        await db.flush()
        # Linked so staff can ask about this service and reach internal text;
        # visibility still keeps it away from the public assistant.
        if first_service is not None:
            await db.execute(
                insert(service_sources).values(
                    service_id=first_service.id,
                    source_id=internal_source.id,
                )
            )

    existing_complaint = await db.scalar(
        select(Complaint).where(Complaint.agency_id == organization.id).limit(1)
    )
    if existing_complaint is None:
        for description, category in spec["complaints"]:
            db.add(
                Complaint(
                    agency_id=organization.id,
                    service_id=first_service.id if first_service else None,
                    category=category,
                    severity="MEDIUM",
                    description=description,
                )
            )
            await record_issue(
                db,
                agency_id=organization.id,
                service_id=first_service.id if first_service else None,
                source_kind="COMPLAINT",
                category=category,
                example=description,
            )

    print(f"Seeded {spec['name']} → /sites/{spec['slug']} (code: {spec['access_code']})")


async def seed_demo_sites() -> None:
    await init_db()
    async with async_session() as db:
        for spec in DEMO_TENANTS:
            await upsert_tenant(db, spec)
        await db.commit()
    print(f"\n{len(DEMO_TENANTS)} demo sites ready. All content is synthetic.")


if __name__ == "__main__":
    asyncio.run(seed_demo_sites())
