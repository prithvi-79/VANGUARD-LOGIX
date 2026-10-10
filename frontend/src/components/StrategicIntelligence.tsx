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
  Filter,
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

  // Run Custom Terrain Simulation
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
          bg: 'rgba(239, 68, 68, 0.2)',
          border: '#ef4444',
          color: '#ef4444',
          label: 'OP-IMMEDIATE',
        };
      case 'HIGH':
        return {
          bg: 'rgba(245, 158, 11, 0.2)',
          border: '#f59e0b',
          color: '#f59e0b',
          label: 'HIGH PRIORITY',
        };
      case 'MEDIUM':
        return {
          bg: 'rgba(59, 130, 246, 0.2)',
          border: '#3b82f6',
          color: '#3b82f6',
          label: 'MEDIUM',
        };
      default:
        return {
          bg: 'rgba(16, 185, 129, 0.2)',
          border: '#10b981',
          color: '#10b981',
          label: 'ROUTINE',
        };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Sub-Navigation Header */}
      <div
        className="tactical-card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          borderLeft: '4px solid var(--accent-cyan)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="live-badge" style={{ background: 'var(--accent-cyan)' }} />
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, letterSpacing: '0.04em' }}>
              TACTICAL DECISION INTELLIGENCE & RISK ENGINES
            </h2>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Pure stateless mathematical engines for multi-attribute replenishment ranking, burn-down trajectories & topographic slope friction ($R_g$)
          </div>
        </div>

        {/* Engine Switcher */}
        <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-card)', padding: '4px', borderRadius: '6px' }}>
          <button
            onClick={() => setActiveSubTab('priority')}
            className="tactical-btn"
            style={{
              background: activeSubTab === 'priority' ? 'var(--accent-cyan)' : 'transparent',
              color: activeSubTab === 'priority' ? '#000000' : 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '0.75rem',
            }}
          >
            <ShieldAlert size={14} /> Priority Scoring (0-100)
          </button>
          <button
            onClick={() => setActiveSubTab('burndown')}
            className="tactical-btn"
            style={{
              background: activeSubTab === 'burndown' ? 'var(--accent-cyan)' : 'transparent',
              color: activeSubTab === 'burndown' ? '#000000' : 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '0.75rem',
            }}
          >
            <TrendingDown size={14} /> 14-Day Burn-Down
          </button>
          <button
            onClick={() => setActiveSubTab('terrain')}
            className="tactical-btn"
            style={{
              background: activeSubTab === 'terrain' ? 'var(--accent-cyan)' : 'transparent',
              color: activeSubTab === 'terrain' ? '#000000' : 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '0.75rem',
            }}
          >
            <Navigation size={14} /> Topographic Slope ($R_g$)
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-VIEW 1: MULTI-ATTRIBUTE PRIORITY SCORING ENGINE */}
      {/* ========================================================================= */}
      {activeSubTab === 'priority' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Summary KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div className="tactical-card" style={{ padding: '16px', borderLeft: '4px solid #ef4444' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>OP-IMMEDIATE REQUISITIONS</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ef4444', fontFamily: 'var(--font-mono)' }}>
                {priorityQueue?.op_immediate_count ?? 0}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Score ≥ 80.0 • Immediate Dispatch</div>
            </div>

            <div className="tactical-card" style={{ padding: '16px', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>HIGH PRIORITY REQUISITIONS</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>
                {priorityQueue?.high_count ?? 0}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Score 65–79 • Within 24 Hours</div>
            </div>

            <div className="tactical-card" style={{ padding: '16px', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>MEDIUM PRIORITY</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3b82f6', fontFamily: 'var(--font-mono)' }}>
                {priorityQueue?.medium_count ?? 0}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Score 45–64 • Next Convoy Window</div>
            </div>

            <div className="tactical-card" style={{ padding: '16px', borderLeft: '4px solid #10b981' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ROUTINE BUFFER ADEQUATE</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                {priorityQueue?.routine_count ?? 0}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Score &lt; 45 • Monitoring Only</div>
            </div>
          </div>

          {/* Filters Bar */}
          <div
            className="tactical-card"
            style={{
              padding: '12px 16px',
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
              flexWrap: 'wrap',
              background: 'var(--bg-surface)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <Filter size={14} /> Filter Tier:
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['ALL', 'OP_IMMEDIATE', 'HIGH', 'MEDIUM', 'ROUTINE'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTierFilter(t)}
                  className="tactical-btn"
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    background: tierFilter === t ? 'var(--accent-cyan)' : 'var(--bg-card)',
                    color: tierFilter === t ? '#000000' : 'var(--text-secondary)',
                    fontWeight: tierFilter === t ? 700 : 500,
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            <div style={{ width: '1px', height: '20px', background: 'var(--border-subtle)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Class:
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['ALL', 'CLASS_I', 'CLASS_II', 'CLASS_III', 'CLASS_IV', 'CLASS_V'].map((c) => (
                <button
                  key={c}
                  onClick={() => setClassFilter(c)}
                  className="tactical-btn"
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    background: classFilter === c ? 'var(--accent-gold)' : 'var(--bg-card)',
                    color: classFilter === c ? '#000000' : 'var(--text-secondary)',
                    fontWeight: classFilter === c ? 700 : 500,
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Ranked Table */}
          <div className="tactical-card" style={{ overflowX: 'auto', padding: '0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 16px' }}>RANK</th>
                  <th style={{ padding: '12px 16px' }}>FORWARD POST</th>
                  <th style={{ padding: '12px 16px' }}>SUPPLY ITEM</th>
                  <th style={{ padding: '12px 16px' }}>CLASS</th>
                  <th style={{ padding: '12px 16px' }}>COMPOSITE SCORE</th>
                  <th style={{ padding: '12px 16px' }}>PRIORITY TIER</th>
                  <th style={{ padding: '12px 16px' }}>7-FACTOR WEIGHT BREAKDOWN</th>
                  <th style={{ padding: '12px 16px' }}>RECOMMENDED DISPATCH</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingPriority ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      Evaluating dynamic multi-attribute priority scores across all forward ledgers...
                    </td>
                  </tr>
                ) : priorityQueue?.items.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No forward stock items matching active tier/class filter criteria.
                    </td>
                  </tr>
                ) : (
                  priorityQueue?.items.map((item, idx) => {
                    const badge = getTierBadge(item.priority_tier);
                    return (
                      <tr
                        key={`${item.location_id}-${item.supply_id}`}
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          transition: 'background 0.15s ease',
                          background: item.priority_tier === 'OP_IMMEDIATE' ? 'rgba(239, 68, 68, 0.04)' : 'transparent',
                        }}
                      >
                        <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                          #{idx + 1}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 700 }}>{item.location_name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {item.location_id}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>{item.supply_name}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              fontFamily: 'var(--font-mono)',
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid var(--border-subtle)',
                            }}
                          >
                            {item.supply_class}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.95rem', minWidth: '40px' }}>
                              {item.composite_score}
                            </div>
                            <div style={{ flex: 1, height: '6px', background: 'var(--bg-card)', borderRadius: '3px', overflow: 'hidden', minWidth: '60px' }}>
                              <div
                                style={{
                                  width: `${item.composite_score}%`,
                                  height: '100%',
                                  background: badge.border,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              fontFamily: 'var(--font-mono)',
                              background: badge.bg,
                              border: `1px solid ${badge.border}`,
                              color: badge.color,
                            }}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: '4px', fontSize: '0.68rem', fontFamily: 'var(--font-mono)' }}>
                            <span title="Urgency DoS (30pts max)" style={{ color: '#ef4444' }}>U:{item.factor_breakdown.urgency_dos}</span>
                            <span style={{ color: 'var(--border-subtle)' }}>•</span>
                            <span title="Deficit (15pts max)" style={{ color: '#f59e0b' }}>D:{item.factor_breakdown.safety_deficit}</span>
                            <span style={{ color: 'var(--border-subtle)' }}>•</span>
                            <span title="Class Criticality (15pts max)" style={{ color: 'var(--accent-cyan)' }}>C:{item.factor_breakdown.supply_criticality}</span>
                            <span style={{ color: 'var(--border-subtle)' }}>•</span>
                            <span title="Lead-Time (10pts max)" style={{ color: 'var(--text-secondary)' }}>L:{item.factor_breakdown.lead_time_pressure}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {item.recommended_mode === 'AIR_BRIDGE' ? (
                              <Plane size={14} className="text-crimson" />
                            ) : (
                              <Truck size={14} className="text-cyan" />
                            )}
                            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{item.recommended_mode}</span>
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px', maxWidth: '240px' }}>
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
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 2: 14-DAY INVENTORY BURN-DOWN SIMULATOR */}
      {/* ========================================================================= */}
      {activeSubTab === 'burndown' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Post and Item Selectors */}
          <div
            className="tactical-card"
            style={{
              padding: '16px',
              display: 'flex',
              gap: '20px',
              alignItems: 'center',
              flexWrap: 'wrap',
              background: 'var(--bg-surface)',
            }}
          >
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                SELECT FORWARD OUTPOST:
              </label>
              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                style={{
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                }}
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.elevation_m}m)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                SELECT STRATEGIC SUPPLY:
              </label>
              <select
                value={selectedSupplyId}
                onChange={(e) => setSelectedSupplyId(e.target.value)}
                style={{
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                }}
              >
                {supplies.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name} [{sup.supply_class}]
                  </option>
                ))}
              </select>
            </div>

            {burnDownData && (
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>ELEVATION BURN MULTIPLIER</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                    {burnDownData.elevation_m >= 4000 ? '1.65x' : burnDownData.elevation_m >= 3500 ? '1.18x' : '1.00x'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>INITIAL LEDGER BALANCE</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                    {burnDownData.initial_stock} {burnDownData.unit}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Visual Trajectory Chart */}
          {isLoadingBurnDown ? (
            <div className="tactical-card" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Projecting 14-day high-altitude forward consumption curve...
            </div>
          ) : burnDownData && (
            <div className="tactical-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
                  14-DAY FORWARD BURN-DOWN CURVE: {burnDownData.location_name} • {burnDownData.supply_name}
                </h3>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '12px', height: '3px', background: 'var(--accent-cyan)' }} /> Projected Stock
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '12px', height: '2px', background: '#ef4444', borderBottom: '1px dashed #ef4444' }} /> Safety Threshold
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '12px', height: '2px', background: '#f59e0b', borderBottom: '1px dashed #f59e0b' }} /> Reorder Point
                  </span>
                </div>
              </div>

              {/* Day-by-Day Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '8px' }}>
                {burnDownData.trajectory.map((pt) => {
                  const isStockout = pt.status === 'STOCKOUT';
                  const isCritical = pt.status === 'CRITICAL';
                  const isWarning = pt.status === 'WARNING';

                  const cardBorder = isStockout
                    ? '#ef4444'
                    : isCritical
                    ? '#f97316'
                    : isWarning
                    ? '#f59e0b'
                    : 'var(--border-subtle)';

                  return (
                    <div
                      key={pt.day}
                      style={{
                        background: 'var(--bg-card)',
                        border: `1px solid ${cardBorder}`,
                        borderRadius: '6px',
                        padding: '10px 8px',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>DAY +{pt.day}</div>
                      <div
                        style={{
                          fontSize: '1rem',
                          fontWeight: 800,
                          fontFamily: 'var(--font-mono)',
                          color: isStockout ? '#ef4444' : isCritical ? '#f97316' : 'var(--accent-cyan)',
                          marginTop: '4px',
                        }}
                      >
                        {pt.projected_stock}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {pt.days_of_supply} DoS
                      </div>
                      <div
                        style={{
                          marginTop: '6px',
                          fontSize: '0.6rem',
                          fontWeight: 800,
                          padding: '2px 4px',
                          borderRadius: '3px',
                          background: isStockout ? 'rgba(239, 68, 68, 0.2)' : isCritical ? 'rgba(249, 115, 22, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                          color: isStockout ? '#ef4444' : isCritical ? '#f97316' : '#10b981',
                        }}
                      >
                        {pt.status}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 3: TOPOGRAPHIC & ROUTE SLOPE PHYSICS ENGINE ($R_g$) */}
      {/* ========================================================================= */}
      {activeSubTab === 'terrain' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Interactive Mountain Grade Simulator Card */}
          <div
            className="tactical-card"
            style={{
              padding: '20px',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(15, 23, 42, 0.9) 100%)',
              border: '1px solid var(--accent-cyan)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                  INTERACTIVE TOPOGRAPHIC PHYSICS SIMULATOR ($R_g = 1.0 + 0.035|\theta| + 0.002|\theta|^2$)
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Computes grade resistance factor, surface friction, environmental degradation and convoy transit delay
                </div>
              </div>

              {simResult && (
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>GRADE RESISTANCE ($R_g$)</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                      {simResult.grade_resistance_factor}x
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>EFFECTIVE TRANSIT TIME</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 800, color: '#ef4444' }}>
                      {simResult.effective_transit_hours} hrs
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Controls */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  MAXIMUM ROAD SLOPE: {simSlope}° ({simSlope > 10 ? 'High Alpine Steep Grade' : 'Moderate Grade'})
                </label>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="0.5"
                  value={simSlope}
                  onChange={(e) => setSimSlope(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  CORRIDOR DISTANCE: {simDistance} km
                </label>
                <input
                  type="range"
                  min="20"
                  max="350"
                  step="5"
                  value={simDistance}
                  onChange={(e) => setSimDistance(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  TERRAIN SURFACE CLASSIFICATION:
                </label>
                <select
                  value={simSurface}
                  onChange={(e) => setSimSurface(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                    padding: '6px 10px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                  }}
                >
                  <option value="HIGHWAY">HIGHWAY (Friction 1.00x)</option>
                  <option value="MOUNTAIN_ROAD">MOUNTAIN ROAD (Friction 1.25x)</option>
                  <option value="UNPAVED_TRACK">UNPAVED TRACK (Friction 1.55x)</option>
                  <option value="GLACIAL_SNOWCAT_TRAIL">GLACIAL SNOWCAT (Friction 1.85x)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  WEATHER DEGRADATION:
                </label>
                <select
                  value={simWeather}
                  onChange={(e) => setSimWeather(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                    padding: '6px 10px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                  }}
                >
                  <option value="NORMAL">NORMAL (Multiplier 1.00x)</option>
                  <option value="RAIN_SLUSH">RAIN / SLUSH (Multiplier 1.20x)</option>
                  <option value="SNOW_ICE">SNOW & BLACK ICE (Multiplier 1.45x)</option>
                  <option value="BLIZZARD">ACTIVE BLIZZARD (Severance 3.50x)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Supply Corridors Physics Table */}
          <div
            className="tactical-card"
            style={{
              padding: '12px 16px',
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              flexWrap: 'wrap',
              background: 'var(--bg-surface)',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Simulate Theater Weather Impact on All Corridors:
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['NORMAL', 'RAIN_SLUSH', 'SNOW_ICE', 'BLIZZARD'].map((w) => (
                <button
                  key={w}
                  onClick={() => setWeatherOverride(w)}
                  className="tactical-btn"
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    background: weatherOverride === w ? 'var(--accent-cyan)' : 'var(--bg-card)',
                    color: weatherOverride === w ? '#000000' : 'var(--text-secondary)',
                    fontWeight: weatherOverride === w ? 700 : 500,
                  }}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <div className="tactical-card" style={{ overflowX: 'auto', padding: '0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 16px' }}>CORRIDOR</th>
                  <th style={{ padding: '12px 16px' }}>DISTANCE</th>
                  <th style={{ padding: '12px 16px' }}>SLOPE (θ)</th>
                  <th style={{ padding: '12px 16px' }}>GRADE FACTOR ($R_g$)</th>
                  <th style={{ padding: '12px 16px' }}>TOTAL FRICTION</th>
                  <th style={{ padding: '12px 16px' }}>BASE TRANSIT</th>
                  <th style={{ padding: '12px 16px' }}>EFFECTIVE TRANSIT</th>
                  <th style={{ padding: '12px 16px' }}>PASSABILITY STATUS</th>
                  <th style={{ padding: '12px 16px' }}>CONTINGENCY FALLBACK</th>
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
                    <tr
                      key={c.route_id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        background: c.status === 'CLOSED' ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700 }}>{c.route_name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {c.route_id}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>{c.distance_km} km</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>{c.max_slope_deg}°</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-gold)' }}>
                        {c.grade_resistance_factor}x
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>
                        {c.composite_terrain_friction}x
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>
                        {c.base_transit_hours} hrs
                      </td>
                      <td
                        style={{
                          padding: '12px 16px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          color: c.status === 'CLOSED' ? '#ef4444' : 'var(--text-primary)',
                        }}
                      >
                        {c.status === 'CLOSED' ? 'IMPASSABLE' : `${c.effective_transit_hours} hrs`}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            fontFamily: 'var(--font-mono)',
                            background:
                              c.status === 'OPEN'
                                ? 'rgba(16, 185, 129, 0.2)'
                                : c.status === 'RESTRICTED'
                                ? 'rgba(245, 158, 11, 0.2)'
                                : 'rgba(239, 68, 68, 0.2)',
                            color:
                              c.status === 'OPEN' ? '#10b981' : c.status === 'RESTRICTED' ? '#f59e0b' : '#ef4444',
                            border: `1px solid ${
                              c.status === 'OPEN' ? '#10b981' : c.status === 'RESTRICTED' ? '#f59e0b' : '#ef4444'
                            }`,
                          }}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {c.contingency_fallback ? (
                          <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>
                            {c.contingency_fallback}
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Standard Convoy Ops</div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
