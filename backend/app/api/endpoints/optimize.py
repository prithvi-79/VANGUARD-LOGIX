"""
Multimodal Fleet Routing & Allocation Optimizer API Endpoints
"""

from dataclasses import asdict
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.location import Location
from app.models.supply import InventoryRecord
from app.models.route import Route, StrategicPass
from app.models.vehicle import Vehicle
from app.services.inventory_risk import assess_item_risk, InventoryItemState
from app.services.optimizer import (
    DeliveryDemand,
    VehicleCandidate,
    OptimizationResult,
    solve_multimodal_fleet_dispatch,
)

router = APIRouter(prefix="/optimize", tags=["Multimodal Fleet Optimizer"])


class CustomDemandItem(BaseModel):
    order_id: str = Field(..., examples=["ORD-001"])
    destination_id: str = Field(..., examples=["LOC-KUMAR"])
    destination_name: str = Field(..., examples=["Kumar Base (Siachen)"])
    elevation_m: float = Field(default=4850.0, examples=[4850.0])
    supply_id: str = Field(..., examples=["SUP-POL-DIESEL-ARCTIC"])
    supply_name: str = Field(..., examples=["Arctic Diesel Fuel"])
    supply_class: str = Field(default="CLASS_III", examples=["CLASS_III"])
    demand_kg: float = Field(..., gt=0, examples=[1200.0])
    priority_tier: str = Field(default="OP_IMMEDIATE", examples=["OP_IMMEDIATE"])
    route_status: str = Field(default="OPEN", examples=["OPEN"])


class FleetOptimizationSimulationRequest(BaseModel):
    depot_location_id: str = Field(default="LOC-LEH", examples=["LOC-LEH"])
    depot_name: str = Field(default="14 Corps HQ Logistics Hub, Leh", examples=["14 Corps HQ Logistics Hub, Leh"])
    demands: List[CustomDemandItem]
    speed_kmh: float = Field(default=28.0, gt=5.0, le=60.0, examples=[28.0])


