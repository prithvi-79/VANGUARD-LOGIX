"""
SQLAlchemy 2.0 Models for VANGUARD-LOGIX
"""

from app.models.location import Location
from app.models.supply import SupplyItem, InventoryRecord
from app.models.route import Route, StrategicPass
from app.models.vehicle import Vehicle
from app.models.indent import IndentVoucher
from app.models.telemetry import TelemetryRecord

__all__ = [
    "Location",
    "SupplyItem",
    "InventoryRecord",
    "Route",
    "StrategicPass",
    "Vehicle",
    "IndentVoucher",
    "TelemetryRecord",
]
