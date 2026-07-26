"""RAG orchestrator — the main entry point for AI-powered chat.

Coordinates: embedding → retrieval → reranking → context building → generation.

Each provider step degrades instead of failing: without embeddings retrieval
becomes keyword-only, and without a language model the answer is composed
extractively from the retrieved approved text.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from app.ai import embedding as embed_client
from app.ai import llm
from app.ai.extractive import compose_answer
from app.ai.language import language_directive
from app.ai.retriever import hybrid_search
from app.ai.reranker import rerank
from app.ai.sanitize import strip_vendor_identity
from app.ai.context_builder import build_context
from app.ai.prompts import INTERNAL_RAG_SYSTEM_PROMPT, RAG_SYSTEM_PROMPT
from app.config.settings import settings


async def generate_answer(
    service,
    message: str,
    db: AsyncSession,
    organization=None,
    scope: str = "PUBLIC",
    history: list[dict] | None = None,
    catalogue=None,
) -> dict:
    """Run the full RAG pipeline to answer a user's question.

    Args:
        service: Service with loaded relationships, or None for org-wide chat.
        message: The user's question.
        db: Async database session.
        organization: Owning organization (required when service is None).
        scope: PUBLIC serves visitors; INTERNAL also retrieves staff-only text.
        history: Prior conversation turns.
        catalogue: Published services, so the assistant can describe everything
            the organization offers even when no document mentions it.

    Returns:
        Dict with reply, cited_sources, answer_status, retrieved_chunk_ids and
        the generation mode used.
    """
    if organization is None and service is not None:
        organization = service.agency
    if organization is None:
        raise ValueError("An organization is required for RAG retrieval")

    # 1. Embed the query. Without embeddings we still retrieve lexically.
    query_embedding: list[float] | None
    try:
        query_embedding = await embed_client.embed_text(message)
    except embed_client.EmbeddingUnavailable:
        query_embedding = None

    # 2. Hybrid retrieval, always bounded to this organization
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

    if not top_chunks and service is None and not catalogue:
        return {
            "reply": (
                "I don't have verified information about that question in the "
                "organization's approved knowledge base."
            ),
            "cited_sources": [],
            "answer_status": "UNANSWERED",
            "retrieved_chunk_ids": [],
            "generated_by": "none",
        }

    # 4. Build context (structured service data + semantic chunks)
    context = build_context(
        service=service,
        chunks=top_chunks,
        organization=organization,
        catalogue=catalogue,
    )

    # 5. Generate, falling back to extraction when the model is unreachable
    prompt_template = (
        INTERNAL_RAG_SYSTEM_PROMPT if scope == "INTERNAL" else RAG_SYSTEM_PROMPT
    )
    system_prompt = (
        f"{prompt_template.format(context=context)}\n\n"
        f"OUTPUT LANGUAGE: {language_directive(message)}"
    )
    messages = [{"role": "system", "content": system_prompt}]
    if history:
        messages.extend(history[-6:])
    messages.append({"role": "user", "content": message})

    generated_by = "llm"
    extractive_match = True
    try:
        reply = strip_vendor_identity(await llm.chat_completion(messages))
    except llm.LLMUnavailable:
        if not settings.AI_EXTRACTIVE_FALLBACK:
            raise
        reply, extractive_match = compose_answer(
            question=message,
            chunks=top_chunks,
            organization=organization,
            service=service,
        )
        generated_by = "extractive"

    # 6. Attribute the answer to the documents it came from
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

    if top_chunks and extractive_match:
        answer_status = "ANSWERED"
    else:
        answer_status = "LOW_CONFIDENCE"

    return {
        "reply": reply,
        "cited_sources": cited_sources,
        "answer_status": answer_status,
        "retrieved_chunk_ids": [str(chunk.chunk_id) for chunk in top_chunks],
        "generated_by": generated_by,
    }
