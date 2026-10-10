"""
Vehicle Fleet Pydantic Schemas
"""

from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class VehicleBase(BaseModel):
    id: str
    callsign: str
    vehicle_type: str
    mode: str
    max_payload_kg: float
    service_ceiling_m: float
    fuel_type: str
    fuel_consumption_rate: float
    current_location_id: str
    operational_status: str


class VehicleResponse(VehicleBase):
    model_config = ConfigDict(from_attributes=True)


class VehicleListResponse(BaseModel):
    total: int
    items: List[VehicleResponse]


class VehicleAltitudeCheck(BaseModel):
    vehicle_id: str
    callsign: str
    vehicle_type: str
    rated_payload_kg: float
    elevation_m: float
    effective_payload_kg: float
    de_rating_percent: float
