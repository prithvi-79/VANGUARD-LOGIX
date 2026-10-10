"""
Tests for Quantile Demand Forecasting Engine & REST APIs.
Validates P10/P50/P90 quantile bounds, WAPE/MAE/RMSE evaluation metrics, and API contracts.
"""

import pytest
import numpy as np
from httpx import AsyncClient

from app.services.forecasting import (
    ForecastSeriesInput,
    compute_wape,
    compute_mae,
    compute_rmse,
    train_and_forecast_quantiles,
)


def test_metric_computations():
    """Verify statistical walk-forward evaluation formulas."""
    actual = np.array([100.0, 110.0, 95.0, 105.0])
    predicted = np.array([102.0, 108.0, 93.0, 106.0])

    mae = compute_mae(actual, predicted)
    assert mae == 1.75  # mean(|2| + |2| + |2| + |1|) = 7 / 4 = 1.75

    wape = compute_wape(actual, predicted)
    # sum(|e|) = 7.0, sum(y) = 410.0 -> 7 / 410 * 100 = 1.71%
    assert 1.6 < wape < 1.8

    rmse = compute_rmse(actual, predicted)
    assert rmse > 0.0


def test_quantile_forecast_consistency():
    """Verify P10 <= P50 <= P90 constraint holds across all horizon days."""
    series = [75.0 + 5.0 * (i % 5) for i in range(35)]
    input_data = ForecastSeriesInput(
        location_id="LOC-KUMAR",
        location_name="Kumar Post (Siachen)",
        supply_id="SUP-POL-DIESEL-ARCTIC",
        supply_name="Arctic Diesel",
        supply_class="CLASS_III",
        historical_consumption=series,
        forecast_horizon_days=14,
        elevation_m=4850.0,
    )

    res = train_and_forecast_quantiles(input_data)
    assert res.horizon_days == 14
    assert len(res.forecast_points) == 14

    for pt in res.forecast_points:
        assert pt.p10 <= pt.p50, f"Day {pt.day}: P10 ({pt.p10}) must be <= P50 ({pt.p50})"
        assert pt.p50 <= pt.p90, f"Day {pt.day}: P50 ({pt.p50}) must be <= P90 ({pt.p90})"
        assert pt.surge_delta >= 0.0

    assert res.total_projected_p50 > 0.0
    assert res.total_projected_p90 >= res.total_projected_p50
    assert 0.0 <= res.confidence_score <= 100.0
    assert len(res.feature_attributions) >= 3


# ==============================================================================
# REST API Integration Tests
# ==============================================================================

@pytest.mark.asyncio
async def test_api_forecast_quantile(test_client: AsyncClient):
    """Test GET /api/forecast/quantile returns 14-day quantile predictions."""
    response = await test_client.get(
        "/api/forecast/quantile?location_id=LOC-KUMAR&supply_id=SUP-POL-DIESEL-ARCTIC&horizon=14"
    )
    assert response.status_code == 200
    data = response.json()
    assert data["location_id"] == "LOC-KUMAR"
    assert data["horizon_days"] == 14
    assert len(data["forecast_points"]) == 14
    assert "evaluation" in data
    assert "wape" in data["evaluation"]
    assert "feature_attributions" in data


@pytest.mark.asyncio
async def test_api_forecast_custom(test_client: AsyncClient):
    """Test POST /api/forecast/custom accepts arbitrary series."""
    payload = {
        "location_id": "LOC-TEST",
        "location_name": "Test Outpost",
        "supply_id": "SUP-RATION-RETORT",
        "supply_name": "RTE Retort Rations",
        "supply_class": "CLASS_I",
        "historical_consumption": [50.0, 52.0, 48.0, 55.0, 51.0, 49.0, 53.0, 54.0, 50.0, 52.0],
        "headcount": 40,
        "elevation_m": 3800.0,
        "horizon_days": 7,
    }
    response = await test_client.post("/api/forecast/custom", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["forecast_points"]) == 7
    assert data["forecast_points"][0]["p50"] > 0
