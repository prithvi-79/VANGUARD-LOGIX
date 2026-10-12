import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type {
  Location,
  SupplyItem,
  QuantileForecastResponse,
  OptimizationResponse,
  DecisionExplanationReport,
} from '../types';
import {
  Truck,
  HelpCircle,
  TrendingUp,
  Plane,
  Clock,
} from 'lucide-react';

interface PredictiveOptimizationProps {
  locations: Location[];
  supplies: SupplyItem[];
  onNavigate?: (tab: any, context?: any) => void;
  initialSubTab?: 'forecast' | 'optimizer' | 'explain';
}

export const PredictiveOptimization: React.FC<PredictiveOptimizationProps> = ({
  locations,
  supplies,
  onNavigate,
  initialSubTab = 'forecast',
}) => {
  const [activeTab, setActiveTab] = useState<'forecast' | 'optimizer' | 'explain'>(initialSubTab);
  const [showHelpGuide, setShowHelpGuide] = useState<boolean>(false);

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Forecaster State
  const [selectedLocId, setSelectedLocId] = useState<string>('LOC-KUMAR');
  const [selectedSupplyId, setSelectedSupplyId] = useState<string>('SUP-POL-DIESEL-ARCTIC');
  const [horizonDays, setHorizonDays] = useState<number>(14);
  const [forecastData, setForecastData] = useState<QuantileForecastResponse | null>(null);
  const [isLoadingForecast, setIsLoadingForecast] = useState<boolean>(false);

  // Optimizer State
  const [selectedDepotId, setSelectedDepotId] = useState<string>('LOC-LEH');
  const [optimizationData, setOptimizationData] = useState<OptimizationResponse | null>(null);
  const [isLoadingOptimizer, setIsLoadingOptimizer] = useState<boolean>(false);

  // Explainability State
  const [selectedExplainLocId, setSelectedExplainLocId] = useState<string>('LOC-KUMAR');
  const [explainData, setExplainData] = useState<DecisionExplanationReport | null>(null);
  const [isLoadingExplain, setIsLoadingExplain] = useState<boolean>(false);

  // Load Forecast
  const loadForecast = async () => {
    if (!selectedLocId || !selectedSupplyId) return;
    setIsLoadingForecast(true);
    try {
      const res = await api.getQuantileForecast(selectedLocId, selectedSupplyId, horizonDays);
      setForecastData(res);
    } catch (err) {
      console.error('Failed to load forecast:', err);
    } finally {
      setIsLoadingForecast(false);
    }
  };

  useEffect(() => {
    loadForecast();
  }, [selectedLocId, selectedSupplyId, horizonDays]);

  // Load Optimizer
  const loadOptimizer = async () => {
    setIsLoadingOptimizer(true);
    try {
      const res = await api.getFleetOptimization(selectedDepotId);
      setOptimizationData(res);
    } catch (err) {
      console.error('Failed to load fleet optimization:', err);
    } finally {
      setIsLoadingOptimizer(false);
    }
  };

  useEffect(() => {
    loadOptimizer();
  }, [selectedDepotId]);

  // Load Explainability Report
  const loadExplainability = async () => {
    if (!selectedExplainLocId) return;
    setIsLoadingExplain(true);
    try {
      const res = await api.getDecisionExplanation(selectedExplainLocId, 'CLASS_III');
      setExplainData(res);
    } catch (err) {
      console.error('Failed to load explainability report:', err);
    } finally {
      setIsLoadingExplain(false);
    }
  };

  useEffect(() => {
    loadExplainability();
  }, [selectedExplainLocId]);

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
            <span>Demand Forecasting & Route Optimization</span>
          </div>

          <h1 style={{ fontSize: '1.45rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Demand Forecasting & Multimodal Convoy Routing
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Probabilistic consumption forecasting (P10/P50/P90 quantile curves), high-altitude vehicle load solver, and explainability audit traces.
          </p>
        </div>

        <button
          onClick={() => setShowHelpGuide(!showHelpGuide)}
          className="tactical-btn"
          style={{ fontSize: '0.76rem', padding: '6px 12px' }}
        >
          <HelpCircle size={14} />
          <span>{showHelpGuide ? 'Hide Methodology Guide' : 'How Calculations Work'}</span>
        </button>
      </div>

      {/* Progressive Disclosure Guide (Collapsible) */}
      {showHelpGuide && (
        <div
          className="panel"
          style={{
            padding: '16px 20px',
            background: 'var(--bg-surface-elevated)',
            borderLeft: '4px solid var(--accent-primary)',
          }}
        >
          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
            Understanding the Quantile & Multimodal Solver Engines
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                1. Quantile Forecasts (P10 / P50 / P90)
              </div>
              Instead of a single point forecast, the model outputs 3 curves: P10 is lean baseline burn, P50 is expected demand, and P90 provides the surge buffer for extreme blizzard/freeze conditions.
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                2. High-Altitude Payload De-Rating
              </div>
              Above 3,000m MSL, lower atmospheric pressure de-rates vehicle engine torque and helicopter lift capacity by 15% to 30%, preventing dangerous overloadings in mountain passes.
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                3. Daylight Transit Windows
              </div>
              Mountain convoys are constrained between 0600 and 1700 hrs to avoid freezing black ice and zero-visibility blizzards.
            </div>
          </div>
        </div>
      )}

      {/* Sub-Mode Navigation Ribbon */}
      <div className="panel" style={{ padding: '4px 6px' }}>
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' }}>
          <button
            onClick={() => setActiveTab('forecast')}
            className="tactical-btn"
            style={{
              flex: 1,
              justifyContent: 'center',
              fontSize: '0.82rem',
              padding: '10px 14px',
              background: activeTab === 'forecast' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'forecast' ? 'var(--text-inverse)' : 'var(--text-primary)',
              borderColor: activeTab === 'forecast' ? 'var(--accent-primary)' : 'transparent',
              fontWeight: activeTab === 'forecast' ? 600 : 400,
            }}
          >
            <TrendingUp size={15} />
            <span>1. Demand Forecasting (7d / 14d / 30d Quantiles)</span>
          </button>

          <button
            onClick={() => setActiveTab('optimizer')}
            className="tactical-btn"
            style={{
              flex: 1,
              justifyContent: 'center',
              fontSize: '0.82rem',
              padding: '10px 14px',
              background: activeTab === 'optimizer' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'optimizer' ? 'var(--text-inverse)' : 'var(--text-primary)',
              borderColor: activeTab === 'optimizer' ? 'var(--accent-primary)' : 'transparent',
              fontWeight: activeTab === 'optimizer' ? 600 : 400,
            }}
          >
            <Truck size={15} />
            <span>2. Fleet Load & Convoy Solver (CVRPTW)</span>
          </button>

          <button
            onClick={() => setActiveTab('explain')}
            className="tactical-btn"
            style={{
              flex: 1,
              justifyContent: 'center',
              fontSize: '0.82rem',
              padding: '10px 14px',
              background: activeTab === 'explain' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'explain' ? 'var(--text-inverse)' : 'var(--text-primary)',
              borderColor: activeTab === 'explain' ? 'var(--accent-primary)' : 'transparent',
              fontWeight: activeTab === 'explain' ? 600 : 400,
            }}
          >
            <HelpCircle size={15} />
            <span>3. Decision Explanation & Audit Rationale</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: QUANTILE DEMAND FORECASTER (P10 / P50 / P90) */}
      {/* ========================================================================= */}
      {activeTab === 'forecast' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Controls Bar */}
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
                    value={selectedLocId}
                    onChange={(e) => setSelectedLocId(e.target.value)}
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

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Horizon:</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[7, 14, 21, 28].map((d) => (
                      <button
                        key={d}
                        onClick={() => setHorizonDays(d)}
                        className="tactical-btn"
                        style={{
                          padding: '3px 8px',
                          fontSize: '0.72rem',
                          background: horizonDays === d ? 'var(--accent-primary)' : 'transparent',
                          color: horizonDays === d ? 'var(--text-inverse)' : 'var(--text-secondary)',
                          borderColor: horizonDays === d ? 'var(--accent-primary)' : 'var(--border-subtle)',
                        }}
                      >
                        +{d}d
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {isLoadingForecast ? (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Calculating quantile estimates...</div>
              ) : forecastData && (
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Walk-Forward WAPE</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      {forecastData.evaluation.wape}%
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Confidence Score</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-amber)' }}>
                      {forecastData.confidence_score}%
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Model Validation & Evaluation Cards */}
            {forecastData && (
              <div className="panel-body">
                <div className="grid-kpi-4" style={{ marginBottom: '16px' }}>
                  <div className="panel" style={{ padding: '12px 14px', borderLeft: '4px solid var(--accent-primary)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Forecast Error (WAPE)</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                      {forecastData.evaluation.wape}%
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                      vs {forecastData.evaluation.baseline_wape}% baseline (+{forecastData.evaluation.wape_improvement_pct}% gain)
                    </div>
                  </div>

                  <div className="panel" style={{ padding: '12px 14px', borderLeft: '4px solid var(--accent-amber)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Median Projected (P50)</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                      {forecastData.total_projected_p50.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Expected baseline burn over +{horizonDays} days</div>
                  </div>

                  <div className="panel" style={{ padding: '12px 14px', borderLeft: '4px solid var(--accent-crimson)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Surge Contingency (P90)</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-crimson)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                      {forecastData.total_projected_p90.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                      +{roundNumber(forecastData.total_projected_p90 - forecastData.total_projected_p50, 1).toLocaleString()} surge buffer
                    </div>
                  </div>

                  <div className="panel" style={{ padding: '12px 14px', borderLeft: '4px solid var(--accent-emerald)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Conservative Low (P10)</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                      {roundNumber(forecastData.total_projected_p50 * 0.85, 1).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Minimum required allocation</div>
                  </div>
                </div>

                {/* Day-by-Day Forecast Fan Grid */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600 }}>
                      Daily Quantile Projections: {forecastData.location_name} • {forecastData.supply_name}
                    </h3>
                    <div style={{ display: 'flex', gap: '14px', fontSize: '0.72rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '10px', height: '3px', background: 'var(--accent-crimson)' }} /> P90 Surge
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '10px', height: '3px', background: 'var(--accent-amber)' }} /> P50 Median
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '10px', height: '3px', background: 'var(--accent-emerald)' }} /> P10 Low
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(85px, 1fr))', gap: '6px' }}>
                    {forecastData.forecast_points.map((pt) => (
                      <div
                        key={pt.day}
                        style={{
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '8px 6px',
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Day +{pt.day}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--accent-crimson)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                          P90: {pt.p90}
                        </div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
                          {pt.p50}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                          P10: {pt.p10}
                        </div>
                        <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                          Δ +{pt.surge_delta}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Causal Feature Attribution Tags */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>
                    Feature Importance & Influence Weights:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' }}>
                    {forecastData.feature_attributions.map((feat, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '8px 12px',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{feat.feature_name}</span>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              fontFamily: 'var(--font-mono)',
                              color: 'var(--accent-primary)',
                            }}
                          >
                            {feat.impact_pct}%
                          </span>
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                          {feat.explanation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MULTIMODAL FLEET SOLVER */}
      {/* ========================================================================= */}
      {activeTab === 'optimizer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Depot Selection Bar */}
          <div className="panel">
            <div
              className="panel-header"
              style={{
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Staging Base:</span>
                <select
                  value={selectedDepotId}
                  onChange={(e) => setSelectedDepotId(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto', padding: '4px 8px', fontSize: '0.75rem' }}
                >
                  <option value="LOC-LEH">14 Corps Logistics Base, Leh (3,524m)</option>
                  <option value="LOC-SRINAGAR">BB Cantt Forward Depot, Srinagar (1,585m)</option>
                  <option value="LOC-THOISE">Thoise Air Logistics Hub, Nubra (3,067m)</option>
                </select>
              </div>

              {optimizationData && (
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Solver Status</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                      {optimizationData.solver_status}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Payload Allocated</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      {optimizationData.total_allocated_kg.toLocaleString()} kg
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Optimizer KPI Cards */}
            {optimizationData && (
              <div className="panel-body">
                <div className="grid-kpi-4" style={{ marginBottom: '16px' }}>
                  <div className="panel" style={{ padding: '12px 14px', borderLeft: '4px solid var(--accent-emerald)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Demands Covered</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                      {optimizationData.fulfilled_demands_count} / {optimizationData.total_demands_count}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Forward requisitions served</div>
                  </div>

                  <div className="panel" style={{ padding: '12px 14px', borderLeft: '4px solid var(--accent-primary)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Surface Convoys</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                      {optimizationData.road_convoys_count}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Heavy 4x4 / 6x6 truck dispatches</div>
                  </div>

                  <div className="panel" style={{ padding: '12px 14px', borderLeft: '4px solid var(--accent-crimson)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Air Sorties</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-crimson)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                      {optimizationData.air_bridge_sorties_count}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>IAF Mi-17 V5 severe weather missions</div>
                  </div>

                  <div className="panel" style={{ padding: '12px 14px', borderLeft: '4px solid var(--accent-amber)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Max Turnaround</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                      {optimizationData.total_mission_hours} hrs
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Longest mission execution time</div>
                  </div>
                </div>

                {/* Active Dispatches Roster */}
                <div>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '0.88rem', fontWeight: 600 }}>
                    Scheduled Dispatch Envelopes
                  </h3>
                  {isLoadingOptimizer ? (
                    <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      Solving vehicle routing with altitude de-rating constraints...
                    </div>
                  ) : optimizationData.dispatch_plans.length === 0 ? (
                    <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No critical dispatch required. Forward buffers currently adequate.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {optimizationData.dispatch_plans.map((plan) => (
                        <div
                          key={plan.vehicle_id}
                          className="panel"
                          style={{
                            padding: '14px 16px',
                            borderLeft: plan.is_air_bridge ? '4px solid var(--accent-crimson)' : '4px solid var(--accent-primary)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {plan.is_air_bridge ? (
                                <Plane size={18} style={{ color: 'var(--accent-crimson)' }} />
                              ) : (
                                <Truck size={18} style={{ color: 'var(--accent-primary)' }} />
                              )}
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                  {plan.callsign} • {plan.vehicle_type}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                                  ID: {plan.vehicle_id} • Mode: {plan.mode}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                              <span
                                className={`tactical-badge ${plan.fits_daylight_window ? 'badge-normal' : 'badge-critical'}`}
                              >
                                <Clock size={11} style={{ marginRight: '4px' }} />
                                {plan.fits_daylight_window ? 'Daylight (0600–1700)' : 'Overnight Staging'}
                              </span>

                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Payload Allocated</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                                  {plan.allocated_payload_kg} / {plan.effective_payload_kg} kg ({plan.payload_utilization_pct}%)
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Route Sequence Stepper */}
                          <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Route:</span>
                            {plan.route_sequence.map((node, idx) => (
                              <React.Fragment key={idx}>
                                <span className="elevation-tag">
                                  {node}
                                </span>
                                {idx < plan.route_sequence.length - 1 && (
                                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>→</span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>

                          {/* Notes */}
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                            {plan.operational_notes}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CAUSAL DECISION EXPLAINABILITY */}
      {/* ========================================================================= */}
      {activeTab === 'explain' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Outpost Selector */}
          <div className="panel">
            <div
              className="panel-header"
              style={{
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Inspect Outpost:</span>
                <select
                  value={selectedExplainLocId}
                  onChange={(e) => setSelectedExplainLocId(e.target.value)}
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

              {explainData && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Doctrine Standard</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                    {explainData.doctrine_compliance_ref}
                  </div>
                </div>
              )}
            </div>

            {isLoadingExplain ? (
              <div className="panel-body" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Evaluating decision tree and counterfactual alternatives...
              </div>
            ) : explainData && (
              <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Primary Recommendation Banner */}
                <div
                  className="panel"
                  style={{
                    padding: '14px 16px',
                    borderLeft: '4px solid var(--accent-primary)',
                    background: 'var(--bg-surface-elevated)',
                  }}
                >
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Recommended Action:
                  </div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {explainData.primary_recommendation}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Target: <strong>{explainData.subject_location}</strong> • Supply: <strong>{explainData.subject_supply}</strong>
                  </div>
                </div>

                {/* Causal Factors Tree */}
                <div>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '0.88rem', fontWeight: 600 }}>
                    Primary Decision Drivers & Evidence
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {explainData.causal_factors.map((f, idx) => {
                      const isCritical = f.threat_severity === 'CRITICAL';
                      const isHigh = f.threat_severity === 'HIGH';
                      const badgeClass = isCritical ? 'badge-critical' : isHigh ? 'badge-warning' : 'badge-info';
                      return (
                        <div
                          key={idx}
                          style={{
                            padding: '10px 14px',
                            background: 'var(--bg-surface-elevated)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-sm)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className={`tactical-badge ${badgeClass}`}>
                                {f.threat_severity}
                              </span>
                              <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{f.factor_name}</span>
                            </div>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.8rem', color: 'var(--accent-primary)' }}>
                              {f.impact_weight_pct}% weight
                            </span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            {f.evidence}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Counterfactual Trade-off Analysis */}
                <div>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '0.88rem', fontWeight: 600 }}>
                    Counterfactual Evaluation (Alternative Options Analyzed)
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                    {explainData.counterfactual_tradeoffs.map((cf, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '12px 14px',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-crimson)' }}>
                          Rejected: {cf.rejected_alternative}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          <strong>Reason:</strong> {cf.why_rejected}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                          <strong>Risk:</strong> {cf.casualty_or_stockout_hazard}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      marginTop: '12px',
                      padding: '8px 12px',
                      background: 'var(--bg-surface-elevated)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.7rem',
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-mono)',
                      borderLeft: '3px solid var(--accent-primary)',
                    }}
                  >
                    Note: {explainData.decision_disclaimer}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function roundNumber(num: number, dec: number): number {
  const factor = Math.pow(10, dec);
  return Math.round(num * factor) / factor;
}
