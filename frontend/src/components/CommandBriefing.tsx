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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 4 Stat Metric Cards */}
      <div className="tactical-grid-4">
        {/* Card 1: Inventory Health & Critical Stockouts */}
        <div className="tactical-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                THEATER INVENTORY STATUS
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px' }}>
                <span className="text-crimson">{criticalItems.length}</span>
                <span style={{ fontSize: '1rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                  {' '}
                  Critical / {inventory.length} Ledgers
                </span>
              </div>
            </div>
            <div
              style={{
                padding: '10px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: 'var(--accent-crimson)',
              }}
            >
              <AlertTriangle size={22} />
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '16px',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span className="tactical-badge badge-critical">{criticalItems.length} &lt; 5d DoS</span>
            <span className="tactical-badge badge-warning">{warningItems.length} &lt; 12d DoS</span>
          </div>
        </div>

        {/* Card 2: Strategic Passes */}
        <div className="tactical-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                BRO STRATEGIC PASSES
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px' }}>
                <span className="text-emerald">{openPasses.length}</span>
                <span style={{ fontSize: '1rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                  {' '}
                  Open / {passes.length} Monitored
                </span>
              </div>
            </div>
            <div
              style={{
                padding: '10px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--accent-emerald)',
              }}
            >
              <Mountain size={22} />
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '16px',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span className="tactical-badge badge-normal">{openPasses.length} Passable</span>
            <span className="tactical-badge badge-critical">{blockedPasses.length} Severed</span>
          </div>
        </div>

        {/* Card 3: Multimodal Fleet Readiness */}
        <div className="tactical-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                MULTIMODAL FLEET
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px' }}>
                <span className="text-cyan">{availableVehicles.length}</span>
                <span style={{ fontSize: '1rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                  {' '}
                  Ready / {vehicles.length} Units
                </span>
              </div>
            </div>
            <div
              style={{
                padding: '10px',
                borderRadius: '8px',
                background: 'rgba(6, 182, 212, 0.15)',
                color: 'var(--accent-cyan)',
              }}
            >
              <Truck size={22} />
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginTop: '16px',
              fontSize: '0.72rem',
              color: 'var(--text-secondary)',
            }}
          >
            <span>Trucks 4x4/6x6</span> • <span>Bv-206 Snowcats</span> • <span>Mi-17 Air Lift</span>
          </div>
        </div>

        {/* Card 4: IAF-Z-2096 Indent Vouchers */}
        <div className="tactical-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                IAF-Z-2096 INDENTS
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px' }}>
                <span className="text-amber">{indents.length}</span>
                <span style={{ fontSize: '1rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                  {' '}
                  Vouchers Signed
                </span>
              </div>
            </div>
            <div
              style={{
                padding: '10px',
                borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--accent-amber)',
              }}
            >
              <FileCheck2 size={22} />
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '16px',
              fontSize: '0.72rem',
              color: 'var(--accent-emerald)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <CheckCircle2 size={13} />
            <span>SHA-256 Verified Signatures</span>
          </div>
        </div>
      </div>

      {/* Strategic Passes Passability Live Panel */}
      <div className="tactical-card" style={{ padding: '24px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '18px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mountain className="text-cyan" size={18} />
              Border Roads Organisation (BRO) — Strategic Mountain Pass Monitor
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Real-time passability conditions for choke points across Northern Command supply axes. Toggle status to simulate weather disruption or clearance.
            </p>
          </div>
          <span className="tactical-badge badge-cyan">BRO Project Himank / Beacon</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '14px' }}>
          {passes.map((pass) => {
            const isBlocked = !pass.is_passable;
            return (
              <div
                key={pass.id}
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  background: 'var(--bg-surface-elevated)',
                  border: `1px solid ${isBlocked ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-subtle)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{pass.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{pass.highway}</div>
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
                    {pass.status.replace('_', ' ')}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <span className="elevation-tag">{pass.elevation_m}m MSL</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Thermometer size={13} /> {pass.temperature_c}°C
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Snowflake size={13} /> {pass.snow_accumulation_cm}cm Snow
                  </span>
                </div>

                {pass.closure_reason && (
                  <div
                    style={{
                      fontSize: '0.74rem',
                      color: 'var(--accent-crimson)',
                      background: 'rgba(239, 68, 68, 0.08)',
                      padding: '6px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    ⚠️ {pass.closure_reason}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                    Detachment: {pass.bro_detachment}
                  </span>
                  <button
                    onClick={() => onTogglePass(pass.id, pass.status)}
                    className="tactical-btn"
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      background: isBlocked ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      borderColor: isBlocked ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)',
                      color: isBlocked ? 'var(--accent-emerald)' : 'var(--accent-crimson)',
                    }}
                  >
                    {isBlocked ? 'Mark CLEARED (Open)' : 'Simulate BLIZZARD (Close)'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Forward Posts & Base Depots Directory */}
      <div className="tactical-card" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
            Northern Command XIV Corps — Tactical Locations Directory
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Base depots, transit camps, and high-altitude forward posts with MGRS coordinates and elevation envelopes.
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--border-prominent)',
                  textAlign: 'left',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                }}
              >
                <th style={{ padding: '10px 12px' }}>NODE ID</th>
                <th style={{ padding: '10px 12px' }}>FORMATION / POST NAME</th>
                <th style={{ padding: '10px 12px' }}>SECTOR</th>
                <th style={{ padding: '10px 12px' }}>ELEVATION</th>
                <th style={{ padding: '10px 12px' }}>MGRS GRID</th>
                <th style={{ padding: '10px 12px' }}>TROOP COUNT</th>
                <th style={{ padding: '10px 12px' }}>AIR LIFT</th>
                <th style={{ padding: '10px 12px' }}>WEATHER RISK</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((loc) => (
                <tr
                  key={loc.id}
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
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {loc.id}
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{loc.name}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                    {loc.sector.replace(/_/g, ' ')}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className="elevation-tag">{loc.elevation_m}m</span>
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
                    {loc.mgrs_grid || '—'}
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)' }}>
                    {loc.current_headcount} PAX
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {loc.is_air_accessible ? (
                      <span className="tactical-badge badge-cyan" style={{ fontSize: '0.68rem' }}>
                        HELI / ALG
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>ROAD ONLY</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
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
