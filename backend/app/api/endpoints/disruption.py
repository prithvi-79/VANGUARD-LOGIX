"""
FastAPI Endpoints for What-If Disruption Scenario Simulator
"""

from typing import List
from fastapi import APIRouter
from app.schemas.disruption import (
    DisruptionScenarioPreset,
    DisruptionSimulationRequest,
    DisruptionSimulationResponse,
)
from app.services.disruption import (
    get_all_scenarios,
    simulate_disruption_scenario,
)

router = APIRouter(prefix="/disruption", tags=["What-If Disruption Simulator"])


@router.get("/scenarios", response_model=List[DisruptionScenarioPreset])
async def list_disruption_scenarios() -> List[DisruptionScenarioPreset]:
    """Retrieve the 5 standard military disruption scenario presets."""
    return get_all_scenarios()


@router.post("/simulate", response_model=DisruptionSimulationResponse)
async def run_disruption_simulation(
    req: DisruptionSimulationRequest,
) -> DisruptionSimulationResponse:
    """
    Execute What-If disruption simulation.
    Evaluates temperature drops, troop headcount surges, closed pass choke points,
    and road fleet capacity reduction to output comprehensive delta impact analytics.
    """
    return simulate_disruption_scenario(req)
