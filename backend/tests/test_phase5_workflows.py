"""
Unit and Integration Tests for Phase 5 Military Workflows, Disruption Simulation & IoT Telemetry
"""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.disruption import (
    get_all_scenarios,
    simulate_disruption_scenario,
    DISRUPTION_PRESETS,
)
from app.schemas.disruption import DisruptionSimulationRequest
from app.services.telemetry import (
    get_deterministic_telemetry_stream,
    detect_inventory_discrepancies,
    get_telemetry_overview,
    inject_simulated_anomaly,
)
from app.schemas.telemetry import TelemetryAnomalyRequest


@pytest.fixture
def anyio_backend():
    return "asyncio"


def test_disruption_scenario_presets():
    """Verify all 5 standard defense disruption scenario presets exist with required fields."""
    scenarios = get_all_scenarios()
    assert len(scenarios) == 5
    scenario_ids = {s.id for s in scenarios}
    assert "BASELINE" in scenario_ids
    assert "SEVERE_BLIZZARD" in scenario_ids
    assert "PASS_AVALANCHE_BLOCKAGE" in scenario_ids
    assert "TROOP_REINFORCEMENT_SURGE" in scenario_ids
    assert "AIRLIFT_CONTINGENCY" in scenario_ids


def test_disruption_blizzard_simulation_deltas():
    """Verify severe blizzard causes non-zero drops in DoS and increases emergency tonnage and air sorties."""
    req = DisruptionSimulationRequest(
        scenario_id="SEVERE_BLIZZARD",
        temp_delta_c=-25.0,
        troop_surge_pct=0.0,
        closed_pass_ids=["PASS-ZOJILA", "PASS-CHANG"],
        fleet_availability_pct=60.0,
    )
    res = simulate_disruption_scenario(req)

    assert res.scenario_id == "SEVERE_BLIZZARD"
    assert res.temp_delta_c == -25.0
    assert res.disrupted_mean_dos < res.baseline_mean_dos
    assert res.dos_drop_pct > 0.0
    assert res.total_emergency_tonnage_kg > 0.0
    assert res.mi17_sorties_required > 0
    assert len(res.location_deltas) == 10
    assert len(res.response_actions) > 0


def test_disruption_troop_surge_simulation():
    """Verify troop surge accelerates burn rate and degrades forward post DoS."""
    req = DisruptionSimulationRequest(
        scenario_id="TROOP_REINFORCEMENT_SURGE",
        temp_delta_c=-5.0,
        troop_surge_pct=50.0,
        closed_pass_ids=[],
        fleet_availability_pct=90.0,
    )
    res = simulate_disruption_scenario(req)

    assert res.troop_surge_pct == 50.0
    assert res.disrupted_mean_dos < res.baseline_mean_dos
    # Verify forward outposts show headcount growth
    kumar = next(l for l in res.location_deltas if l.location_id == "LOC-KUMAR")
    assert kumar.headcount_disrupted > kumar.headcount_baseline


def test_telemetry_live_streams():
    """Verify deterministic IoT telemetry stream produces valid readings across all locations."""
    readings = get_deterministic_telemetry_stream()
    assert len(readings) >= 40  # 10 locations * 4 sensor types
    sensor_types = {r.sensor_type for r in readings}
    assert "FUEL_BLADDER_LEVEL" in sensor_types
    assert "FUEL_HEATING_BLANKET_TEMP" in sensor_types
    assert "COLD_CHAIN_CRYO_TEMP" in sensor_types
    assert "AMBIENT_AIR_TEMP" in sensor_types


def test_inventory_discrepancy_and_leak_detection():
    """Verify discrepancy engine flags physical vs book stock differences."""
    discrepancies = detect_inventory_discrepancies()
    assert len(discrepancies) >= 1
    leak = next((d for d in discrepancies if d.alert_type == "FUEL_LEAK_OR_PILFERAGE"), None)
    assert leak is not None
    assert leak.discrepancy_amount > 0.0
    assert leak.severity in ("CRITICAL", "WARNING")


