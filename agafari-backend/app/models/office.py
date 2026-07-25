from __future__ import annotations
import uuid
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Text, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base

if TYPE_CHECKING:
    from app.models.agency import Agency
    from app.models.service import Service

class Office(Base):
    __tablename__ = "offices"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    agency_id: Mapped[str] = mapped_column(String(36), ForeignKey("agencies.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    region: Mapped[str] = mapped_column(String(50), default="Addis Ababa")
    sub_city: Mapped[str] = mapped_column(String(100), nullable=False)
    address_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    operating_hours: Mapped[str] = mapped_column(String(150), nullable=False)
    phone_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    agency: Mapped[Agency] = relationship("Agency", back_populates="offices")
    services: Mapped[List[Service]] = relationship("Service", secondary="service_offices", back_populates="offices")