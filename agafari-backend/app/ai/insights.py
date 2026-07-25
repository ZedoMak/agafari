from datetime import datetime
import re

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Insight, IssueCluster


def redact_pii(text: str) -> str:
    text = re.sub(r"[\w.+-]+@[\w-]+\.[\w.-]+", "[email redacted]", text)
    text = re.sub(r"(?<!\w)(?:\+?251|0)?9\d{8}(?!\w)", "[phone redacted]", text)
    return text


def suggested_action(source_kind: str, category: str) -> str:
    if source_kind == "KNOWLEDGE_GAP":
        return (
            "Review the unanswered questions, add or clarify an approved knowledge "
            "document, then verify the assistant can answer them with citations."
        )
    return (
        f"Review the underlying {category.lower().replace('_', ' ')} cases, assign an "
        "owner, communicate the resolution path, and measure whether volume decreases."
    )


async def record_issue(
    db: AsyncSession,
    *,
    agency_id: str,
    service_id: str | None,
    source_kind: str,
    category: str,
    example: str,
) -> IssueCluster:
    result = await db.execute(
        select(IssueCluster).where(
            IssueCluster.agency_id == agency_id,
            IssueCluster.service_id == service_id,
            IssueCluster.source_kind == source_kind,
            IssueCluster.category == category,
        )
    )
    cluster = result.scalar_one_or_none()
    redacted_example = redact_pii(example)[:300]
    if cluster is None:
        title = (
            "Unanswered or low-confidence questions"
            if source_kind == "KNOWLEDGE_GAP"
            else f"Repeated {category.lower().replace('_', ' ')} feedback"
        )
        cluster = IssueCluster(
            agency_id=agency_id,
            service_id=service_id,
            source_kind=source_kind,
            category=category,
            title=title,
            summary=f"Similar {source_kind.lower().replace('_', ' ')} items require review.",
            representative_items=[redacted_example],
        )
        db.add(cluster)
        await db.flush()
    else:
        cluster.item_count += 1
        cluster.last_seen_at = datetime.utcnow()
        examples = list(cluster.representative_items or [])
        if redacted_example not in examples:
            examples = (examples + [redacted_example])[-5:]
        cluster.representative_items = examples

    if cluster.item_count >= 2:
        insight_result = await db.execute(
            select(Insight).where(Insight.cluster_id == cluster.id)
        )
        insight = insight_result.scalar_one_or_none()
        if insight is None:
            insight = Insight(
                agency_id=agency_id,
                cluster_id=cluster.id,
                title=cluster.title,
                summary=(
                    f"{cluster.item_count} related items have been detected. "
                    "Review the evidence and confirm the operational cause."
                ),
                recommendation=suggested_action(source_kind, category),
                confidence=min(95, 55 + cluster.item_count * 5),
            )
            db.add(insight)
        else:
            insight.summary = (
                f"{cluster.item_count} related items have been detected. "
                "Review the evidence and confirm the operational cause."
            )
            insight.confidence = min(95, 55 + cluster.item_count * 5)
    return cluster