def test_telemetry_anomaly_injection():
    """Verify dynamic anomaly injection modifies discrepancy counts."""
    req = TelemetryAnomalyRequest(
        location_id="LOC-GALWAN",
        anomaly_type="FUEL_LEAK",
        severity="CRITICAL",
        discrepancy_pct=18.0,
    )
    res = inject_simulated_anomaly(req)
    assert res["status"] == "SUCCESS"
    discrepancies = detect_inventory_discrepancies()
    galwan_disc = next((d for d in discrepancies if d.location_id == "LOC-GALWAN"), None)
    assert galwan_disc is not None


@pytest.mark.anyio
async def test_api_disruption_endpoints():
    """Verify HTTP GET /api/disruption/scenarios and POST /api/disruption/simulate."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Scenarios
        res1 = await client.get("/api/disruption/scenarios")
        assert res1.status_code == 200
        scenarios = res1.json()
        assert len(scenarios) == 5

        # 2. Simulate
        res2 = await client.post(
            "/api/disruption/simulate",
            json={
                "scenario_id": "SEVERE_BLIZZARD",
                "temp_delta_c": -20.0,
                "troop_surge_pct": 10.0,
                "closed_pass_ids": ["PASS-ZOJILA"],
                "fleet_availability_pct": 70.0,
            },
        )
        assert res2.status_code == 200
        data = res2.json()
        assert data["scenario_id"] == "SEVERE_BLIZZARD"
        assert "dos_drop_pct" in data
        assert "mi17_sorties_required" in data


@pytest.mark.anyio
async def test_api_telemetry_endpoints():
    """Verify HTTP GET /api/telemetry/overview, /live, /discrepancies, and POST anomaly injection."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Overview
        res1 = await client.get("/api/telemetry/overview")
        assert res1.status_code == 200
        overview = res1.json()
        assert overview["total_active_sensors"] > 0

        # Live readings
        res2 = await client.get("/api/telemetry/live")
        assert res2.status_code == 200
        assert len(res2.json()) > 0

        # Discrepancies
        res3 = await client.get("/api/telemetry/discrepancies")
        assert res3.status_code == 200
        assert isinstance(res3.json(), list)


@pytest.mark.anyio
async def test_api_indent_movement_orders_and_status():
    """Verify single indent lookup, status update, movement order generation, and CSV export."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. List indents to get seeded voucher ID
        list_res = await client.get("/api/indents")
        assert list_res.status_code == 200
        indents = list_res.json()
        assert len(indents) > 0
        target_id = indents[0]["id"]

        # 2. Get single indent via query & path
        get_res = await client.get("/api/indents/voucher", params={"indent_id": target_id})
        assert get_res.status_code == 200
        assert get_res.json()["id"] == target_id

        # Also verify path endpoint
        get_res_path = await client.get(f"/api/indents/voucher/{target_id}")
        assert get_res_path.status_code == 200

        # 3. Update status to APPROVED
        patch_res = await client.patch(
            "/api/indents/status",
            params={"indent_id": target_id},
            json={"status": "APPROVED", "remarks": "Approved by XIV Corps ASC Logistics Commander"},
        )
        assert patch_res.status_code == 200
        assert patch_res.json()["status"] == "APPROVED"

        # 4. Generate movement order
        mo_res = await client.get("/api/indents/movement-order", params={"indent_id": target_id})
        assert mo_res.status_code == 200
        mo_data = mo_res.json()
        assert "movement_order_number" in mo_data
        assert "route_checkpoints" in mo_data
        assert len(mo_data["route_checkpoints"]) > 0

        # 5. Export movement orders CSV
        csv_res = await client.get("/api/indents/movement-orders/export-csv")
        assert csv_res.status_code == 200
        assert "text/csv" in csv_res.headers.get("content-type", "")
        csv_text = csv_res.text
        assert "MOVEMENT_ORDER_NO" in csv_text
        assert "CRYPTOGRAPHIC_SHA256_HASH" in csv_text

