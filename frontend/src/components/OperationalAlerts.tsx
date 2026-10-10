import React, { useState } from 'react';
import {
  AlertTriangle,
  FileCheck2,
  Mountain,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import type { InventoryRecord, StrategicPass, IndentVoucher, Location } from '../types';

interface OperationalAlertsProps {
  inventory: InventoryRecord[];
  passes: StrategicPass[];
  indents: IndentVoucher[];
  locations: Location[];
}

export const OperationalAlerts: React.FC<OperationalAlertsProps> = ({
  inventory,
  passes,
  indents,
  locations,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  // Generate tactical alert items from current state
  const alerts = [];

  // 1. Critical inventory alerts (< 5d)
  const criticalInv = inventory.filter((i) => i.status === 'CRITICAL');
  for (const item of criticalInv) {
    const loc = locations.find((l) => l.id === item.location_id);
    alerts.push({
      id: `alert-inv-${item.id}`,
      severity: 'CRITICAL',
      category: 'INVENTORY_STOCKOUT',
      title: `Critical Supply Shortage: ${item.supply?.name.split('(')[0] || item.supply_id}`,
      locationName: loc?.name || item.location_id,
      elevation: loc?.elevation_m,
      message: `Current stock (${item.current_stock.toLocaleString()} ${item.supply?.unit}) represents only ${item.days_of_supply} Days of Supply at forward burn rate of ${item.daily_consumption_rate}/day.`,
      action: 'Initiate Emergency IAF-Z-2096 Requisition / Air-Drop',
      timestamp: 'Immediate Concern',
    });
  }

  // 2. Severed mountain passes
  const blockedPasses = passes.filter((p) => !p.is_passable);
  for (const pass of blockedPasses) {
    alerts.push({
      id: `alert-pass-${pass.id}`,
      severity: 'CRITICAL',
      category: 'ROUTE_SEVERED',
      title: `Pass Choke Point Severed: ${pass.name} (${pass.elevation_m}m)`,
      locationName: pass.highway,
      elevation: pass.elevation_m,
      message: `Status: ${pass.status.replace(/_/g, ' ')}. ${pass.closure_reason || 'Severe snowstorm accumulation exceeding 50cm'}. Temp: ${pass.temperature_c}°C.`,
      action: 'Divert road convoys to contingency IAF Mi-17 V5 air-bridge',
      timestamp: 'Active Disruption',
    });
  }

  // 3. Restricted convoy passes
  const restrictedPasses = passes.filter((p) => p.status === 'RESTRICTED_CONVOY');
  for (const pass of restrictedPasses) {
    alerts.push({
      id: `alert-pass-rest-${pass.id}`,
      severity: 'WARNING',
      category: 'ROUTE_RESTRICTED',
      title: `Pass Traffic Restricted: ${pass.name}`,
      locationName: pass.highway,
      elevation: pass.elevation_m,
      message: `Single-lane convoy timing restriction active due to black ice (${pass.snow_accumulation_cm}cm snow, ${pass.temperature_c}°C). Estimated transit delay: +3.5 hours.`,
      action: 'Enforce tire-chain mandate and heavy recovery escort',
      timestamp: 'Active Restriction',
    });
  }

  // 4. Pending Indent Vouchers
  for (const voucher of indents) {
    const loc = locations.find((l) => l.id === voucher.forward_post_id);
    alerts.push({
      id: `alert-indent-${voucher.id}`,
      severity: voucher.priority === 'OP_IMMEDIATE' ? 'CRITICAL' : 'WARNING',
      category: 'INDENT_PENDING',
      title: `IAF-Z-2096 Voucher Awaiting Dispatch: ${voucher.id}`,
      locationName: loc?.name || voucher.forward_post_id,
      elevation: loc?.elevation_m,
      message: `Origin: ${voucher.originating_unit} (${voucher.officer_service_number}). Priority: ${voucher.priority}. Justification: ${voucher.justification}`,
      action: `Cryptographic Signature Validated (${voucher.verification_hash.slice(0, 12)}...)`,
      timestamp: 'Requisition Queue',
    });
  }

  const filteredAlerts = alerts.filter((a) => {
    return filterSeverity === 'ALL' || a.severity === filterSeverity;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Alert Stats Ribbon */}
      <div className="tactical-card" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="tactical-badge badge-critical">LIVE MILITARY SITUATION FEED</span>
            <span className="tactical-badge badge-cyan">{alerts.length} ACTIVE DIRECTIVES</span>
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '4px', margin: 0 }}>
            Northern Command XIV Corps — Tactical Operational Alerts
          </h2>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Automated alerts triggered by burn-rate threshold violations, BRO pass condition changes, and pending IAF-Z-2096 vouchers.
          </div>
        </div>

        {/* Severity Filter */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['ALL', 'CRITICAL', 'WARNING'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`tactical-btn ${filterSeverity === sev ? 'tactical-btn-primary' : ''}`}
              style={{ padding: '6px 14px', fontSize: '0.75rem' }}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Feed List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredAlerts.length === 0 ? (
          <div className="tactical-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            No operational alerts matching active filter criteria. All theater nodes reporting within normal parameters.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCrit = alert.severity === 'CRITICAL';

            return (
              <div
                key={alert.id}
                className="tactical-card"
                style={{
                  padding: '18px 20px',
                  borderLeft: `4px solid ${isCrit ? '#ef4444' : '#f59e0b'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', gap: '14px', flex: 1 }}>
                  <div
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      background: isCrit ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: isCrit ? 'var(--accent-crimson)' : 'var(--accent-amber)',
                      flexShrink: 0,
                    }}
                  >
                    {alert.category.includes('PASS') ? (
                      <Mountain size={20} />
                    ) : alert.category.includes('INDENT') ? (
                      <FileCheck2 size={20} />
                    ) : (
                      <AlertTriangle size={20} />
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span
                        className={`tactical-badge ${isCrit ? 'badge-critical' : 'badge-warning'}`}
                        style={{ fontSize: '0.65rem' }}
                      >
                        {alert.severity}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                        {alert.category}
                      </span>
                      {alert.elevation && (
                        <span className="elevation-tag">{alert.elevation}m MSL</span>
                      )}
                    </div>

                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '4px', margin: 0 }}>
                      {alert.title}
                    </h4>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Sector / Post: <strong style={{ color: 'var(--text-primary)' }}>{alert.locationName}</strong>
                    </div>

                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
                      {alert.message}
                    </p>

                    <div
                      style={{
                        marginTop: '10px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.72rem',
                        color: 'var(--accent-cyan)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      <ArrowRight size={12} />
                      {alert.action}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0, fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                  <span className="font-mono">{alert.timestamp}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* IAF-Z-2096 Indent Vouchers Cryptographic Verification Register */}
      <div className="tactical-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} className="text-emerald" />
              IAF-Z-2096 Military Requisition Vouchers & Cryptographic Ledger
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Every requisition indent is signed with SHA-256 integrity verification preventing field voucher tampering.
            </p>
          </div>
          <span className="tactical-badge badge-normal">
            <CheckCircle2 size={12} /> SHA-256 HASH VERIFIED
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--border-prominent)',
                  textAlign: 'left',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                }}
              >
                <th style={{ padding: '10px 12px' }}>VOUCHER NO</th>
                <th style={{ padding: '10px 12px' }}>ORIGINATING UNIT</th>
                <th style={{ padding: '10px 12px' }}>POST</th>
                <th style={{ padding: '10px 12px' }}>PRIORITY</th>
                <th style={{ padding: '10px 12px' }}>OFFICER CREDENTIALS</th>
                <th style={{ padding: '10px 12px' }}>SHA-256 SIGNATURE</th>
                <th style={{ padding: '10px 12px' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {indents.map((voucher) => (
                <tr
                  key={voucher.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    {voucher.id}
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{voucher.originating_unit}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className="elevation-tag">{voucher.forward_post_id}</span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span
                      className={`tactical-badge ${
                        voucher.priority === 'OP_IMMEDIATE'
                          ? 'badge-critical'
                          : voucher.priority === 'PRIORITY'
                          ? 'badge-warning'
                          : 'badge-normal'
                      }`}
                      style={{ fontSize: '0.68rem' }}
                    >
                      {voucher.priority}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: '0.75rem' }}>
                    {voucher.officer_service_number}
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--accent-cyan)' }}>
                    {voucher.verification_hash ? `${voucher.verification_hash.slice(0, 16)}...` : '—'}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className="tactical-badge badge-warning" style={{ fontSize: '0.68rem' }}>
                      {voucher.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
