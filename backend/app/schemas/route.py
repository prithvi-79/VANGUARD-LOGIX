"""
Route and Pass Pydantic Schemas
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class RouteBase(BaseModel):
    id: str
    name: str
    origin_id: str
    destination_id: str
    distance_km: float
    surface_type: str
    max_slope_deg: float
    average_elevation_m: float
    transit_mode: str
    base_transit_hours: float
    status: str
    choke_pass_id: Optional[str] = None


class RouteResponse(RouteBase):
    grade_resistance_factor: float
    surface_friction_factor: float

    model_config = ConfigDict(from_attributes=True)


class StrategicPassBase(BaseModel):
    id: str
    name: str
    highway: str
    elevation_m: float
    latitude: float
    longitude: float
    status: str
    snow_accumulation_cm: float
    temperature_c: float
    bro_detachment: str
    predicted_reopen_hours: float
    closure_reason: Optional[str] = None


class StrategicPassResponse(StrategicPassBase):
    is_passable: bool
    last_status_update: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class PassStatusUpdate(BaseModel):
    status: str
    snow_accumulation_cm: Optional[float] = None
    temperature_c: Optional[float] = None
    closure_reason: Optional[str] = None
    predicted_reopen_hours: Optional[float] = None
