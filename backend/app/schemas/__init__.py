"""
Pydantic Schemas for VANGUARD-LOGIX
"""

from app.schemas.health import HealthResponse, DBStatusResponse
from app.schemas.location import LocationBase, LocationCreate, LocationResponse, LocationListResponse
from app.schemas.supply import (
    SupplyItemBase,
    SupplyItemResponse,
    InventoryRecordBase,
    InventoryRecordResponse,
    InventoryListResponse,
)
from app.schemas.route import (
    RouteBase,
    RouteResponse,
    StrategicPassBase,
    StrategicPassResponse,
    PassStatusUpdate,
)
from app.schemas.vehicle import VehicleBase, VehicleResponse, VehicleListResponse, VehicleAltitudeCheck
from app.schemas.indent import (
    IndentItem,
    IndentCreate,
    IndentResponse,
    IndentBatchSyncRequest,
    IndentBatchSyncResponse,
)

__all__ = [
    "HealthResponse",
    "DBStatusResponse",
    "LocationBase",
    "LocationCreate",
    "LocationResponse",
    "LocationListResponse",
    "SupplyItemBase",
    "SupplyItemResponse",
    "InventoryRecordBase",
    "InventoryRecordResponse",
    "InventoryListResponse",
    "RouteBase",
    "RouteResponse",
    "StrategicPassBase",
    "StrategicPassResponse",
    "PassStatusUpdate",
    "VehicleBase",
    "VehicleResponse",
    "VehicleListResponse",
    "VehicleAltitudeCheck",
    "IndentItem",
    "IndentCreate",
    "IndentResponse",
    "IndentBatchSyncRequest",
    "IndentBatchSyncResponse",
]
