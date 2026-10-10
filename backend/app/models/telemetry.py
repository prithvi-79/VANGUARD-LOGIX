"""
Telemetry Model — IoT sensor streams and cold-chain/fuel temperature monitoring.
"""

from datetime import datetime, timezone
from sqlalchemy import String, Float, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class TelemetryRecord(Base):
    __tablename__ = "telemetry_records"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    location_id: Mapped[str] = mapped_column(String(64), nullable=False)
    sensor_type: Mapped[str] = mapped_column(String(64), nullable=False)
    # Types: FUEL_BLADDER_TEMP, BLADDER_VOLUME, COLD_CHAIN_TEMP, AMBIENT_WEATHER, VIBRATION_SENSOR
    reading_value: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(String(32), nullable=False, default="CELSIUS")
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="NORMAL")  # NORMAL, WARNING, CRITICAL
    alert_message: Mapped[str] = mapped_column(String(256), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self) -> str:
        return f"<TelemetryRecord {self.sensor_type} @ {self.location_id}: {self.reading_value} {self.unit}>"
