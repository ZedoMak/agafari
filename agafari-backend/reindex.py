"""Re-index approved sources into the vector store.

Indexing normally happens on document approval and in the background at
startup. Run this after seeding, after changing the embedding model, or to
upgrade text-only chunks once an embedding provider becomes available.

    python reindex.py            # index sources that have no embeddings
    python reindex.py --force    # rebuild chunks for every approved source
"""

import asyncio
import sys

from sqlalchemy import func, select

from app.ai.indexer import index_all_sources
from app.database.session import async_session, init_db
from app.models.chunk import Chunk
from app.models.service import Source


async def main(force: bool) -> None:
    await init_db()
    async with async_session() as db:
        created = await index_all_sources(db, force=force)

        total_chunks = await db.scalar(select(func.count()).select_from(Chunk))
        embedded = await db.scalar(
            select(func.count()).select_from(Chunk).where(Chunk.embedding.isnot(None))
        )
        statuses = await db.execute(
            select(Source.processing_status, func.count())
            .group_by(Source.processing_status)
            .order_by(Source.processing_status)
        )

    print(f"Chunks created this run: {created}")
    print(f"Chunks in store: {total_chunks} ({embedded} with embeddings)")
    for status, count in statuses.all():
        print(f"  {status}: {count}")
    if embedded == 0 and total_chunks:
        print(
            "\nNo embeddings were produced — retrieval will run keyword-only.\n"
            "Set OPENROUTER_API_KEY and re-run with --force to upgrade."
        )


if __name__ == "__main__":
    asyncio.run(main(force="--force" in sys.argv))
