import React from 'react';
import {
  AlertTriangle,
  Truck,
  Mountain,
  FileCheck2,
  CheckCircle2,
  Thermometer,
  Snowflake,
} from 'lucide-react';
import type { Location, StrategicPass, Vehicle, InventoryRecord, IndentVoucher } from '../types';

interface CommandBriefingProps {
  locations: Location[];
  passes: StrategicPass[];
  vehicles: Vehicle[];
  inventory: InventoryRecord[];
  indents: IndentVoucher[];
  onTogglePass: (passId: string, currentStatus: string) => void;
}

export const CommandBriefing: React.FC<CommandBriefingProps> = ({
  locations,
  passes,
  vehicles,
  inventory,
  indents,
  onTogglePass,
}) => {
  const criticalItems = inventory.filter((item) => item.status === 'CRITICAL');
  const warningItems = inventory.filter((item) => item.status === 'WARNING');
  const openPasses = passes.filter((p) => p.is_passable);
  const blockedPasses = passes.filter((p) => !p.is_passable);
  const availableVehicles = vehicles.filter((v) => v.operational_status === 'AVAILABLE');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 4 Primary Operational Metric Cards */}
      <div className="grid-kpi-4">
        {/* Card 1: Inventory Health */}
        <div className="panel" style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Theater Stock Health
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '4px', letterSpacing: '-0.02em' }}>
                <span style={{ color: 'var(--accent-crimson)' }}>{criticalItems.length}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                  {' '}
                  Critical / {inventory.length} Ledgers
                </span>
              </div>
            </div>
            <div
              style={{
                padding: '8px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--badge-critical-bg)',
                color: 'var(--accent-crimson)',
              }}
            >
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <span className="tactical-badge badge-critical">{criticalItems.length} &lt; 5d Burn Buffer</span>
            <span className="tactical-badge badge-warning">{warningItems.length} &lt; 12d Warning</span>
          </div>
        </div>

        {/* Card 2: Strategic Passes */}
        <div className="panel" style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Strategic Pass Clearances
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '4px', letterSpacing: '-0.02em' }}>
                <span style={{ color: 'var(--accent-emerald)' }}>{openPasses.length}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                  {' '}
                  Open / {passes.length} Monitored
                </span>
              </div>
            </div>
            <div
              style={{
                padding: '8px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--badge-normal-bg)',
                color: 'var(--accent-emerald)',
              }}
            >
              <Mountain size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <span className="tactical-badge badge-normal">{openPasses.length} Passable</span>
            <span className="tactical-badge badge-critical">{blockedPasses.length} Blocked</span>
          </div>
        </div>

        {/* Card 3: Multimodal Fleet Readiness */}
        <div className="panel" style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Transport Fleet Readiness
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '4px', letterSpacing: '-0.02em' }}>
                <span style={{ color: 'var(--accent-primary)' }}>{availableVehicles.length}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                  {' '}
                  Available / {vehicles.length} Units
                </span>
              </div>
            </div>
            <div
              style={{
                padding: '8px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--badge-info-bg)',
                color: 'var(--accent-primary)',
              }}
            >
              <Truck size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '12px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            <span>Trucks 4x4/6x6</span> • <span>Bv-206 Tracked</span> • <span>Mi-17 Sorties</span>
          </div>
        </div>

        {/* Card 4: IAF-Z-2096 Indent Vouchers */}
        <div className="panel" style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Signed Requisitions (IAF-Z-2096)
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '4px', letterSpacing: '-0.02em' }}>
                <span style={{ color: 'var(--accent-amber)' }}>{indents.length}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                  {' '}
                  Active Vouchers
                </span>
              </div>
            </div>
            <div
              style={{
                padding: '8px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--badge-warning-bg)',
                color: 'var(--accent-amber)',
              }}
            >
              <FileCheck2 size={18} />
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '12px',
              fontSize: '0.72rem',
              color: 'var(--accent-emerald)',
            }}
          >
            <CheckCircle2 size={13} />
            <span>SHA-256 Tamper-Evident Signatures</span>
          </div>
        </div>
      </div>

      {/* Strategic Passes Live Status Panel */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mountain size={16} style={{ color: 'var(--accent-primary)' }} />
              Border Roads Organisation (BRO) — Mountain Pass Monitoring
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Real-time transit conditions along Northern Command supply axes (NH-1D, Manali-Leh, Nubra, DBO). Toggle status to simulate weather disruption or road clearance.
            </div>
          </div>
          <span className="tactical-badge badge-info">BRO Projects Himank / Beacon</span>
        </div>

        <div className="panel-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
            {passes.map((pass) => {
              const isBlocked = !pass.is_passable;
              return (
                <div
                  key={pass.id}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: `1px solid ${isBlocked ? 'var(--badge-critical-border)' : 'var(--border-subtle)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{pass.name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>{pass.highway}</div>
                    </div>
                    <span
                      className={`tactical-badge ${
                        pass.status === 'OPEN'
                          ? 'badge-normal'
                          : pass.status === 'RESTRICTED_CONVOY'
                          ? 'badge-warning'
                          : 'badge-critical'
                      }`}
                    >
                      {pass.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <span className="elevation-tag">{pass.elevation_m}m MSL</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Thermometer size={12} /> {pass.temperature_c}°C
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Snowflake size={12} /> {pass.snow_accumulation_cm}cm Snow
                    </span>
                  </div>

                  {pass.closure_reason && (
                    <div
                      style={{
                        fontSize: '0.73rem',
                        color: 'var(--accent-crimson)',
                        background: 'var(--badge-critical-bg)',
                        padding: '6px 8px',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid var(--badge-critical-border)',
                      }}
                    >
                      ⚠️ {pass.closure_reason}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                      Detachment: {pass.bro_detachment}
                    </span>
                    <button
                      onClick={() => onTogglePass(pass.id, pass.status)}
                      className="tactical-btn"
                      style={{
                        padding: '3px 8px',
                        fontSize: '0.72rem',
                        color: isBlocked ? 'var(--accent-emerald)' : 'var(--accent-crimson)',
                        borderColor: isBlocked ? 'var(--badge-normal-border)' : 'var(--badge-critical-border)',
                      }}
                    >
                      {isBlocked ? 'Mark Cleared (Open)' : 'Simulate Blizzard (Close)'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Forward Posts & Base Depots Directory */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>
              Northern Command XIV Corps — Tactical Locations Directory
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Base logistics depots, transit camps, and forward outposts with elevation envelopes and weather risk classifications.
            </div>
          </div>
          <span className="elevation-tag">{locations.length} Operating Nodes</span>
        </div>

        <div className="enterprise-table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Node Code</th>
                <th>Formation / Post Name</th>
                <th>Operating Sector</th>
                <th>Elevation</th>
                <th>MGRS Grid</th>
                <th>Complement</th>
                <th>Air Accessibility</th>
                <th>Environmental Risk</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((loc) => (
                <tr key={loc.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.78rem' }}>
                    {loc.id}
                  </td>
                  <td style={{ fontWeight: 600 }}>{loc.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {loc.sector.replace(/_/g, ' ')}
                  </td>
                  <td>
                    <span className="elevation-tag">{loc.elevation_m}m</span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', fontSize: '0.76rem' }}>
                    {loc.mgrs_grid || '—'}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                    {loc.current_headcount} PAX
                  </td>
                  <td>
                    {loc.is_air_accessible ? (
                      <span className="tactical-badge badge-info" style={{ fontSize: '0.68rem' }}>
                        HELI / ALG
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.74rem' }}>Surface Only</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`tactical-badge ${
                        loc.weather_risk_level === 'EXTREME'
                          ? 'badge-critical'
                          : loc.weather_risk_level === 'HIGH'
                          ? 'badge-warning'
                          : 'badge-normal'
                      }`}
                      style={{ fontSize: '0.68rem' }}
                    >
                      {loc.weather_risk_level}
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
