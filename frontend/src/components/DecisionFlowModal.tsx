import React, { useState } from 'react';
import {
  X,
  Radio,
  TrendingUp,
  AlertTriangle,
  Award,
  Layers,
  MapPin,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface DecisionFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STAGES = [
  {
    step: 1,
    title: 'Data Ingestion & Theater Sensing',
    icon: Radio,
    tag: 'Telemetry Synchronized',
    desc: 'Ingests operational multi-source inputs: consumption telemetry from 10 Northern forward posts, Border Roads Organisation pass condition feeds, sub-zero meteorological readings, and outpost troop strengths.',
    inputs: ['Historical consumption logs (7, 14, 21-day lags)', 'Ambient temperatures (-35°C to -50°C)', 'BRO Pass open/closed status indicators', 'Headcount & storage capacities'],
    math: 'Synchronized telemetry anchoring forward post inventory registers across Ladakh, Siachen, and Sub-Sector North.',
    output: 'Normalized feature vector passed to forecasting engines.',
  },
  {
    step: 2,
    title: 'Quantile Demand Forecasting',
    icon: TrendingUp,
    tag: 'P10 / P50 / P90 Intervals',
    desc: 'Gradient-boosted quantile regression estimates demand percentiles instead of a single point estimate. P10 represents baseline burn, P50 is expected operational demand, and P90 provides the surge buffer for harsh weather spikes.',
    inputs: ['Sub-zero bukhari heating curves', 'Troop headcount variations', 'Extreme blizzard covariates', 'Rolling origin walk-forward splits'],
    math: 'HistGradientBoostingRegressor(loss="quantile", quantile=0.90) achieving <10% WAPE across winter operational cycles.',
    output: 'Multi-horizon demand predictions: P10 (lean burn), P50 (expected), P90 (tactical surge).',
  },
  {
    step: 3,
    title: 'Risk & Days-of-Supply Countdown',
    icon: AlertTriangle,
    tag: 'Burn-Rate Dynamics',
    desc: 'Computes dynamic Days of Supply (DoS = Current Stock / Forward Daily Demand Rate) and classifies outposts into Normal (>12d), Warning (5-12d), and Critical (<5d) replenishment emergency status.',
    inputs: ['Forward post current stock registers', 'Forecasted daily burn rates', 'Safety stock replenishment thresholds'],
    math: 'DoS = Current Stock / Forward Daily Demand Rate. Safety Deficit = max(0, Safety Stock - Current Stock).',
    output: 'Categorized risk classification and countdown indicators for replenishment planning.',
  },
  {
    step: 4,
    title: 'Multi-Attribute Priority Scoring',
    icon: Award,
    tag: '0–100 Criticality Rank',
    desc: 'Calculates composite priority scores (0–100 scale) for forward posts and requisition indents, weighting urgency, deficit severity, strategic item criticality, route accessibility, and weather threat.',
    inputs: ['Urgency index (30%)', 'Stock deficit severity (15%)', 'Supply Class I-V criticality (15%)', 'Pass lead-time pressure (10%)', 'Route feasibility (10%)'],
    math: 'Score = Σ (Weight_i × Normalized_Attribute_i). Non-linear penalty applied if Days of Supply < 3 days.',
    output: 'Ranked queue determining order of depot allocations and air-bridge dispatch.',
  },
  {
    step: 5,
    title: 'Inventory Allocation & Manifest',
    icon: Layers,
    tag: 'High-Altitude De-Rating',
    desc: 'Allocates stock from base depots (Leh, Srinagar, Thoise) to forward posts according to priority ranking. Automatically applies high-altitude payload de-rating envelopes above 3,500m MSL.',
    inputs: ['Base depot inventory buffers (45-60d stock)', 'Forward post storage capacities', 'Class I-V storage compatibility rules'],
    math: 'Effective Payload = Rated Payload × max(0.40, 1.0 - (Altitude - 3000)/10000). Enforces weight and volume constraints.',
    output: 'Optimized manifest items mapped to eligible multimodal vehicles.',
  },
  {
    step: 6,
    title: 'Route & Pass Feasibility Routing',
    icon: MapPin,
    tag: 'Topographic Friction & Passability',
    desc: 'Computes physical travel resistance over mountain roads taking into account slope grade resistance, surface friction, and real-time BRO pass status. If a mountain pass is closed, traffic is rerouted or shifted to air-bridge sorties.',
    inputs: ['Grade resistance formula: Rg = 1.0 + 0.035|θ| + 0.002|θ|²', 'Surface friction: Highway (1.0) vs Track (1.55)', 'BRO pass status: Open vs Closed'],
    math: 'Dijkstra / CVRPTW shortest-friction path on dynamic graph. Multimodal fallback to Mi-17 air-bridge when pass is severed.',
    output: 'Feasible route corridors with estimated transit durations and vehicle assignments.',
  },
  {
    step: 7,
    title: 'Tactical Dispatch & Movement Orders',
    icon: CheckCircle2,
    tag: 'IAF-Z-2096 & SHA-256 Integrity',
    desc: 'Generates formal military dispatch slips, movement orders, and cryptographically verified IAF-Z-2096 vouchers. Provides transparent factor attribution ("Why this dispatch was prioritized").',
    inputs: ['Allocated vehicle manifests', 'Assigned route corridors', 'Quartermaster officer service credentials'],
    math: 'SHA-256 Digest = Hash(Voucher_ID : Unit : Post : Items : Officer_ID). Tamper-evident verification.',
    output: 'Formal tactical movement order and explainable causal breakdown for decision support.',
  },
];

export const DecisionFlowModal: React.FC<DecisionFlowModalProps> = ({ isOpen, onClose }) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  if (!isOpen) return null;

  const currentStage = STAGES.find((s) => s.step === activeStep) || STAGES[0];
  const IconComponent = currentStage.icon;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(22, 22, 22, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="panel"
        style={{
          width: '100%',
          maxWidth: '860px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-prominent)',
          borderRadius: '0px',
          boxShadow: 'none',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="tactical-badge badge-normal">Decision Support Architecture</span>
              <span className="tactical-badge badge-info">7-Stage Pipeline</span>
            </div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, margin: '4px 0 0 0' }}>
              High-Altitude Logistics Decision Pipeline
            </h2>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Systematic breakdown of data ingestion, quantile demand forecasting, and route allocation.
            </div>
          </div>

          <button
            onClick={onClose}
            className="tactical-btn"
            style={{ padding: '6px', borderRadius: '0px' }}
            aria-label="Close Modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Pipeline Stepper Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            padding: '12px 0',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {STAGES.map((s) => {
            const isActive = s.step === activeStep;
            return (
              <button
                key={s.step}
                onClick={() => setActiveStep(s.step)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: isActive ? 'var(--accent-primary)' : 'var(--bg-surface-elevated)',
                  border: `1px solid ${isActive ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                  color: isActive ? 'var(--text-inverse)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{s.step}.</span>
                <span>{s.title.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Active Stage Deep-Dive */}
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  padding: '8px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--badge-normal-bg)',
                  color: 'var(--badge-normal-text)',
                }}
              >
                <IconComponent size={20} />
              </div>
              <div>
                <span className="tactical-badge badge-normal" style={{ fontSize: '0.62rem' }}>
                  Stage {currentStage.step} of 7 • {currentStage.tag}
                </span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: '2px 0 0 0' }}>
                  {currentStage.title}
                </h3>
              </div>
            </div>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            {currentStage.desc}
          </p>

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Inputs Box */}
            <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '6px' }}>
                Operational Inputs & Parameters
              </div>
              <ul style={{ paddingLeft: '16px', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {currentStage.inputs.map((inp, idx) => (
                  <li key={idx}>{inp}</li>
                ))}
              </ul>
            </div>

            {/* Model & Math Box */}
            <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent-emerald)', marginBottom: '6px' }}>
                Algorithmic & Analytical Formulation
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {currentStage.math}
              </p>
            </div>
          </div>

          {/* Output Directive Box */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--badge-info-bg)',
              border: '1px solid var(--badge-info-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={16} style={{ color: 'var(--badge-info-text)', flexShrink: 0 }} />
            <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>
              <strong>Stage Output: </strong>
              <span style={{ color: 'var(--text-secondary)' }}>{currentStage.output}</span>
            </div>
          </div>

          {/* Stepper Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
            <button
              onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
              disabled={activeStep === 1}
              className="tactical-btn"
              style={{ padding: '5px 12px', fontSize: '0.75rem' }}
            >
              Previous Stage
            </button>

            <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
              Stage {activeStep} / 7
            </span>

            <button
              onClick={() => setActiveStep((prev) => Math.min(7, prev + 1))}
              disabled={activeStep === 7}
              className="tactical-btn"
              style={{
                padding: '5px 12px',
                fontSize: '0.75rem',
                background: 'var(--accent-primary)',
                color: 'var(--text-inverse)',
                borderColor: 'var(--accent-primary)',
              }}
            >
              Next Stage <ArrowRight size={12} style={{ marginLeft: '4px' }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
