"""
Military Indent Model — IAF-Z-2096 Requisition Voucher with cryptographic SHA-256 verification.
"""

import hashlib
import json
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class IndentVoucher(Base):
    __tablename__ = "indent_vouchers"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)  # Voucher No e.g. IAF-Z-2096/2026/0481
    originating_unit: Mapped[str] = mapped_column(String(128), nullable=False)
    forward_post_id: Mapped[str] = mapped_column(String(64), nullable=False)
    priority: Mapped[str] = mapped_column(String(32), nullable=False, default="ROUTINE")
    # Priorities: OP_IMMEDIATE, PRIORITY, ROUTINE
    officer_service_number: Mapped[str] = mapped_column(String(128), nullable=False)
    officer_name: Mapped[str] = mapped_column(String(128), nullable=False, default="")
    items_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    justification: Mapped[str] = mapped_column(Text, nullable=False, default="")
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="PENDING_APPROVAL")
    # Status: DRAFT, PENDING_APPROVAL, APPROVED, DISPATCHED, DELIVERED
    verification_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    synchronized_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    @classmethod
    def compute_hash(cls, voucher_id: str, unit: str, post_id: str, items_raw: str, officer_id: str) -> str:
        """Compute SHA-256 integrity hash for the military voucher."""
        payload = f"{voucher_id}:{unit}:{post_id}:{items_raw}:{officer_id}".encode("utf-8")
        return hashlib.sha256(payload).hexdigest()

    def verify_integrity(self) -> bool:
        """Verify that the voucher has not been tampered with."""
        expected = self.compute_hash(
            self.id, self.originating_unit, self.forward_post_id, self.items_json, self.officer_service_number
        )
        return self.verification_hash == expected

    @property
    def parsed_items(self) -> list:
        try:
            return json.loads(self.items_json)
        except Exception:
            return []

    def __repr__(self) -> str:
        return f"<IndentVoucher {self.id}: {self.originating_unit} ({self.priority})>"
