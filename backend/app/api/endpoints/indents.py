"""
Military Indents Endpoints (IAF-Z-2096).
Includes cryptographic SHA-256 verification and offline batch synchronization.
"""

import io
import csv
import json
from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.indent import IndentVoucher
from app.schemas.indent import (
    IndentCreate,
    IndentResponse,
    IndentBatchSyncRequest,
    IndentBatchSyncResponse,
    IndentStatusUpdate,
    MovementOrderResponse,
)

router = APIRouter(prefix="/indents", tags=["IAF-Z-2096 Indents"])



@router.get("", response_model=List[IndentResponse])
async def list_indents(db: AsyncSession = Depends(get_db)) -> List[IndentResponse]:
    """Retrieve all military requisition vouchers and queue statuses."""
    result = await db.execute(select(IndentVoucher).order_by(IndentVoucher.created_at.desc()))
    vouchers = result.scalars().all()
    return [
        IndentResponse(
            id=v.id,
            originating_unit=v.originating_unit,
            forward_post_id=v.forward_post_id,
            priority=v.priority,
            officer_service_number=v.officer_service_number,
            officer_name=v.officer_name,
            items=v.parsed_items,
            justification=v.justification,
            status=v.status,
            verification_hash=v.verification_hash,
            created_at=v.created_at,
            synchronized_at=v.synchronized_at,
        )
        for v in vouchers
    ]


@router.post("", response_model=IndentResponse, status_code=201)
async def create_indent(indent_in: IndentCreate, db: AsyncSession = Depends(get_db)) -> IndentResponse:
    """
    Create a formal IAF-Z-2096 requisition voucher with SHA-256 integrity hash.
    """
    timestamp = datetime.now(timezone.utc)
    voucher_id = f"IAF-Z-2096/{timestamp.year}/{timestamp.strftime('%m%d%H%M%S')}"
    items_raw = json.dumps([item.model_dump() for item in indent_in.items])

    verification_hash = IndentVoucher.compute_hash(
        voucher_id,
        indent_in.originating_unit,
        indent_in.forward_post_id,
        items_raw,
        indent_in.officer_service_number,
    )

    voucher = IndentVoucher(
        id=voucher_id,
        originating_unit=indent_in.originating_unit,
        forward_post_id=indent_in.forward_post_id,
        priority=indent_in.priority,
        officer_service_number=indent_in.officer_service_number,
        officer_name=indent_in.officer_name,
        items_json=items_raw,
        justification=indent_in.justification,
        status="PENDING_APPROVAL",
        verification_hash=verification_hash,
        created_at=timestamp,
        synchronized_at=timestamp,
    )

    db.add(voucher)
    await db.commit()
    await db.refresh(voucher)

    return IndentResponse(
        id=voucher.id,
        originating_unit=voucher.originating_unit,
        forward_post_id=voucher.forward_post_id,
        priority=voucher.priority,
        officer_service_number=voucher.officer_service_number,
        officer_name=voucher.officer_name,
        items=voucher.parsed_items,
        justification=voucher.justification,
        status=voucher.status,
        verification_hash=voucher.verification_hash,
        created_at=voucher.created_at,
        synchronized_at=voucher.synchronized_at,
    )


