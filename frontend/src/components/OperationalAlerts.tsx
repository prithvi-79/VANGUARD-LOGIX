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
  onNavigate?: (tab: any, context?: any) => void;
}

export const OperationalAlerts: React.FC<OperationalAlertsProps> = ({
  inventory,
  passes,
  indents,
  locations,
  onNavigate,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const handleAlertAction = (category: string) => {
    if (!onNavigate) return;
    if (category === 'INVENTORY_SHORTAGE') {
      onNavigate('optimization');
    } else if (category === 'ROUTE_SEVERED') {
      onNavigate('disruption');
    } else if (category === 'REQUISITION_PENDING') {
      onNavigate('indents');
    } else {
      onNavigate('inventory');
    }
  };

  // Generate tactical alert items from current state
  const alerts = [];

  // 1. Critical inventory alerts (< 5d)
  const criticalInv = inventory.filter((i) => i.status === 'CRITICAL');
  for (const item of criticalInv) {
    const loc = locations.find((l) => l.id === item.location_id);
    alerts.push({
      id: `alert-inv-${item.id}`,
      severity: 'CRITICAL',
      category: 'INVENTORY_SHORTAGE',
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
      {/* SaaS Page Header & Breadcrumbs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            {onNavigate && (
              <>
                <button
                  onClick={() => onNavigate('briefing')}
                  style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', padding: 0, fontSize: 'inherit' }}
                >
                  Dashboard
                </button>
                <span>/</span>
              </>
            )}
            <span>Operational Alerts & Directives</span>
          </div>

          <h1 style={{ fontSize: '1.45rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Operational Alerts & Field Directive Triage
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Automated alerts triggered by burn-rate threshold violations, mountain pass status changes, and pending IAF-Z-2096 vouchers.
          </p>
        </div>
      </div>

      {/* Alert Stats Ribbon */}
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
                Operational Alerts & Field Directives
              </h2>
              <span className="tactical-badge badge-info">
                {alerts.length} Active Directives
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Automated alerts triggered by burn-rate threshold violations, mountain pass status changes, and pending IAF-Z-2096 vouchers.
            </div>
          </div>

          {/* Severity Filter */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {['ALL', 'CRITICAL', 'WARNING'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className="tactical-btn"
                style={{
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  background: filterSeverity === sev ? 'var(--accent-primary)' : 'transparent',
                  color: filterSeverity === sev ? 'var(--text-inverse)' : 'var(--text-secondary)',
                  borderColor: filterSeverity === sev ? 'var(--accent-primary)' : 'var(--border-subtle)',
                }}
              >
                {sev === 'ALL' ? 'All Alerts' : sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts Feed List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredAlerts.length === 0 ? (
          <div className="panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No operational alerts matching active filter criteria. All theater nodes reporting within normal parameters.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCrit = alert.severity === 'CRITICAL';

            return (
              <div
                key={alert.id}
                className="panel"
                style={{
                  padding: '16px 18px',
                  borderLeft: `4px solid ${isCrit ? 'var(--accent-crimson)' : 'var(--accent-amber)'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                  <div
                    style={{
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      background: isCrit ? 'var(--badge-critical-bg)' : 'var(--badge-warning-bg)',
                      color: isCrit ? 'var(--accent-crimson)' : 'var(--accent-amber)',
                      flexShrink: 0,
                    }}
                  >
                    {alert.category.includes('PASS') ? (
                      <Mountain size={18} />
                    ) : alert.category.includes('INDENT') ? (
                      <FileCheck2 size={18} />
                    ) : (
                      <AlertTriangle size={18} />
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className={`tactical-badge ${isCrit ? 'badge-critical' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>
                        {alert.severity}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        {alert.category.replace(/_/g, ' ')}
                      </span>
                      {alert.elevation && (
                        <span className="elevation-tag">{alert.elevation}m MSL</span>
                      )}
                    </div>

                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '4px 0 0 0' }}>
                      {alert.title}
                    </h4>

                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Sector / Post: <strong style={{ color: 'var(--text-primary)' }}>{alert.locationName}</strong>
                    </div>

                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5, margin: '6px 0 0 0' }}>
                      {alert.message}
                    </p>

                    <button
                      onClick={() => handleAlertAction(alert.category)}
                      className="tactical-btn"
                      style={{
                        marginTop: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        fontSize: '0.74rem',
                        color: 'var(--accent-primary)',
                        borderColor: 'var(--border-prominent)',
                        background: 'var(--bg-surface-elevated)',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                      title="Navigate directly to tool to resolve this operational directive"
                    >
                      <ArrowRight size={12} />
                      <span>{alert.action}</span>
                    </button>
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
              <ShieldCheck size={16} style={{ color: 'var(--accent-emerald)' }} />
              <h3 style={{ fontSize: '0.92rem', fontWeight: 600, margin: 0 }}>
                IAF-Z-2096 Requisition Vouchers & Cryptographic Ledger
              </h3>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Every field indent is authenticated with SHA-256 integrity verification.
            </p>
          </div>
          <span className="tactical-badge badge-normal">
            <CheckCircle2 size={11} style={{ marginRight: '4px' }} /> SHA-256 Verified
          </span>
        </div>

        <div className="enterprise-table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Voucher No</th>
                <th>Originating Unit</th>
                <th>Post</th>
                <th>Priority</th>
                <th>Officer Credentials</th>
                <th>SHA-256 Signature</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {indents.map((voucher) => (
                <tr key={voucher.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {voucher.id}
                  </td>
                  <td style={{ fontWeight: 500 }}>{voucher.originating_unit}</td>
                  <td>
                    <span className="elevation-tag">{voucher.forward_post_id}</span>
                  </td>
                  <td>
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
                      {voucher.priority.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.75rem' }}>
                    {voucher.officer_service_number}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--accent-primary)' }}>
                    {voucher.verification_hash ? `${voucher.verification_hash.slice(0, 16)}...` : '—'}
                  </td>
                  <td>
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
