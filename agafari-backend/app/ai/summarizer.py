"""Service summaries and procedure steps.

Used by the admin dashboard to (re)generate the visitor-facing description of a
service from its approved documents and structured fields. When the language
model is unavailable the same inputs are turned into a deterministic extractive
summary, so managing a service never depends on the provider being up.
"""

import json
import logging
import re

from app.ai import llm
from app.ai.extractive import rank_sentences
from app.ai.prompts import PROCEDURE_PROMPT, SUMMARIZATION_PROMPT

logger = logging.getLogger(__name__)

MAX_STEPS = 6
_SOURCE_CHARS = 4000
_LIST_MARKER = re.compile(r"^\s*(?:[-*•]|\d+[.)])\s*")


def approved_source_texts(service) -> list[str]:
    return [
        source.raw_text_content
        for source in getattr(service, "sources", []) or []
        if source.approval_status == "APPROVED" and source.raw_text_content
    ]


def _fee(service) -> float:
    try:
        return float(service.fee_etb or 0)
    except (TypeError, ValueError):
        return 0.0


def _requirement_lines(service) -> list[str]:
    lines = []
    for requirement in getattr(service, "requirements", []) or []:
        detail = f": {requirement.description}" if requirement.description else ""
        marker = "" if requirement.is_mandatory else " (optional)"
        lines.append(f"- {requirement.title}{marker}{detail}")
    return lines


def build_context(service) -> str:
    """The structured service profile plus its approved documents, as one text."""
    fee = _fee(service)
    parts = [
        f"Service: {service.title}",
        f"Category: {service.category}",
        f"Fee: {'free of charge' if fee == 0 else f'{fee:,.2f} ETB'}",
        f"Processing time: {service.processing_time}",
    ]
    requirements = _requirement_lines(service)
    if requirements:
        parts.append("Requirements:")
        parts.extend(requirements)
    sources = approved_source_texts(service)
    if sources:
        parts.append("Approved documents:")
        parts.append("\n\n".join(sources)[:_SOURCE_CHARS])
    return "\n".join(parts)


def _parse_steps(response_text: str) -> list[str]:
    """Read an ordered step list out of a model response.

    Accepts a JSON array, a fenced JSON array, or plain bulleted/numbered lines.
    """
    cleaned = response_text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[-1].rsplit("```", 1)[0].strip()

    try:
        parsed = json.loads(cleaned)
    except (json.JSONDecodeError, ValueError):
        parsed = None
    if isinstance(parsed, dict):
        parsed = parsed.get("steps")
    if isinstance(parsed, list):
        steps = [str(item).strip() for item in parsed if str(item).strip()]
        if steps:
            return steps[:MAX_STEPS]

    lines = [
        _LIST_MARKER.sub("", line).strip()
        for line in cleaned.splitlines()
        if line.strip()
    ]
    steps = [line for line in lines if len(line) > 8]
    # A single line is prose or a refusal, not a procedure.
    return steps[:MAX_STEPS] if len(steps) > 1 else []


def extractive_summary(service) -> str:
    """A summary built only from the service's own text, no model involved."""
    fee = _fee(service)
    lead = (
        f"{service.title} is a {service.category.lower()} service. "
        f"It takes {service.processing_time} and is "
        + ("free of charge." if fee == 0 else f"charged at {fee:,.2f} ETB.")
    )
    mandatory = [
        requirement.title
        for requirement in getattr(service, "requirements", []) or []
        if requirement.is_mandatory
    ]
    if mandatory:
        lead += " You need to bring " + ", ".join(mandatory[:4]) + "."

    query = f"{service.title} {service.category} {service.processing_time}"
    highlights = rank_sentences(query, approved_source_texts(service), limit=2)
    return " ".join([lead, *highlights]).strip()


def extractive_steps(service) -> list[str]:
    """Ordered steps derived from the requirements and approved documents."""
    steps: list[str] = []
    requirements = sorted(
        getattr(service, "requirements", []) or [],
        key=lambda item: (item.order_index or 0),
    )
    mandatory = [item for item in requirements if item.is_mandatory] or requirements
    for requirement in mandatory[:3]:
        steps.append(f"Prepare {requirement.title}.")
    if not steps:
        steps.append(f"Gather the documents you have for {service.title}.")

    fee = _fee(service)
    steps.append(
        f"Contact us to start {service.title}."
        if fee == 0
        else f"Pay the {fee:,.2f} ETB fee for {service.title}."
    )
    steps.append(f"Submit your request and allow {service.processing_time}.")
    return steps[:MAX_STEPS]


async def summarize_service(service) -> dict:
    """Regenerate the summary and procedure steps for one service.

    Returns `{"summary": str, "procedure_steps": list[str], "generated_by": str}`
    where `generated_by` reports where the summary itself came from: "llm", or
    "extractive" when the model could not be reached.
    """
    context = build_context(service)
    try:
        summary = await llm.chat_completion(
            [
                {"role": "system", "content": "You write clear public service descriptions."},
                {"role": "user", "content": SUMMARIZATION_PROMPT.format(text=context)},
            ],
            temperature=0.2,
        )
    except llm.LLMUnavailable as exc:
        logger.warning("Summarization fell back to extractive: %s", exc)
        return {
            "summary": extractive_summary(service),
            "procedure_steps": extractive_steps(service),
            "generated_by": "extractive",
        }

    steps: list[str] = []
    try:
        steps = _parse_steps(
            await llm.chat_completion(
                [
                    {"role": "system", "content": "Respond ONLY with a JSON array of strings."},
                    {"role": "user", "content": PROCEDURE_PROMPT.format(text=context)},
                ],
                temperature=0.2,
            )
        )
    except llm.LLMUnavailable as exc:
        logger.warning("Procedure steps fell back to extractive: %s", exc)

    return {
        "summary": summary.strip() or extractive_summary(service),
        "procedure_steps": steps or extractive_steps(service),
        "generated_by": "llm",
    }
