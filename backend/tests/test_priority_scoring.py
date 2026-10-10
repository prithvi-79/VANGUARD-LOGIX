"""
Tests for Multi-Attribute Priority Scoring & Queue Engine.
Validates 0-100 score bounds, tier classifications, and REST API endpoints.
"""

import pytest
from httpx import AsyncClient

from app.services.priority_scoring import (
    PriorityInput,
    PriorityScoreResult,
    get_supply_class_criticality,
    compute_priority_score,
    rank_priority_queue,
)


# ==============================================================================
# Pure Stateless Engine Unit Tests
# ==============================================================================

def test_supply_class_criticality():
    """Verify Indian Army supply class strategic importance weights."""
    assert get_supply_class_criticality("CLASS_III") == 1.00  # Fuel/POL is survival priority
    assert get_supply_class_criticality("CLASS_I") == 0.95    # Rations
    assert get_supply_class_criticality("CLASS_V") == 0.85    # Ammo
    assert get_supply_class_criticality("CLASS_II") == 0.75   # ECC Clothing
    assert get_supply_class_criticality("CLASS_IV") == 0.50   # Construction


def test_priority_score_emergency_immediate():
    """Severe starvation / zero stock at high altitude generates OP_IMMEDIATE tier."""
    item = PriorityInput(
        location_id="LOC-KUMAR",
        location_name="Kumar Base",
        elevation_m=4850.0,
        supply_id="SUP-POL-DIESEL-ARCTIC",
        supply_name="Arctic Diesel",
        supply_class="CLASS_III",
        current_stock=10.0,
        daily_consumption_rate=50.0,  # DoS = 0.2 days!
        safety_stock_threshold=200.0,
        lead_time_days=3.0,
        route_status="CLOSED",
        weather_risk_level="EXTREME",
        headcount=120,
    )
    res = compute_priority_score(item)
    assert res.composite_score >= 80.0
    assert res.priority_tier == "OP_IMMEDIATE"
    # When route is closed and elevation is high, AIR_BRIDGE is recommended
    assert res.recommended_mode == "AIR_BRIDGE"
    assert "Air-Bridge" in res.recommended_action or "AIR_BRIDGE" in res.recommended_action


def test_priority_score_routine():
    """Abundant stock at low altitude base generates ROUTINE tier."""
    item = PriorityInput(
        location_id="LOC-LEH",
        location_name="Leh Transit Depot",
        elevation_m=3500.0,
        supply_id="SUP-WORKS-CEMENT",
        supply_name="Rapid Setting Cement",
        supply_class="CLASS_IV",
        current_stock=2000.0,
        daily_consumption_rate=10.0,  # DoS = 200 days
        safety_stock_threshold=200.0,
        lead_time_days=1.0,
        route_status="OPEN",
        weather_risk_level="LOW",
        headcount=40,
    )
    res = compute_priority_score(item)
    assert res.composite_score < 45.0
    assert res.priority_tier == "ROUTINE"
    assert res.recommended_mode == "ROAD"


def test_priority_score_bounds():
    """Composite score must always lie within [0.0, 100.0]."""
    # Worst case
    worst = PriorityInput(
        location_id="L1",
        location_name="Worst",
        elevation_m=6000.0,
        supply_id="S1",
        supply_name="Fuel",
        supply_class="CLASS_III",
        current_stock=0.0,
        daily_consumption_rate=100.0,
        safety_stock_threshold=1000.0,
        lead_time_days=10.0,
        route_status="CLOSED",
        weather_risk_level="EXTREME",
        headcount=500,
    )
    res_worst = compute_priority_score(worst)
    assert 0.0 <= res_worst.composite_score <= 100.0

    # Best case
    best = PriorityInput(
        location_id="L2",
        location_name="Best",
        elevation_m=2000.0,
        supply_id="S2",
        supply_name="Works",
        supply_class="CLASS_IV",
        current_stock=100000.0,
        daily_consumption_rate=1.0,
        safety_stock_threshold=10.0,
        lead_time_days=0.5,
        route_status="OPEN",
        weather_risk_level="LOW",
        headcount=10,
    )
    res_best = compute_priority_score(best)
    assert 0.0 <= res_best.composite_score <= 100.0
    assert res_best.composite_score < res_worst.composite_score


def test_rank_priority_queue_ordering():
    """Verify items are strictly sorted descending by composite score."""
    items = [
        PriorityInput(
            location_id=f"LOC-{i}",
            location_name=f"Post {i}",
            elevation_m=3500.0 + i * 200,
            supply_id=f"SUP-{i}",
            supply_name=f"Supply {i}",
            supply_class="CLASS_III",
            current_stock=float(100 * (i + 1)),
            daily_consumption_rate=50.0,
            safety_stock_threshold=300.0,
        )
        for i in range(5)
    ]
    ranked = rank_priority_queue(items)
    for i in range(len(ranked) - 1):
        assert ranked[i].composite_score >= ranked[i + 1].composite_score


# ==============================================================================
# REST API Integration Tests
# ==============================================================================

@pytest.mark.asyncio
async def test_api_priority_queue(test_client: AsyncClient):
    """Test GET /api/priority/queue returns ranked items with correct schema."""
    response = await test_client.get("/api/priority/queue")
    assert response.status_code == 200
    data = response.json()
    assert "total_items" in data
    assert data["total_items"] > 0
    assert "op_immediate_count" in data
    assert "high_count" in data
    assert "items" in data
    items = data["items"]
    # Check descending order
    for i in range(len(items) - 1):
        assert items[i]["composite_score"] >= items[i + 1]["composite_score"]


@pytest.mark.asyncio
async def test_api_priority_score_custom(test_client: AsyncClient):
    """Test POST /api/priority/score with custom payload."""
    payload = {
        "location_id": "LOC-TEST",
        "location_name": "Test Forward Outpost",
        "elevation_m": 4500.0,
        "supply_id": "SUP-POL-DIESEL-ARCTIC",
        "supply_name": "Arctic Diesel",
        "supply_class": "CLASS_III",
        "current_stock": 25.0,
        "daily_consumption_rate": 60.0,
        "safety_stock_threshold": 300.0,
        "lead_time_days": 4.0,
        "route_status": "RESTRICTED",
        "weather_risk_level": "HIGH",
        "headcount": 80,
    }
    response = await test_client.post("/api/priority/score", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert "composite_score" in res
    assert "priority_tier" in res
    assert res["priority_tier"] in ("OP_IMMEDIATE", "HIGH")
    assert "factor_breakdown" in res
    assert "urgency_dos" in res["factor_breakdown"]
