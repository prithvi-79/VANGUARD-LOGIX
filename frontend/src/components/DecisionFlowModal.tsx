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
    title: 'DATA INGESTION & THEATER SENSING',
    icon: Radio,
    tag: 'SEED 26251 SYNCHRONIZED',
    desc: 'Ingests real-time and historical multi-source inputs: consumption telemetry from 10 Northern Command posts, Border Roads Organisation pass condition feeds, sub-zero weather series, and high-altitude troop strengths.',
    inputs: ['Historical burn logs (7, 14, 21-day lags)', 'Ambient temperatures (-35°C to -50°C)', 'BRO Pass open/closed status flags', 'Headcount & storage capacities'],
    math: 'Deterministic seed generation (seed=26251) anchoring 120 forward post inventory registers across Ladakh, Siachen, and SSN DBO.',
    output: 'Normalized feature vector passed to forecasting engines.',
  },
  {
    step: 2,
    title: 'QUANTILE DEMAND FORECASTING',
    icon: TrendingUp,
    tag: 'P10 / P50 / P90 INTERVALS',
    desc: 'Gradient-boosted quantile regression predicts demand percentiles instead of a single point estimate. P10 represents mild-weather baseline burn, P50 is expected operational demand, and P90 provides the crucial high-altitude tactical surge buffer.',
    inputs: ['Sub-zero bukhari heating curves', 'Troop headcount variations', 'Extreme blizzard covariates', 'Rolling origin walk-forward splits'],
    math: 'HistGradientBoostingRegressor(loss="quantile", quantile=0.90) achieving <10% WAPE across simulated Himalayan winter cycles.',
    output: 'Multi-horizon demand predictions: P10 (lean burn), P50 (expected), P90 (tactical surge).',
  },
  {
    step: 3,
    title: 'RISK & DAYS-OF-SUPPLY COUNTDOWN',
    icon: AlertTriangle,
    tag: 'BURN-RATE DYNAMICS',
    desc: 'Computes dynamic Days of Supply (DoS = Current Stock / Forward Daily Demand Rate) and classifies forward outposts into NORMAL (>12d), WARNING (5-12d), and CRITICAL (<5d) replenishment emergency status.',
    inputs: ['Forward post current stock registers', 'Forecasted daily burn rates', 'Safety stock replenishment thresholds'],
    math: 'DoS = Current Stock / Forward Daily Demand Rate. Safety Deficit = max(0, Safety Stock - Current Stock).',
    output: 'Categorized threat classification and countdown timers for emergency resupply.',
  },
  {
    step: 4,
    title: 'MULTI-ATTRIBUTE PRIORITY SCORING',
    icon: Award,
    tag: '0–100 CRITICALITY RANK',
    desc: 'Calculates deterministic composite priority scores (0–100 scale) for all forward posts and requisition indents, weighting urgency, deficit severity, strategic item criticality, route accessibility, and weather threat.',
    inputs: ['Urgency index (30%)', 'Stock deficit severity (15%)', 'ASC/AOC Class I-V criticality (15%)', 'Pass lead-time pressure (10%)', 'Route feasibility (10%)'],
    math: 'Score = Σ (Weight_i × Normalized_Attribute_i). Non-linear penalty applied if Days of Supply < 3 days.',
    output: 'Ranked queue determining order of depot allocations and air-bridge dispatch.',
  },
  {
    step: 5,
    title: 'INVENTORY ALLOCATION & MANIFEST',
    icon: Layers,
    tag: 'HIGH-ALTITUDE DE-RATING',
    desc: 'Allocates stock from base depots (Leh, Srinagar, Thoise) to forward posts according to priority ranking. Automatically applies high-altitude payload de-rating envelopes above 3,500m MSL.',
    inputs: ['Base depot inventory buffers (45-60d stock)', 'Forward post storage capacities', 'Class I-V storage compatibility rules'],
    math: 'Effective Payload = Rated Payload × max(0.40, 1.0 - (Altitude - 3000)/10000). Enforces weight and volume constraints.',
    output: 'Optimized manifest items mapped to eligible multimodal vehicles.',
  },
  {
    step: 6,
    title: 'ROUTE & PASS FEASIBILITY ROUTING',
    icon: MapPin,
    tag: 'TOPOGRAPHIC PHYSICS & PASSABILITY',
    desc: 'Computes physical travel resistance over mountain roads taking into account slope grade resistance, surface friction, and real-time BRO pass status. If a mountain pass is severed by an avalanche, traffic is rerouted or switched to air-bridge.',
    inputs: ['Grade resistance formula: Rg = 1.0 + 0.035|θ| + 0.002|θ|²', 'Surface friction: Highway (1.0) vs Track (1.55)', 'BRO pass status: OPEN vs CLOSED_BLIZZARD'],
    math: 'Dijkstra / CVRPTW shortest-friction path on dynamic graph. Automatic multimodal fallback to IAF Mi-17 V5 air-bridge when pass is severed.',
    output: 'Feasible route corridors with estimated transit durations and transit mode assignments.',
  },
  {
    step: 7,
    title: 'TACTICAL DISPATCH & MOVEMENT ORDERS',
    icon: CheckCircle2,
    tag: 'IAF-Z-2096 & SHA-256 INTEGRITY',
    desc: 'Generates formal military dispatch slips, movement orders, and cryptographically verified IAF-Z-2096 vouchers. Provides transparent factor attribution ("Why this dispatch was prioritized").',
    inputs: ['Allocated vehicle manifests', 'Assigned route corridors', 'Quartermaster officer service credentials'],
    math: 'SHA-256 Digest = Hash(Voucher_ID : Unit : Post : Items : Officer_ID). Tamper-evident verification.',
    output: 'Formal tactical movement order and explainable causal breakdown for defense commanders.',
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
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="tactical-card"
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-prominent)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="tactical-badge badge-cyan">DECISION SUPPORT ARCHITECTURE</span>
              <span className="tactical-badge badge-normal">SIH PS 26251</span>
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '6px 0 0 0' }}>
              VANGUARD-LOGIX End-to-End Decision Pipeline
            </h2>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Step-by-step mathematical breakdown of the forward tactical supply chain intelligence engine.
            </div>
          </div>

          <button
            onClick={onClose}
            className="tactical-btn"
            style={{ padding: '6px', borderRadius: '50%' }}
            aria-label="Close Modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Pipeline Stepper Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            padding: '16px 0',
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
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: isActive ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-surface-elevated)',
                  border: `1px solid ${isActive ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                  color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
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
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  color: 'var(--accent-cyan)',
                }}
              >
                <IconComponent size={24} />
              </div>
              <div>
                <span className="tactical-badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                  STAGE {currentStage.step} OF 7 • {currentStage.tag}
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '2px 0 0 0' }}>
                  {currentStage.title}
                </h3>
              </div>
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {currentStage.desc}
          </p>

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* Inputs Box */}
            <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
                TACTICAL INPUTS & COVARIATES
              </div>
              <ul style={{ paddingLeft: '18px', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {currentStage.inputs.map((inp, idx) => (
                  <li key={idx}>{inp}</li>
                ))}
              </ul>
            </div>

            {/* Model & Math Box */}
            <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
                MATHEMATICAL / ALGORITHMIC MODEL
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {currentStage.math}
              </p>
            </div>
          </div>

          {/* Output Directive Box */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: 'rgba(2, 132, 199, 0.1)',
              border: '1px solid rgba(2, 132, 199, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <CheckCircle2 size={18} className="text-cyan" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
              <strong>Stage Output: </strong>
              <span style={{ color: 'var(--text-secondary)' }}>{currentStage.output}</span>
            </div>
          </div>

          {/* Stepper Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <button
              onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
              disabled={activeStep === 1}
              className="tactical-btn"
              style={{ padding: '6px 14px', fontSize: '0.78rem' }}
            >
              Previous Stage
            </button>

            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
              STAGE {activeStep} / 7
            </span>

            <button
              onClick={() => setActiveStep((prev) => Math.min(7, prev + 1))}
              disabled={activeStep === 7}
              className="tactical-btn tactical-btn-primary"
              style={{ padding: '6px 14px', fontSize: '0.78rem' }}
            >
              Next Stage <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
