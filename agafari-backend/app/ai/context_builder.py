"""Context builder — merges structured service data with semantic chunks.

This is the key differentiator: the LLM receives both the verified
structured data (fees, requirements, steps) AND the semantically
relevant source document excerpts.
"""

from app.ai.reranker import ScoredChunk


def build_context(
    service,
    chunks: list[ScoredChunk],
    organization=None,
) -> str:
    """Build a rich context string from service data and retrieved chunks.

    Args:
        service: A SQLAlchemy Service object with loaded relationships.
        chunks: Top-k reranked chunks from the retriever.

    Returns:
        A formatted context string ready for prompt injection.
    """
    sections = []

    if organization is not None:
        sections.append("=== ORGANIZATION ===")
        sections.append(f"Organization: {organization.name}")
        if organization.description:
            sections.append(f"About: {organization.description}")

    # Layer 1: Structured program/service data, when the chat is scoped to one.
    if service is not None:
        sections.append("\n=== VERIFIED PROGRAM OR SERVICE INFORMATION ===")
        sections.append(f"Program or Service: {service.title}")
        sections.append(f"Category: {service.category}")
        sections.append(f"Summary: {service.ai_summary}")
        sections.append(f"Processing Time: {service.processing_time}")
        sections.append(f"Verification Status: {service.verification_status}")

        if service.fee_etb is not None:
            sections.append(f"Fee or Payment Amount: {service.fee_etb} ETB")

        if service.requirements:
            sections.append("\nREQUIREMENTS OR ELIGIBILITY:")
            for i, req in enumerate(service.requirements, 1):
                mandatory = "(MANDATORY)" if req.is_mandatory else "(optional)"
                desc = f" — {req.description}" if req.description else ""
                sections.append(f"  {i}. {req.title} {mandatory}{desc}")
                if req.photo_specifications:
                    sections.append(f"     Specifications: {req.photo_specifications}")

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
