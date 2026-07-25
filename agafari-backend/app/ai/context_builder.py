"""Context builder — merges structured service data with semantic chunks.

This is the key differentiator: the LLM receives both the verified
structured data (fees, requirements, steps) AND the semantically
relevant source document excerpts.
"""

from app.ai.reranker import ScoredChunk


def build_context(service, chunks: list[ScoredChunk]) -> str:
    """Build a rich context string from service data and retrieved chunks.

    Args:
        service: A SQLAlchemy Service object with loaded relationships.
        chunks: Top-k reranked chunks from the retriever.

    Returns:
        A formatted context string ready for prompt injection.
    """
    sections = []

    # Layer 1: Structured service data
    sections.append("=== VERIFIED SERVICE INFORMATION ===")
    sections.append(f"Service: {service.title}")
    sections.append(f"Agency: {service.agency.name if service.agency else 'N/A'}")
    sections.append(f"Fee: {service.fee_etb} ETB")
    sections.append(f"Processing Time: {service.processing_time}")
    sections.append(f"Verification Status: {service.verification_status}")

    if service.payment_channels:
        channels = ", ".join(
            ch for ch, available in service.payment_channels.items() if available
        )
        sections.append(f"Payment Channels: {channels}")

    sections.append(f"Anti-Broker Notice: {service.anti_broker_notice}")

    # Requirements
    if service.requirements:
        sections.append("\nREQUIREMENTS:")
        for i, req in enumerate(service.requirements, 1):
            mandatory = "(MANDATORY)" if req.is_mandatory else "(optional)"
            desc = f" — {req.description}" if req.description else ""
            sections.append(f"  {i}. {req.title} {mandatory}{desc}")
            if req.photo_specifications:
                sections.append(f"     Photo Specs: {req.photo_specifications}")

    # Layer 2: Semantic chunks from source documents
    if chunks:
        sections.append("\n=== RELEVANT SOURCE DOCUMENTS ===")
        for i, chunk in enumerate(chunks, 1):
            source_title = chunk.metadata.get("source_title", "Unknown Source")
            source_url = chunk.metadata.get("source_url", "")
            sections.append(f"\n[Source {i}: {source_title}]")
            if source_url:
                sections.append(f"URL: {source_url}")
            sections.append(chunk.content)

    return "\n".join(sections)
