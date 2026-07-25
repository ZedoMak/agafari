from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database.session import get_db
from app.models import Service
from app.schemas import ChatRequest, ChatResponse
from app.ai.rag import generate_answer

router = APIRouter(prefix="/api/v1/services", tags=["AI Chat"])


@router.post("/{service_id}/chat", response_model=ChatResponse)
async def chat_with_service_ai(
        service_id: str,
        payload: ChatRequest,
        db: AsyncSession = Depends(get_db)
):
    """
    Accepts a user chat message, retrieves the service's verified sources (Context),
    and generates a grounded AI response using the RAG pipeline.
    """
    result = await db.execute(
        select(Service)
        .options(
            selectinload(Service.agency),
            selectinload(Service.requirements),
            selectinload(Service.sources),
        )
        .where(Service.id == service_id)
    )
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Service context not found")

    # Run the full RAG pipeline
    answer = await generate_answer(
        service=service,
        message=payload.message,
        db=db,
    )

    return ChatResponse(
        reply=answer["reply"],
        cited_sources=answer["cited_sources"],
    )