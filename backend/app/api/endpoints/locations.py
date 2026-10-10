"""
Locations Endpoints — Military base depots and forward outposts.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.location import Location
from app.schemas.location import LocationResponse, LocationListResponse

router = APIRouter(prefix="/locations", tags=["Tactical Locations"])


@router.get("", response_model=LocationListResponse)
async def list_locations(
    sector: Optional[str] = Query(default=None, description="Filter by sector"),
    node_type: Optional[str] = Query(default=None, description="Filter by node type"),
    db: AsyncSession = Depends(get_db),
) -> LocationListResponse:
    """Retrieve all military logistics nodes in Northern Command XIV Corps."""
    query = select(Location)
    if sector:
        query = query.where(Location.sector == sector)
    if node_type:
        query = query.where(Location.node_type == node_type)

    result = await db.execute(query)
    locations = result.scalars().all()

    return LocationListResponse(
        total=len(locations),
        items=[LocationResponse.model_validate(loc) for loc in locations],
    )


@router.get("/{location_id}", response_model=LocationResponse)
async def get_location(location_id: str, db: AsyncSession = Depends(get_db)) -> LocationResponse:
    """Retrieve details for a specific base depot or forward post."""
    result = await db.execute(select(Location).where(Location.id == location_id))
    loc = result.scalar_one_or_none()
    if not loc:
        raise HTTPException(status_code=404, detail=f"Location {location_id} not found in theater")
    return LocationResponse.model_validate(loc)
