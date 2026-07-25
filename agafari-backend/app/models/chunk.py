"""Chunk model — stores embedded text fragments for pgvector search."""

from __future__ import annotations
import uuid
from typing import Optional, Dict, Any
from sqlalchemy import String, Text, Integer, JSON, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column
from pgvector.sqlalchemy import Vector
from app.database.session import Base
from app.config.settings import settings


class Chunk(Base):
    __tablename__ = "chunks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    source_id: Mapped[str] = mapped_column(String(36), ForeignKey("sources.id", ondelete="CASCADE"), nullable=False, index=True)
    service_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    embedding = mapped_column(Vector(settings.EMBEDDING_DIMENSION))
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    metadata_: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)

    __table_args__ = (
        Index(
            "ix_chunks_embedding_hnsw",
            "embedding",
            postgresql_using="hnsw",
            postgresql_ops={"embedding": "vector_cosine_ops"},
            postgresql_with={"m": 16, "ef_construction": 64},
        ),
    )
