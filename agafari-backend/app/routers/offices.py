from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from app.database.session import get_db
from app.models import Office
from app.schemas import OfficeSchema

router = APIRouter(prefix="/api/v1/offices", tags=["Offices"])


@router.get("", response_model=List[OfficeSchema])
async def get_offices(db: AsyncSession = Depends(get_db)):
    """Returns all government office locations."""
    result = await db.execute(select(Office))
    return result.scalars().all()


@router.get("/{office_id}", response_model=OfficeSchema)
async def get_office(office_id: str, db: AsyncSession = Depends(get_db)):
    """Returns details for a specific office."""
    result = await db.execute(
        select(Office)
        .options(selectinload(Office.services))
        .where(Office.id == office_id)
    )
    office = result.scalar_one_or_none()
    if not office:
        raise HTTPException(status_code=404, detail="Office not found")
    return office