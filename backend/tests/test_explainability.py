"""
Tests for Causal Decision Explainability Engine & REST APIs.
Validates causal factors, counterfactual tradeoffs, and doctrine compliance reports.
"""

import pytest
from httpx import AsyncClient

from app.services.explainability import (
    generate_decision_explanation,
    DecisionExplanationReport,
)


def test_generate_decision_explanation_critical():
    """Verify explainability report generates appropriate causal factors and counterfactuals."""
    report = generate_decision_explanation(
        decision_type="DISPATCH_PRIORITY",
        location_name="Kumar Post (Siachen)",
        elevation_m=4850.0,
        supply_name="Arctic Diesel",
        supply_class="CLASS_III",
        days_of_supply=1.5,
        pass_status="CLOSED_BLIZZARD",
        weather_condition="BLIZZARD",
        recommended_mode="AIR_BRIDGE",
        headcount=65,
    )

    assert isinstance(report, DecisionExplanationReport)
    assert report.confidence_score > 90.0
    assert len(report.causal_factors) >= 3
    # Check that critical factors exist
    severities = [f.threat_severity for f in report.causal_factors]
    assert "CRITICAL" in severities
    # Check counterfactuals
    assert len(report.counterfactual_tradeoffs) >= 2
    assert "Air-Bridge" in report.primary_recommendation or "Mi-17" in report.primary_recommendation


# ==============================================================================
# REST API Integration Tests
# ==============================================================================

@pytest.mark.asyncio
async def test_api_explain_outpost(test_client: AsyncClient):
    """Test GET /api/explain/outpost/{location_id} returns structured causal report."""
    response = await test_client.get("/api/explain/outpost/LOC-KUMAR")
    assert response.status_code == 200
    data = response.json()
    assert "decision_id" in data
    assert "causal_factors" in data
    assert "counterfactual_tradeoffs" in data
    assert len(data["causal_factors"]) > 0


@pytest.mark.asyncio
async def test_api_explain_custom_decision(test_client: AsyncClient):
    """Test POST /api/explain/decision with custom operational parameters."""
    payload = {
        "decision_type": "DISPATCH_PRIORITY",
        "location_name": "Galwan Patrol Base",
        "elevation_m": 4300.0,
        "supply_name": "Emergency Trauma Kits",
        "supply_class": "CLASS_II",
        "days_of_supply": 2.2,
        "pass_status": "OPEN",
        "weather_condition": "SNOW_ICE",
        "recommended_mode": "ROAD",
        "headcount": 50,
    }
    response = await test_client.post("/api/explain/decision", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "primary_recommendation" in data
    assert len(data["counterfactual_tradeoffs"]) > 0
