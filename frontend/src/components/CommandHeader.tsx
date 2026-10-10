import { Shield, Sun, Moon, RefreshCw, Radio, MapPin, Database } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import type { DBStatusResponse } from '../types';

interface CommandHeaderProps {
  dbStatus: DBStatusResponse | null;
  onRefresh: () => void;
  isLoading: boolean;
}

export const CommandHeader: React.FC<CommandHeaderProps> = ({ dbStatus, onRefresh, isLoading }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="tactical-header">
      {/* Top Banner Ribbon */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 24px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              boxShadow: '0 0 15px rgba(2, 132, 199, 0.4)',
            }}
          >
            <Shield size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.04em', margin: 0 }}>
                VANGUARD-LOGIX
              </h1>
              <span className="tactical-badge badge-cyan">SIH PS 26251</span>
              <span className="tactical-badge badge-normal">
                <span className="pulse-indicator" style={{ background: 'var(--accent-emerald)' }}></span>
                ONLINE
              </span>
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                gap: '12px',
                marginTop: '2px',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} /> HQ 14 Corps, Northern Command (Leh)
              </span>
              <span>•</span>
              <span>High Altitude Forward Supply Chain & Predictive Logistics</span>
            </div>
          </div>
        </div>

        {/* Action Controls & Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {dbStatus && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '6px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <Database size={13} className="text-cyan" />
              <span>{dbStatus.database_type}</span>
              <span style={{ color: 'var(--text-tertiary)' }}>|</span>
              <span style={{ color: 'var(--accent-emerald)' }}>{dbStatus.inventory_records_count} Stock Ledgers</span>
            </div>
          )}

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="tactical-btn"
            title="Refresh Theater State"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span style={{ fontSize: '0.8rem' }}>Sync</span>
          </button>

          <button
            onClick={toggleTheme}
            className="tactical-btn"
            title={theme === 'dark' ? 'Switch to High-Contrast Light Mode' : 'Switch to Dark Command Center'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun size={15} style={{ color: '#f59e0b' }} />
                <span style={{ fontSize: '0.8rem' }}>Daylight</span>
              </>
            ) : (
              <>
                <Moon size={15} style={{ color: '#06b6d4' }} />
                <span style={{ fontSize: '0.8rem' }}>Night Ops</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Decision Flow Strip */}
      <div style={{ padding: '8px 24px', background: 'var(--bg-surface-elevated)' }}>
        <div className="decision-strip">
          <span style={{ color: 'var(--text-secondary)', fontWeight: 700, marginRight: '4px' }}>
            OPERATIONAL PIPELINE:
          </span>
          <span className="step-node active">
            <Radio size={12} /> 1. DATA (SEED 26251)
          </span>
          <span className="step-arrow">→</span>
          <span className="step-node">2. FORECAST (P10/P50/P90)</span>
          <span className="step-arrow">→</span>
          <span className="step-node">3. RISK & DOS COUNTDOWN</span>
          <span className="step-arrow">→</span>
          <span className="step-node">4. PRIORITY SCORING</span>
          <span className="step-arrow">→</span>
          <span className="step-node">5. ALLOCATION</span>
          <span className="step-arrow">→</span>
          <span className="step-node">6. ROUTE & PASS FEASIBILITY</span>
          <span className="step-arrow">→</span>
          <span className="step-node">7. TACTICAL DISPATCH</span>
        </div>
      </div>
    </header>
  );
};
