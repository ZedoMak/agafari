from __future__ import annotations
import uuid
from datetime import datetime
from typing import Dict, Any, Optional, TYPE_CHECKING
from sqlalchemy import String, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base

if TYPE_CHECKING:
    from app.models.service import Service

class ChangeLog(Base):
    """An AI-detected policy change or a manually written announcement.

    Both share the review/publish workflow, so `origin` distinguishes them and
    `service_id` stays empty for organization-wide notices.
    """

    __tablename__ = "change_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    agency_id: Mapped[str] = mapped_column(String(36), ForeignKey("agencies.id", ondelete="CASCADE"), nullable=False, index=True)
    service_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("services.id", ondelete="CASCADE"), nullable=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    source_title: Mapped[str] = mapped_column(String(255), nullable=False)
    old_data_snapshot: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    new_data_snapshot: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    ai_change_summary: Mapped[str] = mapped_column(Text, nullable=False)
    public_notice: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="PENDING")
    origin: Mapped[str] = mapped_column(String(20), nullable=False, default="AI_DETECTED")
    detected_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True, index=True)
    effective_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    service: Mapped[Optional[Service]] = relationship("Service")
