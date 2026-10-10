"""
Routes & Strategic Mountain Passes Endpoints.
Includes real-time passability toggles for Border Roads Organisation (BRO).
"""

from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.route import Route, StrategicPass
from app.schemas.route import (
    RouteResponse,
    StrategicPassResponse,
    PassStatusUpdate,
)

router = APIRouter(tags=["Routes & Strategic Passes"])


@router.get("/routes", response_model=List[RouteResponse])
async def list_routes(
    origin_id: Optional[str] = Query(default=None),
    destination_id: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
    db: AsyncSession = Depends(get_db),
) -> List[RouteResponse]:
    """Retrieve tactical supply corridors and mountain route friction profiles."""
    query = select(Route)
    if origin_id:
        query = query.where(Route.origin_id == origin_id)
    if destination_id:
        query = query.where(Route.destination_id == destination_id)
    if status:
        query = query.where(Route.status == status)

    result = await db.execute(query)
    routes = result.scalars().all()
    return [
        RouteResponse(
            id=r.id,
            name=r.name,
            origin_id=r.origin_id,
            destination_id=r.destination_id,
            distance_km=r.distance_km,
            surface_type=r.surface_type,
            max_slope_deg=r.max_slope_deg,
            average_elevation_m=r.average_elevation_m,
            transit_mode=r.transit_mode,
            base_transit_hours=r.base_transit_hours,
            status=r.status,
            choke_pass_id=r.choke_pass_id,
            grade_resistance_factor=r.grade_resistance_factor,
            surface_friction_factor=r.surface_friction_factor,
        )
        for r in routes
    ]


@router.get("/passes", response_model=List[StrategicPassResponse])
async def list_passes(
    status: Optional[str] = Query(default=None, description="Filter by pass status"),
    db: AsyncSession = Depends(get_db),
) -> List[StrategicPassResponse]:
    """Retrieve Border Roads Organisation (BRO) mountain pass status and snow conditions."""
    query = select(StrategicPass)
    if status:
        query = query.where(StrategicPass.status == status)

    result = await db.execute(query)
    passes = result.scalars().all()
    return [
        StrategicPassResponse(
            id=p.id,
            name=p.name,
            highway=p.highway,
            elevation_m=p.elevation_m,
            latitude=p.latitude,
            longitude=p.longitude,
            status=p.status,
            snow_accumulation_cm=p.snow_accumulation_cm,
            temperature_c=p.temperature_c,
            bro_detachment=p.bro_detachment,
            predicted_reopen_hours=p.predicted_reopen_hours,
            closure_reason=p.closure_reason,
            is_passable=p.is_passable,
            last_status_update=p.last_status_update,
        )
        for p in passes
    ]


@router.patch("/passes/{pass_id}", response_model=StrategicPassResponse)
async def update_pass_status(
    pass_id: str,
    update: PassStatusUpdate,
    db: AsyncSession = Depends(get_db),
) -> StrategicPassResponse:
    """
    Update status of a strategic mountain pass (e.g. declare blizzard closure or clear road).
    Automatically propagates status to downstream routes that traverse this choke point.
    """
    result = await db.execute(select(StrategicPass).where(StrategicPass.id == pass_id))
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail=f"Pass {pass_id} not found")

    p.status = update.status
    if update.snow_accumulation_cm is not None:
        p.snow_accumulation_cm = update.snow_accumulation_cm
    if update.temperature_c is not None:
        p.temperature_c = update.temperature_c
    if update.closure_reason is not None:
        p.closure_reason = update.closure_reason
    if update.predicted_reopen_hours is not None:
        p.predicted_reopen_hours = update.predicted_reopen_hours
    p.last_status_update = datetime.now(timezone.utc)

    # Propagate to dependent routes
    routes_result = await db.execute(select(Route).where(Route.choke_pass_id == pass_id))
    dependent_routes = routes_result.scalars().all()
    for route in dependent_routes:
        if p.status in ("CLOSED_BLIZZARD", "CLOSED_AVALANCHE"):
            route.status = "CLOSED"
        elif p.status == "RESTRICTED_CONVOY":
            route.status = "RESTRICTED"
        else:
            route.status = "OPEN"

    await db.commit()
    await db.refresh(p)

    return StrategicPassResponse(
        id=p.id,
        name=p.name,
        highway=p.highway,
        elevation_m=p.elevation_m,
        latitude=p.latitude,
        longitude=p.longitude,
        status=p.status,
        snow_accumulation_cm=p.snow_accumulation_cm,
        temperature_c=p.temperature_c,
        bro_detachment=p.bro_detachment,
        predicted_reopen_hours=p.predicted_reopen_hours,
        closure_reason=p.closure_reason,
        is_passable=p.is_passable,
        last_status_update=p.last_status_update,
    )
