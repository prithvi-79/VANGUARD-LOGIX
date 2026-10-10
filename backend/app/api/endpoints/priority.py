"""
Multi-Attribute Priority Scoring & Replenishment Queue API Endpoints
"""

from dataclasses import asdict
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.supply import InventoryRecord
from app.models.route import Route, StrategicPass
from app.services.priority_scoring import (
    PriorityInput,
    PriorityScoreResult,
    compute_priority_score,
    rank_priority_queue,
)

router = APIRouter(prefix="/priority", tags=["Priority Scoring & Indent Ranking"])


class CustomPriorityScoreRequest(BaseModel):
    location_id: str = Field(..., examples=["LOC-KUMAR"])
    location_name: str = Field(..., examples=["Kumar Base (Siachen)"])
    elevation_m: float = Field(default=4850.0, examples=[4850.0])
    supply_id: str = Field(..., examples=["SUP-POL-DIESEL-ARCTIC"])
    supply_name: str = Field(..., examples=["Arctic High-Altitude Diesel Fuel"])
    supply_class: str = Field(..., examples=["CLASS_III"])
    current_stock: float = Field(..., examples=[320.0])
    daily_consumption_rate: float = Field(..., examples=[85.0])
    safety_stock_threshold: float = Field(..., examples=[600.0])
    lead_time_days: float = Field(default=3.0, examples=[3.0])
    route_status: str = Field(default="OPEN", examples=["OPEN"])
    weather_risk_level: str = Field(default="HIGH", examples=["HIGH"])
    headcount: int = Field(default=65, examples=[65])


@router.get("/queue")
async def get_ranked_priority_queue(
    tier: Optional[str] = Query(default=None, description="Filter by tier: OP_IMMEDIATE, HIGH, MEDIUM, ROUTINE"),
    supply_class: Optional[str] = Query(default=None, description="Filter by supply class: CLASS_I, CLASS_II, CLASS_III, CLASS_IV, CLASS_V"),
    location_id: Optional[str] = Query(default=None, description="Filter by outpost location ID"),
    limit: int = Query(default=50, ge=1, le=200, description="Max items returned"),
    db: AsyncSession = Depends(get_db),
):
    """
    Computes real-time multi-attribute priority scores across all forward post
    inventories and returns a descending ranked replenishment dispatch queue.
    """
    # 1. Fetch routes and passes to detect route choke point statuses
    routes_result = await db.execute(select(Route))
    routes = routes_result.scalars().all()
    
    passes_result = await db.execute(select(StrategicPass))
    passes = {p.id: p for p in passes_result.scalars().all()}
    
    # Map destination location_id -> most restrictive route status
    location_route_status: Dict[str, str] = {}
    for r in routes:
        status = r.status
        if r.choke_pass_id and r.choke_pass_id in passes:
            pass_obj = passes[r.choke_pass_id]
            if pass_obj.status in ("CLOSED_BLIZZARD", "CLOSED_AVALANCHE"):
                status = "CLOSED"
            elif pass_obj.status == "RESTRICTED_CONVOY":
                status = "RESTRICTED"
        
        # Keep most restrictive status for destination
        dest = r.destination_id
        if dest not in location_route_status or status == "CLOSED":
            location_route_status[dest] = status
        elif status == "RESTRICTED" and location_route_status[dest] == "OPEN":
            location_route_status[dest] = status

    # 2. Fetch inventory records with associated location and supply items
    query = (
        select(InventoryRecord)
        .options(selectinload(InventoryRecord.supply), selectinload(InventoryRecord.location))
    )
    if location_id:
        query = query.where(InventoryRecord.location_id == location_id)

    records_result = await db.execute(query)
    records = records_result.scalars().all()

    priority_inputs: List[PriorityInput] = []
    for rec in records:
        loc = rec.location
        sup = rec.supply
        if not loc or not sup:
            continue

        if supply_class and sup.supply_class != supply_class:
            continue

        route_status = location_route_status.get(rec.location_id, "OPEN")

        priority_inputs.append(
            PriorityInput(
                location_id=rec.location_id,
                location_name=loc.name,
                elevation_m=loc.elevation_m,
                supply_id=rec.supply_id,
                supply_name=sup.name,
                supply_class=sup.supply_class,
                current_stock=rec.current_stock,
                daily_consumption_rate=rec.daily_consumption_rate,
                safety_stock_threshold=rec.safety_stock_threshold,
                lead_time_days=3.0,
                route_status=route_status,
                weather_risk_level=loc.weather_risk_level,
                headcount=loc.current_headcount,
            )
        )

    # 3. Compute and sort priority scores
    ranked_results = rank_priority_queue(priority_inputs)

    # 4. Optional tier filter
    if tier:
        ranked_results = [r for r in ranked_results if r.priority_tier == tier.upper()]

    # 5. Build summary breakdown
    total_count = len(ranked_results)
    op_immediate = sum(1 for r in ranked_results if r.priority_tier == "OP_IMMEDIATE")
    high = sum(1 for r in ranked_results if r.priority_tier == "HIGH")
    medium = sum(1 for r in ranked_results if r.priority_tier == "MEDIUM")
    routine = sum(1 for r in ranked_results if r.priority_tier == "ROUTINE")

    serialized_items = [asdict(r) for r in ranked_results[:limit]]

    return {
        "total_items": total_count,
        "op_immediate_count": op_immediate,
        "high_count": high,
        "medium_count": medium,
        "routine_count": routine,
        "items": serialized_items,
    }


@router.post("/score")
async def calculate_single_priority_score(
    request: CustomPriorityScoreRequest,
):
    """
    Computes an ad-hoc 0–100 multi-attribute priority score and tier recommendation
    for a given forward post demand or emergency indent requisition.
    """
    priority_input = PriorityInput(
        location_id=request.location_id,
        location_name=request.location_name,
        elevation_m=request.elevation_m,
        supply_id=request.supply_id,
        supply_name=request.supply_name,
        supply_class=request.supply_class,
        current_stock=request.current_stock,
        daily_consumption_rate=request.daily_consumption_rate,
        safety_stock_threshold=request.safety_stock_threshold,
        lead_time_days=request.lead_time_days,
        route_status=request.route_status,
        weather_risk_level=request.weather_risk_level,
        headcount=request.headcount,
    )

    result = compute_priority_score(priority_input)
    return asdict(result)
