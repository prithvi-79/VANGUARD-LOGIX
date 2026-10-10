# Smart India Hackathon (SIH 2026) — Problem Statement 26251
# Verified Requirements & Acceptance Criteria

**Document Status:** Approved Baseline (Phase 0)  
**Problem Statement ID:** 26251  
**Title:** Indian Army — Predictive Logistics & Forward Supply Chain  
**Organization / Department:** Ministry of Defence (MoD) / Defence Services Staff College (DSSC)  
**Theme:** Transportation & Logistics / Defense  
**Category:** Software  
**Operational Theater:** Northern Command / XIV Corps (High-Altitude, Ladakh, Siachen, DBO, Dras/Kargil sectors)

---

## 1. Operational Problem Context & Verification

### 1.1 Verified Problem Background
Forward military formations deployed in glaciated, high-altitude, and operationally contentious environments face extreme supply-chain friction. Supply lines traverse hazardous mountain corridors (11,000 ft to >18,000 ft above sea level) exposed to extreme sub-zero weather (-35°C to -50°C), winter blizzards, avalanches, and seasonal mountain pass closures (notably Zoji La, Khardung La, and Chang La).

Existing operational friction points verified across authoritative source documentation:
1. **Disconnected Information Silos:** Disconnects between depot inventory levels, troop strength fluctuations, and weather-induced route passability.
2. **Extreme High-Altitude Consumption Spikes:** Severe sub-zero temperatures exponentially increase fuel burn (Class III Arctic Diesel/Kerosene for bukhari space heaters, generators, and anti-waxing vehicle heaters) and pack ration caloric requirements (DRDO 4,088 kcal/man/day scale).
3. **Critical Pass Choke Points:** Sudden avalanche/snow closures at Zojila, Khardung La, or Chang La isolate forward outposts, requiring immediate rerouting, transit window enforcement, or multi-modal air-bridges (ALH Dhruv / Mi-17 V5 tactical airlift).
4. **Intermittent Border Connectivity:** Forward outposts operate in DDN/VSAT shadow zones, requiring offline-first field capability with tamper-evident local voucher storage and automated synchronization upon link restoration.
5. **Payload De-rating at High Altitude:** Lower air density at high altitude degrades vehicle and helicopter payloads by 15% to 30%, making standard sea-level loading formulas dangerous.

---

## 2. Stakeholder Personas & Core User Workflows

| Persona | Role | Primary Objective in System |
|---|---|---|
| **Theater Logistics Commander (C2)** | Corps HQ / Divisional Logistics Officer | High-level situational awareness across all depots and forward posts; strategic pass passability monitoring; What-If disruption simulations; contingency air-bridge authorization. |
| **Depot Dispatcher / Convoy Commander** | Base Supply Depot (BSD) / Forward Supply Depot (FSD) | Converting urgent demand into feasible multi-modal manifests; vehicle load allocation with high-altitude engine de-rating; daylight transit window scheduling; movement orders export. |
| **Forward Post Quartermaster** | Outpost Field Officer / Company Havildar Major | Daily physical stock audits; offline-first voucher creation under IAF-Z-2096 spec; bilingual (English/Hindi) inventory logging; real-time sensor verification (fuel tank levels, cold-chain cryo-storage). |

---

## 3. Prioritized Feature Backlog & Acceptance Criteria

### P0: Essential Working Demonstration (Core Minimum Viable Product)
These features constitute the mandatory end-to-end baseline that must function seamlessly:

* **[P0-REQ-01] Tactical Command Dashboard & Decision Flow:**
  - *Description:* Unified command interface displaying network status, critical stockout countdowns (Days-of-Supply), overall risk index, active alerts, and top recommended actions.
  - *Acceptance Criteria:* Displays real computed figures across the pipeline: DATA → FORECAST → RISK → PRIORITY → ALLOCATION → ROUTE → DECISION. Dark/Light tactical mode compliant with WCAG AA contrast (≥ 4.5:1). Every status uses unambiguous indicators (NORMAL / WARNING / CRITICAL).
* **[P0-REQ-02] Predictive Demand Forecasting Engine:**
  - *Description:* Multi-horizon demand forecaster for each forward location and supply class across 7, 14, and 30 days.
  - *Acceptance Criteria:* Combines weather-aware covariates (ambient temperature, snowfall) with historical consumption patterns. Outputs quantile prediction intervals ($P_{10}$ low-burn, $P_{50}$ median expectation, $P_{90}$ surge buffer) or statistical baseline + challenger cross-checks. Measured and reported with transparent evaluation metrics (WAPE, MAE, RMSE) against naive rolling baselines.
* **[P0-REQ-03] Inventory Risk & Days-of-Supply (DoS) Engine:**
  - *Description:* Automated real-time burn-down analytics and safety stock deficit scoring.
  - *Acceptance Criteria:* Calculates exact $\text{DoS} = \text{Current Stock} / \text{Forward Daily Demand Rate}$. Quantifies safety stock deficit and priority score ($0 \dots 100$) based on urgency, volume, supply criticality, and lead-time pressure.
