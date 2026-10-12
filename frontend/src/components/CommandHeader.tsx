import React from 'react';
import {
  Shield,
  Sun,
  Moon,
  RefreshCw,
  Database,
  Search,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import type { DBStatusResponse } from '../types';

interface CommandHeaderProps {
  dbStatus: DBStatusResponse | null;
  onRefresh: () => void;
  isLoading: boolean;
  onOpenDecisionFlow: () => void;
  onOpenSearch: () => void;
  onNavigateHome: () => void;
  criticalCount: number;
  blockedPassCount: number;
}

export const CommandHeader: React.FC<CommandHeaderProps> = ({
  dbStatus,
  onRefresh,
  isLoading,
  onOpenDecisionFlow,
  onOpenSearch,
  onNavigateHome,
  criticalCount,
  blockedPassCount,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className="tactical-header"
      style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Left: Organization Identity & Home Link */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            cursor: 'pointer',
          }}
          onClick={onNavigateHome}
          title="Return to Main Operational Dashboard"
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '0px',
              background: 'var(--accent-primary)',
              color: 'var(--text-inverse)',
              transition: 'opacity 0.15s ease',
            }}
          >
            <Shield size={20} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  color: 'var(--text-primary)',
                }}
              >
                VANGUARD-LOGIX
              </span>
              <span
                className="tactical-badge badge-info"
                style={{ fontSize: '0.68rem', padding: '2px 6px', fontWeight: 600 }}
              >
                HQ XIV Corps • Northern Command
              </span>
            </div>

            <div
              style={{
                fontSize: '0.74rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '1px',
              }}
            >
              <span>Predictive Logistics & Forward Supply Chain Optimization</span>
              <span>•</span>
              <span style={{ color: 'var(--text-tertiary)' }}>Leh Staging Hub</span>
            </div>
          </div>
        </div>

        {/* Center: Global Quick Command Search Bar */}
        <div style={{ flex: '1', maxWidth: '440px', minWidth: '240px' }}>
          <button
            onClick={onOpenSearch}
            className="tactical-btn"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 14px',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '0.78rem',
              cursor: 'pointer',
              textAlign: 'left',
            }}
            title="Search posts, supplies, passes, and tools (Ctrl + K)"
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={14} style={{ color: 'var(--text-tertiary)' }} />
              <span>Search posts, supplies, passes, or features...</span>
            </span>
            <kbd
              style={{
                fontSize: '0.65rem',
                padding: '1px 5px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-prominent)',
                borderRadius: '0px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-secondary)',
              }}
            >
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right: Operational Status, Sync & View Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Operational Pulse Pill */}
          {criticalCount > 0 || blockedPassCount > 0 ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
                background: 'var(--badge-critical-bg)',
                border: '1px solid var(--badge-critical-border)',
                color: 'var(--accent-crimson)',
                fontSize: '0.74rem',
                fontWeight: 600,
              }}
            >
              <AlertTriangle size={13} />
              <span>
                {criticalCount > 0 ? `${criticalCount} Critical Shortages` : ''}
                {criticalCount > 0 && blockedPassCount > 0 ? ' • ' : ''}
                {blockedPassCount > 0 ? `${blockedPassCount} Pass Blocked` : ''}
              </span>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
                background: 'var(--badge-normal-bg)',
                border: '1px solid var(--badge-normal-border)',
                color: 'var(--accent-emerald)',
                fontSize: '0.74rem',
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={13} />
              <span>Theater Posture: Normal</span>
            </div>
          )}

          {/* Database Ledger Status */}
          {dbStatus && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.74rem',
                color: 'var(--text-secondary)',
              }}
              title={`Database: ${dbStatus.database_type} with ${dbStatus.inventory_records_count} inventory records`}
            >
              <Database size={13} style={{ color: 'var(--text-tertiary)' }} />
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {dbStatus.inventory_records_count}
              </span>
              <span>Records</span>
            </div>
          )}

          {/* Architecture / How it Works Guide */}
          <button
            onClick={onOpenDecisionFlow}
            className="tactical-btn"
            style={{ fontSize: '0.76rem', padding: '5px 10px' }}
            title="Inspect the 7-stage military logistics decision architecture"
          >
            <BookOpen size={13} />
            <span>Decision Guide</span>
          </button>

          {/* Sync State Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="tactical-btn"
            title="Refresh Theater Stock & Pass Status from Backend"
            style={{ fontSize: '0.76rem', padding: '5px 10px' }}
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span>Sync State</span>
          </button>

          {/* Daylight / Dark Mode Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="tactical-btn"
            title={theme === 'dark' ? 'Switch to Daylight Ops Mode (Light)' : 'Switch to Command Center Mode (Dark)'}
            aria-label="Toggle Interface Theme"
            style={{ fontSize: '0.76rem', padding: '5px 10px' }}
          >
            {theme === 'dark' ? (
              <>
                <Sun size={13} style={{ color: 'var(--accent-amber)' }} />
                <span>Daylight</span>
              </>
            ) : (
              <>
                <Moon size={13} style={{ color: 'var(--accent-primary)' }} />
                <span>Dark</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
