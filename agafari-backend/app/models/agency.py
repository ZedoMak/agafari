from __future__ import annotations
import uuid
from datetime import datetime
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import Boolean, DateTime, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base

if TYPE_CHECKING:
    from app.models.service import Service
    from app.models.office import Office

class Agency(Base):
    __tablename__ = "agencies"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    short_code: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    slug: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, unique=True, index=True)
    logo_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    sector: Mapped[str] = mapped_column(String(80), default="NGO")
    primary_color: Mapped[str] = mapped_column(String(30), default="#175CD3")
    accent_color: Mapped[str] = mapped_column(String(30), default="#12B76A")
    terminology: Mapped[dict] = mapped_column(
        JSON,
        default=lambda: {"service_singular": "Program", "service_plural": "Programs"},
    )
    features: Mapped[dict] = mapped_column(
        JSON,
        default=lambda: {
            "public_chat": True,
            "complaints": True,
            "employee_assistant": True,
            "insights": True,
        },
    )
    contact: Mapped[dict] = mapped_column(JSON, default=dict)
    access_code_hash: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    services: Mapped[List[Service]] = relationship("Service", back_populates="agency", cascade="all, delete")
    offices: Mapped[List[Office]] = relationship("Office", back_populates="agency", cascade="all, delete")