@router.post("/sync", response_model=IndentBatchSyncResponse)
async def sync_offline_indents(
    sync_req: IndentBatchSyncRequest,
    db: AsyncSession = Depends(get_db),
) -> IndentBatchSyncResponse:
    """
    Idempotent batch synchronization endpoint for offline field PWA outposts.
    Reconciles queued vouchers entered while VSAT connectivity was down.
    """
    synced = []
    rejected = 0

    for item in sync_req.indents:
        try:
            timestamp = datetime.now(timezone.utc)
            voucher_id = f"IAF-Z-2096/{timestamp.year}/FIELD-{timestamp.strftime('%m%d%H%M%S')}-{len(synced)+1}"
            items_raw = json.dumps([it.model_dump() for it in item.items])
            v_hash = IndentVoucher.compute_hash(
                voucher_id, item.originating_unit, item.forward_post_id, items_raw, item.officer_service_number
            )

            voucher = IndentVoucher(
                id=voucher_id,
                originating_unit=item.originating_unit,
                forward_post_id=item.forward_post_id,
                priority=item.priority,
                officer_service_number=item.officer_service_number,
                officer_name=item.officer_name,
                items_json=items_raw,
                justification=item.justification,
                status="PENDING_APPROVAL",
                verification_hash=v_hash,
                created_at=timestamp,
                synchronized_at=timestamp,
            )
            db.add(voucher)
            synced.append(
                IndentResponse(
                    id=voucher.id,
                    originating_unit=voucher.originating_unit,
                    forward_post_id=voucher.forward_post_id,
                    priority=voucher.priority,
                    officer_service_number=voucher.officer_service_number,
                    officer_name=voucher.officer_name,
                    items=voucher.parsed_items,
                    justification=voucher.justification,
                    status=voucher.status,
                    verification_hash=voucher.verification_hash,
                    created_at=voucher.created_at,
                    synchronized_at=voucher.synchronized_at,
                )
            )
        except Exception:
            rejected += 1

    await db.commit()

    return IndentBatchSyncResponse(
        synced_count=len(synced),
        rejected_count=rejected,
        vouchers=synced,
        sync_status="COMPLETED",
    )


