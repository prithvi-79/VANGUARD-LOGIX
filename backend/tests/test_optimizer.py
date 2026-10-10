"""
Tests for Multimodal Fleet Optimizer & CVRPTW Solver.
Validates payload altitude de-rating, daylight window enforcement, and air-bridge deployment.
"""

import pytest
from httpx import AsyncClient

from app.services.optimizer import (
    DeliveryDemand,
    VehicleCandidate,
    compute_effective_vehicle_payload,
    solve_multimodal_fleet_dispatch,
)


def test_effective_payload_de_rating():
    """Verify high-altitude payload envelopes de-rate above 3,000m MSL."""
    # Sea level or below 3,000m: 100% nominal payload
    assert compute_effective_vehicle_payload(2500.0, "ROAD", 2500.0) == 2500.0

    # Road truck at 4,850m (Siachen): de-rates ~15%
    derated_road = compute_effective_vehicle_payload(2500.0, "ROAD", 4850.0)
    assert derated_road < 2500.0
    assert derated_road >= 1500.0

    # Helicopter at 4,850m: de-rates ~28%
    derated_air = compute_effective_vehicle_payload(3000.0, "AIR", 4850.0)
    assert derated_air < 3000.0
    assert derated_air >= 1800.0


def test_solve_multimodal_dispatch_air_bridge_trigger():
    """Severed mountain pass must trigger automated tactical air-bridge sortie."""
    demands = [
        DeliveryDemand(
            order_id="ORD-1",
            destination_id="LOC-KUMAR",
            destination_name="Kumar Post (Siachen)",
            elevation_m=4850.0,
            supply_id="SUP-POL-DIESEL-ARCTIC",
            supply_name="Arctic Diesel",
            supply_class="CLASS_III",
            demand_kg=1200.0,
            priority_tier="OP_IMMEDIATE",
            route_status="CLOSED",  # Road pass closed!
        )
    ]
    vehicles = [
        VehicleCandidate(
            vehicle_id="VEH-MI17-01",
            callsign="GARUDA-01",
            vehicle_type="MI17_V5_HELI",
            mode="AIR",
            max_payload_kg=3000.0,
            service_ceiling_m=6000.0,
            operational_status="AVAILABLE",
            current_location_id="LOC-LEH",
        )
    ]

    res = solve_multimodal_fleet_dispatch(
        depot_location_id="LOC-LEH",
        depot_name="Leh Logistics Hub",
        demands=demands,
        vehicles=vehicles,
    )
    assert res.air_bridge_sorties_count == 1
    assert len(res.dispatch_plans) == 1
    plan = res.dispatch_plans[0]
    assert plan.is_air_bridge is True
    assert plan.mode == "AIR"
    assert plan.fits_daylight_window is True


# ==============================================================================
# REST API Integration Tests
# ==============================================================================

@pytest.mark.asyncio
async def test_api_optimize_fleet_dispatch(test_client: AsyncClient):
    """Test GET /api/optimize/fleet-dispatch returns multi-vehicle dispatch plan."""
    response = await test_client.get("/api/optimize/fleet-dispatch?depot_id=LOC-LEH")
    assert response.status_code == 200
    data = response.json()
    assert "total_demands_count" in data
    assert "dispatch_plans" in data
    assert isinstance(data["dispatch_plans"], list)
    if len(data["dispatch_plans"]) > 0:
        plan = data["dispatch_plans"][0]
        assert "vehicle_id" in plan
        assert "effective_payload_kg" in plan
        assert "fits_daylight_window" in plan


@pytest.mark.asyncio
async def test_api_optimize_simulate(test_client: AsyncClient):
    """Test POST /api/optimize/simulate with custom demand set."""
    payload = {
        "depot_location_id": "LOC-LEH",
        "depot_name": "Leh Depot",
        "demands": [
            {
                "order_id": "ORD-SIM-1",
                "destination_id": "LOC-THOISE",
                "destination_name": "Thoise Air Base",
                "elevation_m": 3067.0,
                "supply_id": "SUP-RATION-RETORT",
                "supply_name": "RTE Retort Rations",
                "supply_class": "CLASS_I",
                "demand_kg": 800.0,
                "priority_tier": "HIGH",
                "route_status": "OPEN",
            }
        ],
        "speed_kmh": 28.0,
    }
    response = await test_client.post("/api/optimize/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_demands_count"] == 1
    assert len(data["dispatch_plans"]) >= 1
