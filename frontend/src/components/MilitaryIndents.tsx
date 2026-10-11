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
      await api.updateIndentStatus(voucherId, 'APPROVED', 'Approved by XIV Corps ASC Logistics Cell');
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div
        className="tactical-card"
        style={{
          padding: '20px 24px',
          borderLeft: '4px solid var(--accent-gold)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--accent-gold)',
                fontWeight: 700,
                letterSpacing: '0.08em',
              }}
            >
              MILITARY WORKFLOWS & VOUCHERS — P1-REQ-02 & P1-REQ-05
            </span>
            <span className="badge badge-gold">IAF-Z-2096 COMPLIANT</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px', letterSpacing: '-0.01em' }}>
            IAF-Z-2096 Indent Management & Movement Orders
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px', maxWidth: '850px' }}>
            Official Indian Army requisition vouchers featuring cryptographic SHA-256 verification hashes, officer service number attribution, automated movement order generation, and CSV export.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <a
            href={api.getMovementOrdersCsvUrl()}
            download="vanguard_movement_orders.csv"
            className="tactical-btn tactical-btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
          >
            <Download size={14} /> Export Movement Orders (CSV)
          </a>
        </div>
      </div>

      {/* KPI Counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="tactical-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Total Indents on Ledger
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: '4px', color: 'var(--text-primary)' }}>
            {indents.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Northern Command XIV Corps
          </div>
        </div>

        <div className="tactical-card" style={{ padding: '16px', borderLeft: '4px solid var(--accent-amber)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Pending Approval
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: '4px', color: 'var(--accent-amber)' }}>
            {pendingCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Awaiting commander sign-off
          </div>
        </div>

        <div className="tactical-card" style={{ padding: '16px', borderLeft: '4px solid var(--accent-cyan)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Approved For Lift
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: '4px', color: 'var(--accent-cyan)' }}>
            {approvedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Vehicle assignment queued
          </div>
        </div>

        <div className="tactical-card" style={{ padding: '16px', borderLeft: '4px solid var(--accent-emerald)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Dispatched / En Route
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: '4px', color: 'var(--accent-emerald)' }}>
            {dispatchedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Convoys under transit radar
          </div>
        </div>
      </div>

      {/* Indents Ledger Table */}
      <div className="tactical-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>IAF-Z-2096 Requisition Voucher Ledger</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            100% Cryptographically Sealed & Non-Repudiable
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '10px 8px' }}>Voucher No</th>
                <th style={{ padding: '10px 8px' }}>Originating Unit</th>
                <th style={{ padding: '10px 8px' }}>Destination Post</th>
                <th style={{ padding: '10px 8px' }}>Officer Service No</th>
                <th style={{ padding: '10px 8px' }}>Priority</th>
                <th style={{ padding: '10px 8px' }}>Status</th>
                <th style={{ padding: '10px 8px' }}>SHA-256 Integrity</th>
                <th style={{ padding: '10px 8px', textAlign: 'right' }}>Tactical Actions</th>
              </tr>
            </thead>
            <tbody>
              {indents.map((v) => {
                const isImmediate = v.priority === 'OP_IMMEDIATE';
                const isPending = v.status === 'PENDING_APPROVAL';
                const isApproved = v.status === 'APPROVED';

                return (
                  <tr key={v.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {v.id}
                    </td>
                    <td style={{ padding: '10px 8px', fontWeight: 600 }}>{v.originating_unit}</td>
                    <td style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>{v.forward_post_id}</td>
                    <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)' }}>{v.officer_service_number}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <span className={`badge ${isImmediate ? 'badge-crimson' : v.priority === 'PRIORITY' ? 'badge-amber' : 'badge-cyan'}`} style={{ fontSize: '0.65rem' }}>
                        {v.priority}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <span className={`badge ${v.status === 'DISPATCHED' ? 'badge-emerald' : isApproved ? 'badge-cyan' : 'badge-amber'}`} style={{ fontSize: '0.65rem' }}>
                        {v.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--accent-emerald)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
                        <ShieldCheck size={12} />
                        {v.verification_hash.slice(0, 10)}...{v.verification_hash.slice(-6)}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {isPending && (
                          <button
                            onClick={() => handleApproveVoucher(v.id)}
                            disabled={isProcessing}
                            className="tactical-btn"
                            style={{ fontSize: '0.7rem', padding: '4px 8px', color: 'var(--accent-emerald)', borderColor: 'var(--accent-emerald)' }}
                          >
                            Approve
                          </button>
                        )}
                        {isApproved && (
                          <button
                            onClick={() => handleDispatchVoucher(v.id)}
                            disabled={isProcessing}
                            className="tactical-btn"
                            style={{ fontSize: '0.7rem', padding: '4px 8px', color: 'var(--accent-cyan)', borderColor: 'var(--accent-cyan)' }}
                          >
                            Dispatch
                          </button>
                        )}
                        <button
                          onClick={() => handleViewMovementOrder(v)}
                          className="tactical-btn"
                          style={{ fontSize: '0.7rem', padding: '4px 8px' }}
                          title="View Movement Order"
                        >
                          <Truck size={12} /> Order
                        </button>
                        <button
                          onClick={() => handleOpenPrintSlip(v)}
                          className="tactical-btn"
                          style={{ fontSize: '0.7rem', padding: '4px 8px' }}
                          title="Print Tactical Slip"
                        >
                          <Printer size={12} /> Slip
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
        <div className="tactical-card" style={{ padding: '24px', border: '1px solid var(--accent-cyan)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={20} className="text-cyan" />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                  Tactical Movement Order: {activeMovementOrder.movement_order_number}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-crimson)', fontWeight: 700 }}>
                  {activeMovementOrder.security_classification}
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveMovementOrder(null)}
              className="tactical-btn"
              style={{ fontSize: '0.75rem' }}
            >
              Close Order
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', fontSize: '0.8rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Assigned Vehicle Callsign:</span>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-cyan)', marginTop: '2px' }}>
                {activeMovementOrder.assigned_vehicle_callsign}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                Type: {activeMovementOrder.vehicle_type}
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)' }}>Convoy Commander:</span>
              <div style={{ fontWeight: 700, marginTop: '2px' }}>{activeMovementOrder.convoy_commander}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                Auth Officer: {activeMovementOrder.authorized_officer}
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)' }}>Departure Window:</span>
              <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                {activeMovementOrder.departure_window}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                ETA: {activeMovementOrder.estimated_arrival}
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)' }}>Total Mission Payload:</span>
              <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.9rem', marginTop: '2px' }}>
                {activeMovementOrder.total_cargo_weight_kg.toLocaleString()} kg
              </div>
            </div>
          </div>

          {/* Route Checkpoints Stepper */}
          <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
              En-Route Checkpoints & Choke Passes
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {activeMovementOrder.route_checkpoints.map((cp, idx) => (
                <React.Fragment key={idx}>
                  <div
                    style={{
                      padding: '6px 12px',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    {idx + 1}. {cp}
                  </div>
                  {idx < activeMovementOrder.route_checkpoints.length - 1 && (
                    <ArrowRight size={14} className="text-muted" />
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
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div
            className="tactical-card"
            style={{
              maxWidth: '680px',
              width: '100%',
              padding: '32px',
              background: '#0e1420',
              border: '2px solid var(--accent-cyan)',
              color: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #334155', paddingBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-crimson)', letterSpacing: '0.1em' }}>
                  INDIAN ARMY — DEFENCE SERVICES STAFF COLLEGE
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, marginTop: '2px' }}>
                  TACTICAL DISPATCH SLIP & REQUISITION VOUCHER
                </h2>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
                  FORM IAF-Z-2096 &bull; {selectedVoucher.id}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-crimson" style={{ fontSize: '0.75rem' }}>
                  {selectedVoucher.priority}
                </span>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>
                  HQ XIV CORPS / ASC
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', margin: '20px 0', fontSize: '0.8rem' }}>
              <div>
                <div style={{ color: '#94a3b8' }}>Originating Formation:</div>
                <div style={{ fontWeight: 700 }}>{selectedVoucher.originating_unit}</div>
              </div>
              <div>
                <div style={{ color: '#94a3b8' }}>Forward Destination Node:</div>
                <div style={{ fontWeight: 700 }}>{selectedVoucher.forward_post_id}</div>
              </div>
              <div>
                <div style={{ color: '#94a3b8' }}>Indenting Officer Service No:</div>
                <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{selectedVoucher.officer_service_number}</div>
              </div>
              <div>
                <div style={{ color: '#94a3b8' }}>Voucher Status:</div>
                <div style={{ fontWeight: 700 }}>{selectedVoucher.status}</div>
              </div>
            </div>

            <div style={{ margin: '16px 0', fontSize: '0.8rem' }}>
              <div style={{ color: '#94a3b8', marginBottom: '6px' }}>Cargo Items Manifest:</div>
              <div style={{ background: '#1e293b', padding: '12px', borderRadius: '4px' }}>
                {selectedVoucher.items.map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span>{it.supply_name} ({it.supply_class})</span>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>
                      {it.quantity_requested.toLocaleString()} {it.unit}
                    </strong>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#cbd5e1', fontStyle: 'italic', margin: '12px 0' }}>
              Justification: "{selectedVoucher.justification}"
            </div>

            {/* Cryptographic Seal */}
            <div
              style={{
                marginTop: '20px',
                padding: '12px',
                borderRadius: '4px',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent-emerald)',
                wordBreak: 'break-all',
              }}
            >
              <Lock size={12} style={{ display: 'inline', marginRight: '6px' }} />
              CRYPTOGRAPHIC INTEGRITY SEAL (SHA-256):<br />
              {selectedVoucher.verification_hash}
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => setIsDispatchModalOpen(false)}
                className="tactical-btn"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="tactical-btn tactical-btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Printer size={14} /> Print Formal Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
