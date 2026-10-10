import React, { useState } from 'react';
import {
  Mountain,
  Snowflake,
  Thermometer,
  Clock,
  AlertTriangle,
  RefreshCw,
  HardHat,
} from 'lucide-react';
import type { StrategicPass, Route } from '../types';

interface PassMonitorProps {
  passes: StrategicPass[];
  routes: Route[];
  onTogglePass: (passId: string, currentStatus: string) => Promise<void>;
}

export const PassMonitor: React.FC<PassMonitorProps> = ({
  passes,
  routes,
  onTogglePass,
}) => {
  const [updatingPassId, setUpdatingPassId] = useState<string | null>(null);

  const handleToggle = async (passId: string, status: string) => {
    setUpdatingPassId(passId);
    try {
      await onTogglePass(passId, status);
    } finally {
      setUpdatingPassId(null);
    }
  };

  const openPasses = passes.filter((p) => p.is_passable);
  const blockedPasses = passes.filter((p) => !p.is_passable);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div
        className="tactical-card"
        style={{
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              padding: '10px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(2, 132, 199, 0.3))',
              color: 'var(--accent-cyan)',
            }}
          >
            <Mountain size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                Border Roads Organisation (BRO) — Strategic Mountain Pass Monitor
              </h2>
              <span className="tactical-badge badge-cyan">PROJECT BEACON / HIMANK / DEEPAK</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Real-time monitoring of Himalayan mountain choke points along Northern Command supply axes (NH-1D, Manali-Leh, Nubra, DBO).
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
            }}
          >
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>
              {openPasses.length} PASSABLE
            </span>
            <span style={{ margin: '0 8px', color: 'var(--text-tertiary)' }}>•</span>
            <span style={{ color: 'var(--accent-crimson)', fontWeight: 700 }}>
              {blockedPasses.length} SEVERED
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Pass Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>
        {passes.map((pass) => {
          const isBlocked = !pass.is_passable;
          const isUpdating = updatingPassId === pass.id;
          const affectedRoutes = routes.filter((r) => r.choke_pass_id === pass.id);

          return (
            <div
              key={pass.id}
              className="tactical-card"
              style={{
                padding: '20px',
                borderLeft: `4px solid ${
                  pass.status === 'OPEN'
                    ? '#10b981'
                    : pass.status === 'RESTRICTED_CONVOY'
                    ? '#f59e0b'
                    : '#ef4444'
                }`,
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                      {pass.name}
                    </h3>
                    <span className="elevation-tag">{pass.elevation_m}m MSL</span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {pass.highway}
                  </div>
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

              {/* Environmental Telemetry */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  padding: '10px',
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                }}
              >
                <div>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.65rem' }}>TEMP</div>
                  <div
                    style={{
                      fontWeight: 700,
                      marginTop: '2px',
                      color: pass.temperature_c < -20 ? 'var(--accent-cyan)' : 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Thermometer size={12} /> {pass.temperature_c}°C
                  </div>
                </div>

                <div>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.65rem' }}>SNOW ACCUM</div>
                  <div
                    style={{
                      fontWeight: 700,
                      marginTop: '2px',
                      color: pass.snow_accumulation_cm > 30 ? 'var(--accent-crimson)' : 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Snowflake size={12} /> {pass.snow_accumulation_cm} cm
                  </div>
                </div>

                <div>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.65rem' }}>REOPEN EST</div>
                  <div style={{ fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    {pass.predicted_reopen_hours > 0 ? `${pass.predicted_reopen_hours}h` : 'Immediate'}
                  </div>
                </div>
              </div>

              {/* Closure Alert Reason if blocked */}
              {pass.closure_reason && (
                <div
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    fontSize: '0.74rem',
                    color: 'var(--accent-crimson)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '6px',
                  }}
                >
                  <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>{pass.closure_reason}</div>
                </div>
              )}

              {/* Dependent Routes */}
              {affectedRoutes.length > 0 && (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                  <span style={{ fontWeight: 600 }}>Governs Corridors: </span>
                  {affectedRoutes.map((r) => r.name.split('(')[0].trim()).join(', ')}
                </div>
              )}

              {/* Detachment & Action */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 'auto',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <HardHat size={12} /> {pass.bro_detachment}
                </div>

                <button
                  onClick={() => handleToggle(pass.id, pass.status)}
                  disabled={isUpdating}
                  className="tactical-btn"
                  style={{
                    padding: '5px 12px',
                    fontSize: '0.74rem',
                    background: isBlocked ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    borderColor: isBlocked ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)',
                    color: isBlocked ? 'var(--accent-emerald)' : 'var(--accent-crimson)',
                  }}
                >
                  {isUpdating ? (
                    <RefreshCw size={12} className="animate-spin" />
                  ) : isBlocked ? (
                    'Mark CLEARED (Open)'
                  ) : (
                    'Simulate BLIZZARD (Sever)'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
