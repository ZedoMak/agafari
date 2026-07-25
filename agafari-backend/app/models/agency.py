from __future__ import annotations
import uuid
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Text
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
    logo_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    services: Mapped[List[Service]] = relationship("Service", back_populates="agency", cascade="all, delete")
    offices: Mapped[List[Office]] = relationship("Office", back_populates="agency", cascade="all, delete")