"""
Tests for Topographic and Slope Terrain Physics Engine.
Validates grade resistance Rg, surface friction, weather factors, pass severance, and REST APIs.
"""

import pytest
from httpx import AsyncClient

from app.services.terrain import (
    RoutePhysicsInput,
    RoutePhysicsOutput,
    calculate_grade_resistance,
    get_surface_friction_multiplier,
    get_weather_friction_multiplier,
    compute_route_physics,
)


# ==============================================================================
# Pure Stateless Engine Unit Tests
# ==============================================================================

def test_grade_resistance_calculation():
    """
    Test Rg = 1.0 + 0.035|theta| + 0.002|theta|^2
    """
    # Flat ground (0 deg): Rg = 1.0
    assert calculate_grade_resistance(0.0) == 1.0

    # 10 deg: Rg = 1.0 + 0.35 + 0.20 = 1.55
    assert calculate_grade_resistance(10.0) == 1.55

    # Negative slope (downhill grade has identical resistance for heavy convoy braking):
    assert calculate_grade_resistance(-10.0) == 1.55

    # 15 deg (steep Himalayan pass): Rg = 1.0 + 0.525 + 0.45 = 1.975
    assert calculate_grade_resistance(15.0) == 1.975


def test_surface_friction_multipliers():
    """Verify surface terrain friction multipliers."""
    assert get_surface_friction_multiplier("HIGHWAY") == 1.00
    assert get_surface_friction_multiplier("MOUNTAIN_ROAD") == 1.25
    assert get_surface_friction_multiplier("UNPAVED_TRACK") == 1.55
    assert get_surface_friction_multiplier("GLACIAL_SNOWCAT_TRAIL") == 1.85


def test_weather_friction_multipliers():
    """Verify environmental weather degradation multipliers."""
    assert get_weather_friction_multiplier("NORMAL") == 1.00
    assert get_weather_friction_multiplier("RAIN_SLUSH") == 1.20
    assert get_weather_friction_multiplier("SNOW_ICE") == 1.45
    assert get_weather_friction_multiplier("BLIZZARD") == 3.50


def test_compute_route_physics_open():
    """Open route in normal weather computes effective hours based on friction."""
    route = RoutePhysicsInput(
        route_id="R-TEST",
        route_name="Test Valley Corridor",
        distance_km=100.0,
        max_slope_deg=5.0,  # Rg = 1.0 + 0.175 + 0.05 = 1.225
        average_elevation_m=3500.0,
        surface_type="HIGHWAY",  # 1.0
        base_transit_hours=4.0,
        pass_status="OPEN",
        weather_condition="NORMAL",  # 1.0
    )
    res = compute_route_physics(route)
    assert res.is_passable is True
    assert res.status == "OPEN"
    assert res.grade_resistance_factor == 1.225
    assert res.surface_friction_factor == 1.0
    assert res.weather_friction_factor == 1.0
    # composite friction = 1.23
    assert res.effective_transit_hours > res.base_transit_hours
    assert res.contingency_fallback is None


def test_compute_route_physics_restricted():
    """Restricted convoy status increases transit delay and mandates convoy timing."""
    route = RoutePhysicsInput(
        route_id="R-PASS",
        route_name="Khardung La Pass Corridor",
        distance_km=40.0,
        max_slope_deg=12.0,
        average_elevation_m=5359.0,
        surface_type="MOUNTAIN_ROAD",
        base_transit_hours=3.0,
        pass_status="RESTRICTED_CONVOY",
        pass_name="Khardung La",
        weather_condition="SNOW_ICE",
    )
    res = compute_route_physics(route)
    assert res.is_passable is True
    assert res.status == "RESTRICTED"
    assert "convoy" in res.contingency_fallback.lower()
    assert res.effective_transit_hours > res.base_transit_hours


def test_compute_route_physics_closed_blizzard():
    """Blizzard closure marks corridor impassable and triggers tactical air-bridge."""
    route = RoutePhysicsInput(
        route_id="R-ZOJILA",
        route_name="Zoji La Pass Corridor",
        distance_km=80.0,
        max_slope_deg=14.0,
        average_elevation_m=3528.0,
        surface_type="MOUNTAIN_ROAD",
        base_transit_hours=5.0,
        pass_status="CLOSED_BLIZZARD",
        pass_name="Zoji La",
        weather_condition="BLIZZARD",
    )
    res = compute_route_physics(route)
    assert res.is_passable is False
    assert res.status == "CLOSED"
    assert res.effective_transit_hours == 999.0
    assert "Air-Bridge" in res.contingency_fallback


# ==============================================================================
# REST API Integration Tests
# ==============================================================================

@pytest.mark.asyncio
async def test_api_terrain_route_physics(test_client: AsyncClient):
    """Test GET /api/terrain/route-physics returns full corridor inventory."""
    response = await test_client.get("/api/terrain/route-physics")
    assert response.status_code == 200
    data = response.json()
    assert "total_corridors" in data
    assert data["total_corridors"] > 0
    assert "open_count" in data
    assert "restricted_count" in data
    assert "closed_count" in data
    assert "air_bridge_required_count" in data
    assert isinstance(data["corridors"], list)


@pytest.mark.asyncio
async def test_api_terrain_route_physics_single(test_client: AsyncClient):
    """Test GET /api/terrain/route-physics/{route_id} returns specific corridor."""
    response = await test_client.get("/api/terrain/route-physics/RTE-SRN-LEH")
    assert response.status_code == 200
    data = response.json()
    assert data["route_id"] == "RTE-SRN-LEH"
    assert "grade_resistance_factor" in data
    assert "composite_terrain_friction" in data


@pytest.mark.asyncio
async def test_api_terrain_simulate(test_client: AsyncClient):
    """Test POST /api/terrain/simulate with custom slope and weather parameters."""
    payload = {
        "distance_km": 65.0,
        "max_slope_deg": 11.5,
        "surface_type": "MOUNTAIN_ROAD",
        "base_transit_hours": 3.5,
        "pass_status": "OPEN",
        "weather_condition": "SNOW_ICE",
    }
    response = await test_client.post("/api/terrain/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["grade_resistance_factor"] > 1.0
    assert data["weather_friction_factor"] == 1.45
    assert data["effective_transit_hours"] > 3.5