* **[P0-REQ-04] Topographic Terrain & Pass Passability Modeling:**
  - *Description:* Mountain route network model incorporating pass status, slope gradients, elevation profiles, and surface friction.
  - *Acceptance Criteria:* Models real strategic passes (Zoji La, Khardung La, Chang La, Rohtang). Dynamically incorporates pass state (`OPEN`, `CHAINS_REQD`, `ONE_WAY_TIMED`, `CLOSED_BLIZZARD`, `CLOSED_AVALANCHE`). Calculates slope-grade resistance and surface friction multipliers.
* **[P0-REQ-05] Dispatch Allocation & Multimodal Load Optimization:**
  - *Description:* Algorithmic allocation matching prioritized demands to available depot stock and fleet vehicles.
  - *Acceptance Criteria:* Evaluates vehicle capacities with high-altitude payload de-rating (above 3,000m MSL). Supports road transit and multi-modal contingency air-bridges (tactical airlift / helicopter). Enforces daylight travel constraints (0600–1700 hrs). Outputs structured dispatch manifests.
* **[P0-REQ-06] Explainability & Transparent Decision Support:**
  - *Description:* Clear explanation panels for system recommendations.
  - *Acceptance Criteria:* Every recommendation explains *why* a location is prioritized and *why* a specific route/vehicle was chosen or rejected (delivering clear factor deltas: shortage, lead time, route risk, terrain friction). Clear disclaimer stating recommendations are rule-based/predictive decision support, not autonomous military orders.

---

### P1: High-Value Operational Differentiators
Features that elevate the solution from a standard hackathon demo to an operationally credible military logistics system:

* **[P1-REQ-01] What-If Disruption Simulator:**
  - *Description:* Interactive stress-testing of supply resilience under extreme operational disruptions.
  - *Acceptance Criteria:* Interactive sliders / scenarios for: severe weather drop (-15°C to -45°C), sudden pass blockage (avalanche/blizzard), troop surge (+20% to +60%), and vehicle fleet grounding. Computes before-and-after deltas for stockouts, DoS, transit delays, and recommended responses.
* **[P1-REQ-02] Military Indent & Offline Voucher Workflow (IAF-Z-2096):**
  - *Description:* Formal Indian Army requisition workflow conforming to IAF-Z-2096 specifications.
  - *Acceptance Criteria:* Capture unit, formation, priority (`OP_IMMEDIATE`, `PRIORITY`, `ROUTINE`), officer service number, and justification. Generates verifiable voucher numbers with SHA-256 hash digests and offline queuing capability.
* **[P1-REQ-03] Offline-First Field App (PWA / Mobile View):**
  - *Description:* Resilient field-level stock check interface operable in VSAT/connectivity shadow zones.
  - *Acceptance Criteria:* Standalone lightweight view with bilingual support (English & Hindi). Caches stock audits locally when offline, with automatic replay and idempotent reconciliation upon link restoration.
* **[P1-REQ-04] IoT Cold-Chain & Tank Sensor Telemetry Simulator:**
  - *Description:* Real-time sensor stream modeling storage conditions for fuel bladders and medical plasma.
  - *Acceptance Criteria:* Simulates tank-level sensors and cryo-cooler temperatures. Detects physical vs book stock discrepancies (fuel leaks / pilferage alerts) and temperature excursion alerts for sensitive medical Class II items.
* **[P1-REQ-05] Movement Orders Export:**
  - *Description:* Exportable operational movement manifests.
  - *Acceptance Criteria:* Produces structured CSV and printable dispatch slips detailing vehicle call-signs, route checkpoints, cargo manifests, and departure/arrival windows.

---

### P2: Optional Tactical Enhancements
* **[P2-REQ-01]** MGRS Grid Coordinate Overlay & Interactive Topographic Contours.
* **[P2-REQ-02]** Multi-leg porter / animal transport (mule train) last-mile scheduling for unpaved snow tracks.
* **[P2-REQ-03]** Long-term seasonal pre-winter stocking (OP SNOW-STORM) budget and fuel quota calculator.

---

## 4. Non-Functional Requirements (NFR)

1. **Deterministic Reproducibility:** Every simulation run and synthetic dataset generator must support fixed seeding (`seed=26251`) ensuring repeatable demonstration results.
2. **Operational Data Safety & Watermarking:** Absolute prohibition of classified, sensitive, or real-world operational troop coordinates. All synthetic entities must be clearly watermarked `SYNTHETIC_DATA = True`.
3. **Resilience & Fault Tolerance:** Backend and frontend must maintain graceful degradation. If database, external weather APIs, or background solvers fail or disconnect, the application must degrade to documented offline fallbacks without crashing.
4. **Performance:** UI interactions must remain fluid (< 100ms render latency). Optimization solves must return within a hard cap of 5 seconds.
5. **Code Quality & Type Safety:** Clean separation between pure mathematical/optimization engines and persistence layers. Full static typing on both frontend (TypeScript strict mode) and backend (Pydantic / Python type hints).
6. **Accessibility:** Dual tactical theme support (Dark Command Center and High-Contrast Light) adhering to WCAG AA contrast guidelines.
