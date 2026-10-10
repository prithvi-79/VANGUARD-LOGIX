"""
Unit tests for Seed Data, Inventory Risk & IAF-Z-2096 Indent verification.
"""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.indent import IndentVoucher
from app.models.supply import InventoryRecord


@pytest.mark.asyncio
async def test_inventory_records_and_dos(test_client: AsyncClient):
    """Verify inventory endpoint returns records with calculated Days-of-Supply."""
    response = await test_client.get("/api/inventory?location_id=LOC-KUMAR")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 12
    # Verify items have days_of_supply and status
    for item in data["items"]:
        assert "days_of_supply" in item
        assert item["status"] in ("CRITICAL", "WARNING", "NORMAL")


@pytest.mark.asyncio
async def test_pass_status_toggle(test_client: AsyncClient):
    """Verify updating pass status propagates to routes."""
    # Khardung La currently RESTRICTED_CONVOY
    response = await test_client.patch(
        "/api/passes/PASS-KHARDUNGLA",
        json={"status": "CLOSED_BLIZZARD", "snow_accumulation_cm": 95.0, "closure_reason": "Severe whiteout"},
    )
    assert response.status_code == 200
    updated_pass = response.json()
    assert updated_pass["status"] == "CLOSED_BLIZZARD"
    assert updated_pass["is_passable"] is False

    # Check that downstream route is closed
    r_resp = await test_client.get("/api/routes?destination_id=LOC-THOISE")
    assert r_resp.status_code == 200
    routes = r_resp.json()
    assert len(routes) > 0
    assert routes[0]["status"] == "CLOSED"


@pytest.mark.asyncio
async def test_indent_sha256_integrity(test_client: AsyncClient):
    """Verify creating an IAF-Z-2096 indent produces valid cryptographic hash."""
    payload = {
        "originating_unit": "14 SIKH LIGHT INFANTRY",
        "forward_post_id": "LOC-SBC",
        "priority": "OP_IMMEDIATE",
        "officer_service_number": "IC-69120K Lt Col K. Singh",
        "officer_name": "Lt Col K. Singh",
        "items": [
            {
                "supply_id": "SUP-POL-DIESEL-ARCTIC",
                "supply_name": "Arctic Diesel",
                "supply_class": "CLASS_III",
                "quantity_requested": 3000,
                "unit": "LITERS",
                "urgency_reason": "Reserve tanks compromised by glacial shifting",
            }
        ],
        "justification": "Immediate heating fuel replenishment required.",
    }
    response = await test_client.post("/api/indents", json=payload)
    assert response.status_code == 201
    voucher = response.json()
    assert voucher["id"].startswith("IAF-Z-2096/")
    assert len(voucher["verification_hash"]) == 64  # SHA-256 hex string length
    assert voucher["status"] == "PENDING_APPROVAL"
