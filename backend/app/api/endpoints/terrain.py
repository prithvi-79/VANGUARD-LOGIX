"""
Topographic and Slope Terrain Physics API Endpoints
"""

from dataclasses import asdict
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.route import Route, StrategicPass
from app.services.terrain import (
    RoutePhysicsInput,
    RoutePhysicsOutput,
    compute_route_physics,
    calculate_grade_resistance,
    get_surface_friction_multiplier,
    get_weather_friction_multiplier,
)

router = APIRouter(prefix="/terrain", tags=["Topographic & Terrain Physics Engine"])


class TerrainSimulationRequest(BaseModel):
    distance_km: float = Field(..., gt=0, examples=[120.0])
    max_slope_deg: float = Field(..., ge=0, le=45.0, examples=[14.5])
    surface_type: str = Field(default="MOUNTAIN_ROAD", examples=["MOUNTAIN_ROAD"])
    base_transit_hours: float = Field(default=5.0, gt=0, examples=[5.0])
    pass_status: str = Field(default="OPEN", examples=["OPEN"])
    pass_name: Optional[str] = Field(default=None, examples=["Khardung La Pass"])
    weather_condition: str = Field(default="NORMAL", examples=["SNOW_ICE"])


@router.get("/route-physics")
async def get_all_routes_physics(
    weather_condition: Optional[str] = Query(default=None, description="Override weather condition: NORMAL, RAIN_SLUSH, SNOW_ICE, BLIZZARD"),
    pass_id: Optional[str] = Query(default=None, description="Filter routes passing through strategic pass"),
    db: AsyncSession = Depends(get_db),
):
    """
    Computes rigorous empirical topographic and slope physics across all supply corridors:
    - Grade Resistance: Rg = 1.0 + 0.035|theta| + 0.002|theta|^2
    - Surface friction & weather degradation factors
    - Strategic pass choke-point severance & air-bridge recommendations
    """
    routes_result = await db.execute(select(Route))
    routes = routes_result.scalars().all()

    passes_result = await db.execute(select(StrategicPass))
    passes = {p.id: p for p in passes_result.scalars().all()}

    corridors: List[RoutePhysicsOutput] = []

    for r in routes:
        if pass_id and r.choke_pass_id != pass_id:
            continue

        pass_obj = passes.get(r.choke_pass_id) if r.choke_pass_id else None
        pass_status = pass_obj.status if pass_obj else "OPEN"
        pass_name = pass_obj.name if pass_obj else None

        # Effective weather condition
        effective_weather = weather_condition or "NORMAL"
        if pass_obj and pass_obj.status == "CLOSED_BLIZZARD":
            effective_weather = "BLIZZARD"

        phys_input = RoutePhysicsInput(
            route_id=r.id,
            route_name=r.name,
            distance_km=r.distance_km,
            max_slope_deg=r.max_slope_deg,
            average_elevation_m=r.average_elevation_m,
            surface_type=r.surface_type,
            base_transit_hours=r.base_transit_hours,
            pass_status=pass_status,
            pass_name=pass_name,
            weather_condition=effective_weather,
        )

        output = compute_route_physics(phys_input)
        corridors.append(output)

    total_corridors = len(corridors)
    open_count = sum(1 for c in corridors if c.status == "OPEN")
    restricted_count = sum(1 for c in corridors if c.status == "RESTRICTED")
    closed_count = sum(1 for c in corridors if c.status == "CLOSED")
    air_bridge_count = sum(1 for c in corridors if c.contingency_fallback and "Air-Bridge" in c.contingency_fallback)

    return {
        "total_corridors": total_corridors,
        "open_count": open_count,
        "restricted_count": restricted_count,
        "closed_count": closed_count,
        "air_bridge_required_count": air_bridge_count,
        "corridors": [asdict(c) for c in corridors],
    }


@router.get("/route-physics/{route_id}")
async def get_single_route_physics(
    route_id: str,
    weather_condition: Optional[str] = Query(default=None),
    pass_status_override: Optional[str] = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    """
    Evaluates topographic friction and passability metrics for a specific supply corridor.
    """
    result = await db.execute(select(Route).where(Route.id == route_id))
    r = result.scalar_one_or_none()
    if not r:
        raise HTTPException(status_code=404, detail=f"Route corridor '{route_id}' not found")

    pass_obj = None
    if r.choke_pass_id:
        p_res = await db.execute(select(StrategicPass).where(StrategicPass.id == r.choke_pass_id))
        pass_obj = p_res.scalar_one_or_none()

    pass_status = pass_status_override or (pass_obj.status if pass_obj else "OPEN")
    pass_name = pass_obj.name if pass_obj else None
    effective_weather = weather_condition or ("BLIZZARD" if pass_status == "CLOSED_BLIZZARD" else "NORMAL")

    phys_input = RoutePhysicsInput(
        route_id=r.id,
        route_name=r.name,
        distance_km=r.distance_km,
        max_slope_deg=r.max_slope_deg,
        average_elevation_m=r.average_elevation_m,
        surface_type=r.surface_type,
        base_transit_hours=r.base_transit_hours,
        pass_status=pass_status,
        pass_name=pass_name,
        weather_condition=effective_weather,
    )

    output = compute_route_physics(phys_input)
    return asdict(output)


@router.post("/simulate")
async def simulate_custom_terrain_physics(
    request: TerrainSimulationRequest,
):
    """
    Simulates slope physics, friction, and effective transit delay for hypothetical
    military convoy corridors and weather scenarios.
    """
    phys_input = RoutePhysicsInput(
        route_id="SIM-ROUTE",
        route_name=f"Custom Simulated Corridor ({request.distance_km}km, {request.max_slope_deg}°)",
        distance_km=request.distance_km,
        max_slope_deg=request.max_slope_deg,
        average_elevation_m=4200.0,
        surface_type=request.surface_type,
        base_transit_hours=request.base_transit_hours,
        pass_status=request.pass_status,
        pass_name=request.pass_name,
        weather_condition=request.weather_condition,
    )

    output = compute_route_physics(phys_input)
    return asdict(output)
