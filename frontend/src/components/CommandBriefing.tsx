import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Truck,
  Mountain,
  FileCheck2,
  CheckCircle2,
  Thermometer,
  Snowflake,
  ArrowRight,
  TrendingUp,
  Compass,
  Sliders,
  Zap,
} from 'lucide-react';
import type { Location, StrategicPass, Vehicle, InventoryRecord, IndentVoucher } from '../types';
import type { TabView } from '../App';

interface CommandBriefingProps {
  locations: Location[];
  passes: StrategicPass[];
  vehicles: Vehicle[];
  inventory: InventoryRecord[];
  indents: IndentVoucher[];
  onTogglePass: (passId: string, currentStatus: string) => void;
  onNavigate: (tab: TabView, context?: any) => void;
}

export const CommandBriefing: React.FC<CommandBriefingProps> = ({
  locations,
  passes,
  vehicles,
  inventory,
  indents,
  onTogglePass,
  onNavigate,
}) => {
  const criticalItems = useMemo(() => inventory.filter((item) => item.status === 'CRITICAL'), [inventory]);
  const warningItems = useMemo(() => inventory.filter((item) => item.status === 'WARNING'), [inventory]);
  const openPasses = useMemo(() => passes.filter((p) => p.is_passable), [passes]);
  const blockedPasses = useMemo(() => passes.filter((p) => !p.is_passable), [passes]);
  const availableVehicles = useMemo(() => vehicles.filter((v) => v.operational_status === 'AVAILABLE'), [vehicles]);
  const pendingIndents = useMemo(() => indents.filter((i) => i.status === 'PENDING_APPROVAL'), [indents]);

  const [locationSearch, setLocationSearch] = useState('');

  const filteredLocations = useMemo(() => {
    if (!locationSearch.trim()) return locations;
    const q = locationSearch.toLowerCase();
    return locations.filter(
      (loc) =>
        loc.name.toLowerCase().includes(q) ||
        loc.id.toLowerCase().includes(q) ||
        loc.sector.toLowerCase().includes(q)
    );
  }, [locations, locationSearch]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Executive Mission & Operational Theater Banner */}
      <div
        className="panel"
        style={{
          padding: '24px',
          background: 'var(--bg-surface)',
          borderLeft: '4px solid var(--accent-primary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ maxWidth: '900px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="tactical-badge badge-info" style={{ fontSize: '0.72rem' }}>
              Operational Theater Overview
            </span>
            <span className="tactical-badge badge-normal" style={{ fontSize: '0.72rem' }}>
              Winter Cycle 2026 Baseline
            </span>
          </div>

          <h1
            style={{
              fontSize: '1.45rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              margin: '8px 0 6px',
              color: 'var(--text-primary)',
            }}
          >
            Northern Command High-Altitude Forward Supply Logistics
          </h1>

          <p
            style={{
              fontSize: '0.86rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.55,
              margin: 0,
            }}
          >
            VANGUARD-LOGIX provides automated decision support for high-altitude forward posts across the
            Ladakh, Siachen, Dras, and Sub-Sector North theaters. The platform continuously monitors
            sub-zero fuel and ration burn rates, mountain pass choke points, and vehicle engine de-rating
            to eliminate forward stockouts.
          </p>
        </div>

        {/* Quick Launch Action Button */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigate('optimization')}
            className="tactical-btn"
            style={{
              background: 'var(--accent-primary)',
              color: 'var(--text-inverse)',
              borderColor: 'var(--accent-primary)',
              fontWeight: 600,
              padding: '8px 16px',
              fontSize: '0.84rem',
            }}
          >
            <TrendingUp size={15} />
            <span>Open Demand Forecaster</span>
          </button>
          <button
            onClick={() => onNavigate('disruption')}
            className="tactical-btn"
            style={{
              background: 'var(--bg-surface-elevated)',
              padding: '8px 16px',
              fontSize: '0.84rem',
            }}
          >
            <Sliders size={15} />
            <span>Simulate Disruptions</span>
          </button>
        </div>
      </div>

      {/* 2. Four Primary Executive KPI Tiles (Interactive) */}
      <div className="grid-kpi-4">
        {/* KPI 1: Inventory Health */}
        <div
          className="panel"
          onClick={() => onNavigate('inventory')}
          style={{
            padding: '18px 20px',
            cursor: 'pointer',
            borderLeft: criticalItems.length > 0 ? '4px solid var(--accent-crimson)' : '4px solid var(--accent-emerald)',
            transition: 'transform 0.1s ease, border-color 0.1s ease',
          }}
          title="Click to view detailed inventory registers"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Forward Stock Health
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 700, marginTop: '4px', letterSpacing: '-0.02em' }}>
                <span style={{ color: criticalItems.length > 0 ? 'var(--accent-crimson)' : 'var(--accent-emerald)' }}>
                  {criticalItems.length}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                  {' '}
                  Critical / {inventory.length} Ledgers
                </span>
              </div>
            </div>
            <div
              style={{
                padding: '8px',
                borderRadius: '0px',
                background: criticalItems.length > 0 ? 'var(--badge-critical-bg)' : 'var(--badge-normal-bg)',
                color: criticalItems.length > 0 ? 'var(--accent-crimson)' : 'var(--accent-emerald)',
              }}
            >
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span className="tactical-badge badge-critical">{criticalItems.length} &lt; 5d Burn</span>
              <span className="tactical-badge badge-warning">{warningItems.length} &lt; 12d Warning</span>
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View Ledgers <ArrowRight size={12} />
            </span>
          </div>
        </div>

        {/* KPI 2: Mountain Pass Corridors */}
        <div
          className="panel"
          onClick={() => onNavigate('passes')}
          style={{
            padding: '18px 20px',
            cursor: 'pointer',
            borderLeft: blockedPasses.length > 0 ? '4px solid var(--accent-crimson)' : '4px solid var(--accent-emerald)',
            transition: 'transform 0.1s ease, border-color 0.1s ease',
          }}
          title="Click to view mountain pass monitor"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Mountain Pass Transit
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 700, marginTop: '4px', letterSpacing: '-0.02em' }}>
                <span style={{ color: 'var(--accent-emerald)' }}>{openPasses.length}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                  {' '}
                  Open / {passes.length} Passes
                </span>
              </div>
            </div>
            <div
              style={{
                padding: '8px',
                borderRadius: '0px',
                background: blockedPasses.length > 0 ? 'var(--badge-critical-bg)' : 'var(--badge-normal-bg)',
                color: blockedPasses.length > 0 ? 'var(--accent-crimson)' : 'var(--accent-emerald)',
              }}
            >
              <Mountain size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span className="tactical-badge badge-normal">{openPasses.length} Clear</span>
              {blockedPasses.length > 0 && (
                <span className="tactical-badge badge-critical">{blockedPasses.length} Blocked</span>
              )}
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Monitor Passes <ArrowRight size={12} />
            </span>
          </div>
        </div>

        {/* KPI 3: Fleet Readiness & High Altitude */}
        <div
          className="panel"
          onClick={() => onNavigate('fleet')}
          style={{
            padding: '18px 20px',
            cursor: 'pointer',
            borderLeft: '4px solid var(--accent-primary)',
            transition: 'transform 0.1s ease, border-color 0.1s ease',
          }}
          title="Click to view fleet readiness & altitude calculations"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Transport Fleet Readiness
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 700, marginTop: '4px', letterSpacing: '-0.02em' }}>
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
                borderRadius: '0px',
                background: 'var(--badge-info-bg)',
                color: 'var(--accent-primary)',
              }}
            >
              <Truck size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Altitude De-Rating Active
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Inspect Fleet <ArrowRight size={12} />
            </span>
          </div>
        </div>

        {/* KPI 4: Requisitions & Movement Orders */}
        <div
          className="panel"
          onClick={() => onNavigate('indents')}
          style={{
            padding: '18px 20px',
            cursor: 'pointer',
            borderLeft: pendingIndents.length > 0 ? '4px solid var(--accent-amber)' : '4px solid var(--accent-emerald)',
            transition: 'transform 0.1s ease, border-color 0.1s ease',
          }}
          title="Click to view requisition vouchers and movement orders"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                IAF-Z-2096 Requisitions
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 700, marginTop: '4px', letterSpacing: '-0.02em' }}>
                <span style={{ color: 'var(--accent-amber)' }}>{indents.length}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                  {' '}
                  Signed Vouchers
                </span>
              </div>
            </div>
            <div
              style={{
                padding: '8px',
                borderRadius: '0px',
                background: 'var(--badge-warning-bg)',
                color: 'var(--accent-amber)',
              }}
            >
              <FileCheck2 size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--accent-emerald)' }}>
              <CheckCircle2 size={12} />
              <span>{pendingIndents.length} Awaiting Verification</span>
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View Orders <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </div>

      {/* 3. Operational Triage: Issues & Recommended Actions */}
      <div className="panel" style={{ border: '1px solid var(--border-prominent)' }}>
        <div
          className="panel-header"
          style={{
            background: 'var(--bg-surface-elevated)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.94rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={16} style={{ color: 'var(--accent-amber)' }} />
              <span>Immediate Operational Actions & Threat Triage</span>
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Actionable operational bottlenecks detected across forward outposts and arterial transit corridors.
            </div>
          </div>
          <span className="tactical-badge badge-warning">Priority Action Queue</span>
        </div>

        <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px' }}>
          {/* Issue 1: Forward Fuel Burn Outpost */}
          <div
            style={{
              padding: '14px 16px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--badge-critical-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', maxWidth: '850px' }}>
              <div
                style={{
                  padding: '8px',
                  background: 'var(--badge-critical-bg)',
                  color: 'var(--accent-crimson)',
                  marginTop: '2px',
                }}
              >
                <AlertTriangle size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-crimson)' }}>
                    Critical Stockout Threat: Siachen Base Camp & Kumar Post
                  </span>
                  <span className="tactical-badge badge-critical" style={{ fontSize: '0.65rem' }}>
                    2.8 Days of Supply
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Class III Arctic Diesel is burning at 1,850 L/day for space heaters (bukharis) and gensets under
                  -35°C conditions. Safety buffer is depleted below the mandatory 5-day emergency threshold.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => onNavigate('optimization')}
                className="tactical-btn"
                style={{
                  background: 'var(--accent-primary)',
                  color: 'var(--text-inverse)',
                  borderColor: 'var(--accent-primary)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                }}
              >
                <Truck size={13} />
                <span>Plan Convoy Dispatch</span>
              </button>
              <button
                onClick={() => onNavigate('inventory')}
                className="tactical-btn"
                style={{ fontSize: '0.78rem' }}
              >
                Inspect Ledger
              </button>
            </div>
          </div>

          {/* Issue 2: Mountain Pass Closure */}
          {blockedPasses.length > 0 && (
            <div
              style={{
                padding: '14px 16px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--badge-warning-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', maxWidth: '850px' }}>
                <div
                  style={{
                    padding: '8px',
                    background: 'var(--badge-warning-bg)',
                    color: 'var(--accent-amber)',
                    marginTop: '2px',
                  }}
                >
                  <Mountain size={18} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      Arterial Choke Point Severed: {blockedPasses[0].name} ({blockedPasses[0].highway})
                    </span>
                    <span className="tactical-badge badge-critical" style={{ fontSize: '0.65rem' }}>
                      {blockedPasses[0].status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {blockedPasses[0].closure_reason ||
                      'Heavy snow accumulation exceeding 80cm has severed ground transit along NH-1D.'}{' '}
                    Requires multi-modal rerouting via Manali-Leh corridor or tactical airlift.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => onNavigate('disruption')}
                  className="tactical-btn"
                  style={{
                    background: 'var(--accent-primary)',
                    color: 'var(--text-inverse)',
                    borderColor: 'var(--accent-primary)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                  }}
                >
                  <Sliders size={13} />
                  <span>Simulate Contingency Reroute</span>
                </button>
                <button
                  onClick={() => onNavigate('passes')}
                  className="tactical-btn"
                  style={{ fontSize: '0.78rem' }}
                >
                  Pass Details
                </button>
              </div>
            </div>
          )}

          {/* Issue 3: Pending Requisition Authorization */}
          <div
            style={{
              padding: '14px 16px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', maxWidth: '850px' }}>
              <div
                style={{
                  padding: '8px',
                  background: 'var(--badge-info-bg)',
                  color: 'var(--accent-primary)',
                  marginTop: '2px',
                }}
              >
                <FileCheck2 size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    IAF-Z-2096 Movement Requisitions Awaiting Verification
                  </span>
                  <span className="tactical-badge badge-info" style={{ fontSize: '0.65rem' }}>
                    {pendingIndents.length} Pending Approval
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Forward Quartermaster units have submitted cryptographically signed requisition indents.
                  Authorizing releases automated dispatch movement orders and vehicle loading manifests.
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('indents')}
              className="tactical-btn"
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
              }}
            >
              <FileCheck2 size={13} />
              <span>Review & Authorize Indents</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. First-Time Operator Launchpad ("Where to Begin") */}
      <div>
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Platform Quick Launchpad
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
            Jump directly into the primary operational workflows:
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {/* Card 1: Map */}
          <div
            className="panel"
            onClick={() => onNavigate('map')}
            style={{
              padding: '16px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)' }}>
                <Compass size={18} />
                <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>1. Corridor & Terrain Map</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.45 }}>
                Inspect live 3D elevation contours, road supply arteries, forward posts, and pass choke points across Northern Command.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
              <span>Open Tactical Map</span>
              <ArrowRight size={13} />
            </div>
          </div>

          {/* Card 2: Forecaster */}
          <div
            className="panel"
            onClick={() => onNavigate('optimization')}
            style={{
              padding: '16px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)' }}>
                <TrendingUp size={18} />
                <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>2. Demand Forecasting</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.45 }}>
                Generate multi-horizon demand curves (7, 14, 30 days) with weather-aware P10/P50/P90 quantile surge buffers under -40°C.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
              <span>Run Quantile Forecaster</span>
              <ArrowRight size={13} />
            </div>
          </div>

          {/* Card 3: Dispatch & Fleet */}
          <div
            className="panel"
            onClick={() => onNavigate('fleet')}
            style={{
              padding: '16px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)' }}>
                <Truck size={18} />
                <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>3. Route & Fleet Dispatch</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.45 }}>
                Solve vehicle load allocation (CVRPTW) with high-altitude engine de-rating and daylight convoy transit windows.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
              <span>Configure Fleet Dispatch</span>
              <ArrowRight size={13} />
            </div>
          </div>

          {/* Card 4: Disruption Simulator */}
          <div
            className="panel"
            onClick={() => onNavigate('disruption')}
            style={{
              padding: '16px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)' }}>
                <Sliders size={18} />
                <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>4. Disruption Simulator</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.45 }}>
                Stress-test network resilience against severe blizzards (-45°C), pass blockages, troop surges (+50%), and fleet groundings.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
              <span>Launch What-If Simulator</span>
              <ArrowRight size={13} />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Live Mountain Pass Status Strip */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mountain size={16} style={{ color: 'var(--accent-primary)' }} />
              Border Roads Organisation (BRO) — Mountain Pass Transit Conditions
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Real-time transit conditions along Northern Command supply axes (NH-1D, Manali-Leh, Nubra, DBO).
            </div>
          </div>
          <button
            onClick={() => onNavigate('passes')}
            className="tactical-btn"
            style={{ fontSize: '0.74rem' }}
          >
            Detailed Pass Monitor <ArrowRight size={12} />
          </button>
        </div>

        <div className="panel-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {passes.map((pass) => {
              const isBlocked = !pass.is_passable;
              return (
                <div
                  key={pass.id}
                  style={{
                    padding: '14px',
                    borderRadius: '0px',
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
                        borderRadius: '0px',
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

      {/* 6. Forward Posts & Base Depots Directory */}
      <div className="panel">
        <div className="panel-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>
              Northern Command XIV Corps — Tactical Outposts Directory
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Base logistics depots, transit camps, and forward outposts with elevation envelopes and weather risk classifications.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="text"
              placeholder="Filter outposts by name or sector..."
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              className="tactical-btn"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.78rem',
                minWidth: '240px',
                textAlign: 'left',
                cursor: 'text',
              }}
            />
            <span className="elevation-tag">{filteredLocations.length} Operating Nodes</span>
          </div>
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
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLocations.map((loc) => (
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
                  <td>
                    <button
                      onClick={() => onNavigate('inventory')}
                      className="tactical-btn"
                      style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                    >
                      Check Stock
                    </button>
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
