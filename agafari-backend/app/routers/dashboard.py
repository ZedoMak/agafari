from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.models import (
    AccessSession,
    AuditEvent,
    ChatMessage,
    Complaint,
    Conversation,
    Insight,
    IssueCluster,
    Source,
)
from app.schemas.saas import InsightUpdate
from app.security import require_access_session

router = APIRouter(prefix="/api/v1/admin", tags=["Admin Intelligence"])


def range_start(value: str) -> datetime:
    days = {"7d": 7, "30d": 30, "90d": 90}.get(value)
    if days is None:
        raise HTTPException(status_code=422, detail="Range must be 7d, 30d, or 90d")
    return datetime.utcnow() - timedelta(days=days)


@router.get("/dashboard/summary")
async def dashboard_summary(
    range: str = Query(default="30d"),
    session: AccessSession = Depends(require_access_session),
    db: AsyncSession = Depends(get_db),
):
    since = range_start(range)
    message_base = (
        select(func.count(ChatMessage.id))
        .join(Conversation, ChatMessage.conversation_id == Conversation.id)
        .where(
            Conversation.agency_id == session.agency_id,
            ChatMessage.role == "assistant",
            ChatMessage.created_at >= since,
        )
    )
    total_interactions = (await db.execute(message_base)).scalar_one()
    answered = (
        await db.execute(
            message_base.where(ChatMessage.answer_status == "ANSWERED")
        )
    ).scalar_one()

    scope_result = await db.execute(
        select(Conversation.scope, func.count(ChatMessage.id))
        .join(ChatMessage, ChatMessage.conversation_id == Conversation.id)
        .where(
            Conversation.agency_id == session.agency_id,
            ChatMessage.role == "assistant",
            ChatMessage.created_at >= since,
        )
        .group_by(Conversation.scope)
    )
    scope_usage = {scope.lower(): count for scope, count in scope_result.all()}

    complaint_result = await db.execute(
        select(Complaint.severity, func.count(Complaint.id))
        .where(
            Complaint.agency_id == session.agency_id,
            Complaint.created_at >= since,
            Complaint.status.notin_(["RESOLVED", "DISMISSED"]),
        )
        .group_by(Complaint.severity)
    )
    complaints_by_severity = {
        severity.lower(): count for severity, count in complaint_result.all()
    }

    document_result = await db.execute(
        select(Source.processing_status, func.count(Source.id))
        .where(Source.agency_id == session.agency_id)
        .group_by(Source.processing_status)
    )
    documents_by_status = {
        status.lower(): count for status, count in document_result.all()
    }

    cluster_result = await db.execute(
        select(IssueCluster)
        .where(IssueCluster.agency_id == session.agency_id)
        .order_by(IssueCluster.item_count.desc(), IssueCluster.last_seen_at.desc())
        .limit(5)
    )
    insight_result = await db.execute(
        select(Insight)
        .where(
            Insight.agency_id == session.agency_id,
            Insight.status.notin_(["RESOLVED", "DISMISSED"]),
        )
        .order_by(Insight.created_at.desc())
        .limit(5)
    )
    return {
        "range": range,
        "interactions": {
            "total": total_interactions,
            "answered": answered,
            "answer_rate": round(answered / total_interactions * 100, 1)
            if total_interactions
            else 0,
            "by_scope": scope_usage,
        },
        "open_complaints": {
            "total": sum(complaints_by_severity.values()),
            "by_severity": complaints_by_severity,
        },
        "documents": documents_by_status,
        "top_issue_clusters": [
            {
                "id": item.id,
                "title": item.title,
                "source_kind": item.source_kind,
                "category": item.category,
                "item_count": item.item_count,
                "last_seen_at": item.last_seen_at,
            }
            for item in cluster_result.scalars().all()
        ],
        "emerging_insights": [
            {
                "id": item.id,
                "title": item.title,
                "summary": item.summary,
                "confidence": item.confidence,
                "status": item.status,
            }
            for item in insight_result.scalars().all()
        ],
    }


@router.get("/insights")
async def list_insights(
    status: str | None = Query(default=None),
    session: AccessSession = Depends(require_access_session),
    db: AsyncSession = Depends(get_db),
):
    query = select(Insight).where(Insight.agency_id == session.agency_id)
    if status:
        query = query.where(Insight.status == status.upper())
    result = await db.execute(query.order_by(Insight.created_at.desc()))
    return result.scalars().all()


@router.get("/insights/{insight_id}")
async def get_insight(
    insight_id: str,
    session: AccessSession = Depends(require_access_session),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Insight).where(
            Insight.id == insight_id,
            Insight.agency_id == session.agency_id,
        )
    )
    insight = result.scalar_one_or_none()
    if insight is None:
        raise HTTPException(status_code=404, detail="Insight not found")
    cluster = await db.get(IssueCluster, insight.cluster_id) if insight.cluster_id else None
    return {
        "id": insight.id,
        "title": insight.title,
        "summary": insight.summary,
        "recommendation": insight.recommendation,
        "confidence": insight.confidence,
        "status": insight.status,
        "owner": insight.owner,
        "resolution_note": insight.resolution_note,
        "evidence": {
            "item_count": cluster.item_count if cluster else 0,
            "representative_items": cluster.representative_items if cluster else [],
            "first_seen_at": cluster.first_seen_at if cluster else None,
            "last_seen_at": cluster.last_seen_at if cluster else None,
        },
    }


@router.patch("/insights/{insight_id}")
async def update_insight(
    insight_id: str,
    payload: InsightUpdate,
    session: AccessSession = Depends(require_access_session),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Insight).where(
            Insight.id == insight_id,
            Insight.agency_id == session.agency_id,
        )
    )
    insight = result.scalar_one_or_none()
    if insight is None:
        raise HTTPException(status_code=404, detail="Insight not found")
    insight.status = payload.status
    insight.owner = payload.owner
    insight.resolution_note = payload.resolution_note
    db.add(
        AuditEvent(
            agency_id=session.agency_id,
            event_type="INSIGHT_UPDATED",
            target_type="insight",
            target_id=insight.id,
            details={"status": insight.status, "owner": insight.owner},
        )
    )
    await db.commit()
    return {"id": insight.id, "status": insight.status, "owner": insight.owner}


@router.get("/conversations")
async def list_conversations(
    scope: str | None = Query(default=None),
    session: AccessSession = Depends(require_access_session),
    db: AsyncSession = Depends(get_db),
):
    query = select(Conversation).where(Conversation.agency_id == session.agency_id)
    if scope:
        query = query.where(Conversation.scope == scope.upper())
    result = await db.execute(query.order_by(Conversation.updated_at.desc()).limit(100))
    conversations = result.scalars().all()
    output = []
    for conversation in conversations:
        message_result = await db.execute(
            select(ChatMessage)
            .where(ChatMessage.conversation_id == conversation.id)
            .order_by(ChatMessage.created_at.desc())
            .limit(2)
        )
        messages = list(reversed(message_result.scalars().all()))
        output.append(
            {
                "id": conversation.id,
                "scope": conversation.scope,
                "service_id": conversation.service_id,
                "department": conversation.department,
                "updated_at": conversation.updated_at,
                "messages": messages,
            }
        )
    return output
