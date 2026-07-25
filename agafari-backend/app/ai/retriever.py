"""Hybrid retriever — pgvector cosine similarity + keyword matching with RRF fusion."""

import uuid
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.ai.reranker import ScoredChunk

# Reciprocal Rank Fusion constant (standard value from the RRF paper)
RRF_K = 60


async def hybrid_search(
    query_embedding: list[float],
    query_text: str,
    service_id: str,
    db: AsyncSession,
    limit: int = 10,
    vector_weight: float = 0.7,
) -> list[ScoredChunk]:
    """Run vector + keyword search in parallel and merge via RRF.

    Args:
        query_embedding: The embedded user query vector.
        query_text: The raw user query string (for keyword matching).
        service_id: Filter chunks to this service only.
        db: Async database session.
        limit: Max results to return.
        vector_weight: Weight for vector results (keyword = 1 - vector_weight).

    Returns:
        RRF-fused list of ScoredChunk objects.
    """
    fetch_limit = limit * 2  # Over-fetch for better fusion

    # 1. Vector search (pgvector cosine distance)
    vector_sql = text("""
        SELECT id, content, metadata_,
               1 - (embedding <=> CAST(:query_vec AS vector)) AS score
        FROM chunks
        WHERE service_id = :sid
        ORDER BY embedding <=> CAST(:query_vec AS vector)
        LIMIT :lim
    """)
    vector_result = await db.execute(
        vector_sql,
        {"query_vec": str(query_embedding), "sid": service_id, "lim": fetch_limit},
    )
    vector_rows = vector_result.fetchall()

    # 2. Keyword search (ILIKE for simplicity, works well for hackathon)
    # Split query into terms and search for any match
    search_terms = [t.strip() for t in query_text.split() if len(t.strip()) > 2]
    keyword_rows = []
    if search_terms:
        # Build OR conditions for each term
        conditions = " OR ".join([f"content ILIKE :term{i}" for i in range(len(search_terms))])
        keyword_sql = text(f"""
            SELECT id, content, metadata_, 1.0 AS score
            FROM chunks
            WHERE service_id = :sid AND ({conditions})
            LIMIT :lim
        """)
        params = {"sid": service_id, "lim": fetch_limit}
        for i, term in enumerate(search_terms):
            params[f"term{i}"] = f"%{term}%"

        keyword_result = await db.execute(keyword_sql, params)
        keyword_rows = keyword_result.fetchall()

    # 3. Reciprocal Rank Fusion
    scores: dict[str, float] = {}
    chunks_map: dict[str, ScoredChunk] = {}

    for rank, row in enumerate(vector_rows):
        chunk_id = row.id
        scores[chunk_id] = scores.get(chunk_id, 0.0) + vector_weight / (RRF_K + rank + 1)
        if chunk_id not in chunks_map:
            chunks_map[chunk_id] = ScoredChunk(
                chunk_id=chunk_id,
                content=row.content,
                score=0.0,
                metadata=row.metadata_ or {},
            )

    keyword_weight = 1.0 - vector_weight
    for rank, row in enumerate(keyword_rows):
        chunk_id = row.id
        scores[chunk_id] = scores.get(chunk_id, 0.0) + keyword_weight / (RRF_K + rank + 1)
        if chunk_id not in chunks_map:
            chunks_map[chunk_id] = ScoredChunk(
                chunk_id=chunk_id,
                content=row.content,
                score=0.0,
                metadata=row.metadata_ or {},
            )

    # 4. Sort by fused score and assign
    sorted_ids = sorted(scores, key=scores.get, reverse=True)
    results = []
    for chunk_id in sorted_ids[:limit]:
        chunk = chunks_map[chunk_id]
        chunk.score = scores[chunk_id]
        results.append(chunk)

    return results
