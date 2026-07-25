"""RAG orchestrator — the main entry point for AI-powered chat.

Coordinates: embedding → retrieval → reranking → context building → LLM generation.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from app.ai import embedding as embed_client
from app.ai import llm
from app.ai.retriever import hybrid_search
from app.ai.reranker import rerank
from app.ai.context_builder import build_context
from app.ai.prompts import INTERNAL_RAG_SYSTEM_PROMPT, RAG_SYSTEM_PROMPT


async def generate_answer(
    service,
    message: str,
    db: AsyncSession,
    organization=None,
    scope: str = "PUBLIC",
    history: list[dict] | None = None,
) -> dict:
    """Run the full RAG pipeline to answer a user's question.

    Args:
        service: SQLAlchemy Service object with loaded relationships (agency, requirements, sources).
        message: The user's question.
        db: Async database session.

    Returns:
        Dict with 'reply' and 'cited_sources'.
    """
    if organization is None and service is not None:
        organization = service.agency
    if organization is None:
        raise ValueError("An organization is required for RAG retrieval")

    # 1. Embed the user's query
    query_embedding = await embed_client.embed_text(message)

    # 2. Hybrid retrieval (vector + keyword, filtered by service_id)
    raw_chunks = await hybrid_search(
        query_embedding=query_embedding,
        query_text=message,
        agency_id=organization.id,
        service_id=service.id if service is not None else None,
        db=db,
        scope=scope,
        limit=10,
    )

    # 3. Rerank to top-5
    top_chunks = rerank(query=message, chunks=raw_chunks, top_k=5)

    # 4. Build context (structured service data + semantic chunks)
    context = build_context(
        service=service,
        chunks=top_chunks,
        organization=organization,
    )

    if not top_chunks and service is None:
        return {
            "reply": (
                "I don't have verified information about that question in the "
                "organization's approved knowledge base."
            ),
            "cited_sources": [],
            "answer_status": "UNANSWERED",
            "retrieved_chunk_ids": [],
        }

    # 5. Build prompt
    prompt_template = (
        INTERNAL_RAG_SYSTEM_PROMPT if scope == "INTERNAL" else RAG_SYSTEM_PROMPT
    )
    system_prompt = prompt_template.format(context=context)
    messages = [{"role": "system", "content": system_prompt}]
    if history:
        messages.extend(history[-6:])
    messages.append({"role": "user", "content": message})

    # 6. Generate answer via Addis AI
    reply = await llm.chat_completion(messages)

    # 7. Extract cited sources from chunk metadata
    seen_sources = set()
    cited_sources = []
    for chunk in top_chunks:
        source_id = chunk.metadata.get("source_id")
        title = chunk.metadata.get("source_title", "")
        url = chunk.metadata.get("source_url", "")
        if title and title not in seen_sources:
            seen_sources.add(title)
            cited_sources.append({
                "source_id": source_id,
                "source_title": title,
                "source_url": url or None,
            })

    return {
        "reply": reply,
        "cited_sources": cited_sources,
        "answer_status": "ANSWERED" if top_chunks else "LOW_CONFIDENCE",
        "retrieved_chunk_ids": [str(chunk.chunk_id) for chunk in top_chunks],
    }
