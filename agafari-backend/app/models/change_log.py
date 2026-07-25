from __future__ import annotations
import uuid
from datetime import datetime
from typing import Dict, Any, TYPE_CHECKING
from sqlalchemy import String, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base

if TYPE_CHECKING:
    from app.models.service import Service

class ChangeLog(Base):
    __tablename__ = "change_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    service_id: Mapped[str] = mapped_column(String(36), ForeignKey("services.id", ondelete="CASCADE"), nullable=False)
    source_title: Mapped[str] = mapped_column(String(255), nullable=False)
    old_data_snapshot: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    new_data_snapshot: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    ai_change_summary: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="PENDING")
    detected_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    service: Mapped[Service] = relationship("Service")