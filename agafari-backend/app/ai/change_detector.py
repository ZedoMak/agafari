"""AI-powered change detector for the admin.

Compares a new source directive against existing service data
and generates a structured analysis of what changed.

A provider outage or a malformed model response is reported as "no changes
detected" rather than raised, so ingesting a document never fails because of it.
"""

import json
import logging

from app.ai import llm
from app.ai.prompts import CHANGE_DETECTION_PROMPT

logger = logging.getLogger(__name__)


def _no_changes(service, reason: str) -> dict:
    return {
        "changes_detected": False,
        "ai_change_summary": reason,
        "public_notice": "",
        "old_snapshot": _old_snapshot(service),
        "new_snapshot": {},
    }


def _old_snapshot(service) -> dict:
    try:
        fee = float(service.fee_etb or 0)
    except (TypeError, ValueError):
        fee = 0.0
    return {"fee_etb": fee, "current_summary": (service.ai_summary or "")[:200]}


async def detect_changes(
    new_text: str,
    service,
) -> dict:
    """Compare new directive text against current service data.

    Args:
        new_text: The raw_text_content of the new source.
        service: The SQLAlchemy Service object with loaded relationships.

    Returns:
        Dict with keys: changes_detected, ai_change_summary, public_notice,
        old_snapshot, new_snapshot.
    """
    # Build current service data string
    current_data_parts = [
        f"Title: {service.title}",
        f"Fee: {service.fee_etb} ETB",
        f"Processing Time: {service.processing_time}",
        f"Summary: {service.ai_summary}",
    ]

    if service.requirements:
        current_data_parts.append("Requirements:")
        for req in service.requirements:
            current_data_parts.append(f"  - {req.title} ({'mandatory' if req.is_mandatory else 'optional'})")

    current_data = "\n".join(current_data_parts)

    # Build the prompt
    prompt_text = CHANGE_DETECTION_PROMPT.format(
        current_data=current_data,
        new_directive=new_text[:3000],  # Truncate very long texts
    )

    messages = [
        {"role": "system", "content": "You are a policy analysis AI. Respond ONLY with valid JSON."},
        {"role": "user", "content": prompt_text},
    ]

    try:
        response_text = await llm.chat_completion(messages, temperature=0.1)
    except llm.LLMUnavailable as exc:
        logger.warning("Change detection skipped, model unavailable: %s", exc)
        return _no_changes(service, "Automatic change detection is unavailable right now.")

    try:
        # Strip markdown code fences if present
        cleaned = response_text.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            cleaned = cleaned.rsplit("```", 1)[0]
        analysis = json.loads(cleaned)
        if not isinstance(analysis, dict):
            raise json.JSONDecodeError("Expected a JSON object", cleaned, 0)
    except (json.JSONDecodeError, IndexError, ValueError) as exc:
        logger.warning("Change detection returned unreadable JSON: %s", exc)
        return _no_changes(service, "Automatic change detection returned an unreadable result.")

    return {
        "changes_detected": bool(analysis.get("changes_detected", True)),
        "ai_change_summary": analysis.get("summary", "AI detected potential changes — review required."),
        "public_notice": (analysis.get("public_notice") or "").strip(),
        "old_snapshot": _old_snapshot(service),
        "new_snapshot": analysis,
    }
