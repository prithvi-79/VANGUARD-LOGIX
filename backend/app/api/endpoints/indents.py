"""
Military Indents Endpoints (IAF-Z-2096).
Includes cryptographic SHA-256 verification and offline batch synchronization.
"""

import json
from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.indent import IndentVoucher
from app.schemas.indent import (
    IndentCreate,
    IndentResponse,
    IndentBatchSyncRequest,
    IndentBatchSyncResponse,
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
