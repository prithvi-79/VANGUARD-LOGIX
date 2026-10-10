"""
Location Pydantic Schemas
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class LocationBase(BaseModel):
    id: str
    name: str
    node_type: str
    sector: str
    latitude: float
    longitude: float
    elevation_m: float
    mgrs_grid: str
    storage_capacity_tons: float
    current_headcount: int
    is_air_accessible: bool
    weather_risk_level: str


class LocationCreate(LocationBase):
    pass


class LocationResponse(LocationBase):
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class LocationListResponse(BaseModel):
    total: int
    items: List[LocationResponse]
