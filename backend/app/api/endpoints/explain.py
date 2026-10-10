"""
Causal Decision Explainability REST API Endpoints
"""

from dataclasses import asdict
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.location import Location
from app.models.supply import InventoryRecord
from app.models.route import Route, StrategicPass
from app.services.inventory_risk import assess_item_risk, InventoryItemState
from app.services.explainability import (
    DecisionExplanationReport,
    generate_decision_explanation,
)

router = APIRouter(prefix="/explain", tags=["Causal Decision Explainability Engine"])


class CustomExplanationRequest(BaseModel):
    decision_type: str = Field(default="DISPATCH_PRIORITY", examples=["DISPATCH_PRIORITY"])
    location_name: str = Field(..., examples=["Kumar Base (Siachen)"])
    elevation_m: float = Field(default=4850.0, examples=[4850.0])
    supply_name: str = Field(..., examples=["Arctic High-Altitude Diesel Fuel"])
    supply_class: str = Field(default="CLASS_III", examples=["CLASS_III"])
    days_of_supply: float = Field(default=1.8, examples=[1.8])
    pass_status: str = Field(default="CLOSED_BLIZZARD", examples=["CLOSED_BLIZZARD"])
    weather_condition: str = Field(default="BLIZZARD", examples=["BLIZZARD"])
    recommended_mode: str = Field(default="AIR_BRIDGE", examples=["AIR_BRIDGE"])
    headcount: int = Field(default=65, examples=[65])


@router.get("/outpost/{location_id}")
async def explain_outpost_replenishment_decision(
    location_id: str,
    supply_class: Optional[str] = Query(default="CLASS_III", description="Supply class to explain (e.g. CLASS_III, CLASS_I)"),
    db: AsyncSession = Depends(get_db),
):
    """
    Synthesizes a causal decision explanation report for a specific forward outpost,
    explaining why a priority tier and transit mode were assigned with counterfactual trade-offs.
    """
    # 1. Fetch location
    loc_res = await db.execute(select(Location).where(Location.id == location_id))
    loc = loc_res.scalar_one_or_none()
    if not loc:
        raise HTTPException(status_code=404, detail=f"Location '{location_id}' not found")

    # 2. Fetch inventory record
    inv_res = await db.execute(
        select(InventoryRecord)
        .options(selectinload(InventoryRecord.supply))
        .where(InventoryRecord.location_id == location_id)
    )
    records = inv_res.scalars().all()
    target_rec = None
    for r in records:
        if r.supply and r.supply.supply_class == supply_class:
            target_rec = r
            break
    if not target_rec and records:
        target_rec = records[0]

    # Calculate DoS
    if target_rec:
        item_state = InventoryItemState(
            location_id=location_id,
            supply_id=target_rec.supply_id,
            supply_name=target_rec.supply.name,
            supply_class=target_rec.supply.supply_class,
            current_stock=target_rec.current_stock,
            daily_consumption_rate=target_rec.daily_consumption_rate,
            safety_stock_threshold=target_rec.safety_stock_threshold,
            reorder_point=target_rec.reorder_point,
            elevation_m=loc.elevation_m,
            unit=target_rec.supply.unit,
        )
        risk = assess_item_risk(item_state)
        dos = risk.days_of_supply
        supply_name = target_rec.supply.name
        sup_class = target_rec.supply.supply_class
    else:
        dos = 2.5
        supply_name = "Arctic Diesel"
        sup_class = "CLASS_III"

    # 3. Check pass status on inbound routes
    routes_res = await db.execute(select(Route).where(Route.destination_id == location_id))
    inbound_routes = routes_res.scalars().all()
    pass_status = "OPEN"
    for r in inbound_routes:
        if r.choke_pass_id:
            p_res = await db.execute(select(StrategicPass).where(StrategicPass.id == r.choke_pass_id))
            pass_obj = p_res.scalar_one_or_none()
            if pass_obj and pass_obj.status in ("CLOSED_BLIZZARD", "CLOSED_AVALANCHE"):
                pass_status = pass_obj.status
                break

    mode = "AIR_BRIDGE" if pass_status in ("CLOSED_BLIZZARD", "CLOSED_AVALANCHE") else "ROAD"

    report = generate_decision_explanation(
        decision_type="DISPATCH_PRIORITY_AND_ROUTING",
        location_name=loc.name,
        elevation_m=loc.elevation_m,
        supply_name=supply_name,
        supply_class=sup_class,
        days_of_supply=dos,
        pass_status=pass_status,
        weather_condition=loc.weather_risk_level,
        recommended_mode=mode,
        headcount=loc.current_headcount,
    )

    return asdict(report)


@router.post("/decision")
async def explain_custom_decision(
    request: CustomExplanationRequest,
):
    """
    Evaluates causal factors and rejected counterfactual alternatives for any custom military dispatch decision.
    """
    report = generate_decision_explanation(
        decision_type=request.decision_type,
        location_name=request.location_name,
        elevation_m=request.elevation_m,
        supply_name=request.supply_name,
        supply_class=request.supply_class,
        days_of_supply=request.days_of_supply,
        pass_status=request.pass_status,
        weather_condition=request.weather_condition,
        recommended_mode=request.recommended_mode,
        headcount=request.headcount,
    )
    return asdict(report)
