"""
Location Model — Military Base Depots and Forward Outposts in Northern Command XIV Corps.
"""

from datetime import datetime, timezone
from sqlalchemy import String, Float, Integer, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Location(Base):
    __tablename__ = "locations"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    node_type: Mapped[str] = mapped_column(String(64), nullable=False, default="FORWARD_POST")
    sector: Mapped[str] = mapped_column(String(64), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    elevation_m: Mapped[float] = mapped_column(Float, nullable=False, default=3500.0)
    mgrs_grid: Mapped[str] = mapped_column(String(32), nullable=False, default="")
    storage_capacity_tons: Mapped[float] = mapped_column(Float, nullable=False, default=100.0)
    current_headcount: Mapped[int] = mapped_column(Integer, nullable=False, default=50)
    is_air_accessible: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    weather_risk_level: Mapped[str] = mapped_column(String(32), nullable=False, default="LOW")
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    inventory_items = relationship("InventoryRecord", back_populates="location", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Location {self.id}: {self.name} ({self.sector}) - {self.elevation_m}m>"
