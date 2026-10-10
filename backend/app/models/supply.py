"""
Supply Models — Indian Army ASC/AOC Class I to Class V supply ledger and inventory records.
"""

from datetime import datetime, timezone
from sqlalchemy import String, Float, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class SupplyItem(Base):
    __tablename__ = "supply_items"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    supply_class: Mapped[str] = mapped_column(String(32), nullable=False)  # CLASS_I .. CLASS_V
    class_label: Mapped[str] = mapped_column(String(128), nullable=False)
    unit: Mapped[str] = mapped_column(String(32), nullable=False, default="KG")
    unit_weight_kg: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    priority_weight: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    shelf_life_days: Mapped[int] = mapped_column(Integer, nullable=False, default=365)
    storage_type: Mapped[str] = mapped_column(String(64), nullable=False, default="DRY")

    # Relationships
    inventory_records = relationship("InventoryRecord", back_populates="supply", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<SupplyItem {self.id}: {self.name} ({self.supply_class})>"


class InventoryRecord(Base):
    __tablename__ = "inventory_records"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    location_id: Mapped[str] = mapped_column(String(64), ForeignKey("locations.id"), nullable=False)
    supply_id: Mapped[str] = mapped_column(String(64), ForeignKey("supply_items.id"), nullable=False)
    current_stock: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    daily_consumption_rate: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    safety_stock_threshold: Mapped[float] = mapped_column(Float, nullable=False, default=10.0)
    reorder_point: Mapped[float] = mapped_column(Float, nullable=False, default=20.0)
    batch_number: Mapped[str] = mapped_column(String(64), nullable=False, default="BATCH-2026-A1")
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    location = relationship("Location", back_populates="inventory_items")
    supply = relationship("SupplyItem", back_populates="inventory_records")

    @property
    def days_of_supply(self) -> float:
        """Calculate dynamic Days of Supply."""
        if self.daily_consumption_rate <= 0:
            return 999.0
        return round(self.current_stock / self.daily_consumption_rate, 1)

    @property
    def status(self) -> str:
        """Calculate risk status based on Days of Supply."""
        dos = self.days_of_supply
        if dos <= 5.0 or self.current_stock < self.safety_stock_threshold:
            return "CRITICAL"
        elif dos <= 12.0:
            return "WARNING"
        return "NORMAL"

    def __repr__(self) -> str:
        return f"<InventoryRecord {self.location_id} - {self.supply_id}: stock={self.current_stock}>"
