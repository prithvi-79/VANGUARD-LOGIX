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
}

export const PredictiveOptimization: React.FC<PredictiveOptimizationProps> = ({
  locations,
  supplies,
}) => {
  const [activeTab, setActiveTab] = useState<'forecast' | 'optimizer' | 'explain'>('forecast');

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
      {/* Top Header Card */}
      <div
        className="tactical-card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          borderLeft: '4px solid var(--accent-gold)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="live-badge" style={{ background: 'var(--accent-gold)' }} />
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, letterSpacing: '0.04em' }}>
              PREDICTIVE ML FORECASTING & MULTIMODAL FLEET SOLVER
            </h2>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Quantile Gradient-Boosted Forecasters ($P_{10}/P_{50}/P_{90}$), CVRPTW Multimodal Route Optimizer & Causal Explainability
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-card)', padding: '4px', borderRadius: '6px' }}>
          <button
            onClick={() => setActiveTab('forecast')}
            className="tactical-btn"
            style={{
              background: activeTab === 'forecast' ? 'var(--accent-gold)' : 'transparent',
              color: activeTab === 'forecast' ? '#000000' : 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '0.75rem',
            }}
          >
            <TrendingUp size={14} /> Quantile Forecasts ($P_{10}/P_{50}/P_{90}$)
          </button>
          <button
            onClick={() => setActiveTab('optimizer')}
            className="tactical-btn"
            style={{
              background: activeTab === 'optimizer' ? 'var(--accent-gold)' : 'transparent',
              color: activeTab === 'optimizer' ? '#000000' : 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '0.75rem',
            }}
          >
            <Truck size={14} /> Multimodal Fleet Solver (CVRPTW)
          </button>
          <button
            onClick={() => setActiveTab('explain')}
            className="tactical-btn"
            style={{
              background: activeTab === 'explain' ? 'var(--accent-gold)' : 'transparent',
              color: activeTab === 'explain' ? '#000000' : 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '0.75rem',
            }}
          >
            <HelpCircle size={14} /> Causal Explainability
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: QUANTILE DEMAND FORECASTER (P10 / P50 / P90) */}
      {/* ========================================================================= */}
      {activeTab === 'forecast' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Controls Bar */}
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
                FORWARD OUTPOST:
              </label>
              <select
                value={selectedLocId}
                onChange={(e) => setSelectedLocId(e.target.value)}
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
                STRATEGIC SUPPLY:
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

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                HORIZON (DAYS):
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[7, 14, 21, 28].map((d) => (
                  <button
                    key={d}
                    onClick={() => setHorizonDays(d)}
                    className="tactical-btn"
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      background: horizonDays === d ? 'var(--accent-gold)' : 'var(--bg-card)',
                      color: horizonDays === d ? '#000000' : 'var(--text-secondary)',
                      fontWeight: horizonDays === d ? 800 : 500,
                    }}
                  >
                    +{d}d
                  </button>
                ))}
              </div>
            </div>

            {forecastData && (
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>WALK-FORWARD WAPE</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                    {forecastData.evaluation.wape}%
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>CONFIDENCE SCORE</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                    {forecastData.confidence_score}%
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Model Validation & Evaluation Cards */}
          {forecastData && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div className="tactical-card" style={{ padding: '16px', borderLeft: '4px solid var(--accent-cyan)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>WALK-FORWARD WAPE</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                  {forecastData.evaluation.wape}%
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  vs {forecastData.evaluation.baseline_wape}% 7d baseline (+{forecastData.evaluation.wape_improvement_pct}% gain)
                </div>
              </div>

              <div className="tactical-card" style={{ padding: '16px', borderLeft: '4px solid var(--accent-gold)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>TOTAL PROJECTED MEDIAN (P50)</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)' }}>
                  {forecastData.total_projected_p50}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Expected baseline burn over +{horizonDays} days</div>
              </div>

              <div className="tactical-card" style={{ padding: '16px', borderLeft: '4px solid #ef4444' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>TACTICAL SURGE SCENARIO (P90)</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ef4444', fontFamily: 'var(--font-mono)' }}>
                  {forecastData.total_projected_p90}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  +{roundNumber(forecastData.total_projected_p90 - forecastData.total_projected_p50, 1)} surge contingency
                </div>
              </div>

              <div className="tactical-card" style={{ padding: '16px', borderLeft: '4px solid #10b981' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CONSERVATIVE DEFENSIVE (P10)</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                  {roundNumber(forecastData.total_projected_p50 * 0.85, 1)}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Low consumption lull scenario</div>
              </div>
            </div>
          )}

          {/* Day-by-Day Forecast Fan Grid */}
          {isLoadingForecast ? (
            <div className="tactical-card" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Training Quantile Gradient Boosting Regressors (P10/P50/P90)...
            </div>
          ) : forecastData && (
            <div className="tactical-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>
                  QUANTILE TIME-SERIES FAN TRAJECTORY: {forecastData.location_name} • {forecastData.supply_name}
                </h3>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '12px', height: '3px', background: '#ef4444' }} /> P90 Surge
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '12px', height: '3px', background: 'var(--accent-gold)' }} /> P50 Median
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '12px', height: '3px', background: '#10b981' }} /> P10 Low Burn
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '8px' }}>
                {forecastData.forecast_points.map((pt) => (
                  <div
                    key={pt.day}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '10px 8px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>DAY +{pt.day}</div>
                    <div style={{ fontSize: '0.7rem', color: '#ef4444', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                      P90: {pt.p90}
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)' }}>
                      {pt.p50}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                      P10: {pt.p10}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Δ +{pt.surge_delta}
                    </div>
                  </div>
                ))}
              </div>

              {/* Causal Feature Attribution Tags */}
              <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  CAUSAL FEATURE ATTRIBUTION & INFLUENCE COEFFICIENTS:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
                  {forecastData.feature_attributions.map((feat, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 12px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{feat.feature_name}</span>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--accent-gold)',
                          }}
                        >
                          {feat.impact_pct}%
                        </span>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {feat.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MULTIMODAL FLEET SOLVER (CVRPTW) */}
      {/* ========================================================================= */}
      {activeTab === 'optimizer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Depot Selection Bar */}
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
                STAGING LOGISTICS DEPOT:
              </label>
              <select
                value={selectedDepotId}
                onChange={(e) => setSelectedDepotId(e.target.value)}
                style={{
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                }}
              >
                <option value="LOC-LEH">14 Corps HQ & Transit Logistics Hub, Leh (3,524m)</option>
                <option value="LOC-SRINAGAR">BB Cantt Forward Base Logistics Depot, Srinagar (1,585m)</option>
                <option value="LOC-THOISE">Thoise Air Base & Nubra Logistics Staging Area (3,067m)</option>
              </select>
            </div>

            {optimizationData && (
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>SOLVER STATUS</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>
                    {optimizationData.solver_status}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>TOTAL TONNAGE DELIVERED</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                    {optimizationData.total_allocated_kg} kg
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Optimizer KPI Cards */}
          {optimizationData && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div className="tactical-card" style={{ padding: '16px', borderLeft: '4px solid #10b981' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>FULFILLED REQUISITIONS</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                  {optimizationData.fulfilled_demands_count} / {optimizationData.total_demands_count}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Deficit demands covered</div>
              </div>

              <div className="tactical-card" style={{ padding: '16px', borderLeft: '4px solid var(--accent-cyan)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ROAD CONVOYS SCHEDULED</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                  {optimizationData.road_convoys_count}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Heavy 4x4 / 6x6 truck dispatches</div>
              </div>

              <div className="tactical-card" style={{ padding: '16px', borderLeft: '4px solid #ef4444' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>TACTICAL AIR-BRIDGES</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ef4444', fontFamily: 'var(--font-mono)' }}>
                  {optimizationData.air_bridge_sorties_count}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Mi-17 V5 severe weather sorties</div>
              </div>

              <div className="tactical-card" style={{ padding: '16px', borderLeft: '4px solid var(--accent-gold)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>MAX MISSION TIME</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)' }}>
                  {optimizationData.total_mission_hours} hrs
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Longest single-sortie turnaround</div>
              </div>
            </div>
          )}

          {/* Active Dispatches Roster */}
          {isLoadingOptimizer ? (
            <div className="tactical-card" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Solving Multi-Vehicle CVRPTW with High-Altitude De-Rating Envelopes...
            </div>
          ) : optimizationData?.dispatch_plans.length === 0 ? (
            <div className="tactical-card" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No critical dispatch plans required. Forward buffers currently adequate.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {optimizationData?.dispatch_plans.map((plan) => (
                <div
                  key={plan.vehicle_id}
                  className="tactical-card"
                  style={{
                    padding: '18px 20px',
                    borderLeft: plan.is_air_bridge ? '4px solid #ef4444' : '4px solid var(--accent-cyan)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {plan.is_air_bridge ? (
                        <Plane size={20} className="text-crimson" />
                      ) : (
                        <Truck size={20} className="text-cyan" />
                      )}
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                          {plan.callsign} • {plan.vehicle_type}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          ID: {plan.vehicle_id} • MODE: {plan.mode}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      {/* Daylight Window Badge */}
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          background: plan.fits_daylight_window ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: plan.fits_daylight_window ? '#10b981' : '#ef4444',
                          border: `1px solid ${plan.fits_daylight_window ? '#10b981' : '#ef4444'}`,
                        }}
                      >
                        <Clock size={12} /> {plan.fits_daylight_window ? 'DAYLIGHT WINDOW (0600-1700)' : 'OVERNIGHT STAGING REQUIRED'}
                      </span>

                      {/* Payload Utilization */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>PAYLOAD UTILIZATION</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                          {plan.allocated_payload_kg} / {plan.effective_payload_kg} kg ({plan.payload_utilization_pct}%)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Route Sequence Stepper */}
                  <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TRANSIT ROUTE:</span>
                    {plan.route_sequence.map((node, idx) => (
                      <React.Fragment key={idx}>
                        <span
                          style={{
                            padding: '2px 8px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                          }}
                        >
                          {node}
                        </span>
                        {idx < plan.route_sequence.length - 1 && (
                          <span style={{ color: 'var(--accent-gold)', fontSize: '0.7rem' }}>→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Notes */}
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic' }}>
                    {plan.operational_notes}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CAUSAL DECISION EXPLAINABILITY */}
      {/* ========================================================================= */}
      {activeTab === 'explain' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Outpost Selector */}
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
                SELECT OUTPOST TO INSPECT CAUSAL DECISION:
              </label>
              <select
                value={selectedExplainLocId}
                onChange={(e) => setSelectedExplainLocId(e.target.value)}
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

            {explainData && (
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>DOCTRINE COMPLIANCE REFERENCE</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                  {explainData.doctrine_compliance_ref}
                </div>
              </div>
            )}
          </div>

          {isLoadingExplain ? (
            <div className="tactical-card" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Synthesizing Causal Factor Tree and Counterfactual Alternatives...
            </div>
          ) : explainData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Primary Recommendation Banner */}
              <div
                className="tactical-card"
                style={{
                  padding: '18px 20px',
                  borderLeft: '4px solid var(--accent-gold)',
                  background: 'rgba(234, 179, 8, 0.05)',
                }}
              >
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                  TACTICAL SYSTEM RECOMMENDATION:
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {explainData.primary_recommendation}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Target Post: <strong style={{ color: 'var(--text-primary)' }}>{explainData.subject_location}</strong> • Supply: <strong style={{ color: 'var(--text-primary)' }}>{explainData.subject_supply}</strong>
                </div>
              </div>

              {/* Causal Factors Tree */}
              <div className="tactical-card" style={{ padding: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, marginBottom: '14px' }}>
                  PRIMARY CAUSAL DRIVERS & EVIDENCE BREAKDOWN
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {explainData.causal_factors.map((f, idx) => {
                    const isCritical = f.threat_severity === 'CRITICAL';
                    const isHigh = f.threat_severity === 'HIGH';
                    const color = isCritical ? '#ef4444' : isHigh ? '#f59e0b' : 'var(--accent-cyan)';
                    return (
                      <div
                        key={idx}
                        style={{
                          padding: '12px 16px',
                          background: 'var(--bg-card)',
                          border: `1px solid ${color}`,
                          borderRadius: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                padding: '2px 6px',
                                borderRadius: '3px',
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                fontFamily: 'var(--font-mono)',
                                background: `${color}20`,
                                color: color,
                              }}
                            >
                              {f.threat_severity}
                            </span>
                            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{f.factor_name}</span>
                          </div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: color, fontSize: '0.85rem' }}>
                            {f.impact_weight_pct}% Influence
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                          {f.evidence}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Counterfactual Trade-off Analysis */}
              <div className="tactical-card" style={{ padding: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, marginBottom: '14px' }}>
                  COUNTERFACTUAL TRADE-OFFS: "WHY NOT THE ALTERNATIVE?"
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
                  {explainData.counterfactual_tradeoffs.map((cf, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '14px 16px',
                        background: 'rgba(239, 68, 68, 0.04)',
                        border: '1px solid #ef4444',
                        borderRadius: '6px',
                      }}
                    >
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ef4444' }}>
                        REJECTED: {cf.rejected_alternative}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                        <strong>Reason:</strong> {cf.why_rejected}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                        <strong>Stockout / Freeze Hazard:</strong> {cf.casualty_or_stockout_hazard}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: '16px',
                    padding: '10px 14px',
                    background: 'var(--bg-card)',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    borderLeft: '3px solid var(--accent-gold)',
                  }}
                >
                  DISCLAIMER: {explainData.decision_disclaimer}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function roundNumber(num: number, dec: number): number {
  const factor = Math.pow(10, dec);
  return Math.round(num * factor) / factor;
}
