"""
Supply and Inventory Pydantic Schemas
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class SupplyItemBase(BaseModel):
    id: str
    name: str
    supply_class: str
    class_label: str
    unit: str
    unit_weight_kg: float
    priority_weight: float
    shelf_life_days: int
    storage_type: str


class SupplyItemResponse(SupplyItemBase):
    model_config = ConfigDict(from_attributes=True)


class InventoryRecordBase(BaseModel):
    id: str
    location_id: str
    supply_id: str
    current_stock: float
    daily_consumption_rate: float
    safety_stock_threshold: float
    reorder_point: float
    batch_number: str


class InventoryRecordResponse(InventoryRecordBase):
    days_of_supply: float
    status: str
    updated_at: Optional[datetime] = None
    supply: Optional[SupplyItemResponse] = None

    model_config = ConfigDict(from_attributes=True)


class InventoryListResponse(BaseModel):
    total: int
    items: List[InventoryRecordResponse]
