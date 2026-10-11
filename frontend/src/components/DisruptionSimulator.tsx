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
}

export const DisruptionSimulator: React.FC<DisruptionSimulatorProps> = ({ passes }) => {
  const [scenarios, setScenarios] = useState<DisruptionScenarioPreset[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('BASELINE');

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div
        className="tactical-card"
        style={{
          padding: '20px 24px',
          borderLeft: '4px solid var(--accent-crimson)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--accent-crimson)',
                fontWeight: 700,
                letterSpacing: '0.08em',
              }}
            >
              WARGAME & STRESS-TEST ENGINE — P1-REQ-01
            </span>
            <span className="badge badge-crimson">
              {isLoading ? 'CALCULATING DELTAS...' : 'OPERATIONAL RISK SIMULATOR'}
            </span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px', letterSpacing: '-0.01em' }}>
            What-If Disruption Scenario Simulator
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px', maxWidth: '850px' }}>
            Stress-test XIV Corps forward logistics under extreme Himalayan weather, sudden pass blockages, troop reinforcement surges, and fleet degradation with automated $\Delta$ impact metrics.
          </p>
        </div>

        <button
          onClick={handleResetToBaseline}
          className="tactical-btn"
          style={{ background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RotateCcw size={14} /> Reset Baseline
        </button>
      </div>

      {error && (
        <div className="tactical-card" style={{ padding: '16px', borderColor: 'var(--accent-crimson)' }}>
          <p style={{ color: 'var(--accent-crimson)', fontSize: '0.85rem' }}>{error}</p>
        </div>
      )}

      {/* 5 Scenario Presets */}
      <div>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>
          Select Military Disruption Preset
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          {scenarios.map((sc) => {
            const isSelected = selectedScenarioId === sc.id;
            const isCritical = sc.severity === 'CRITICAL';
            return (
              <div
                key={sc.id}
                onClick={() => handleSelectPreset(sc)}
                className="tactical-card"
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  border: isSelected
                    ? `2px solid ${isCritical ? 'var(--accent-crimson)' : 'var(--accent-cyan)'}`
                    : '1px solid var(--border-subtle)',
                  background: isSelected
                    ? isCritical ? 'rgba(239, 68, 68, 0.08)' : 'rgba(6, 182, 212, 0.08)'
                    : 'var(--bg-surface)',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: isCritical ? 'var(--accent-crimson)' : 'var(--accent-cyan)', fontWeight: 700 }}>
                    {sc.code}
                  </span>
                  <span
                    className={`badge ${
                      sc.severity === 'CRITICAL' ? 'badge-crimson' : sc.severity === 'HIGH' ? 'badge-amber' : 'badge-cyan'
                    }`}
                    style={{ fontSize: '0.65rem' }}
                  >
                    {sc.severity}
                  </span>
                </div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px' }}>{sc.name}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, height: '42px', overflow: 'hidden' }}>
                  {sc.description}
                </p>
                <div style={{ marginTop: '12px', fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                  Temp: {sc.default_temp_delta_c}°C | Surge: +{sc.default_troop_surge_pct}% | Fleet: {sc.default_fleet_availability_pct}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Controls & Delta Impact Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px' }}>
        {/* Left Column: Interactive Sliders & Pass Choke Selector */}
        <div className="tactical-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            <TrendingDown size={18} className="text-cyan" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Interactive Stress Sliders</h3>
          </div>

          {/* Temperature Drop Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                <CloudSnow size={14} className="text-cyan" /> Ambient Temp Delta:
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: tempDelta < 0 ? 'var(--accent-crimson)' : 'var(--text-primary)' }}>
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
              style={{ width: '100%', accentColor: 'var(--accent-crimson)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              <span>-35°C (Extreme Blizzard)</span>
              <span>0°C (Normal)</span>
            </div>
          </div>

          {/* Troop Headcount Surge Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                <Users size={14} className="text-amber" /> Forward PAX Surge:
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: troopSurge > 0 ? 'var(--accent-amber)' : 'var(--text-primary)' }}>
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
              style={{ width: '100%', accentColor: 'var(--accent-amber)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              <span>0% (Standard)</span>
              <span>+60% (Heavy Surge)</span>
            </div>
          </div>

          {/* Road Fleet Availability Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                <Truck size={14} className="text-cyan" /> Fleet Availability:
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: fleetAvailability < 70 ? 'var(--accent-crimson)' : 'var(--accent-emerald)' }}>
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
              style={{ width: '100%', accentColor: 'var(--accent-emerald)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              <span>20% (Grounding)</span>
              <span>100% (Full Ready)</span>
            </div>
          </div>

          {/* Strategic Passes Choke Selector */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)' }}>
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
                      borderRadius: '4px',
                      background: isBlocked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                      border: isBlocked ? '1px solid var(--accent-crimson)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isBlocked}
                      onChange={() => handleTogglePass(p.id)}
                      style={{ accentColor: 'var(--accent-crimson)' }}
                    />
                    <span style={{ fontWeight: 600, flex: 1 }}>{p.name} ({p.elevation_m}m)</span>
                    {isBlocked && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--accent-crimson)', fontWeight: 700 }}>
                        SEVERED
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Delta Cards & Impact Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 4 Delta Summary Cards */}
          {simulationResult && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              {/* DoS Drop */}
              <div className="tactical-card" style={{ padding: '16px', borderLeft: '4px solid var(--accent-crimson)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Mean DoS Degradation
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-crimson)' }}>
                    -{simulationResult.dos_drop_pct}%
                  </span>
                  <ArrowDownRight size={16} className="text-crimson" />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {simulationResult.baseline_mean_dos}d &rarr; {simulationResult.disrupted_mean_dos}d
                </div>
              </div>

              {/* Critical Outposts */}
              <div className="tactical-card" style={{ padding: '16px', borderLeft: '4px solid var(--accent-amber)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Critical Outposts (&lt;5d DoS)
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)' }}>
                    {simulationResult.critical_outposts_disrupted}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-crimson)', fontWeight: 700 }}>
                    (+{simulationResult.delta_critical_outposts})
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Baseline: {simulationResult.critical_outposts_baseline} outposts
                </div>
              </div>

              {/* Emergency Lift Tonnage */}
              <div className="tactical-card" style={{ padding: '16px', borderLeft: '4px solid var(--accent-cyan)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Emergency Tonnage Deficit
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                    {roundTons(simulationResult.total_emergency_tonnage_kg)} t
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {simulationResult.total_emergency_tonnage_kg.toLocaleString()} kg shortfall
                </div>
              </div>

              {/* Mi-17 Air Sorties */}
              <div className="tactical-card" style={{ padding: '16px', borderLeft: '4px solid var(--accent-gold)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                  IAF Mi-17 V5 Sorties
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)' }}>
                    {simulationResult.mi17_sorties_required}
                  </span>
                  <Plane size={16} className="text-gold" />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Delay: +{simulationResult.projected_transit_delay_hours} hrs
                </div>
              </div>
            </div>
          )}

          {/* Outpost Vulnerability Breakdown Table */}
          {simulationResult && (
            <div className="tactical-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>
                  Outpost Vulnerability & Isolation Analysis
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {simulationResult.location_deltas.length} Formations Evaluated
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textAlign: 'left' }}>
                      <th style={{ padding: '8px' }}>Outpost / Node</th>
                      <th style={{ padding: '8px' }}>Sector / Elev</th>
                      <th style={{ padding: '8px' }}>Troop PAX</th>
                      <th style={{ padding: '8px' }}>Mean DoS</th>
                      <th style={{ padding: '8px' }}>&Delta; DoS</th>
                      <th style={{ padding: '8px' }}>Emergency Tonnage</th>
                      <th style={{ padding: '8px' }}>Isolation Status</th>
                      <th style={{ padding: '8px' }}>Contingency Mode</th>
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
                            borderBottom: '1px solid var(--border-subtle)',
                            background: isCutOff ? 'rgba(239, 68, 68, 0.04)' : 'transparent',
                          }}
                        >
                          <td style={{ padding: '8px', fontWeight: 600 }}>{loc.location_name}</td>
                          <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>
                            {loc.sector} ({loc.elevation_m}m)
                          </td>
                          <td style={{ padding: '8px', fontFamily: 'var(--font-mono)' }}>
                            {loc.headcount_baseline}
                            {loc.headcount_disrupted > loc.headcount_baseline && (
                              <span style={{ color: 'var(--accent-amber)', fontSize: '0.7rem' }}>
                                &rarr; {loc.headcount_disrupted}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '8px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: isCriticalDos ? 'var(--accent-crimson)' : 'inherit' }}>
                            {loc.disrupted_mean_dos}d
                          </td>
                          <td style={{ padding: '8px', fontFamily: 'var(--font-mono)', color: loc.delta_dos < 0 ? 'var(--accent-crimson)' : 'var(--text-muted)' }}>
                            {loc.delta_dos}d
                          </td>
                          <td style={{ padding: '8px', fontFamily: 'var(--font-mono)' }}>
                            {loc.emergency_deficit_kg > 0 ? `${loc.emergency_deficit_kg.toLocaleString()} kg` : '—'}
                          </td>
                          <td style={{ padding: '8px' }}>
                            <span
                              className={`badge ${
                                isCutOff ? 'badge-crimson' : loc.isolation_status === 'CHOKED_PASS' ? 'badge-amber' : 'badge-emerald'
                              }`}
                              style={{ fontSize: '0.65rem' }}
                            >
                              {loc.isolation_status}
                            </span>
                          </td>
                          <td style={{ padding: '8px' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: loc.contingency_mode === 'AIR_BRIDGE' ? 'var(--accent-gold)' : 'inherit' }}>
                              {loc.contingency_mode}
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

          {/* Strategic Tactical Directives */}
          {simulationResult && (
            <div className="tactical-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <ShieldAlert size={18} className="text-crimson" />
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>
                  Recommended Strategic Response Actions
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {simulationResult.response_actions.map((act, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderLeft: `3px solid ${act.priority_level === 'OP_IMMEDIATE' ? 'var(--accent-crimson)' : 'var(--accent-cyan)'}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{act.action_title}</span>
                      <span className={`badge ${act.priority_level === 'OP_IMMEDIATE' ? 'badge-crimson' : 'badge-cyan'}`} style={{ fontSize: '0.65rem' }}>
                        {act.priority_level}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                      Target: {act.target_formation_or_unit}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                      {act.operational_order}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                      Justification: {act.justification}
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
