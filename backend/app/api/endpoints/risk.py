"""
Risk & Inventory Burn-Down API Endpoints
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.location import Location
from app.models.supply import InventoryRecord, SupplyItem
from app.services.inventory_risk import (
    InventoryItemState,
    assess_item_risk,
    simulate_burn_down,
)

router = APIRouter(prefix="/risk", tags=["Inventory Risk & DoS Engine"])


@router.get("/evaluate")
async def evaluate_theater_risk(
    location_id: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    """
    Evaluates dynamic Days-of-Supply, elevation-scaled burn multipliers,
    and safety deficit metrics across all forward post stock registers.
    """
    query = (
        select(InventoryRecord)
        .options(selectinload(InventoryRecord.supply), selectinload(InventoryRecord.location))
    )
    if location_id:
        query = query.where(InventoryRecord.location_id == location_id)

    result = await db.execute(query)
    records = result.scalars().all()

    assessments = []
    for rec in records:
        loc = rec.location
        sup = rec.supply
        if not sup or not loc:
            continue

        item_state = InventoryItemState(
            location_id=rec.location_id,
            supply_id=rec.supply_id,
            supply_name=sup.name,
            supply_class=sup.supply_class,
            current_stock=rec.current_stock,
            daily_consumption_rate=rec.daily_consumption_rate,
            safety_stock_threshold=rec.safety_stock_threshold,
            reorder_point=rec.reorder_point,
            elevation_m=loc.elevation_m,
            unit=sup.unit,
        )

        assessment = assess_item_risk(item_state)
        if status and assessment.status != status:
            continue

        assessments.append(assessment)

    return {
        "total_evaluated": len(assessments),
        "critical_count": sum(1 for a in assessments if a.status == "CRITICAL"),
        "warning_count": sum(1 for a in assessments if a.status == "WARNING"),
        "normal_count": sum(1 for a in assessments if a.status == "NORMAL"),
        "items": assessments,
    }


@router.get("/burn-down")
async def get_burn_down_trajectory(
    location_id: str = Query(..., description="Target forward post ID (e.g. LOC-KUMAR, LOC-DBO)"),
    supply_id: str = Query(..., description="Target supply ID (e.g. SUP-POL-DIESEL-ARCTIC)"),
    days: int = Query(default=14, ge=5, le=30, description="Trajectory forecast horizon in days"),
    db: AsyncSession = Depends(get_db),
):
    """
    Simulates day-by-day forward inventory depletion trajectory, showing stock level,
    Days-of-Supply, and danger zone threshold crossings over N days.
    """
    result = await db.execute(
        select(InventoryRecord)
        .options(selectinload(InventoryRecord.supply), selectinload(InventoryRecord.location))
        .where(InventoryRecord.location_id == location_id, InventoryRecord.supply_id == supply_id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(
            status_code=404,
            detail=f"Inventory ledger for {location_id} and {supply_id} not found",
        )

    loc = record.location
    sup = record.supply

    # Generate daily burn rates
    base_rate = record.daily_consumption_rate
    rates = [base_rate for _ in range(days)]

    trajectory = simulate_burn_down(
        initial_stock=record.current_stock,
        daily_rates=rates,
        safety_threshold=record.safety_stock_threshold,
        reorder_point=record.reorder_point,
        num_days=days,
    )

    return {
        "location_id": location_id,
        "location_name": loc.name if loc else location_id,
        "elevation_m": loc.elevation_m if loc else 3500.0,
        "supply_id": supply_id,
        "supply_name": sup.name if sup else supply_id,
        "initial_stock": record.current_stock,
        "unit": sup.unit if sup else "KG",
        "horizon_days": days,
        "trajectory": trajectory,
    }
