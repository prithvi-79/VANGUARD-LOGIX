import React, { useState } from 'react';
import {
  Download,
  Printer,
  ShieldCheck,
  Truck,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { api } from '../services/api';
import type { IndentVoucher, MovementOrderResponse } from '../types';

interface MilitaryIndentsProps {
  indents: IndentVoucher[];
  onRefresh: () => void;
}

export const MilitaryIndents: React.FC<MilitaryIndentsProps> = ({ indents, onRefresh }) => {
  const [selectedVoucher, setSelectedVoucher] = useState<IndentVoucher | null>(null);
  const [activeMovementOrder, setActiveMovementOrder] = useState<MovementOrderResponse | null>(null);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleApproveVoucher = async (voucherId: string) => {
    setIsProcessing(true);
    try {
      await api.updateIndentStatus(voucherId, 'APPROVED', 'Approved by Corps Logistics Cell');
      onRefresh();
    } catch (err: any) {
      alert(`Approval failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDispatchVoucher = async (voucherId: string) => {
    setIsProcessing(true);
    try {
      await api.updateIndentStatus(voucherId, 'DISPATCHED', 'Convoys / Aerial sorties cleared for movement');
      onRefresh();
    } catch (err: any) {
      alert(`Dispatch update failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewMovementOrder = async (voucher: IndentVoucher) => {
    try {
      const mo = await api.getMovementOrder(voucher.id);
      setActiveMovementOrder(mo);
      setSelectedVoucher(voucher);
    } catch (err: any) {
      alert(`Failed to load movement order: ${err.message}`);
    }
  };

  const handleOpenPrintSlip = (voucher: IndentVoucher) => {
    setSelectedVoucher(voucher);
    setIsDispatchModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const pendingCount = indents.filter((i) => i.status === 'PENDING_APPROVAL').length;
  const approvedCount = indents.filter((i) => i.status === 'APPROVED').length;
  const dispatchedCount = indents.filter((i) => i.status === 'DISPATCHED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div className="panel">
        <div
          className="panel-header"
          style={{
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>
                IAF-Z-2096 Indent Management & Movement Orders
              </h2>
              <span className="tactical-badge badge-normal">
                Standard Compliant
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px', maxWidth: '850px' }}>
              Army supply requisition vouchers featuring cryptographic SHA-256 integrity verification, officer credentials, movement order generation, and CSV export.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <a
              href={api.getMovementOrdersCsvUrl()}
              download="vanguard_movement_orders.csv"
              className="tactical-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none',
                background: 'var(--accent-primary)',
                color: 'var(--text-inverse)',
                borderColor: 'var(--accent-primary)',
                fontSize: '0.75rem',
                padding: '5px 12px',
              }}
            >
              <Download size={13} /> Export Movement Orders (CSV)
            </a>
          </div>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid-kpi-4">
        <div className="panel" style={{ padding: '14px 16px', borderLeft: '4px solid var(--accent-primary)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Total Indents on Ledger
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '2px', color: 'var(--text-primary)' }}>
            {indents.length}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
            Recorded requisition vouchers
          </div>
        </div>

        <div className="panel" style={{ padding: '14px 16px', borderLeft: '4px solid var(--accent-amber)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Pending Approval
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '2px', color: 'var(--accent-amber)' }}>
            {pendingCount}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
            Awaiting logistics cell sign-off
          </div>
        </div>

        <div className="panel" style={{ padding: '14px 16px', borderLeft: '4px solid var(--accent-primary)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Approved For Lift
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '2px', color: 'var(--accent-primary)' }}>
            {approvedCount}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
            Vehicle assignment queued
          </div>
        </div>

        <div className="panel" style={{ padding: '14px 16px', borderLeft: '4px solid var(--accent-emerald)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Dispatched / En Route
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '2px', color: 'var(--accent-emerald)' }}>
            {dispatchedCount}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
            Convoys under transit monitor
          </div>
        </div>
      </div>

      {/* Indents Ledger Table */}
      <div className="panel">
        <div className="panel-header">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>
            Requisition Voucher Ledger
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Cryptographically sealed with SHA-256 hashes
          </span>
        </div>

        <div className="enterprise-table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Voucher No</th>
                <th>Originating Unit</th>
                <th>Destination Post</th>
                <th>Officer Service No</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Integrity Seal</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {indents.map((v) => {
                const isImmediate = v.priority === 'OP_IMMEDIATE';
                const isPending = v.status === 'PENDING_APPROVAL';
                const isApproved = v.status === 'APPROVED';

                return (
                  <tr key={v.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-primary)' }}>
                      {v.id}
                    </td>
                    <td style={{ fontWeight: 500 }}>{v.originating_unit}</td>
                    <td>
                      <span className="elevation-tag">{v.forward_post_id}</span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{v.officer_service_number}</td>
                    <td>
                      <span
                        className={`tactical-badge ${
                          isImmediate ? 'badge-critical' : v.priority === 'PRIORITY' ? 'badge-warning' : 'badge-normal'
                        }`}
                        style={{ fontSize: '0.65rem' }}
                      >
                        {v.priority.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`tactical-badge ${
                          v.status === 'DISPATCHED' ? 'badge-normal' : isApproved ? 'badge-info' : 'badge-warning'
                        }`}
                        style={{ fontSize: '0.65rem' }}
                      >
                        {v.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--accent-emerald)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
                        <ShieldCheck size={12} />
                        {v.verification_hash.slice(0, 8)}...{v.verification_hash.slice(-4)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        {isPending && (
                          <button
                            onClick={() => handleApproveVoucher(v.id)}
                            disabled={isProcessing}
                            className="tactical-btn"
                            style={{ fontSize: '0.7rem', padding: '3px 8px', color: 'var(--accent-emerald)', borderColor: 'var(--accent-emerald)' }}
                          >
                            Approve
                          </button>
                        )}
                        {isApproved && (
                          <button
                            onClick={() => handleDispatchVoucher(v.id)}
                            disabled={isProcessing}
                            className="tactical-btn"
                            style={{ fontSize: '0.7rem', padding: '3px 8px', color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }}
                          >
                            Dispatch
                          </button>
                        )}
                        <button
                          onClick={() => handleViewMovementOrder(v)}
                          className="tactical-btn"
                          style={{ fontSize: '0.7rem', padding: '3px 8px' }}
                          title="View Movement Order"
                        >
                          <Truck size={11} style={{ marginRight: '3px' }} /> Order
                        </button>
                        <button
                          onClick={() => handleOpenPrintSlip(v)}
                          className="tactical-btn"
                          style={{ fontSize: '0.7rem', padding: '3px 8px' }}
                          title="Print Tactical Slip"
                        >
                          <Printer size={11} style={{ marginRight: '3px' }} /> Slip
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movement Order Drawer / Modal */}
      {activeMovementOrder && selectedVoucher && (
        <div className="panel" style={{ padding: '20px', borderLeft: '4px solid var(--accent-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={18} style={{ color: 'var(--accent-primary)' }} />
              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 600, margin: 0 }}>
                  Movement Order: {activeMovementOrder.movement_order_number}
                </h3>
                <span className="tactical-badge badge-warning" style={{ fontSize: '0.62rem', marginTop: '2px' }}>
                  {activeMovementOrder.security_classification}
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveMovementOrder(null)}
              className="tactical-btn"
              style={{ fontSize: '0.72rem', padding: '3px 8px' }}
            >
              Close Order
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.78rem' }}>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Assigned Vehicle:</span>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--accent-primary)', marginTop: '2px' }}>
                {activeMovementOrder.assigned_vehicle_callsign}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                Type: {activeMovementOrder.vehicle_type}
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Convoy Commander:</span>
              <div style={{ fontWeight: 600, marginTop: '2px' }}>{activeMovementOrder.convoy_commander}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                Authorized: {activeMovementOrder.authorized_officer}
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Departure Window:</span>
              <div style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                {activeMovementOrder.departure_window}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                ETA: {activeMovementOrder.estimated_arrival}
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Mission Payload:</span>
              <div style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '0.85rem', marginTop: '2px' }}>
                {activeMovementOrder.total_cargo_weight_kg.toLocaleString()} kg
              </div>
            </div>
          </div>

          {/* Route Checkpoints Stepper */}
          <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              En-Route Checkpoints & Passes:
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {activeMovementOrder.route_checkpoints.map((cp, idx) => (
                <React.Fragment key={idx}>
                  <span className="elevation-tag">
                    {idx + 1}. {cp}
                  </span>
                  {idx < activeMovementOrder.route_checkpoints.length - 1 && (
                    <ArrowRight size={12} style={{ color: 'var(--text-tertiary)' }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Printable Tactical Dispatch Slip Modal */}
      {isDispatchModalOpen && selectedVoucher && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(22, 22, 22, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div
            className="panel"
            style={{
              maxWidth: '640px',
              width: '100%',
              padding: '28px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-prominent)',
              borderRadius: '0px',
              boxShadow: 'none',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Northern Logistics Requisition
                </div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '2px 0 0 0' }}>
                  Tactical Dispatch Slip & Indent Voucher
                </h2>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--accent-primary)', marginTop: '2px' }}>
                  Form IAF-Z-2096 • {selectedVoucher.id}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="tactical-badge badge-critical" style={{ fontSize: '0.7rem' }}>
                  {selectedVoucher.priority.replace(/_/g, ' ')}
                </span>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                  Logistics Command
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', margin: '16px 0', fontSize: '0.78rem' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)' }}>Originating Formation:</div>
                <div style={{ fontWeight: 600 }}>{selectedVoucher.originating_unit}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)' }}>Forward Destination Node:</div>
                <div style={{ fontWeight: 600 }}>{selectedVoucher.forward_post_id}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)' }}>Indenting Officer Service No:</div>
                <div style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{selectedVoucher.officer_service_number}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)' }}>Voucher Status:</div>
                <div style={{ fontWeight: 600 }}>{selectedVoucher.status.replace(/_/g, ' ')}</div>
              </div>
            </div>

            <div style={{ margin: '14px 0', fontSize: '0.78rem' }}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '6px' }}>Cargo Items Manifest:</div>
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                {selectedVoucher.items.map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                    <span>{it.supply_name} ({it.supply_class.replace(/_/g, ' ')})</span>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>
                      {it.quantity_requested.toLocaleString()} {it.unit}
                    </strong>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: '10px 0' }}>
              Justification: "{selectedVoucher.justification}"
            </div>

            {/* Cryptographic Seal */}
            <div
              style={{
                marginTop: '16px',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--badge-normal-bg)',
                border: '1px solid var(--badge-normal-border)',
                fontSize: '0.68rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--badge-normal-text)',
                wordBreak: 'break-all',
              }}
            >
              <Lock size={11} style={{ display: 'inline', marginRight: '5px' }} />
              Cryptographic Integrity Seal (SHA-256):<br />
              {selectedVoucher.verification_hash}
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button
                onClick={() => setIsDispatchModalOpen(false)}
                className="tactical-btn"
                style={{ fontSize: '0.75rem', padding: '5px 12px' }}
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="tactical-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--accent-primary)',
                  color: 'var(--text-inverse)',
                  borderColor: 'var(--accent-primary)',
                  fontSize: '0.75rem',
                  padding: '5px 12px',
                }}
              >
                <Printer size={13} /> Print Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
