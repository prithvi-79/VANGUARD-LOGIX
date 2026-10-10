"""
Fleet Endpoints — Multimodal vehicle management & altitude payload de-rating.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.vehicle import Vehicle
from app.schemas.vehicle import (
    VehicleResponse,
    VehicleListResponse,
    VehicleAltitudeCheck,
)

router = APIRouter(prefix="/fleet", tags=["Multimodal Fleet"])


@router.get("", response_model=VehicleListResponse)
async def list_fleet(
    mode: Optional[str] = Query(default=None, description="Filter by mode: ROAD, AIR, ALL_TERRAIN, ANIMAL_TRANSPORT"),
    status: Optional[str] = Query(default=None, description="Filter by operational status"),
    db: AsyncSession = Depends(get_db),
) -> VehicleListResponse:
    """Retrieve transport vehicles stationed in Northern Command XIV Corps."""
    query = select(Vehicle)
    if mode:
        query = query.where(Vehicle.mode == mode)
    if status:
        query = query.where(Vehicle.operational_status == status)

    result = await db.execute(query)
    vehicles = result.scalars().all()
    return VehicleListResponse(
        total=len(vehicles),
        items=[VehicleResponse.model_validate(v) for v in vehicles],
    )


@router.get("/{vehicle_id}/altitude-rating", response_model=VehicleAltitudeCheck)
async def check_altitude_payload(
    vehicle_id: str,
    elevation_m: float = Query(default=4500.0, description="Target altitude in meters MSL"),
    db: AsyncSession = Depends(get_db),
) -> VehicleAltitudeCheck:
    """
    Calculate dynamic payload de-rating for a vehicle operating at extreme high altitude.
    Applies empirical air density degradation above 3,000m MSL.
    """
    result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
    vehicle = result.scalar_one_or_none()
    if not vehicle:
        raise HTTPException(status_code=404, detail=f"Vehicle {vehicle_id} not found")

    effective_payload = vehicle.effective_payload_at_altitude(elevation_m)
    de_rating_percent = round((1.0 - (effective_payload / vehicle.max_payload_kg)) * 100.0, 1)

    return VehicleAltitudeCheck(
        vehicle_id=vehicle.id,
        callsign=vehicle.callsign,
        vehicle_type=vehicle.vehicle_type,
        rated_payload_kg=vehicle.max_payload_kg,
        elevation_m=elevation_m,
        effective_payload_kg=effective_payload,
        de_rating_percent=de_rating_percent,
    )
