"""
Unit and integration tests for Health & Diagnostics endpoints.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_endpoint(test_client: AsyncClient):
    """Verify /api/health returns 200 and valid schema."""
    response = await test_client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert data["project"] == "VANGUARD-LOGIX"
    assert data["theater"] == "NORTHERN_COMMAND_XIV_CORPS"
    assert "version" in data
    assert "timestamp" in data


@pytest.mark.asyncio
async def test_db_status_endpoint(test_client: AsyncClient):
    """Verify /api/db-status returns table counts."""
    response = await test_client.get("/api/db-status")
    assert response.status_code == 200
    data = response.json()
    assert data["is_connected"] is True
    assert data["locations_count"] == 10
    assert data["passes_count"] == 5
    assert data["routes_count"] == 9
    assert data["supplies_count"] == 12
    assert data["vehicles_count"] == 10
    assert data["inventory_records_count"] == 120  # 10 locations * 12 supplies
