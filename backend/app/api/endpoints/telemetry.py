"""
FastAPI Endpoints for IoT Cold-Chain & Fuel Bladder Telemetry
"""

from typing import List, Dict, Any
from fastapi import APIRouter
from app.schemas.telemetry import (
    TelemetryOverviewResponse,
    TelemetryRecordResponse,
    DiscrepancyAlert,
    TelemetryAnomalyRequest,
)
from app.services.telemetry import (
    get_telemetry_overview,
    get_deterministic_telemetry_stream,
    detect_inventory_discrepancies,
    inject_simulated_anomaly,
)

router = APIRouter(prefix="/telemetry", tags=["IoT Cold-Chain & Fuel Telemetry"])


@router.get("/overview", response_model=TelemetryOverviewResponse)
async def get_overview() -> TelemetryOverviewResponse:
    """Retrieve aggregate telemetry overview including active sensor status and discrepancy alerts."""
    return get_telemetry_overview()


@router.get("/live", response_model=List[TelemetryRecordResponse])
async def list_live_readings() -> List[TelemetryRecordResponse]:
    """Retrieve real-time IoT readings across fuel bladders, cryo-coolers, and pass weather stations."""
    return get_deterministic_telemetry_stream()


@router.get("/discrepancies", response_model=List[DiscrepancyAlert])
async def list_discrepancies() -> List[DiscrepancyAlert]:
    """
    Retrieve detected discrepancies between physical sensor telemetry and book inventory records.
    Flags potential fuel leaks, pilferage, and medical cold-chain temperature excursions.
    """
    return detect_inventory_discrepancies()


@router.post("/simulate-anomaly")
async def simulate_anomaly(req: TelemetryAnomalyRequest) -> Dict[str, Any]:
    """
    Inject or reset simulated sensor discrepancies for jury demonstrations.
    Allows live triggering of fuel bladder leaks or cryo-chamber overheating.
    """
    return inject_simulated_anomaly(req)
