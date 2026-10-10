"""
Tests for Inventory Risk & Days-of-Supply (DoS) Engine.
Validates both pure stateless calculations and REST API endpoints.
"""

import pytest
from httpx import AsyncClient

from app.services.inventory_risk import (
    InventoryItemState,
    RiskAssessment,
    calculate_elevation_burn_multiplier,
    compute_days_of_supply,
    compute_safety_deficit,
    assess_item_risk,
    simulate_burn_down,
)


# ==============================================================================
# Pure Stateless Engine Unit Tests
# ==============================================================================

def test_elevation_burn_multiplier_below_threshold():
    """Elevations at or below 3,000m should incur no altitude burn penalty."""
    assert calculate_elevation_burn_multiplier("CLASS_III", 2500.0) == 1.0
    assert calculate_elevation_burn_multiplier("CLASS_I", 3000.0) == 1.0
    assert calculate_elevation_burn_multiplier("CLASS_V", 2900.0) == 1.0


def test_elevation_burn_multiplier_high_altitude():
    """POL and Rations experience progressive altitude burn surge above 3,000m."""
    # Class III: +35% per 1,000m above 3000m
    assert calculate_elevation_burn_multiplier("CLASS_III", 4000.0) == 1.35
    assert calculate_elevation_burn_multiplier("CLASS_III", 5000.0) == 1.70

    # Class I: +10% per 1,000m above 3000m
    assert calculate_elevation_burn_multiplier("CLASS_I", 4000.0) == 1.10
    assert calculate_elevation_burn_multiplier("CLASS_I", 5000.0) == 1.20

    # Class II: +5% per 1,000m
    assert calculate_elevation_burn_multiplier("CLASS_II", 4000.0) == 1.05

    # Other classes remain baseline
    assert calculate_elevation_burn_multiplier("CLASS_IV", 4500.0) == 1.0


def test_days_of_supply_boundary_cases():
    """Tests zero stock, zero burn rate, and standard DoS computation."""
    assert compute_days_of_supply(0.0, 50.0) == 0.0
    assert compute_days_of_supply(-10.0, 50.0) == 0.0
    assert compute_days_of_supply(500.0, 0.0) == 999.0
    assert compute_days_of_supply(500.0, 50.0) == 10.0
    assert compute_days_of_supply(100.0, 30.0) == 3.3


def test_safety_deficit():
    """Verify safety deficit calculation."""
    # When stock is above safety threshold, deficit is zero
    assert compute_safety_deficit(100.0, 50.0) == 0.0
    # When stock is below safety threshold, deficit is exact difference
    assert compute_safety_deficit(35.0, 100.0) == 65.0
    assert compute_safety_deficit(0.0, 100.0) == 100.0


def test_assess_item_risk_critical():
    """Critical assessment triggers if DoS <= 5.0 or current stock < safety threshold."""
    item = InventoryItemState(
        location_id="LOC-KUMAR",
        supply_id="SUP-POL-DIESEL-ARCTIC",
        supply_name="Arctic Diesel",
        supply_class="CLASS_III",
        current_stock=100.0,
        daily_consumption_rate=50.0,
        safety_stock_threshold=200.0,
        reorder_point=400.0,
        elevation_m=4850.0,  # ~1.648 multiplier -> effective rate ~82.4 -> DoS ~1.2
        unit="LITRE",
    )
    result = assess_item_risk(item)
    assert result.status == "CRITICAL"
    assert result.requires_emergency_replenishment is True
    assert result.days_of_supply <= 5.0
    assert result.safety_deficit == 100.0
    assert result.days_until_safety_breach == 0.0


def test_assess_item_risk_warning():
    """Warning assessment triggers if DoS <= 12.0 or current stock < reorder point."""
    item = InventoryItemState(
        location_id="LOC-LEH",
        supply_id="SUP-RATION-RETORT",
        supply_name="RTE Retort Rations",
        supply_class="CLASS_I",
        current_stock=700.0,
        daily_consumption_rate=70.0,
        safety_stock_threshold=300.0,
        reorder_point=800.0,
        elevation_m=3500.0,  # multiplier 1.05 -> rate 73.5 -> DoS ~9.5
        unit="RATION_PACK",
    )
    result = assess_item_risk(item)
    assert result.status == "WARNING"
    assert result.requires_emergency_replenishment is False
    assert result.safety_deficit == 0.0
    assert result.reorder_deficit == 100.0


