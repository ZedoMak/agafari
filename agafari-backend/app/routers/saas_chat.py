from time import perf_counter

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.ai.insights import record_issue
from app.ai.rag import generate_answer
from app.database.session import get_db
from app.models import AccessSession, Agency, ChatMessage, Conversation, Service
from app.schemas.saas import MessageFeedback, SaaSChatRequest, SaaSChatResponse
from app.security import require_access_session

router = APIRouter(tags=["Public and Internal AI"])


async def load_service(
    service_id: str,
    db: AsyncSession,
    agency_id: str | None = None,
) -> Service:
    query = (
        select(Service)
        .options(
            selectinload(Service.agency),
            selectinload(Service.requirements),
            selectinload(Service.sources),
        )
        .where(Service.id == service_id)
    )
    if agency_id is not None:
        query = query.where(Service.agency_id == agency_id)
    result = await db.execute(query)
    service = result.scalar_one_or_none()
    if service is None:
        raise HTTPException(status_code=404, detail="Program or service not found")
    return service


async def load_catalogue(agency_id: str, db: AsyncSession) -> list[Service]:
    """Published services, so the assistant can speak for the whole organization."""
    result = await db.execute(
        select(Service)
        .where(Service.agency_id == agency_id)
        .order_by(Service.title)
    )
    return [
        service
        for service in result.scalars().all()
        if getattr(service, "is_published", True)
    ]


async def get_or_create_conversation(
    payload: SaaSChatRequest,
    agency_id: str,
    scope: str,
    db: AsyncSession,
    session_id: str | None = None,
) -> tuple[Conversation, list[dict]]:
    history: list[dict] = []
    conversation = None
    if payload.conversation_id:
        result = await db.execute(
            select(Conversation).where(
                Conversation.id == payload.conversation_id,
                Conversation.agency_id == agency_id,
                Conversation.scope == scope,
            )
        )
        conversation = result.scalar_one_or_none()
        if conversation is None:
            raise HTTPException(status_code=404, detail="Conversation not found")
        messages = await db.execute(
            select(ChatMessage)
            .where(ChatMessage.conversation_id == conversation.id)
            .order_by(ChatMessage.created_at.desc())
            .limit(6)
        )
        prior = list(reversed(messages.scalars().all()))
        history = [
            {"role": item.role, "content": item.content}
            for item in prior
            if item.role in {"user", "assistant"}
        ]
    else:
        conversation = Conversation(
            agency_id=agency_id,
            service_id=payload.service_id,
            scope=scope,
            department=payload.department,
            session_id=session_id,
        )
        db.add(conversation)
        await db.flush()
    return conversation, history


async def run_logged_chat(
    payload: SaaSChatRequest,
    organization: Agency,
    service: Service | None,
    scope: str,
    db: AsyncSession,
    session_id: str | None = None,
) -> SaaSChatResponse:
    conversation, history = await get_or_create_conversation(
        payload=payload,
        agency_id=organization.id,
        scope=scope,
        db=db,
        session_id=session_id,
    )
    user_message = ChatMessage(
        conversation_id=conversation.id,
        role="user",
        content=payload.message,
    )
    db.add(user_message)
    await db.flush()

    started = perf_counter()
    try:
        catalogue = await load_catalogue(organization.id, db)
        async with db.begin_nested():
            answer = await generate_answer(
                service=service,
                organization=organization,
                message=payload.message,
                db=db,
                scope=scope,
                history=history,
                catalogue=catalogue,
            )
    except Exception:
        answer = {
            "reply": "The assistant is temporarily unavailable. Please try again.",
            "cited_sources": [],
            "answer_status": "ERROR",
            "retrieved_chunk_ids": [],
        }
    latency_ms = int((perf_counter() - started) * 1000)

    citations = [
        {
            "source_id": item.get("source_id"),
            "title": item["source_title"],
            "url": item.get("source_url"),
            "section": None,
        }
        for item in answer["cited_sources"]
    ]
    assistant_message = ChatMessage(
        conversation_id=conversation.id,
        role="assistant",
        content=answer["reply"],
        answer_status=answer["answer_status"],
        citations=citations,
        retrieved_chunk_ids=answer["retrieved_chunk_ids"],
        latency_ms=latency_ms,
    )
    db.add(assistant_message)
    if answer["answer_status"] in {"LOW_CONFIDENCE", "UNANSWERED"}:
        await record_issue(
            db,
            agency_id=organization.id,
            service_id=service.id if service is not None else None,
            source_kind="KNOWLEDGE_GAP",
            category=f"{scope}_UNANSWERED",
            example=payload.message,
        )
    await db.commit()

    return SaaSChatResponse(
        conversation_id=conversation.id,
        message_id=assistant_message.id,
        reply=assistant_message.content,
        answer_status=assistant_message.answer_status,
        citations=citations,
    )


