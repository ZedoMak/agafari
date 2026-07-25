import asyncio
import uuid
from datetime import datetime, timezone
from sqlalchemy import text
from app.database.session import async_session, engine, Base
from app.models import Agency, Service, Requirement, Source, Office, ChangeLog


async def seed_database():
    print("🗑️ Dropping existing tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

        print("🏗️ Enabling pgvector & Creating fresh tables in Neon...")
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        try:
            print("🌱 Seeding Agencies...")
            ics = Agency(
                id=str(uuid.uuid4()),
                name="Immigration and Citizenship Service",
                short_code="ICS",
                description="Responsible for passport issuance, entry visas, and citizenship services."
            )
            nidp = Agency(
                id=str(uuid.uuid4()),
                name="National ID Program Ethiopia",
                short_code="NIDP",
                description="Issuing Fayda Digital National ID."
            )
            db.add_all([ics, nidp])
            await db.flush()

            print("🌱 Seeding Official Sources...")
            ics_telegram = Source(
                id=str(uuid.uuid4()),
                agency_id=ics.id,
                source_type="TELEGRAM_CHANNEL",
                title="Official ICS Telegram Notice #2024/08",
                source_url="https://t.me/ethiopia_ics",
                raw_text_content="All passport renewal applicants must present original Kebele ID, old passport, and 2,000 ETB receipt."
            )
            fayda_site = Source(
                id=str(uuid.uuid4()),
                agency_id=nidp.id,
                source_type="GOVT_WEBSITE",
                title="Fayda Registration Portal",
                source_url="https://fayda.et",
                raw_text_content="Fayda registration is free of charge. Requires biometric capture at designated sub-city centers."
            )
            db.add_all([ics_telegram, fayda_site])
            await db.flush()

            print("🌱 Seeding Offices (Addis Ababa Locations)...")
            ics_offices = [
                Office(
                    id=str(uuid.uuid4()), agency_id=ics.id,
                    name="ICS Main HQ (Lideta Branch)", sub_city="Lideta",
                    address_text="Near Lideta Church, Next to High Court",
                    latitude=9.0112, longitude=38.7423,
                    operating_hours="Mon-Fri: 8:30 AM - 5:00 PM"
                ),
                Office(
                    id=str(uuid.uuid4()), agency_id=ics.id,
                    name="ICS Bole Branch (Edna Mall Area)", sub_city="Bole",
                    address_text="Bole Road, Opposite Cameroon Street",
                    latitude=8.9984, longitude=38.7865,
                    operating_hours="Mon-Fri: 8:30 AM - 5:00 PM"
                )
            ]
            db.add_all(ics_offices)
            await db.flush()

            print("🌱 Seeding Services...")
            passport_service = Service(
                id=str(uuid.uuid4()),
                agency_id=ics.id,
                title="Ordinary Passport Renewal",
                slug="passport-renewal",
                category="Immigration",
                ai_summary="Standard 32-page passport renewal for adult citizens. Processed within 5-10 working days.",
                processing_time="5 - 10 working days",
                fee_etb=2000.00,
                payment_channels={"telebirr": True, "cbe_birr": True, "cash": False, "telebirr_code": "48392"},
                anti_broker_notice="⚠️ WARNING: Do NOT pay any individual broker (della). All payments must go through Telebirr/CBE.",
                verification_status="VERIFIED",
                last_verified_at=datetime.now(timezone.utc),
                sources=[ics_telegram],  # Appending directly on creation bypasses the Greenlet error
                offices=ics_offices  # Appending directly on creation bypasses the Greenlet error
            )

            fayda_service = Service(
                id=str(uuid.uuid4()),
                agency_id=nidp.id,
                title="Fayda Digital National ID Registration",
                slug="fayda-national-id",
                category="National ID",
                ai_summary="Primary digital identification for Ethiopian residents. Free registration.",
                processing_time="Same Day (Biometrics)",
                fee_etb=0.00,
                payment_channels={"telebirr": False, "cbe_birr": False, "cash": False},
                anti_broker_notice="Fayda registration is 100% free of charge.",
                verification_status="VERIFIED",
                last_verified_at=datetime.now(timezone.utc),
                sources=[fayda_site]
            )
            db.add_all([passport_service, fayda_service])
            await db.flush()

            print("🌱 Seeding Requirements...")
            reqs = [
                Requirement(
                    id=str(uuid.uuid4()), service_id=passport_service.id,
                    title="Original Kebele Renewal ID or Fayda Number",
                    description="Must be currently valid and issued within your residing sub-city.",
                    is_mandatory=True, order_index=1.0
                ),
                Requirement(
                    id=str(uuid.uuid4()), service_id=passport_service.id,
                    title="Expired / Existing Passport Original",
                    description="Must bring the physical booklet to the counter.",
                    is_mandatory=True, order_index=2.0
                ),
                Requirement(
                    id=str(uuid.uuid4()), service_id=passport_service.id,
                    title="Passport Size Photographs (x2)",
                    photo_specifications="3x4 cm, white background, no eyeglasses/hats unless religious.",
                    is_mandatory=True, order_index=3.0
                )
            ]
            db.add_all(reqs)

            print("🌱 Seeding Admin Demo ChangeLog (WOW Moment)...")
            change_log = ChangeLog(
                id=str(uuid.uuid4()),
                service_id=passport_service.id,
                source_title="ICS Urgent Directive #2026/04",
                old_data_snapshot={"requirements": ["Kebele ID", "Old Passport", "2 Photos"], "fee_etb": 2000.00},
                new_data_snapshot={"requirements": ["Kebele ID", "Old Passport", "2 Photos", "Telebirr Receipt"],
                                   "fee_etb": 2000.00},
                ai_change_summary="New requirement: Telebirr receipt confirmation must now be shown digitally at counter #4.",
                status="PENDING"
            )
            db.add(change_log)

            await db.commit()
            print("✅ Neon PostgreSQL database successfully seeded!")

        except Exception as e:
            print(f"❌ Seeding error: {e}")
            await db.rollback()


if __name__ == "__main__":
    asyncio.run(seed_database())