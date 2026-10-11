"""
Pydantic Schemas for What-If Disruption Scenario Simulator
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class DisruptionScenarioPreset(BaseModel):
    id: str
    name: str
    code: str
    description: str
    severity: str
    default_temp_delta_c: float
    default_troop_surge_pct: float
    default_closed_passes: List[str]
    default_fleet_availability_pct: float
    tactical_rationale: str


class DisruptionSimulationRequest(BaseModel):
    scenario_id: Optional[str] = "BASELINE"
    temp_delta_c: float = Field(default=0.0, ge=-45.0, le=0.0)
    troop_surge_pct: float = Field(default=0.0, ge=0.0, le=100.0)
    closed_pass_ids: List[str] = Field(default_factory=list)
    fleet_availability_pct: float = Field(default=100.0, ge=10.0, le=100.0)


class LocationDisruptionDelta(BaseModel):
    location_id: str
    location_name: str
    sector: str
    elevation_m: float
    headcount_baseline: int
    headcount_disrupted: int
    baseline_mean_dos: float
    disrupted_mean_dos: float
    delta_dos: float
    baseline_critical_items: int
    disrupted_critical_items: int
    emergency_deficit_kg: float
    isolation_status: str  # ACCESSIBLE, CHOKED_PASS, CUT_OFF_AIR_ONLY
    contingency_mode: str  # ROAD, AIR_BRIDGE, AIR_DROP


class StrategicResponseAction(BaseModel):
    priority_level: str  # OP_IMMEDIATE, HIGH, MEDIUM
    action_title: str
    target_formation_or_unit: str
    operational_order: str
    justification: str


class DisruptionSimulationResponse(BaseModel):
    scenario_id: str
    scenario_name: str
    temp_delta_c: float
    troop_surge_pct: float
    fleet_availability_pct: float
    closed_pass_count: int

    # Aggregate Theater Deltas
    baseline_mean_dos: float
    disrupted_mean_dos: float
    dos_drop_pct: float

    baseline_stockout_events: int
    disrupted_stockout_events: int
    delta_stockout_events: int

    critical_outposts_baseline: int
    critical_outposts_disrupted: int
    delta_critical_outposts: int

    total_emergency_tonnage_kg: float
    mi17_sorties_required: int
    projected_transit_delay_hours: float

    location_deltas: List[LocationDisruptionDelta]
    response_actions: List[StrategicResponseAction]