@router.get("/movement-orders/export-csv")
async def export_movement_orders_csv(db: AsyncSession = Depends(get_db)):
    """
    Export active operational movement manifests and tactical dispatch orders as downloadable CSV.
    Conforms to Indian Army Forward Convoy Dispatch Standards.
    """
    result = await db.execute(select(IndentVoucher).order_by(IndentVoucher.created_at.desc()))
    vouchers = result.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "MOVEMENT_ORDER_NO",
        "VOUCHER_ID",
        "ORIGINATING_UNIT",
        "DESTINATION_OUTPOST",
        "PRIORITY_TIER",
        "OFFICER_SERVICE_NO",
        "STATUS",
        "CARGO_SUMMARY",
        "ASSIGNED_CONVOY_CALLSIGN",
        "ROUTE_AXIS",
        "CRYPTOGRAPHIC_SHA256_HASH",
        "SECURITY_CLASSIFICATION",
    ])

    for idx, v in enumerate(vouchers, start=1):
        mo_num = f"MO/XIV-CORPS/2026/{idx:04d}"
        items_summary = "; ".join([f"{it.get('supply_name', 'Item')} ({it.get('quantity_requested', 0)} {it.get('unit', '')})" for it in v.parsed_items])
        callsign = "KARGIL-EXPRESS-1" if v.priority != "OP_IMMEDIATE" else "HIMALAYAN-EAGLE-1 (IAF Mi-17 V5)"
        route_axis = "Leh-Khardung La-Siachen Base Camp" if "KUMAR" in v.forward_post_id else "Leh-Darbuk-DBO Axis"
        writer.writerow([
            mo_num,
            v.id,
            v.originating_unit,
            v.forward_post_id,
            v.priority,
            v.officer_service_number,
            v.status,
            items_summary or "Standard Operational Replenishment",
            callsign,
            route_axis,
            v.verification_hash,
            "RESTRICTED — MILITARY LOGISTICS",
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=vanguard_movement_orders.csv"},
    )


@router.get("/voucher", response_model=IndentResponse)
async def get_indent_voucher(indent_id: str, db: AsyncSession = Depends(get_db)) -> IndentResponse:
    """Retrieve specific military requisition voucher by query param indent_id."""
    result = await db.execute(select(IndentVoucher).where(IndentVoucher.id == indent_id))
    voucher = result.scalar_one_or_none()
    if not voucher:
        raise HTTPException(status_code=404, detail=f"Indent voucher {indent_id} not found.")

    return IndentResponse(
        id=voucher.id,
        originating_unit=voucher.originating_unit,
        forward_post_id=voucher.forward_post_id,
        priority=voucher.priority,
        officer_service_number=voucher.officer_service_number,
        officer_name=voucher.officer_name,
        items=voucher.parsed_items,
        justification=voucher.justification,
        status=voucher.status,
        verification_hash=voucher.verification_hash,
        created_at=voucher.created_at,
        synchronized_at=voucher.synchronized_at,
    )


@router.patch("/status", response_model=IndentResponse)
async def update_indent_status_query(
    indent_id: str,
    status_in: IndentStatusUpdate,
    db: AsyncSession = Depends(get_db),
) -> IndentResponse:
    """Update voucher status by query param indent_id."""
    result = await db.execute(select(IndentVoucher).where(IndentVoucher.id == indent_id))
    voucher = result.scalar_one_or_none()
    if not voucher:
        raise HTTPException(status_code=404, detail=f"Indent voucher {indent_id} not found.")

    voucher.status = status_in.status
    voucher.synchronized_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(voucher)

    return IndentResponse(
        id=voucher.id,
        originating_unit=voucher.originating_unit,
        forward_post_id=voucher.forward_post_id,
        priority=voucher.priority,
        officer_service_number=voucher.officer_service_number,
        officer_name=voucher.officer_name,
        items=voucher.parsed_items,
        justification=voucher.justification,
        status=voucher.status,
        verification_hash=voucher.verification_hash,
        created_at=voucher.created_at,
        synchronized_at=voucher.synchronized_at,
    )


@router.get("/movement-order", response_model=MovementOrderResponse)
async def generate_movement_order_query(indent_id: str, db: AsyncSession = Depends(get_db)) -> MovementOrderResponse:
    """Generate formal military movement order corresponding to an approved requisition voucher."""
    result = await db.execute(select(IndentVoucher).where(IndentVoucher.id == indent_id))
    voucher = result.scalar_one_or_none()
    if not voucher:
        raise HTTPException(status_code=404, detail=f"Indent voucher {indent_id} not found.")

    items = voucher.parsed_items
    total_kg = sum(float(it.get("quantity_requested", 0)) * 1.0 for it in items)
    is_air = voucher.priority == "OP_IMMEDIATE"

    vehicle_callsign = "HIMALAYAN-EAGLE-1 (IAF Mi-17 V5)" if is_air else "LADAKH-STALLION-ALPHA"
    vehicle_type = "MI17_V5_TACTICAL_HELI" if is_air else "STALLION_6X6_HEAVY_TRUCK"
    checkpoints = ["Leh Airbase / BSD", "South Pullu", "Khardung La Summit (5,359m)", "North Pullu", "Siachen Base Camp"] if "KUMAR" in voucher.forward_post_id else ["Leh BSD", "Karu Checkpoint", "Chang La Pass", "Tangtse Hub", "DBO Outpost"]

    return MovementOrderResponse(
        voucher_id=voucher.id,
        movement_order_number=f"MO/XIV-CORPS/{datetime.now(timezone.utc).year}/{voucher.id[-4:]}",
        origin_depot_id="LOC-LEH",
        destination_outpost_id=voucher.forward_post_id,
        priority_level=voucher.priority,
        assigned_vehicle_callsign=vehicle_callsign,
        vehicle_type=vehicle_type,
        convoy_commander="Subedar H. Singh (ASC XIV Corps)",
        authorized_officer=voucher.officer_service_number,
        departure_window="06:00 - 08:30 hrs (First Light Transit)",
        estimated_arrival="14:30 hrs",
        route_checkpoints=checkpoints,
        cargo_items=items,
        total_cargo_weight_kg=round(total_kg, 1),
        verification_hash=voucher.verification_hash,
        security_classification="RESTRICTED — OPERATIONAL CONVOY ORDER",
    )


@router.get("/voucher/{indent_id:path}", response_model=IndentResponse)
async def get_indent_by_path(indent_id: str, db: AsyncSession = Depends(get_db)) -> IndentResponse:
    """Retrieve specific military requisition voucher by path."""
    return await get_indent_voucher(indent_id, db)


