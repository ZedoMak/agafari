"""BM25-lite reranker for RAG retrieval results.

Re-scores chunks from vector search using term frequency,
inverse document frequency proxies, and length preference
to surface the most lexically relevant results.
"""

import math
from dataclasses import dataclass

# BM25 tuning parameters
BM25_K1 = 1.5   # term frequency saturation
BM25_B = 0.75   # length normalisation


@dataclass
class ScoredChunk:
    """A chunk with its relevance score."""
    chunk_id: str
    content: str
    score: float
    metadata: dict


def rerank(query: str, chunks: list[ScoredChunk], top_k: int = 5) -> list[ScoredChunk]:
    """Rerank search results using a BM25-inspired scoring formula.

    Args:
        query: The user's original question.
        chunks: Chunks returned by the retriever.
        top_k: Maximum number of results to return.

    Returns:
        Top-k chunks re-sorted by combined score.
    """
    if not chunks:
        return []

    query_terms = [t.lower() for t in query.split() if len(t) > 1]
    if not query_terms:
        return chunks[:top_k]

    avg_len = sum(len(c.content) for c in chunks) / len(chunks) if chunks else 1

    scored: list[tuple[float, ScoredChunk]] = []
    for chunk in chunks:
        content_lower = chunk.content.lower()
        doc_len = len(chunk.content)

        # BM25-lite TF component
        bm25_score = 0.0
        for term in query_terms:
            tf = content_lower.count(term)
            if tf > 0:
                idf = math.log(1 + len(term))
                norm_tf = (tf * (BM25_K1 + 1)) / (
                    tf + BM25_K1 * (1 - BM25_B + BM25_B * doc_len / avg_len)
                )
                bm25_score += idf * norm_tf

        # Normalise BM25 to [0, 1]
        max_possible = len(query_terms) * math.log(1 + 15) * (BM25_K1 + 1)
        bm25_normalised = min(bm25_score / max_possible, 1.0) if max_possible > 0 else 0.0

        # Length preference — moderate chunks (200-800 chars) preferred
        if 200 <= doc_len <= 800:
            length_bonus = 0.05
        elif doc_len < 50 or doc_len > 2000:
            length_bonus = -0.1
        else:
            length_bonus = 0.0

        # Combined score: 60% retrieval + 30% BM25 + 10% length
        final_score = 0.6 * chunk.score + 0.3 * bm25_normalised + 0.1 * (0.5 + length_bonus)
        scored.append((final_score, chunk))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [chunk for _, chunk in scored[:top_k]]
