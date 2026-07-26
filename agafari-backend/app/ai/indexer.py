"""Source indexer — chunks and embeds Source records into the chunks table."""

import uuid
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.chunk import Chunk
from app.models.service import Source, service_sources
from app.ai.splitter import chunk_text
from app.ai import embedding as embed_client


async def index_source(source_id: str, db: AsyncSession) -> int:
    """Process a Source record: chunk its text, embed, and store in chunks table.

    Args:
        source_id: The Source ID to index.
        db: Async database session.

    Returns:
        Number of chunks created.
    """
    # 1. Fetch the source
    result = await db.execute(select(Source).where(Source.id == source_id))
    source = result.scalar_one_or_none()
    if not source or not source.raw_text_content:
        return 0

    # 2. Find which services this source is linked to
    svc_result = await db.execute(
        select(service_sources.c.service_id).where(service_sources.c.source_id == source_id)
    )
    service_ids = [row[0] for row in svc_result.fetchall()]
    # Use first linked service_id for chunk filtering (sources are typically per-service)
    primary_service_id = service_ids[0] if service_ids else None

    # 3. Delete existing chunks for this source (for re-indexing)
    await db.execute(delete(Chunk).where(Chunk.source_id == source_id))

    # 4. Chunk the text
    chunks = chunk_text(source.raw_text_content)
    if not chunks:
        return 0

    # 5. Embed all chunks in a batch. Without a provider we still store the
    # text so keyword retrieval keeps working.
    texts = [c.content for c in chunks]
    try:
        embeddings = await embed_client.embed_texts(texts)
        processing_status = "READY"
    except embed_client.EmbeddingUnavailable as exc:
        print(f"⚠️  Embeddings unavailable for source {source_id}: {exc}")
        embeddings = [None] * len(chunks)
        processing_status = "READY_TEXT_ONLY"

    # 6. Create Chunk records
    chunk_metadata = {
        "source_id": source.id,
        "source_title": source.title,
        "source_url": source.source_url or "",
        "source_type": source.source_type,
        "visibility": source.visibility,
        "department": source.department or "",
    }

    chunk_models = []
    for chunk_data, emb in zip(chunks, embeddings):
        chunk_models.append(Chunk(
            id=str(uuid.uuid4()),
            source_id=source_id,
            agency_id=source.agency_id,
            service_id=primary_service_id,
            content=chunk_data.content,
            embedding=emb,
            chunk_index=chunk_data.index,
            visibility=source.visibility,
            approval_status=source.approval_status,
            metadata_=chunk_metadata,
        ))

    db.add_all(chunk_models)
    source.processing_status = processing_status
    await db.flush()

    return len(chunk_models)


async def index_all_sources(db: AsyncSession, force: bool = False) -> int:
    """Index approved sources.

    Args:
        force: Re-index sources that already have chunks. Use after changing
            the embedding model, or to upgrade text-only chunks once an
            embedding provider becomes available.

    Returns:
        Total number of chunks created.
    """
    result = await db.execute(
        select(Source.id).where(
            Source.raw_text_content.isnot(None),
            Source.approval_status == "APPROVED",
        )
    )
    source_ids = [row[0] for row in result.fetchall()]

    total_chunks = 0
    for sid in source_ids:
        if not force:
            existing = await db.execute(
                select(Chunk.id)
                .where(Chunk.source_id == sid, Chunk.embedding.isnot(None))
                .limit(1)
            )
            if existing.first() is not None:
                continue

        count = await index_source(sid, db)
        total_chunks += count

    await db.commit()
    return total_chunks


async def delete_source_chunks(source_id: str, db: AsyncSession) -> None:
    """Remove all chunks for a given source."""
    await db.execute(delete(Chunk).where(Chunk.source_id == source_id))