@router.get("/fleet-dispatch")
async def generate_fleet_dispatch_plan(
    depot_id: str = Query(default="LOC-LEH", description="Base logistics staging hub ID (e.g. LOC-LEH, LOC-THOISE)"),
    db: AsyncSession = Depends(get_db),
):
    """
    Computes an optimal multimodal vehicle routing and payload allocation dispatch plan
    fulfilling all critical and warning forward post supply deficits.
    """
    # 1. Fetch Depot
    depot_res = await db.execute(select(Location).where(Location.id == depot_id))
    depot = depot_res.scalar_one_or_none()
    if not depot:
        raise HTTPException(status_code=404, detail=f"Logistics depot '{depot_id}' not found")

    # 2. Fetch Routes & Passes to build distance matrix and check pass status
    routes_res = await db.execute(select(Route))
    routes = routes_res.scalars().all()

    passes_res = await db.execute(select(StrategicPass))
    passes = {p.id: p for p in passes_res.scalars().all()}

    distance_matrix: Dict[str, Dict[str, float]] = {}
    destination_route_status: Dict[str, str] = {}

    for r in routes:
        if r.origin_id not in distance_matrix:
            distance_matrix[r.origin_id] = {}
        distance_matrix[r.origin_id][r.destination_id] = r.distance_km

        # Status check
        status = r.status
        if r.choke_pass_id and r.choke_pass_id in passes:
            pass_obj = passes[r.choke_pass_id]
            if pass_obj.status in ("CLOSED_BLIZZARD", "CLOSED_AVALANCHE"):
                status = "CLOSED"
            elif pass_obj.status == "RESTRICTED_CONVOY":
                status = "RESTRICTED"

        destination_route_status[r.destination_id] = status

    # 3. Identify all critical and warning inventory deficits
    inv_res = await db.execute(
        select(InventoryRecord)
        .options(selectinload(InventoryRecord.supply), selectinload(InventoryRecord.location))
    )
    records = inv_res.scalars().all()

    demands: List[DeliveryDemand] = []
    for rec in records:
        if not rec.supply or not rec.location:
            continue

        item_state = InventoryItemState(
            location_id=rec.location_id,
            supply_id=rec.supply_id,
            supply_name=rec.supply.name,
            supply_class=rec.supply.supply_class,
            current_stock=rec.current_stock,
            daily_consumption_rate=rec.daily_consumption_rate,
            safety_stock_threshold=rec.safety_stock_threshold,
            reorder_point=rec.reorder_point,
            elevation_m=rec.location.elevation_m,
            unit=rec.supply.unit,
        )
        risk = assess_item_risk(item_state)

        # Include if stock is CRITICAL or WARNING
        if risk.status in ("CRITICAL", "WARNING"):
            deficit = max(
                risk.safety_deficit,
                rec.reorder_point - rec.current_stock if rec.current_stock < rec.reorder_point else 100.0,
            )
            # Convert units to KG approximate payload
            weight_kg = deficit * rec.supply.unit_weight_kg

            tier = "OP_IMMEDIATE" if risk.status == "CRITICAL" else "HIGH"
            route_status = destination_route_status.get(rec.location_id, "OPEN")

            demands.append(
                DeliveryDemand(
                    order_id=f"DISP-{rec.location_id}-{rec.supply_id}",
                    destination_id=rec.location_id,
                    destination_name=rec.location.name,
                    elevation_m=rec.location.elevation_m,
                    supply_id=rec.supply_id,
                    supply_name=rec.supply.name,
                    supply_class=rec.supply.supply_class,
                    demand_kg=round(weight_kg, 1),
                    priority_tier=tier,
                    route_status=route_status,
                )
            )

    # 4. Fetch available Fleet vehicles
    veh_res = await db.execute(select(Vehicle))
    vehicles_db = veh_res.scalars().all()

    fleet_candidates = [
        VehicleCandidate(
            vehicle_id=v.id,
            callsign=v.callsign,
            vehicle_type=v.vehicle_type,
            mode=v.mode,
            max_payload_kg=v.max_payload_kg,
            service_ceiling_m=v.service_ceiling_m,
            operational_status=v.operational_status,
            current_location_id=v.current_location_id,
        )
        for v in vehicles_db
    ]

    # 5. Execute Solver
    result = solve_multimodal_fleet_dispatch(
        depot_location_id=depot.id,
        depot_name=depot.name,
        demands=demands,
        vehicles=fleet_candidates,
        distance_matrix=distance_matrix,
    )

    return asdict(result)


@router.post("/simulate")
async def simulate_custom_fleet_optimization(
    request: FleetOptimizationSimulationRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Simulates multi-vehicle fleet optimization for custom operational demand sets.
    """
    # Fetch vehicles
    veh_res = await db.execute(select(Vehicle))
    vehicles_db = veh_res.scalars().all()

    fleet_candidates = [
        VehicleCandidate(
            vehicle_id=v.id,
            callsign=v.callsign,
            vehicle_type=v.vehicle_type,
            mode=v.mode,
            max_payload_kg=v.max_payload_kg,
            service_ceiling_m=v.service_ceiling_m,
            operational_status=v.operational_status,
            current_location_id=v.current_location_id,
        )
        for v in vehicles_db
    ]

    demands = [
        DeliveryDemand(
            order_id=d.order_id,
            destination_id=d.destination_id,
            destination_name=d.destination_name,
            elevation_m=d.elevation_m,
            supply_id=d.supply_id,
            supply_name=d.supply_name,
            supply_class=d.supply_class,
            demand_kg=d.demand_kg,
            priority_tier=d.priority_tier,
            route_status=d.route_status,
        )
        for d in request.demands
    ]

    result = solve_multimodal_fleet_dispatch(
        depot_location_id=request.depot_location_id,
        depot_name=request.depot_name,
        demands=demands,
        vehicles=fleet_candidates,
        transit_speed_kmh=request.speed_kmh,
    )

    return asdict(result)
