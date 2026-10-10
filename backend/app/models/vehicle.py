"""
Vehicle Model — Multimodal transport fleet of Northern Command XIV Corps.
Includes high-altitude payload de-rating and operational status.
"""

from sqlalchemy import String, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    callsign: Mapped[str] = mapped_column(String(64), nullable=False)
    vehicle_type: Mapped[str] = mapped_column(String(64), nullable=False)
    # Types: ASHOK_LEYLAND_4X4, STALLION_6X6, BV206_SNOWCAT, MI17_V5_HELI, ALH_DHRUV, MULE_TRAIN
    mode: Mapped[str] = mapped_column(String(32), nullable=False, default="ROAD")
    # Modes: ROAD, AIR, ALL_TERRAIN, ANIMAL_TRANSPORT
    max_payload_kg: Mapped[float] = mapped_column(Float, nullable=False, default=2500.0)
    service_ceiling_m: Mapped[float] = mapped_column(Float, nullable=False, default=4500.0)
    fuel_type: Mapped[str] = mapped_column(String(32), nullable=False, default="ARCTIC_DIESEL")
    fuel_consumption_rate: Mapped[float] = mapped_column(Float, nullable=False, default=0.35)  # liters per km or hr
    current_location_id: Mapped[str] = mapped_column(String(64), ForeignKey("locations.id"), nullable=False)
    operational_status: Mapped[str] = mapped_column(String(32), nullable=False, default="AVAILABLE")
    # Status: AVAILABLE, DISPATCHED, MAINTENANCE, GROUNDED_WEATHER

    current_location = relationship("Location")

    def effective_payload_at_altitude(self, elevation_m: float) -> float:
        """
        Calculate altitude de-rated payload envelope:
        Above 3,000m MSL, payload capacity decreases linearly due to air density loss:
        De-rating factor = 1.0 - max(0, (elevation - 3000) / 10000)
        """
        if elevation_m <= 3000.0:
            factor = 1.0
        else:
            factor = max(0.40, 1.0 - (elevation_m - 3000.0) / 10000.0)
        return round(self.max_payload_kg * factor, 1)

    def __repr__(self) -> str:
        return f"<Vehicle {self.id} ({self.callsign}): {self.vehicle_type} [{self.operational_status}]>"
