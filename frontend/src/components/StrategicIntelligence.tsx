import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type {
  PriorityQueueResponse,
  RoutePhysicsOutput,
  BurnDownResponse,
  Location,
  SupplyItem,
} from '../types';
import {
  ShieldAlert,
  TrendingDown,
  Navigation,
  Plane,
  Truck,
} from 'lucide-react';

interface StrategicIntelligenceProps {
  locations: Location[];
  supplies: SupplyItem[];
}

export const StrategicIntelligence: React.FC<StrategicIntelligenceProps> = ({
  locations,
  supplies,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'priority' | 'burndown' | 'terrain'>('priority');

  // Priority Queue State
  const [priorityQueue, setPriorityQueue] = useState<PriorityQueueResponse | null>(null);
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [isLoadingPriority, setIsLoadingPriority] = useState<boolean>(true);

  // Burn-Down Trajectory State
  const [selectedLocationId, setSelectedLocationId] = useState<string>('LOC-KUMAR');
  const [selectedSupplyId, setSelectedSupplyId] = useState<string>('SUP-POL-DIESEL-ARCTIC');
  const [burnDownData, setBurnDownData] = useState<BurnDownResponse | null>(null);
  const [isLoadingBurnDown, setIsLoadingBurnDown] = useState<boolean>(false);

  // Terrain Physics State
  const [routeCorridors, setRouteCorridors] = useState<RoutePhysicsOutput[]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState<boolean>(true);
  const [weatherOverride, setWeatherOverride] = useState<string>('NORMAL');

  // Ad-hoc Simulator State
  const [simDistance, setSimDistance] = useState<number>(85);
  const [simSlope, setSimSlope] = useState<number>(12);
  const [simSurface, setSimSurface] = useState<string>('MOUNTAIN_ROAD');
  const [simWeather, setSimWeather] = useState<string>('SNOW_ICE');
  const [simResult, setSimResult] = useState<RoutePhysicsOutput | null>(null);

  // Load Priority Queue
  const loadPriorityQueue = async () => {
    setIsLoadingPriority(true);
    try {
      const params: any = {};
      if (tierFilter !== 'ALL') params.tier = tierFilter;
      if (classFilter !== 'ALL') params.supply_class = classFilter;
      const res = await api.getPriorityQueue(params);
      setPriorityQueue(res);
    } catch (err) {
      console.error('Failed to load priority queue:', err);
    } finally {
      setIsLoadingPriority(false);
    }
  };

  useEffect(() => {
    loadPriorityQueue();
  }, [tierFilter, classFilter]);

  // Load Burn-Down Data
  const loadBurnDownTrajectory = async () => {
    if (!selectedLocationId || !selectedSupplyId) return;
    setIsLoadingBurnDown(true);
    try {
      const res = await api.getBurnDownTrajectory(selectedLocationId, selectedSupplyId, 14);
      setBurnDownData(res);
    } catch (err) {
      console.error('Failed to load burn-down trajectory:', err);
    } finally {
      setIsLoadingBurnDown(false);
    }
  };

  useEffect(() => {
    loadBurnDownTrajectory();
  }, [selectedLocationId, selectedSupplyId]);

  // Load Terrain Physics
  const loadTerrainPhysics = async () => {
    setIsLoadingRoutes(true);
    try {
      const res = await api.getRoutePhysics({ weather_condition: weatherOverride });
      setRouteCorridors(res.corridors);
    } catch (err) {
      console.error('Failed to load route physics:', err);
    } finally {
      setIsLoadingRoutes(false);
    }
  };

  useEffect(() => {
    loadTerrainPhysics();
  }, [weatherOverride]);

  const runTerrainSimulation = async () => {
    try {
      const res = await api.simulateTerrainPhysics({
        distance_km: simDistance,
        max_slope_deg: simSlope,
        surface_type: simSurface,
        base_transit_hours: Math.round((simDistance / 25) * 10) / 10,
        pass_status: 'OPEN',
        weather_condition: simWeather,
      });
      setSimResult(res);
    } catch (err) {
      console.error('Simulation failed:', err);
    }
  };

  useEffect(() => {
    runTerrainSimulation();
  }, [simDistance, simSlope, simSurface, simWeather]);

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'OP_IMMEDIATE':
        return {
          badgeClass: 'badge-critical',
          label: 'Immediate Dispatch',
        };
      case 'HIGH':
        return {
          badgeClass: 'badge-warning',
          label: 'High Priority',
        };
      case 'MEDIUM':
        return {
          badgeClass: 'badge-info',
          label: 'Medium Priority',
        };
      default:
        return {
          badgeClass: 'badge-normal',
          label: 'Routine Buffer',
        };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Sub-Navigation Header */}
      <div className="panel">
        <div
          className="panel-header"
          style={{
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>
                Replenishment Priority & Route Dynamics
              </h2>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Multi-attribute dispatch ranking, forward 14-day burn-down projections, and topographic slope resistance models.
            </div>
          </div>

          {/* Engine Switcher */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setActiveSubTab('priority')}
              className="tactical-btn"
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                background: activeSubTab === 'priority' ? 'var(--accent-primary)' : 'transparent',
                color: activeSubTab === 'priority' ? 'var(--text-inverse)' : 'var(--text-secondary)',
                borderColor: activeSubTab === 'priority' ? 'var(--accent-primary)' : 'var(--border-subtle)',
              }}
            >
              <ShieldAlert size={13} /> Priority Queue (0–100)
            </button>
            <button
              onClick={() => setActiveSubTab('burndown')}
              className="tactical-btn"
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                background: activeSubTab === 'burndown' ? 'var(--accent-primary)' : 'transparent',
                color: activeSubTab === 'burndown' ? 'var(--text-inverse)' : 'var(--text-secondary)',
                borderColor: activeSubTab === 'burndown' ? 'var(--accent-primary)' : 'var(--border-subtle)',
              }}
            >
              <TrendingDown size={13} /> 14-Day Burn-Down
            </button>
            <button
              onClick={() => setActiveSubTab('terrain')}
              className="tactical-btn"
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                background: activeSubTab === 'terrain' ? 'var(--accent-primary)' : 'transparent',
                color: activeSubTab === 'terrain' ? 'var(--text-inverse)' : 'var(--text-secondary)',
                borderColor: activeSubTab === 'terrain' ? 'var(--accent-primary)' : 'var(--border-subtle)',
              }}
            >
              <Navigation size={13} /> Route Topography
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-VIEW 1: MULTI-ATTRIBUTE PRIORITY SCORING ENGINE */}
      {/* ========================================================================= */}
      {activeSubTab === 'priority' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Summary KPIs */}
          <div className="grid-kpi-4">
            <div className="panel" style={{ padding: '14px 16px', borderLeft: '4px solid var(--accent-crimson)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                Immediate Requisitions
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-crimson)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                {priorityQueue?.op_immediate_count ?? 0}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Score ≥ 80.0 • Immediate dispatch</div>
            </div>

            <div className="panel" style={{ padding: '14px 16px', borderLeft: '4px solid var(--accent-amber)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                High Priority
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                {priorityQueue?.high_count ?? 0}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Score 65–79 • Within 24 hours</div>
            </div>

            <div className="panel" style={{ padding: '14px 16px', borderLeft: '4px solid var(--accent-primary)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                Medium Priority
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                {priorityQueue?.medium_count ?? 0}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Score 45–64 • Next convoy window</div>
            </div>

            <div className="panel" style={{ padding: '14px 16px', borderLeft: '4px solid var(--accent-emerald)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                Routine Buffer
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                {priorityQueue?.routine_count ?? 0}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Score &lt; 45 • Monitoring only</div>
            </div>
          </div>

          {/* Filters Bar & Ranked Table */}
          <div className="panel">
            <div
              className="panel-header"
              style={{
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Priority Tier:</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {['ALL', 'OP_IMMEDIATE', 'HIGH', 'MEDIUM', 'ROUTINE'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTierFilter(t)}
                      className="tactical-btn"
                      style={{
                        padding: '3px 8px',
                        fontSize: '0.72rem',
                        background: tierFilter === t ? 'var(--accent-primary)' : 'transparent',
                        color: tierFilter === t ? 'var(--text-inverse)' : 'var(--text-secondary)',
                        borderColor: tierFilter === t ? 'var(--accent-primary)' : 'var(--border-subtle)',
                      }}
                    >
                      {t.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Supply Class:</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {['ALL', 'CLASS_I', 'CLASS_II', 'CLASS_III', 'CLASS_IV', 'CLASS_V'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setClassFilter(c)}
                      className="tactical-btn"
                      style={{
                        padding: '3px 8px',
                        fontSize: '0.72rem',
                        background: classFilter === c ? 'var(--accent-primary)' : 'transparent',
                        color: classFilter === c ? 'var(--text-inverse)' : 'var(--text-secondary)',
                        borderColor: classFilter === c ? 'var(--accent-primary)' : 'var(--border-subtle)',
                      }}
                    >
                      {c.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Ranked Table */}
            <div className="enterprise-table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="enterprise-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Forward Outpost</th>
                    <th>Supply Item</th>
                    <th>Class</th>
                    <th>Composite Score</th>
                    <th>Priority Level</th>
                    <th>Factor Weights</th>
                    <th>Dispatch Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingPriority ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Evaluating priority scores across forward ledgers...
                      </td>
                    </tr>
                  ) : priorityQueue?.items.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No items matching active filter criteria.
                      </td>
                    </tr>
                  ) : (
                    priorityQueue?.items.map((item, idx) => {
                      const badge = getTierBadge(item.priority_tier);
                      return (
                        <tr key={`${item.location_id}-${item.supply_id}`}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                            #{idx + 1}
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{item.location_name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                              {item.location_id}
                            </div>
                          </td>
                          <td style={{ fontWeight: 500 }}>{item.supply_name}</td>
                          <td>
                            <span className="elevation-tag">{item.supply_class.replace('_', ' ')}</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem', width: '38px' }}>
                                {item.composite_score}
                              </span>
                              <div style={{ flex: 1, height: '5px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-full)', minWidth: '50px', overflow: 'hidden' }}>
                                <div
                                  style={{
                                    width: `${item.composite_score}%`,
                                    height: '100%',
                                    background:
                                      item.priority_tier === 'OP_IMMEDIATE'
                                        ? 'var(--accent-crimson)'
                                        : item.priority_tier === 'HIGH'
                                        ? 'var(--accent-amber)'
                                        : 'var(--accent-primary)',
                                    borderRadius: 'var(--radius-full)',
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`tactical-badge ${badge.badgeClass}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
                              <span title="Urgency (Days of Supply)">U:{item.factor_breakdown.urgency_dos}</span>
                              <span style={{ color: 'var(--text-tertiary)' }}>•</span>
                              <span title="Deficit Volume">D:{item.factor_breakdown.safety_deficit}</span>
                              <span style={{ color: 'var(--text-tertiary)' }}>•</span>
                              <span title="Class Criticality">C:{item.factor_breakdown.supply_criticality}</span>
                              <span style={{ color: 'var(--text-tertiary)' }}>•</span>
                              <span title="Lead Time">L:{item.factor_breakdown.lead_time_pressure}</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {item.recommended_mode === 'AIR_BRIDGE' ? (
                                <Plane size={13} style={{ color: 'var(--accent-crimson)' }} />
                              ) : (
                                <Truck size={13} style={{ color: 'var(--accent-primary)' }} />
                              )}
                              <span style={{ fontSize: '0.74rem', fontWeight: 600 }}>{item.recommended_mode.replace('_', ' ')}</span>
                            </div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '2px', maxWidth: '240px' }}>
                              {item.recommended_action}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 2: 14-DAY INVENTORY BURN-DOWN SIMULATOR */}
      {/* ========================================================================= */}
      {activeSubTab === 'burndown' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Post and Item Selectors */}
          <div className="panel">
            <div
              className="panel-header"
              style={{
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Outpost:</span>
                  <select
                    value={selectedLocationId}
                    onChange={(e) => setSelectedLocationId(e.target.value)}
                    className="form-select"
                    style={{ width: 'auto', padding: '4px 8px', fontSize: '0.75rem' }}
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.elevation_m}m)
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Supply Item:</span>
                  <select
                    value={selectedSupplyId}
                    onChange={(e) => setSelectedSupplyId(e.target.value)}
                    className="form-select"
                    style={{ width: 'auto', padding: '4px 8px', fontSize: '0.75rem' }}
                  >
                    {supplies.map((sup) => (
                      <option key={sup.id} value={sup.id}>
                        {sup.name} [{sup.supply_class.replace('_', ' ')}]
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {burnDownData && (
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Elevation Factor</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-amber)' }}>
                      {burnDownData.elevation_m >= 4000 ? '1.65x' : burnDownData.elevation_m >= 3500 ? '1.18x' : '1.00x'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Initial Stock</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      {burnDownData.initial_stock.toLocaleString()} {burnDownData.unit}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Visual Trajectory Grid */}
            <div className="panel-body">
              {isLoadingBurnDown ? (
                <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Projecting 14-day forward consumption curve...
                </div>
              ) : burnDownData ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>
                      14-Day Forward Consumption Projection: {burnDownData.location_name} • {burnDownData.supply_name}
                    </h3>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      <span>Initial Stock: {burnDownData.initial_stock.toLocaleString()} {burnDownData.unit}</span>
                      {burnDownData.trajectory[0] && (
                        <span>Safety Threshold: {burnDownData.trajectory[0].safety_threshold.toLocaleString()} {burnDownData.unit}</span>
                      )}
                    </div>
                  </div>

                  {/* Day-by-Day Cards Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '8px' }}>
                    {burnDownData.trajectory.map((pt) => {
                      const isStockout = pt.status === 'STOCKOUT';
                      const isCritical = pt.status === 'CRITICAL';
                      const isWarning = pt.status === 'WARNING';

                      const statusColor = isStockout
                        ? 'var(--accent-crimson)'
                        : isCritical
                        ? 'var(--accent-amber)'
                        : isWarning
                        ? 'var(--accent-amber)'
                        : 'var(--accent-emerald)';

                      return (
                        <div
                          key={pt.day}
                          style={{
                            background: 'var(--bg-surface-elevated)',
                            border: `1px solid ${isStockout || isCritical ? statusColor : 'var(--border-subtle)'}`,
                            borderRadius: 'var(--radius-sm)',
                            padding: '10px 8px',
                            textAlign: 'center',
                          }}
                        >
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                            Day +{pt.day}
                          </div>
                          <div
                            style={{
                              fontSize: '0.95rem',
                              fontWeight: 700,
                              fontFamily: 'var(--font-mono)',
                              color: statusColor,
                              marginTop: '3px',
                            }}
                          >
                            {pt.projected_stock.toLocaleString()}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {pt.days_of_supply}d DoS
                          </div>
                          <div style={{ marginTop: '4px' }}>
                            <span
                              className={`tactical-badge ${
                                isStockout || isCritical
                                  ? 'badge-critical'
                                  : isWarning
                                  ? 'badge-warning'
                                  : 'badge-normal'
                              }`}
                              style={{ fontSize: '0.62rem', padding: '1px 5px' }}
                            >
                              {pt.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 3: TOPOGRAPHIC & ROUTE SLOPE PHYSICS ENGINE */}
      {/* ========================================================================= */}
      {activeSubTab === 'terrain' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Interactive Mountain Grade Simulator Card */}
          <div className="panel">
            <div className="panel-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>
                  Topographic Route Grade & Friction Simulator
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Calculates grade resistance factors, road friction, surface conditions, and convoy travel time.
                </div>
              </div>

              {simResult && (
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Grade Resistance Factor</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-amber)' }}>
                      {simResult.grade_resistance_factor}x
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Effective Transit Time</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-crimson)' }}>
                      {simResult.effective_transit_hours} hrs
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Controls */}
            <div className="panel-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                    Maximum Road Slope: {simSlope}° ({simSlope > 10 ? 'Steep Alpine Grade' : 'Moderate Grade'})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    step="0.5"
                    value={simSlope}
                    onChange={(e) => setSimSlope(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                    Corridor Distance: {simDistance} km
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="350"
                    step="5"
                    value={simDistance}
                    onChange={(e) => setSimDistance(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                    Terrain Surface:
                  </label>
                  <select
                    value={simSurface}
                    onChange={(e) => setSimSurface(e.target.value)}
                    className="form-select"
                    style={{ width: '100%', padding: '4px 8px', fontSize: '0.75rem' }}
                  >
                    <option value="HIGHWAY">Highway (Friction 1.00x)</option>
                    <option value="MOUNTAIN_ROAD">Mountain Road (Friction 1.25x)</option>
                    <option value="UNPAVED_TRACK">Unpaved Track (Friction 1.55x)</option>
                    <option value="GLACIAL_SNOWCAT_TRAIL">Glacial Snowcat Trail (Friction 1.85x)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                    Weather Condition:
                  </label>
                  <select
                    value={simWeather}
                    onChange={(e) => setSimWeather(e.target.value)}
                    className="form-select"
                    style={{ width: '100%', padding: '4px 8px', fontSize: '0.75rem' }}
                  >
                    <option value="NORMAL">Normal Clear (Multiplier 1.00x)</option>
                    <option value="RAIN_SLUSH">Rain / Slush (Multiplier 1.20x)</option>
                    <option value="SNOW_ICE">Snow & Black Ice (Multiplier 1.45x)</option>
                    <option value="BLIZZARD">Active Blizzard (Multiplier 3.50x)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Active Supply Corridors Physics Table */}
          <div className="panel">
            <div
              className="panel-header"
              style={{
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Simulate Weather Condition Across Corridors:
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {['NORMAL', 'RAIN_SLUSH', 'SNOW_ICE', 'BLIZZARD'].map((w) => (
                  <button
                    key={w}
                    onClick={() => setWeatherOverride(w)}
                    className="tactical-btn"
                    style={{
                      padding: '3px 8px',
                      fontSize: '0.72rem',
                      background: weatherOverride === w ? 'var(--accent-primary)' : 'transparent',
                      color: weatherOverride === w ? 'var(--text-inverse)' : 'var(--text-secondary)',
                      borderColor: weatherOverride === w ? 'var(--accent-primary)' : 'var(--border-subtle)',
                    }}
                  >
                    {w.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="enterprise-table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="enterprise-table">
                <thead>
                  <tr>
                    <th>Corridor</th>
                    <th>Distance</th>
                    <th>Slope Angle</th>
                    <th>Grade Factor</th>
                    <th>Total Friction</th>
                    <th>Base Transit</th>
                    <th>Effective Transit</th>
                    <th>Status</th>
                    <th>Contingency Fallback</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingRoutes ? (
                    <tr>
                      <td colSpan={9} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Evaluating corridor terrain physics...
                      </td>
                    </tr>
                  ) : (
                    routeCorridors.map((c) => (
                      <tr key={c.route_id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{c.route_name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                            {c.route_id}
                          </div>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{c.distance_km} km</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{c.max_slope_deg}°</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-amber)' }}>
                          {c.grade_resistance_factor}x
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>
                          {c.composite_terrain_friction}x
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>
                          {c.base_transit_hours} hrs
                        </td>
                        <td
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            color: c.status === 'CLOSED' ? 'var(--accent-crimson)' : 'inherit',
                          }}
                        >
                          {c.status === 'CLOSED' ? 'Blocked' : `${c.effective_transit_hours} hrs`}
                        </td>
                        <td>
                          <span
                            className={`tactical-badge ${
                              c.status === 'OPEN'
                                ? 'badge-normal'
                                : c.status === 'RESTRICTED'
                                ? 'badge-warning'
                                : 'badge-critical'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td>
                          {c.contingency_fallback ? (
                            <div style={{ fontSize: '0.74rem', color: 'var(--accent-crimson)', fontWeight: 500 }}>
                              {c.contingency_fallback}
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Standard Road Convoy</div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