@router.post(
    "/api/v1/public/services/{service_id}/chat",
    response_model=SaaSChatResponse,
)
async def public_chat(
    service_id: str,
    payload: SaaSChatRequest,
    db: AsyncSession = Depends(get_db),
):
    service = await load_service(service_id, db)
    payload.service_id = service_id
    return await run_logged_chat(
        payload=payload,
        organization=service.agency,
        service=service,
        scope="PUBLIC",
        db=db,
    )


@router.post(
    "/api/v1/public/organizations/{slug}/chat",
    response_model=SaaSChatResponse,
)
async def public_organization_chat(
    slug: str,
    payload: SaaSChatRequest,
    db: AsyncSession = Depends(get_db),
):
    """Answer a visitor's question about the organization as a whole.

    Visitors do not know which service holds their answer, so the assistant
    reads across everything the organization has published. A service_id may
    still be supplied to keep a page's context in focus.
    """
    result = await db.execute(
        select(Agency).where(Agency.slug == slug, Agency.is_active.is_(True))
    )
    organization = result.scalar_one_or_none()
    if organization is None:
        raise HTTPException(status_code=404, detail="Organization not found")

    service = None
    if payload.service_id:
        service = await load_service(payload.service_id, db, organization.id)

    return await run_logged_chat(
        payload=payload,
        organization=organization,
        service=service,
        scope="PUBLIC",
        db=db,
    )


@router.post("/api/v1/internal/chat", response_model=SaaSChatResponse)
async def internal_chat(
    payload: SaaSChatRequest,
    session: AccessSession = Depends(require_access_session),
    db: AsyncSession = Depends(get_db),
):
    organization_result = await db.execute(
        select(Agency).where(Agency.id == session.agency_id)
    )
    organization = organization_result.scalar_one()
    service = None
    if payload.service_id:
        service = await load_service(payload.service_id, db, session.agency_id)
    return await run_logged_chat(
        payload=payload,
        organization=organization,
        service=service,
        scope="INTERNAL",
        db=db,
        session_id=session.id,
    )


@router.get("/api/v1/internal/conversations/{conversation_id}")
async def get_internal_conversation(
    conversation_id: str,
    session: AccessSession = Depends(require_access_session),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.agency_id == session.agency_id,
            Conversation.scope == "INTERNAL",
        )
    )
    conversation = result.scalar_one_or_none()
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    messages = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.conversation_id == conversation.id)
        .order_by(ChatMessage.created_at)
    )
    return {
        "id": conversation.id,
        "scope": conversation.scope,
        "service_id": conversation.service_id,
        "department": conversation.department,
        "messages": [
            {
                "id": item.id,
                "role": item.role,
                "content": item.content,
                "answer_status": item.answer_status,
                "citations": item.citations,
                "feedback": item.feedback,
                "created_at": item.created_at,
            }
            for item in messages.scalars().all()
        ],
    }


@router.patch("/api/v1/public/messages/{message_id}/feedback")
async def submit_message_feedback(
    message_id: str,
    payload: MessageFeedback,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ChatMessage).where(
            ChatMessage.id == message_id,
            ChatMessage.role == "assistant",
        )
    )
    message = result.scalar_one_or_none()
    if message is None:
        raise HTTPException(status_code=404, detail="Answer not found")
    message.feedback = payload.feedback
    await db.commit()
    return {"id": message.id, "feedback": message.feedback}
