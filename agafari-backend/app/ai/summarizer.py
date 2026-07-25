import logging
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database.session import async_session
from app.models import Service
from app.ai.llm import chat_completion
from app.ai.prompts import SUMMARIZATION_PROMPT

logger = logging.getLogger(__name__)

async def generate_service_summary(service_id: str) -> None:
    """
    Background worker function that reads a service's complete profile
    and uses Addis AI to generate a concise summary, updating the DB.
    """
    try:
        async with async_session() as db:
            result = await db.execute(
                select(Service)
                .options(
                    selectinload(Service.requirements),
                    selectinload(Service.sources)
                )
                .where(Service.id == service_id)
            )
            service = result.scalar_one_or_none()
            
            if not service:
                logger.error(f"Service {service_id} not found for summarization.")
                return
                
            # Build the context string
            reqs = "\n".join([f"- {r.title}: {r.description or ''}" for r in service.requirements])
            sources_text = "\n".join([s.raw_text_content[:300] for s in service.sources if s.raw_text_content])
            
            raw_text = f"""
Service: {service.title}
Category: {service.category}
Fee: {service.fee_etb} ETB
Processing Time: {service.processing_time}

Requirements:
{reqs}

Additional Directives/Notices:
{sources_text}
            """
            
            messages = [
                {"role": "system", "content": SUMMARIZATION_PROMPT},
                {"role": "user", "content": raw_text}
            ]
            
            # Call Addis AI
            summary = await chat_completion(messages, temperature=0.2)
            
            # Update the DB
            service.ai_summary = summary.strip()
            await db.commit()
            logger.info(f"Successfully generated summary for {service.title}")
            
    except Exception as e:
        logger.error(f"Failed to generate summary for {service_id}: {e}")
