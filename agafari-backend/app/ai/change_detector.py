"""AI-powered change detector for the admin.

Compares a new source directive against existing service data
and generates a structured analysis of what changed.
"""

import json
from app.ai import llm
from app.ai.prompts import CHANGE_DETECTION_PROMPT


async def detect_changes(
    new_text: str,
    service,
) -> dict:
    """Compare new directive text against current service data.

    Args:
        new_text: The raw_text_content of the new source.
        service: The SQLAlchemy Service object with loaded relationships.

    Returns:
        Dict with keys: summary, old_snapshot, new_snapshot
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

    # Call Addis AI
    response_text = await llm.chat_completion(messages, temperature=0.1)

    # Parse the JSON response
    try:
        # Strip markdown code fences if present
        cleaned = response_text.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            cleaned = cleaned.rsplit("```", 1)[0]
        analysis = json.loads(cleaned)
    except (json.JSONDecodeError, IndexError):
        analysis = {
            "summary": response_text[:500],
            "changes_detected": True,
            "details": response_text,
        }

    return {
        "ai_change_summary": analysis.get("summary", "AI detected potential changes — review required."),
        "old_snapshot": {"fee_etb": float(service.fee_etb), "current_summary": service.ai_summary[:200]},
        "new_snapshot": analysis,
    }
