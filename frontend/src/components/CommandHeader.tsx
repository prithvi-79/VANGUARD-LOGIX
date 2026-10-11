import React from 'react';
import { Shield, Sun, Moon, RefreshCw, Database, MapPin, BookOpen } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import type { DBStatusResponse } from '../types';

interface CommandHeaderProps {
  dbStatus: DBStatusResponse | null;
  onRefresh: () => void;
  isLoading: boolean;
  onOpenDecisionFlow: () => void;
}

export const CommandHeader: React.FC<CommandHeaderProps> = ({
  dbStatus,
  onRefresh,
  isLoading,
  onOpenDecisionFlow,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="tactical-header">
      {/* Primary Administrative Header Ribbon */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Left: Organization Identity & Theater */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '0px',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-prominent)',
              color: 'var(--accent-primary)',
            }}
          >
            <Shield size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 600, letterSpacing: '0', margin: 0, color: 'var(--text-primary)' }}>
                Vanguard Logistics Operations Portal
              </span>
              <span className="tactical-badge badge-info">
                HQ XIV Corps • Northern Command
              </span>
              <span className="tactical-badge badge-normal">
                <span className="status-dot status-dot-normal"></span>
                Operational
              </span>
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '2px',
                letterSpacing: '0.16px',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} /> Staging Depot: Leh Transshipment Base
              </span>
              <span>•</span>
              <span>High-Altitude Forward Replenishment & Decision Support</span>
            </div>
          </div>
        </div>

        {/* Right: Operational Status, Sync & View Modes */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {dbStatus && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '0px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.75rem',
              }}
            >
              <Database size={13} style={{ color: 'var(--text-secondary)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Ledger:</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {dbStatus.inventory_records_count} Records
              </span>
              <span style={{ color: 'var(--text-tertiary)' }}>•</span>
              <span style={{ color: 'var(--text-secondary)' }}>{dbStatus.database_type}</span>
            </div>
          )}

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="tactical-btn"
            title="Refresh Theater Stock & Pass Status"
            style={{ fontSize: '0.78rem' }}
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span>Sync State</span>
          </button>

          <button
            onClick={toggleTheme}
            className="tactical-btn"
            title={theme === 'dark' ? 'Switch to Daylight Ops Mode (Light)' : 'Switch to Command Center Mode (Dark)'}
            aria-label="Toggle Interface Theme"
            style={{ fontSize: '0.78rem' }}
          >
            {theme === 'dark' ? (
              <>
                <Sun size={14} style={{ color: 'var(--accent-amber)' }} />
                <span>Daylight</span>
              </>
            ) : (
              <>
                <Moon size={14} style={{ color: 'var(--accent-primary)' }} />
                <span>Dark</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Secondary Decision Flow Reference Strip */}
      <div
        style={{
          padding: '6px 24px',
          background: 'var(--bg-surface-elevated)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-subtle)',
          fontSize: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', overflowX: 'auto', whiteSpace: 'nowrap' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)', marginRight: '4px' }}>
            Decision Pipeline:
          </span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>1. Sensor & Stock Ingestion</span>
          <span style={{ color: 'var(--text-tertiary)' }}>→</span>
          <span>2. Quantile Forecast (P10 / P50 / P90)</span>
          <span style={{ color: 'var(--text-tertiary)' }}>→</span>
          <span>3. Days-of-Supply Burn-Down</span>
          <span style={{ color: 'var(--text-tertiary)' }}>→</span>
          <span>4. Priority Ranking</span>
          <span style={{ color: 'var(--text-tertiary)' }}>→</span>
          <span>5. Fleet Dispatch (CVRPTW)</span>
          <span style={{ color: 'var(--text-tertiary)' }}>→</span>
          <span>6. Pass & Terrain Feasibility</span>
          <span style={{ color: 'var(--text-tertiary)' }}>→</span>
          <span>7. IAF-Z-2096 Movement Order</span>
        </div>

        <button
          className="tactical-btn"
          style={{ padding: '2px 8px', fontSize: '0.72rem', background: 'transparent' }}
          onClick={onOpenDecisionFlow}
          title="Inspect the 7-stage military logistics decision architecture"
        >
          <BookOpen size={12} />
          <span>Architecture Guide</span>
        </button>
      </div>
    </header>
  );
};
