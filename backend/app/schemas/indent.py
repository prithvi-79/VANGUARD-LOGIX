"""
Military Indent Pydantic Schemas (IAF-Z-2096)
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class IndentItem(BaseModel):
    supply_id: str
    supply_name: str
    supply_class: str
    quantity_requested: float
    unit: str
    urgency_reason: Optional[str] = None


class IndentCreate(BaseModel):
    originating_unit: str
    forward_post_id: str
    priority: str  # OP_IMMEDIATE, PRIORITY, ROUTINE
    officer_service_number: str
    officer_name: str
    items: List[IndentItem]
    justification: str


class IndentResponse(BaseModel):
    id: str
    originating_unit: str
    forward_post_id: str
    priority: str
    officer_service_number: str
    officer_name: str
    items: List[Dict[str, Any]]
    justification: str
    status: str
    verification_hash: str
    created_at: Optional[datetime] = None
    synchronized_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class IndentBatchSyncRequest(BaseModel):
    device_id: str
    indents: List[IndentCreate]


class IndentBatchSyncResponse(BaseModel):
    synced_count: int
    rejected_count: int
    vouchers: List[IndentResponse]
    sync_status: str


class IndentStatusUpdate(BaseModel):
    status: str  # PENDING_APPROVAL, APPROVED, DISPATCHED, REJECTED, DELIVERED
    remarks: Optional[str] = None


class MovementOrderResponse(BaseModel):
    voucher_id: str
    movement_order_number: str
    origin_depot_id: str
    destination_outpost_id: str
    priority_level: str
    assigned_vehicle_callsign: str
    vehicle_type: str
    convoy_commander: str
    authorized_officer: str
    departure_window: str
    estimated_arrival: str
    route_checkpoints: List[str]
    cargo_items: List[Dict[str, Any]]
    total_cargo_weight_kg: float
    verification_hash: str
    security_classification: str = "RESTRICTED — OPERATIONAL"

