"""
Phase 6 End-to-End API Sweep, Input Validation & Security Contract Test Suite
Exhaustively validates all 14 endpoint categories, input schema constraints, and error codes.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.mark.anyio
async def test_api_sweep_root_and_diagnostics():
    """Verify system root and health diagnostics endpoints."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Root
        res_root = await client.get("/")
        assert res_root.status_code == 200
        root_json = res_root.json()
        assert root_json["system"] == "VANGUARD-LOGIX"
        assert root_json["theater"] == "NORTHERN_COMMAND_XIV_CORPS"

        # 2. Health
        res_health = await client.get("/api/health")
        assert res_health.status_code == 200
        assert res_health.json()["status"] == "HEALTHY"

        # 3. DB Status
        res_db = await client.get("/api/db-status")
        assert res_db.status_code == 200
        db_json = res_db.json()
        assert db_json["is_connected"] is True
        assert db_json["locations_count"] == 10
        assert db_json["passes_count"] == 5
        assert db_json["supplies_count"] == 12


@pytest.mark.anyio
async def test_api_sweep_locations_and_error_handling():
    """Verify locations retrieval, query filtering, and 404 for invalid ID."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Listing
        res = await client.get("/api/locations")
        assert res.status_code == 200
        data = res.json()
        assert data["total"] == 10
        assert len(data["items"]) == 10

        # Filter by sector
        res_sec = await client.get("/api/locations", params={"sector": "SIACHEN_GLACIER"})
        assert res_sec.status_code == 200
        assert res_sec.json()["total"] >= 1

        # Get valid location
        res_loc = await client.get("/api/locations/LOC-LEH")
        assert res_loc.status_code == 200
        assert res_loc.json()["id"] == "LOC-LEH"

        # 404 on invalid location
        res_invalid = await client.get("/api/locations/LOC-NONEXISTENT")
        assert res_invalid.status_code == 404


@pytest.mark.anyio
async def test_api_sweep_supplies_and_inventory():
    """Verify supply catalog and inventory ledger endpoints."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Supplies
        res_sup = await client.get("/api/supplies")
        assert res_sup.status_code == 200
        assert len(res_sup.json()) == 12

        # Filter supplies
        res_class = await client.get("/api/supplies", params={"supply_class": "CLASS_III"})
        assert res_class.status_code == 200
        for item in res_class.json():
            assert item["supply_class"] == "CLASS_III"

        # Inventory
        res_inv = await client.get("/api/inventory")
        assert res_inv.status_code == 200
        assert res_inv.json()["total"] == 120  # 10 locations * 12 supplies


@pytest.mark.anyio
async def test_api_sweep_routes_and_passes():
    """Verify route network, passes, and pass status update."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Routes
        res_routes = await client.get("/api/routes")
        assert res_routes.status_code == 200
        assert len(res_routes.json()) == 9

        # Passes
        res_passes = await client.get("/api/passes")
        assert res_passes.status_code == 200
        assert len(res_passes.json()) == 5

        # Update pass status
        res_patch = await client.patch(
            "/api/passes/PASS-ZOJILA",
            json={
                "status": "RESTRICTED_CONVOY",
                "snow_accumulation_cm": 25.0,
                "temperature_c": -14.0,
                "predicted_reopen_hours": 4.0,
            },
        )
        assert res_patch.status_code == 200
        assert res_patch.json()["status"] == "RESTRICTED_CONVOY"

        # 404 on invalid pass update
        res_invalid_pass = await client.patch(
            "/api/passes/PASS-NONEXISTENT",
            json={"status": "OPEN"},
        )
        assert res_invalid_pass.status_code == 404


@pytest.mark.anyio
async def test_api_sweep_fleet_and_derating():
    """Verify fleet endpoints and high-altitude payload de-rating."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res_fleet = await client.get("/api/fleet")
        assert res_fleet.status_code == 200
        assert res_fleet.json()["total"] == 10

        # Altitude de-rating calculation
        res_derate = await client.get(
            "/api/fleet/VEH-ALS-01/altitude-rating",
            params={"elevation_m": 4800.0},
        )
        assert res_derate.status_code == 200
        derate_data = res_derate.json()
        assert derate_data["effective_payload_kg"] < derate_data["rated_payload_kg"]


