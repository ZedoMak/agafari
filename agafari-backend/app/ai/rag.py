"""RAG orchestrator — the main entry point for AI-powered chat.

Coordinates: embedding → retrieval → reranking → context building → LLM generation.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from app.ai import embedding as embed_client
from app.ai import llm
from app.ai.retriever import hybrid_search
from app.ai.reranker import rerank
from app.ai.context_builder import build_context
from app.ai.prompts import RAG_SYSTEM_PROMPT


async def generate_answer(
    service,
    message: str,
    db: AsyncSession,
) -> dict:
    """Run the full RAG pipeline to answer a user's question.

    Args:
        service: SQLAlchemy Service object with loaded relationships (agency, requirements, sources).
        message: The user's question.
        db: Async database session.

    Returns:
        Dict with 'reply' and 'cited_sources'.
    """
    # 1. Embed the user's query
    query_embedding = await embed_client.embed_text(message)

    # 2. Hybrid retrieval (vector + keyword, filtered by service_id)
    raw_chunks = await hybrid_search(
        query_embedding=query_embedding,
        query_text=message,
        service_id=service.id,
        db=db,
        limit=10,
    )

    # 3. Rerank to top-5
    top_chunks = rerank(query=message, chunks=raw_chunks, top_k=5)

    # 4. Build context (structured service data + semantic chunks)
    context = build_context(service=service, chunks=top_chunks)

    # 5. Build prompt
    system_prompt = RAG_SYSTEM_PROMPT.format(context=context)
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": message},
    ]

    # 6. Generate answer via Addis AI
    reply = await llm.chat_completion(messages)

    # 7. Extract cited sources from chunk metadata
    seen_sources = set()
    cited_sources = []
    for chunk in top_chunks:
        title = chunk.metadata.get("source_title", "")
        url = chunk.metadata.get("source_url", "")
        if title and title not in seen_sources:
            seen_sources.add(title)
            cited_sources.append({
                "source_title": title,
                "source_url": url or "https://agafari.gov.et",
            })

    # If no chunks were found, still include the service's own sources
    if not cited_sources and hasattr(service, "sources"):
        for src in service.sources:
            cited_sources.append({
                "source_title": src.title,
                "source_url": src.source_url or "https://agafari.gov.et",
            })

    return {
        "reply": reply,
        "cited_sources": cited_sources,
    }
