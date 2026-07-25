from __future__ import annotations
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any, TYPE_CHECKING
from sqlalchemy import String, Text, Numeric, Boolean, DateTime, ForeignKey, Table, JSON, Float, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base

if TYPE_CHECKING:
    from app.models.agency import Agency
    from app.models.office import Office

# Many-to-Many Junction Tables
service_offices = Table(
    'service_offices',
    Base.metadata,
    Column('service_id', String(36), ForeignKey('services.id', ondelete='CASCADE'), primary_key=True),
    Column('office_id', String(36), ForeignKey('offices.id', ondelete='CASCADE'), primary_key=True)
)

service_sources = Table(
    'service_sources',
    Base.metadata,
    Column('service_id', String(36), ForeignKey('services.id', ondelete='CASCADE'), primary_key=True),
    Column('source_id', String(36), ForeignKey('sources.id', ondelete='CASCADE'), primary_key=True)
)

class Service(Base):
    __tablename__ = "services"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    agency_id: Mapped[str] = mapped_column(String(36), ForeignKey("agencies.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(200), nullable=False, unique=True)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    ai_summary: Mapped[str] = mapped_column(Text, nullable=False)
    processing_time: Mapped[str] = mapped_column(String(100), nullable=False)
    fee_etb: Mapped[float] = mapped_column(Numeric(10, 2), default=0.00)
    payment_channels: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, default={"telebirr": True, "cbe_birr": True, "cash": False})
    anti_broker_notice: Mapped[str] = mapped_column(Text, nullable=False)
    verification_status: Mapped[str] = mapped_column(String(20), default="VERIFIED")
    last_verified_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    agency: Mapped[Agency] = relationship("Agency", back_populates="services")
    requirements: Mapped[List[Requirement]] = relationship("Requirement", back_populates="service", cascade="all, delete")
    sources: Mapped[List[Source]] = relationship("Source", secondary=service_sources, backref="services")
    offices: Mapped[List[Office]] = relationship("Office", secondary=service_offices, back_populates="services")

class Requirement(Base):
    __tablename__ = "service_requirements"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    service_id: Mapped[str] = mapped_column(String(36), ForeignKey("services.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_mandatory: Mapped[bool] = mapped_column(Boolean, default=True)
    photo_specifications: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    order_index: Mapped[float] = mapped_column(Float, default=1.0)

    service: Mapped[Service] = relationship("Service", back_populates="requirements")

class Source(Base):
    __tablename__ = "sources"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    agency_id: Mapped[str] = mapped_column(String(36), ForeignKey("agencies.id", ondelete="CASCADE"), nullable=False)
    source_type: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    source_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    raw_text_content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)