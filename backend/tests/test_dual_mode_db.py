"""
Unit tests for Dual-Mode Database and Haversine spatial math.
"""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import haversine_distance_km
from app.models.location import Location
from app.models.route import Route
from app.models.vehicle import Vehicle


def test_haversine_distance_calculation():
    """Verify mathematical Haversine distance parity for Leh to Srinagar."""
    # Leh: (34.1526, 77.5771), Srinagar: (34.0837, 74.7973)
    dist = haversine_distance_km(34.1526, 77.5771, 34.0837, 74.7973)
    # Expected great-circle distance is approx 256 km
    assert 250.0 <= dist <= 265.0


def test_altitude_derating_logic():
    """Verify vehicle payload de-rating above 3000m MSL."""
    v = Vehicle(
        id="TEST-VEH",
        callsign="TEST-1",
        vehicle_type="STALLION_6X6",
        mode="ROAD",
        max_payload_kg=5000.0,
        service_ceiling_m=5000.0,
        current_location_id="LOC-LEH",
    )
    # At sea level or <= 3000m: 100% payload
    assert v.effective_payload_at_altitude(2500.0) == 5000.0
    assert v.effective_payload_at_altitude(3000.0) == 5000.0

    # At 4,000m: 1 - (1000/10000) = 0.90 -> 4500 kg
    assert v.effective_payload_at_altitude(4000.0) == 4500.0

    # At 5,000m: 1 - (2000/10000) = 0.80 -> 4000 kg
    assert v.effective_payload_at_altitude(5000.0) == 4000.0


@pytest.mark.asyncio
async def test_locations_seeded_properly(test_db_session: AsyncSession):
    """Verify key defense outposts exist in seeded database."""
    res = await test_db_session.execute(select(Location).where(Location.id == "LOC-KUMAR"))
    kumar = res.scalar_one_or_none()
    assert kumar is not None
    assert kumar.sector == "SIACHEN_GLACIER"
    assert kumar.elevation_m == 4876.0
    assert kumar.weather_risk_level == "EXTREME"