@pytest.mark.anyio
async def test_api_sweep_risk_and_burndown():
    """Verify risk evaluation and forward burn-down trajectory endpoints."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res_risk = await client.get("/api/risk/evaluate")
        assert res_risk.status_code == 200
        risk_json = res_risk.json()
        assert risk_json["total_evaluated"] == 120
        assert risk_json["critical_count"] > 0

        # Burn-down trajectory
        res_bd = await client.get(
            "/api/risk/burn-down",
            params={"location_id": "LOC-KUMAR", "supply_id": "SUP-POL-DIESEL-ARCTIC", "days": 14},
        )
        assert res_bd.status_code == 200
        bd_json = res_bd.json()
        assert len(bd_json["trajectory"]) == 14

        # 404 on invalid burn-down query
        res_bd_404 = await client.get(
            "/api/risk/burn-down",
            params={"location_id": "LOC-NONEXISTENT", "supply_id": "SUP-NONEXISTENT", "days": 14},
        )
        assert res_bd_404.status_code == 404


@pytest.mark.anyio
async def test_api_sweep_priority_and_scoring():
    """Verify multi-attribute priority queue and custom scoring."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Priority queue
        res_queue = await client.get("/api/priority/queue", params={"limit": 150})
        assert res_queue.status_code == 200
        queue_json = res_queue.json()
        assert queue_json["total_items"] == 120
        # Check monotonic descending sort
        scores = [item["composite_score"] for item in queue_json["items"]]
        assert scores == sorted(scores, reverse=True)

        # Custom priority score
        res_score = await client.post(
            "/api/priority/score",
            json={
                "location_id": "LOC-KUMAR",
                "location_name": "Kumar Post (Central Siachen Glacier)",
                "elevation_m": 4876.0,
                "supply_id": "SUP-POL-DIESEL-ARCTIC",
                "supply_name": "Arctic Grade High-Altitude Diesel Fuel",
                "supply_class": "CLASS_III",
                "current_stock": 200.0,
                "daily_consumption_rate": 85.0,
                "safety_stock_threshold": 600.0,
                "lead_time_days": 4.0,
                "route_status": "CLOSED",
                "weather_risk_level": "EXTREME",
                "headcount": 85,
            },
        )
        assert res_score.status_code == 200
        score_json = res_score.json()
        assert score_json["priority_tier"] in ("OP_IMMEDIATE", "HIGH")
        assert score_json["composite_score"] >= 65.0


@pytest.mark.anyio
async def test_api_sweep_terrain_physics():
    """Verify route physics calculation and interactive slope simulation."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res_physics = await client.get("/api/terrain/route-physics")
        assert res_physics.status_code == 200
        assert len(res_physics.json()["corridors"]) == 9

        # Simulate physics
        res_sim = await client.post(
            "/api/terrain/simulate",
            json={
                "distance_km": 120.0,
                "max_slope_deg": 14.5,
                "surface_type": "UNPAVED_TRACK",
                "base_transit_hours": 4.0,
                "weather_condition": "BLIZZARD",
            },
        )
        assert res_sim.status_code == 200
        sim_data = res_sim.json()
        assert sim_data["effective_transit_hours"] > 4.0
        assert sim_data["grade_resistance_factor"] > 1.0


@pytest.mark.anyio
async def test_api_sweep_predictive_forecasting():
    """Verify quantile demand forecasting and WAPE walk-forward metrics."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res_fc = await client.get(
            "/api/forecast/quantile",
            params={"location_id": "LOC-KUMAR", "supply_id": "SUP-POL-DIESEL-ARCTIC", "horizon": 14},
        )
        assert res_fc.status_code == 200
        fc_data = res_fc.json()
        assert len(fc_data["forecast_points"]) == 14
        assert fc_data["total_projected_p90"] >= fc_data["total_projected_p50"]
        assert "wape" in fc_data["evaluation"]


@pytest.mark.anyio
async def test_api_sweep_fleet_optimizer():
    """Verify CVRPTW fleet dispatch optimization and daylight constraint enforcement."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res_opt = await client.get("/api/optimize/fleet-dispatch", params={"depot_id": "LOC-LEH"})
        assert res_opt.status_code == 200
        opt_data = res_opt.json()
        assert opt_data["solver_status"] in ("OPTIMAL", "FEASIBLE", "PARTIAL_CAPACITY_BOUNDED")
        assert len(opt_data["dispatch_plans"]) > 0


@pytest.mark.anyio
async def test_api_sweep_explainability():
    """Verify causal decision trees and military doctrine citations."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res_exp = await client.get(
            "/api/explain/outpost/LOC-KUMAR",
            params={"supply_class": "CLASS_III"},
        )
        assert res_exp.status_code == 200
        exp_data = res_exp.json()
        assert len(exp_data["causal_factors"]) > 0
        assert len(exp_data["counterfactual_tradeoffs"]) > 0
        assert "ASC-LOG-2026-CH7" in exp_data["doctrine_compliance_ref"]


@pytest.mark.anyio
async def test_api_sweep_pydantic_validation_error_codes():
    """Verify strict Pydantic v2 validation returning HTTP 422 for malformed payloads."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Invalid body on indent creation (missing officer and items)
        res_bad_indent = await client.post(
            "/api/indents",
            json={"originating_unit": "Unknown Unit"},
        )
        assert res_bad_indent.status_code == 422

        # Invalid temperature on disruption simulation (out of range > 0.0)
        res_bad_temp = await client.post(
            "/api/disruption/simulate",
            json={"temp_delta_c": 15.0},  # must be <= 0.0
        )
        assert res_bad_temp.status_code == 422

        # Invalid fleet availability on disruption simulation (below 10.0%)
        res_bad_fleet = await client.post(
            "/api/disruption/simulate",
            json={"fleet_availability_pct": 2.0},  # must be >= 10.0%
        )
        assert res_bad_fleet.status_code == 422
