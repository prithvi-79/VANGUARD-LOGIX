"""
Route and Strategic Pass Models — Tactical supply corridors and mountain pass choke points.
"""

from datetime import datetime, timezone
from sqlalchemy import String, Float, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Route(Base):
    __tablename__ = "routes"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    origin_id: Mapped[str] = mapped_column(String(64), ForeignKey("locations.id"), nullable=False)
    destination_id: Mapped[str] = mapped_column(String(64), ForeignKey("locations.id"), nullable=False)
    distance_km: Mapped[float] = mapped_column(Float, nullable=False)
    surface_type: Mapped[str] = mapped_column(String(64), nullable=False, default="MOUNTAIN_ROAD")
    max_slope_deg: Mapped[float] = mapped_column(Float, nullable=False, default=8.0)
    average_elevation_m: Mapped[float] = mapped_column(Float, nullable=False, default=3800.0)
    transit_mode: Mapped[str] = mapped_column(String(32), nullable=False, default="ROAD")
    base_transit_hours: Mapped[float] = mapped_column(Float, nullable=False, default=4.0)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="OPEN")  # OPEN, RESTRICTED, CLOSED
    choke_pass_id: Mapped[str] = mapped_column(String(64), nullable=True)  # Associated pass (e.g. PASS-KHARDUNGLA)

    origin = relationship("Location", foreign_keys=[origin_id])
    destination = relationship("Location", foreign_keys=[destination_id])

    @property
    def grade_resistance_factor(self) -> float:
        """
        Calculate empirical topographic slope grade factor:
        Grade Factor = 1.0 + 0.035 * |slope| + 0.002 * |slope|^2
        """
        slope = abs(self.max_slope_deg)
        return round(1.0 + 0.035 * slope + 0.002 * (slope ** 2), 3)

    @property
    def surface_friction_factor(self) -> float:
        """Friction multiplier based on military terrain classification."""
        mapping = {
            "HIGHWAY": 1.0,
            "MOUNTAIN_ROAD": 1.25,
            "UNPAVED_TRACK": 1.55,
            "GLACIAL_SNOWCAT_TRAIL": 1.85,
        }
        return mapping.get(self.surface_type, 1.25)

    def __repr__(self) -> str:
        return f"<Route {self.id}: {self.name} ({self.distance_km}km, {self.status})>"


class StrategicPass(Base):
    __tablename__ = "strategic_passes"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    highway: Mapped[str] = mapped_column(String(128), nullable=False)
    elevation_m: Mapped[float] = mapped_column(Float, nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(64), nullable=False, default="OPEN")
    snow_accumulation_cm: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    temperature_c: Mapped[float] = mapped_column(Float, nullable=False, default=-5.0)
    bro_detachment: Mapped[str] = mapped_column(String(128), nullable=False, default="Project Himank / BRO")
    predicted_reopen_hours: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    closure_reason: Mapped[str] = mapped_column(String(256), nullable=True)
    last_status_update: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    @property
    def is_passable(self) -> bool:
        return self.status in ("OPEN", "RESTRICTED_CONVOY")

    def __repr__(self) -> str:
        return f"<StrategicPass {self.id}: {self.name} - {self.status} ({self.elevation_m}m)>"
