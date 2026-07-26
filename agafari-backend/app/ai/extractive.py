"""Grounded answers without a language model.

Used when the LLM provider is unconfigured or failing: instead of telling the
visitor the assistant is down, quote the most relevant sentences from the
organization's approved knowledge and let citations do the rest.
"""

import re

_SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+")
_WORD = re.compile(r"[a-z0-9]+")

_STOPWORDS = {
    "the", "and", "for", "are", "but", "not", "you", "your", "with", "that",
    "this", "from", "have", "has", "had", "was", "were", "what", "when",
    "where", "which", "who", "how", "why", "can", "does", "did", "will",
    "would", "should", "could", "about", "into", "than", "then", "they",
    "them", "there", "their", "our", "its", "his", "her", "any", "all",
    "one", "two", "get", "got", "may", "must", "need", "want",
}


def _terms(question: str) -> set[str]:
    return {
        word
        for word in _WORD.findall(question.lower())
        if len(word) > 2 and word not in _STOPWORDS
    }


def _sentences(text: str) -> list[str]:
    parts = [part.strip() for part in _SENTENCE_SPLIT.split(text or "")]
    return [part for part in parts if len(part) > 25]


def _service_facts(service) -> list[str]:
    """Structured service fields expressed as plain sentences."""
    if service is None:
        return []

    facts: list[str] = []
    if service.ai_summary:
        facts.append(f"{service.title}: {service.ai_summary}")
    if service.processing_time:
        facts.append(f"Processing time for {service.title}: {service.processing_time}.")
    try:
        fee = float(service.fee_etb or 0)
    except (TypeError, ValueError):
        fee = 0.0
    facts.append(
        f"{service.title} is free of charge."
        if fee == 0
        else f"The fee for {service.title} is {fee:,.2f} ETB."
    )
    for requirement in getattr(service, "requirements", []) or []:
        detail = f" {requirement.description}" if requirement.description else ""
        facts.append(f"Required for {service.title} — {requirement.title}.{detail}")
    if service.anti_broker_notice:
        facts.append(service.anti_broker_notice)
    return facts


def _rank(terms: set[str], candidates: list[str], limit: int) -> list[str]:
    scored: list[tuple[float, str]] = []
    seen: set[str] = set()
    for sentence in candidates:
        key = sentence.lower()[:80]
        if key in seen:
            continue
        seen.add(key)
        words = set(_WORD.findall(sentence.lower()))
        overlap = len(terms & words)
        if overlap:
            # Favour dense matches over long sentences that match by accident.
            scored.append((overlap / (len(words) ** 0.5), sentence))
    scored.sort(key=lambda item: item[0], reverse=True)
    return [sentence for _, sentence in scored[:limit]]


def rank_sentences(query: str, texts, limit: int = 3) -> list[str]:
    """The sentences across `texts` that best match `query`, strongest first."""
    candidates: list[str] = []
    for text in texts or []:
        candidates.extend(_sentences(text))
    return _rank(_terms(query), candidates, limit)


def compose_answer(
    question: str,
    chunks,
    organization=None,
    service=None,
    limit: int = 4,
) -> tuple[str, bool]:
    """Build an answer from retrieved text.

    Returns the answer and whether anything actually matched the question.
    """
    candidates: list[str] = []
    for chunk in chunks or []:
        candidates.extend(_sentences(chunk.content))
    candidates.extend(_service_facts(service))

    if not candidates:
        organization_name = getattr(organization, "name", "This organization")
        return (
            f"{organization_name} has not published information that answers "
            "that question yet. Your question has been recorded so the team can "
            "add it.",
            False,
        )

    picked = _rank(_terms(question), candidates, limit)
    matched = bool(picked)
    if matched:
        lead = "Here is what the published documents say:"
    else:
        picked = candidates[:2]
        lead = "I could not find a direct answer. The closest published information is:"

    body = "\n".join(f"• {sentence}" for sentence in picked)
    return f"{lead}\n\n{body}", matched
