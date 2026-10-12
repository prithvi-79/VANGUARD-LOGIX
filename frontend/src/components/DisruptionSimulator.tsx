import React, { useState, useEffect } from 'react';
import {
  CloudSnow,
  Users,
  Plane,
  Truck,
  RotateCcw,
  ShieldAlert,
  ArrowDownRight,
  TrendingDown,
} from 'lucide-react';

import { api } from '../services/api';
import type {
  DisruptionScenarioPreset,
  DisruptionSimulationResponse,
  StrategicPass,
} from '../types';

interface DisruptionSimulatorProps {
  passes: StrategicPass[];
  onNavigate?: (tab: any, context?: any) => void;
}

export const DisruptionSimulator: React.FC<DisruptionSimulatorProps> = ({ passes, onNavigate }) => {
  const [scenarios, setScenarios] = useState<DisruptionScenarioPreset[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('BASELINE');
  const [showPhysicsGuide, setShowPhysicsGuide] = useState<boolean>(false);

  // Interactive Sliders & Toggles
  const [tempDelta, setTempDelta] = useState<number>(0.0);
  const [troopSurge, setTroopSurge] = useState<number>(0.0);
  const [fleetAvailability, setFleetAvailability] = useState<number>(100.0);
  const [closedPassIds, setClosedPassIds] = useState<string[]>([]);

  const [simulationResult, setSimulationResult] = useState<DisruptionSimulationResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadScenarios = async () => {
      try {
        const presets = await api.getDisruptionScenarios();
        setScenarios(presets);
        runSimulation('BASELINE', 0.0, 0.0, 100.0, []);
      } catch (err: any) {
        setError(err.message || 'Failed to load disruption scenarios');
        setIsLoading(false);
      }
    };
    loadScenarios();
  }, []);

  const runSimulation = async (
    scId: string,
    temp: number,
    surge: number,
    fleet: number,
    closedPasses: string[]
  ) => {
    setIsLoading(true);
    try {
      const res = await api.simulateDisruption({
        scenario_id: scId,
        temp_delta_c: temp,
        troop_surge_pct: surge,
        fleet_availability_pct: fleet,
        closed_pass_ids: closedPasses,
      });
      setSimulationResult(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Simulation execution failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (preset: DisruptionScenarioPreset) => {
    setSelectedScenarioId(preset.id);
    setTempDelta(preset.default_temp_delta_c);
    setTroopSurge(preset.default_troop_surge_pct);
    setFleetAvailability(preset.default_fleet_availability_pct);
    setClosedPassIds(preset.default_closed_passes);
    runSimulation(
      preset.id,
      preset.default_temp_delta_c,
      preset.default_troop_surge_pct,
      preset.default_fleet_availability_pct,
      preset.default_closed_passes
    );
  };

  const handleTogglePass = (passId: string) => {
    const updated = closedPassIds.includes(passId)
      ? closedPassIds.filter((id) => id !== passId)
      : [...closedPassIds, passId];
    setClosedPassIds(updated);
    runSimulation(selectedScenarioId, tempDelta, troopSurge, fleetAvailability, updated);
  };

  const handleApplySliders = () => {
    runSimulation(selectedScenarioId, tempDelta, troopSurge, fleetAvailability, closedPassIds);
  };

  const handleResetToBaseline = () => {
    const base = scenarios.find((s) => s.id === 'BASELINE');
    if (base) {
      handleSelectPreset(base);
    } else {
      setSelectedScenarioId('BASELINE');
      setTempDelta(0.0);
      setTroopSurge(0.0);
      setFleetAvailability(100.0);
      setClosedPassIds([]);
      runSimulation('BASELINE', 0.0, 0.0, 100.0, []);
    }
  };

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
            <span>Disruption & Contingency Simulator</span>
          </div>

          <h1 style={{ fontSize: '1.45rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            What-If Disruption & Supply Resilience Simulator
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Stress-test forward logistics under extreme winter conditions, pass blockages, troop reinforcement surges, and fleet de-rating with quantified impact metrics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className={`tactical-badge ${isLoading ? 'badge-warning' : 'badge-normal'}`}>
            {isLoading ? 'Recalculating...' : 'Ready'}
          </span>
          <button
            onClick={() => setShowPhysicsGuide(!showPhysicsGuide)}
            className="tactical-btn"
            style={{ fontSize: '0.76rem', padding: '6px 12px' }}
          >
            <ShieldAlert size={14} />
            <span>{showPhysicsGuide ? 'Hide Guide' : 'How Scenarios Work'}</span>
          </button>
          <button
            onClick={handleResetToBaseline}
            className="tactical-btn"
            style={{ fontSize: '0.76rem', padding: '6px 12px' }}
          >
            <RotateCcw size={13} />
            <span>Reset Baseline</span>
          </button>
        </div>
      </div>

      {/* Progressive Disclosure Guide (Collapsible) */}
      {showPhysicsGuide && (
        <div
          className="panel"
          style={{
            padding: '16px 20px',
            background: 'var(--bg-surface-elevated)',
            borderLeft: '4px solid var(--accent-primary)',
          }}
        >
          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
            How What-If Disruption Physics Calculate Forward Post Impact
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                1. Sub-Zero Fuel Burn Surge
              </div>
              For every 5°C drop below -20°C, bukhari space heating and vehicle anti-freeze requirements surge non-linearly (+18% to +45% fuel consumption).
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                2. Mountain Pass Severance
              </div>
              When Zoji La or Khardung La closes, road travel time spikes by 14 to 36 hours or requires emergency multi-modal air-bridges (Mi-17 V5 tactical airlift).
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                3. Surge Troops (PAX)
              </div>
              Troop reinforcement surges directly increase daily pack ration burn (DRDO 4,088 kcal/man/day scale) and drinking water heating requirements.
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="panel" style={{ padding: '14px 16px', borderLeft: '4px solid var(--accent-crimson)' }}>
          <p style={{ color: 'var(--accent-crimson)', fontSize: '0.82rem', margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Scenario Presets */}
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase' }}>
          Contingency Scenario Presets
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
          {scenarios.map((sc) => {
            const isSelected = selectedScenarioId === sc.id;
            const isCritical = sc.severity === 'CRITICAL';
            return (
              <div
                key={sc.id}
                onClick={() => handleSelectPreset(sc)}
                className="panel"
                style={{
                  padding: '14px',
                  cursor: 'pointer',
                  border: isSelected
                    ? `2px solid ${isCritical ? 'var(--accent-crimson)' : 'var(--accent-primary)'}`
                    : '1px solid var(--border-subtle)',
                  background: isSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {sc.code}
                  </span>
                  <span
                    className={`tactical-badge ${
                      sc.severity === 'CRITICAL'
                        ? 'badge-critical'
                        : sc.severity === 'HIGH'
                        ? 'badge-warning'
                        : 'badge-info'
                    }`}
                    style={{ fontSize: '0.65rem' }}
                  >
                    {sc.severity}
                  </span>
                </div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 600, margin: '0 0 4px 0' }}>{sc.name}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0 0 10px 0', minHeight: '38px' }}>
                  {sc.description}
                </p>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px', fontFamily: 'var(--font-mono)' }}>
                  Temp: {sc.default_temp_delta_c}°C • Surge: +{sc.default_troop_surge_pct}% • Fleet: {sc.default_fleet_availability_pct}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Controls & Delta Impact Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
        {/* Left Column: Interactive Sliders & Pass Selector */}
        <div className="panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
            <TrendingDown size={16} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '0.88rem', fontWeight: 600, margin: 0 }}>Stress Test Parameters</h3>
          </div>

          {/* Temperature Drop Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                <CloudSnow size={13} style={{ color: 'var(--accent-primary)' }} /> Temperature Delta:
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: tempDelta < 0 ? 'var(--accent-crimson)' : 'inherit' }}>
                {tempDelta}°C
              </span>
            </div>
            <input
              type="range"
              min="-35"
              max="0"
              step="1"
              value={tempDelta}
              onChange={(e) => setTempDelta(parseFloat(e.target.value))}
              onMouseUp={handleApplySliders}
              onTouchEnd={handleApplySliders}
              style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
              <span>-35°C (Extreme Blizzard)</span>
              <span>0°C (Normal)</span>
            </div>
          </div>

          {/* Troop Headcount Surge Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                <Users size={13} style={{ color: 'var(--accent-amber)' }} /> Troop Reinforcement:
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: troopSurge > 0 ? 'var(--accent-amber)' : 'inherit' }}>
                +{troopSurge}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={troopSurge}
              onChange={(e) => setTroopSurge(parseFloat(e.target.value))}
              onMouseUp={handleApplySliders}
              onTouchEnd={handleApplySliders}
              style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
              <span>0% (Standard)</span>
              <span>+60% (Heavy Surge)</span>
            </div>
          </div>

          {/* Road Fleet Availability Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                <Truck size={13} style={{ color: 'var(--accent-primary)' }} /> Fleet Availability:
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: fleetAvailability < 70 ? 'var(--accent-crimson)' : 'var(--accent-emerald)' }}>
                {fleetAvailability}%
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={fleetAvailability}
              onChange={(e) => setFleetAvailability(parseFloat(e.target.value))}
              onMouseUp={handleApplySliders}
              onTouchEnd={handleApplySliders}
              style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
              <span>20% (Severe Loss)</span>
              <span>100% (Full Ready)</span>
            </div>
          </div>

          {/* Strategic Passes Choke Selector */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>
              Severed Mountain Passes:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {passes.map((p) => {
                const isBlocked = closedPassIds.includes(p.id);
                return (
                  <label
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.75rem',
                      padding: '6px 8px',
                      borderRadius: 'var(--radius-sm)',
                      background: isBlocked ? 'var(--badge-critical-bg)' : 'var(--bg-surface-elevated)',
                      border: isBlocked ? '1px solid var(--badge-critical-border)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isBlocked}
                      onChange={() => handleTogglePass(p.id)}
                      style={{ accentColor: 'var(--accent-crimson)' }}
                    />
                    <span style={{ fontWeight: 500, flex: 1 }}>{p.name} ({p.elevation_m}m)</span>
                    {isBlocked && (
                      <span className="tactical-badge badge-critical" style={{ fontSize: '0.6rem', padding: '1px 5px' }}>
                        Blocked
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Delta Cards & Impact Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 4 Delta Summary Cards */}
          {simulationResult && (
            <div className="grid-kpi-4">
              {/* DoS Drop */}
              <div className="panel" style={{ padding: '14px 16px', borderLeft: '4px solid var(--accent-crimson)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                  DoS Degradation
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-crimson)' }}>
                    -{simulationResult.dos_drop_pct}%
                  </span>
                  <ArrowDownRight size={15} style={{ color: 'var(--accent-crimson)' }} />
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                  {simulationResult.baseline_mean_dos}d &rarr; {simulationResult.disrupted_mean_dos}d
                </div>
              </div>

              {/* Critical Outposts */}
              <div className="panel" style={{ padding: '14px 16px', borderLeft: '4px solid var(--accent-amber)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Critical Outposts (&lt;5d)
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)' }}>
                    {simulationResult.critical_outposts_disrupted}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-crimson)', fontWeight: 600 }}>
                    (+{simulationResult.delta_critical_outposts})
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                  Baseline: {simulationResult.critical_outposts_baseline} outposts
                </div>
              </div>

              {/* Emergency Lift Tonnage */}
              <div className="panel" style={{ padding: '14px 16px', borderLeft: '4px solid var(--accent-primary)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Emergency Tonnage Deficit
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>
                    {roundTons(simulationResult.total_emergency_tonnage_kg)} t
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                  {simulationResult.total_emergency_tonnage_kg.toLocaleString()} kg shortfall
                </div>
              </div>

              {/* Mi-17 Air Sorties */}
              <div className="panel" style={{ padding: '14px 16px', borderLeft: '4px solid var(--accent-amber)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Air Sorties Required
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)' }}>
                    {simulationResult.mi17_sorties_required}
                  </span>
                  <Plane size={15} style={{ color: 'var(--accent-amber)' }} />
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                  Delay: +{simulationResult.projected_transit_delay_hours} hrs
                </div>
              </div>
            </div>
          )}

          {/* Outpost Vulnerability Breakdown Table */}
          {simulationResult && (
            <div className="panel">
              <div className="panel-header">
                <h4 style={{ fontSize: '0.88rem', fontWeight: 600, margin: 0 }}>
                  Outpost Vulnerability & Isolation Breakdown
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {simulationResult.location_deltas.length} Formations Evaluated
                </span>
              </div>

              <div className="enterprise-table-container" style={{ border: 'none', borderRadius: 0 }}>
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Outpost</th>
                      <th>Sector / Elev</th>
                      <th>Troop PAX</th>
                      <th>Mean DoS</th>
                      <th>DoS Delta</th>
                      <th>Emergency Deficit</th>
                      <th>Isolation Status</th>
                      <th>Contingency Mode</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simulationResult.location_deltas.map((loc) => {
                      const isCutOff = loc.isolation_status === 'CUT_OFF_AIR_ONLY';
                      const isCriticalDos = loc.disrupted_mean_dos < 5.0;
                      return (
                        <tr
                          key={loc.location_id}
                          style={{
                            background: isCutOff ? 'rgba(239, 68, 68, 0.04)' : undefined,
                          }}
                        >
                          <td style={{ fontWeight: 600 }}>{loc.location_name}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>
                            {loc.sector.replace(/_/g, ' ')} ({loc.elevation_m}m)
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>
                            {loc.headcount_baseline}
                            {loc.headcount_disrupted > loc.headcount_baseline && (
                              <span style={{ color: 'var(--accent-amber)', fontSize: '0.7rem', marginLeft: '4px' }}>
                                &rarr; {loc.headcount_disrupted}
                              </span>
                            )}
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: isCriticalDos ? 'var(--accent-crimson)' : 'inherit' }}>
                            {loc.disrupted_mean_dos}d
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', color: loc.delta_dos < 0 ? 'var(--accent-crimson)' : 'var(--text-tertiary)' }}>
                            {loc.delta_dos}d
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>
                            {loc.emergency_deficit_kg > 0 ? `${loc.emergency_deficit_kg.toLocaleString()} kg` : '—'}
                          </td>
                          <td>
                            <span
                              className={`tactical-badge ${
                                isCutOff ? 'badge-critical' : loc.isolation_status === 'CHOKED_PASS' ? 'badge-warning' : 'badge-normal'
                              }`}
                            >
                              {loc.isolation_status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: loc.contingency_mode === 'AIR_BRIDGE' ? 'var(--accent-primary)' : 'inherit' }}>
                              {loc.contingency_mode.replace(/_/g, ' ')}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Strategic Response Actions */}
          {simulationResult && (
            <div className="panel">
              <div className="panel-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={16} style={{ color: 'var(--accent-primary)' }} />
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 600, margin: 0 }}>
                    Recommended Operational Response Directives
                  </h4>
                </div>
              </div>

              <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {simulationResult.response_actions.map((act, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-surface-elevated)',
                      borderLeft: `3px solid ${act.priority_level === 'OP_IMMEDIATE' ? 'var(--accent-crimson)' : 'var(--accent-primary)'}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{act.action_title}</span>
                      <span className={`tactical-badge ${act.priority_level === 'OP_IMMEDIATE' ? 'badge-critical' : 'badge-info'}`} style={{ fontSize: '0.65rem' }}>
                        {act.priority_level.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', marginTop: '3px', fontFamily: 'var(--font-mono)' }}>
                      Target: {act.target_formation_or_unit}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                      {act.operational_order}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                      Rationale: {act.justification}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function roundTons(kg: number): string {
  return (kg / 1000.0).toFixed(1);
}
