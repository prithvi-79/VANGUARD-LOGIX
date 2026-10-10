"""
Supplies & Inventory Endpoints — ASC/AOC supply catalog and inventory ledgers.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.supply import SupplyItem, InventoryRecord
from app.schemas.supply import (
    SupplyItemResponse,
    InventoryRecordResponse,
    InventoryListResponse,
)

router = APIRouter(tags=["Supplies & Inventory"])


@router.get("/supplies", response_model=list[SupplyItemResponse])
async def list_supplies(
    supply_class: Optional[str] = Query(default=None, description="Filter by class (e.g. CLASS_I, CLASS_III)"),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve items from the Indian Army ASC/AOC master supply catalog."""
    query = select(SupplyItem)
    if supply_class:
        query = query.where(SupplyItem.supply_class == supply_class)

    result = await db.execute(query)
    items = result.scalars().all()
    return [SupplyItemResponse.model_validate(item) for item in items]


@router.get("/inventory", response_model=InventoryListResponse)
async def list_inventory(
    location_id: Optional[str] = Query(default=None, description="Filter by location ID"),
    supply_class: Optional[str] = Query(default=None, description="Filter by supply class"),
    status: Optional[str] = Query(default=None, description="Filter by risk status: CRITICAL, WARNING, NORMAL"),
    db: AsyncSession = Depends(get_db),
) -> InventoryListResponse:
    """Retrieve forward post and depot inventory ledgers with Days-of-Supply countdowns."""
    query = select(InventoryRecord).options(selectinload(InventoryRecord.supply))
    if location_id:
        query = query.where(InventoryRecord.location_id == location_id)

    result = await db.execute(query)
    records = result.scalars().all()

    items = []
    for rec in records:
        if supply_class and rec.supply and rec.supply.supply_class != supply_class:
            continue
        if status and rec.status != status:
            continue
        items.append(
            InventoryRecordResponse(
                id=rec.id,
                location_id=rec.location_id,
                supply_id=rec.supply_id,
                current_stock=rec.current_stock,
                daily_consumption_rate=rec.daily_consumption_rate,
                safety_stock_threshold=rec.safety_stock_threshold,
                reorder_point=rec.reorder_point,
                batch_number=rec.batch_number,
                days_of_supply=rec.days_of_supply,
                status=rec.status,
                updated_at=rec.updated_at,
                supply=SupplyItemResponse.model_validate(rec.supply) if rec.supply else None,
            )
        )

    return InventoryListResponse(total=len(items), items=items)
