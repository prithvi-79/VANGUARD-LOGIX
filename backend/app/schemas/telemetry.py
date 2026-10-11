"""
Pydantic Schemas for IoT Cold-Chain & Fuel Bladder Telemetry
"""

from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class TelemetryRecordResponse(BaseModel):
    id: str
    location_id: str
    location_name: str
    sensor_type: str
    reading_value: float
    unit: str
    status: str  # NORMAL, WARNING, CRITICAL
    alert_message: Optional[str] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class DiscrepancyAlert(BaseModel):
    id: str
    location_id: str
    location_name: str
    supply_id: str
    supply_name: str
    supply_class: str
    physical_sensor_reading: float
    book_stock_quantity: float
    discrepancy_amount: float
    discrepancy_pct: float
    severity: str  # CRITICAL, WARNING, MODERATE
    alert_type: str  # FUEL_LEAK_OR_PILFERAGE, COLD_CHAIN_EXCURSION, HEATER_FAILURE
    detection_message: str
    recommended_action: str
    timestamp: datetime


class TelemetryAnomalyRequest(BaseModel):
    location_id: str
    anomaly_type: str  # FUEL_LEAK, CRYOTHERM_FAILURE, BLADDER_PRESSURE_DROP
    severity: str = "CRITICAL"
    discrepancy_pct: float = 12.5


class TelemetryOverviewResponse(BaseModel):
    total_active_sensors: int
    sensors_normal: int
    sensors_warning: int
    sensors_critical: int
    readings: List[TelemetryRecordResponse]
    active_discrepancies: List[DiscrepancyAlert]
