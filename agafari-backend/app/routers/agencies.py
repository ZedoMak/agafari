from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.database.session import get_db
from app.models import Agency
from app.schemas import AgencySchema

router = APIRouter(prefix="/api/v1/agencies", tags=["Agencies"])


@router.get("", response_model=List[AgencySchema])
async def get_agencies(db: AsyncSession = Depends(get_db)):
    """Returns all government agencies."""
    result = await db.execute(select(Agency))
    return result.scalars().all()