def test_assess_item_risk_normal():
    """Normal assessment when healthy stock exists well above reorder threshold."""
    item = InventoryItemState(
        location_id="LOC-LEH",
        supply_id="SUP-MED-TRAUMA",
        supply_name="Trauma Kits",
        supply_class="CLASS_II",
        current_stock=1000.0,
        daily_consumption_rate=20.0,
        safety_stock_threshold=200.0,
        reorder_point=400.0,
        elevation_m=3500.0,
        unit="KIT",
    )
    result = assess_item_risk(item)
    assert result.status == "NORMAL"
    assert result.requires_emergency_replenishment is False
    assert result.safety_deficit == 0.0
    assert result.reorder_deficit == 0.0
    assert result.days_of_supply > 12.0


def test_simulate_burn_down_trajectory():
    """Verify multi-day depletion simulation and threshold transitions."""
    initial_stock = 100.0
    daily_rates = [20.0] * 7  # 5 days to reach 0 stock
    trajectory = simulate_burn_down(
        initial_stock=initial_stock,
        daily_rates=daily_rates,
        safety_threshold=40.0,
        reorder_point=80.0,
        num_days=7,
    )
    assert len(trajectory) == 7
    # Day 1: stock 80, DoS 4.0 -> CRITICAL
    assert trajectory[0]["day"] == 1
    assert trajectory[0]["projected_stock"] == 80.0
    # Day 5: stock reaches 0 -> STOCKOUT
    assert trajectory[4]["day"] == 5
    assert trajectory[4]["projected_stock"] == 0.0
    assert trajectory[4]["status"] == "STOCKOUT"
    # Day 6 and 7 remain STOCKOUT
    assert trajectory[5]["projected_stock"] == 0.0
    assert trajectory[5]["status"] == "STOCKOUT"


# ==============================================================================
# REST API Integration Tests
# ==============================================================================

@pytest.mark.asyncio
async def test_api_risk_evaluate(test_client: AsyncClient):
    """Test GET /api/risk/evaluate returns valid statistics and assessments."""
    response = await test_client.get("/api/risk/evaluate")
    assert response.status_code == 200
    data = response.json()
    assert "total_evaluated" in data
    assert data["total_evaluated"] > 0
    assert "critical_count" in data
    assert "warning_count" in data
    assert "normal_count" in data
    assert isinstance(data["items"], list)

    # Test filtering by status
    crit_resp = await test_client.get("/api/risk/evaluate?status=CRITICAL")
    assert crit_resp.status_code == 200
    crit_data = crit_resp.json()
    for item in crit_data["items"]:
        assert item["status"] == "CRITICAL"


@pytest.mark.asyncio
async def test_api_risk_burn_down_success(test_client: AsyncClient):
    """Test GET /api/risk/burn-down returns multi-day forward trajectory."""
    response = await test_client.get(
        "/api/risk/burn-down?location_id=LOC-KUMAR&supply_id=SUP-POL-DIESEL-ARCTIC&days=10"
    )
    assert response.status_code == 200
    data = response.json()
    assert data["location_id"] == "LOC-KUMAR"
    assert data["supply_id"] == "SUP-POL-DIESEL-ARCTIC"
    assert data["horizon_days"] == 10
    assert len(data["trajectory"]) == 10
    assert "projected_stock" in data["trajectory"][0]
    assert "days_of_supply" in data["trajectory"][0]


@pytest.mark.asyncio
async def test_api_risk_burn_down_not_found(test_client: AsyncClient):
    """Test GET /api/risk/burn-down returns 404 for invalid ledger item."""
    response = await test_client.get(
        "/api/risk/burn-down?location_id=INVALID-LOC&supply_id=SUP-POL-DIESEL-ARCTIC"
    )
    assert response.status_code == 404
