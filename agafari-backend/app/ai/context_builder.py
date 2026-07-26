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
    catalogue=None,
) -> str:
    """Build a rich context string from service data and retrieved chunks.

    Args:
        service: The Service in focus, or None for an organization-wide question.
        chunks: Top-k reranked chunks from the retriever.
        organization: The owning organization.
        catalogue: Every published service, so questions like "what do you
            offer?" can be answered without retrieval finding a document.

    Returns:
        A formatted context string ready for prompt injection.
    """
    sections = []

    if organization is not None:
        sections.append("=== ORGANIZATION ===")
        sections.append(f"Organization: {organization.name}")
        if organization.sector:
            sections.append(f"Sector: {organization.sector}")
        if organization.description:
            sections.append(f"About: {organization.description}")
        contact = organization.contact or {}
        details = [
            f"{label}: {contact.get(key)}"
            for key, label in (("email", "Email"), ("phone", "Phone"), ("website", "Website"))
            if contact.get(key)
        ]
        if details:
            sections.append("Contact — " + "; ".join(details))

    if catalogue:
        sections.append(
            f"\n=== EVERYTHING {organization.name.upper() if organization else 'THIS ORGANIZATION'} OFFERS ==="
        )
        for item in catalogue:
            details = [f"{item.title} ({item.category})"]
            if item.ai_summary:
                details.append(item.ai_summary)
            if item.processing_time:
                details.append(f"Processing time: {item.processing_time}.")
            try:
                fee = float(item.fee_etb or 0)
            except (TypeError, ValueError):
                fee = 0.0
            details.append("Free of charge." if fee == 0 else f"Fee: {fee:,.2f} ETB.")
            sections.append("- " + " ".join(details))

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
