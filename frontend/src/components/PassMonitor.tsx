import React, { useState } from 'react';
import {
  Mountain,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div className="panel">
        <div className="panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                padding: '8px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                color: 'var(--accent-primary)',
              }}
            >
              <Mountain size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
                  Border Roads Organisation (BRO) — Mountain Pass Transit Status
                </h2>
                <span className="tactical-badge badge-info">Projects Beacon / Himank / Deepak</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Operational clearance and snow accumulation across strategic Himalayan passes connecting Leh, Nubra, Kargil, and Siachen.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="tactical-badge badge-normal">{openPasses.length} Passable</span>
            <span className="tactical-badge badge-critical">{blockedPasses.length} Blocked</span>
          </div>
        </div>
      </div>

      {/* Grid of Pass Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
        {passes.map((pass) => {
          const isUpdating = updatingPassId === pass.id;
          const isBlocked = !pass.is_passable;
          const connectedRoutes = routes.filter((r) => r.choke_pass_id === pass.id);

          return (
            <div
              key={pass.id}
              className="panel"
              style={{
                borderColor: isBlocked ? 'var(--badge-critical-border)' : 'var(--border-subtle)',
              }}
            >
              <div className="panel-header">
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{pass.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{pass.highway}</div>
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

              <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Metrics Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center' }}>
                  <div style={{ padding: '8px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>ELEVATION</div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                      {pass.elevation_m}m
                    </div>
                  </div>
                  <div style={{ padding: '8px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>TEMPERATURE</div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        fontFamily: 'var(--font-mono)',
                        marginTop: '2px',
                        color: pass.temperature_c < -15 ? 'var(--accent-primary)' : 'inherit',
                      }}
                    >
                      {pass.temperature_c}°C
                    </div>
                  </div>
                  <div style={{ padding: '8px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>SNOWPACK</div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        fontFamily: 'var(--font-mono)',
                        marginTop: '2px',
                        color: pass.snow_accumulation_cm > 30 ? 'var(--accent-amber)' : 'inherit',
                      }}
                    >
                      {pass.snow_accumulation_cm}cm
                    </div>
                  </div>
                </div>

                {/* Closure Reason Alert */}
                {pass.closure_reason && (
                  <div
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--badge-critical-bg)',
                      border: '1px solid var(--badge-critical-border)',
                      fontSize: '0.75rem',
                      color: 'var(--accent-crimson)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                    <span>{pass.closure_reason}</span>
                  </div>
                )}

                {/* Reopen Hours Forecast */}
                {pass.predicted_reopen_hours > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <Clock size={13} />
                    <span>Estimated clearance window: ~{pass.predicted_reopen_hours} hours</span>
                  </div>
                )}

                {/* Downstream Routes Affected */}
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Affected Corridors ({connectedRoutes.length}):</span>{' '}
                  {connectedRoutes.length > 0
                    ? connectedRoutes.map((r) => `${r.origin_id} → ${r.destination_id}`).join(', ')
                    : 'Feeder link'}
                </div>

                {/* BRO Detachment & Action Button */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    <HardHat size={13} />
                    <span>{pass.bro_detachment}</span>
                  </div>

                  <button
                    onClick={() => handleToggle(pass.id, pass.status)}
                    disabled={isUpdating}
                    className="tactical-btn"
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      color: isBlocked ? 'var(--accent-emerald)' : 'var(--accent-crimson)',
                      borderColor: isBlocked ? 'var(--badge-normal-border)' : 'var(--badge-critical-border)',
                    }}
                  >
                    {isUpdating ? (
                      <>
                        <RefreshCw size={12} className="animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : isBlocked ? (
                      'Mark Cleared (Open)'
                    ) : (
                      'Simulate Blizzard (Close)'
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
