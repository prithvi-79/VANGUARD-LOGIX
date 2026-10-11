# Phased Implementation Roadmap & Task Checklist

**Project:** Indian Army — Predictive Logistics & Forward Supply Chain (SIH PS 26251)  
**System Name:** VANGUARD-LOGIX  
**Document Version:** 1.0 (Phase 0 Baseline)  

---

## Overview & Progression Strategy

Development is structured into sequential, independently verifiable phases. Each phase has strict entry criteria, concrete deliverables, automated tests, and a formal checkpoint protocol.

```mermaid
graph LR
    P0[Phase 0: Recon & Scope] --> P1[Phase 1: Foundation & Dual DB]
    P1 --> P2[Phase 2: Tactical Dashboard & UI]
    P2 --> P3[Phase 3: Logistics Business Logic]
    P3 --> P4[Phase 4: ML & OR-Tools Optimization]
    P4 --> P5[Phase 5: Military Workflows & PWA]
    P5 --> P6[Phase 6: QA, E2E & Hardening]
    P6 --> P7[Phase 7: SIH Delivery & Demo Package]
```

---

## Phase 0: Repository Reconnaissance & Architectural Definition
**Status:** In Progress (Finalizing Exit Deliverables)

- [x] Clone and inspect all 4 candidate GitHub repositories in a persistent scratch environment.
- [x] Verify exact SIH Problem Statement 26251 metadata, defense requirements, and operational context.
- [x] Perform in-depth technical audit of all 4 source repositories (strengths, gaps, licenses, architecture).
- [x] Author comprehensive `REPOSITORY_AUDIT.md`.
- [x] Construct technical Feature Comparison Matrix and author `FEATURE_DECISIONS.md`.
- [x] Define system requirements, user personas, and acceptance criteria in `REQUIREMENTS.md`.
- [x] Design modular, dual-mode system architecture and author `ARCHITECTURE.md`.
- [x] Create project tracking and decision logs (`DECISIONS.md`, `LICENSES_AND_ATTRIBUTION.md`, `CHANGELOG.md`).
- [x] Author `IMPLEMENTATION_PLAN.md` and define Phase 1 entry criteria.
- [x] Checkpoint and stop (awaiting user approval to begin Phase 1).

---

## Phase 1: Foundation & Core Architecture
**Target:** Clean, robust full-stack skeleton with dual-mode database and passing baseline tests.
**Status:** **COMPLETED**

- [x] Initialize clean directory structure (`/backend`, `/frontend`, `/docs`).
- [x] Configure Python environment, dependency management (`pyproject.toml` / `requirements.txt`), and FastAPI application factory.
- [x] Implement dual-mode database engine (SQLAlchemy 2 async with PostgreSQL/PostGIS support and portable SQLite fallback).
- [x] Implement database models:
  - Locations (Base Depots & Forward Posts with MGRS coordinates and elevation).
  - Supplies (ASC/AOC Class I to Class V categories).
  - Routes & Strategic Mountain Passes (Zoji La, Khardung La, Chang La, Rohtang).
  - Fleet Vehicles (Ashok Leyland 4x4, Stallion 6x6, Bv-206 Snowcat, Mi-17 V5 Helicopter).
  - Historical Consumption & Weather series.
- [x] Build deterministic synthetic data generator (`seed=26251`) for Northern Command XIV Corps theater.
- [x] Implement health check, database status, and API error-handling middleware.
- [x] Scaffold React 18 + Vite + TypeScript frontend with dual-theme provider (Dark Command Center & High-Contrast Light Mode).
- [x] Write initial unit tests verifying database initialization, seeding, and health endpoints (8 tests passing in 2.37s).
- [x] **Phase 1 Checkpoint:** Run tests, update `PROJECT_STATE.md` and `HANDOFF.md`, create Git commit.

---

## Phase 2: Core Application & Tactical UI
**Target:** Responsive tactical dashboard with operational overview and live navigation.
**Status:** **COMPLETED**

- [x] Implement tactical application layout (Top Command Header, Tactical Ribbon, Status Banner).
- [x] Build WCAG AA compliant dual-theme system (Dark Command Center and High-Contrast Light Mode).
- [x] Implement Command Dashboard:
  - System Decision Flow strip: `DATA → FORECAST → RISK → PRIORITY → ALLOCATION → ROUTE → DECISION`.
  - Command Briefing card: overall risk gauge, critical locations count, predicted shortages, fleet capacity.
  - Active operational alerts panel.
- [x] Implement Tactical GIS Map component:
  - Northern Command sector overlay (Leh, Siachen, DBO, Galwan, Dras, Chushul).
  - Interactive route corridors, pass choke points, and elevation profiles.
- [x] Implement Border Roads Organisation (BRO) Strategic Pass Monitor component with real-time passability toggles.
- [x] Connect dashboard components to FastAPI endpoints with realistic loading, error, and empty states.
- [x] **Phase 2 Checkpoint:** Run frontend build and typecheck, update state documents, create Git commit.

---

## Phase 3: Logistics Business Logic & Risk Engines
**Target:** Deterministic inventory burn-down, multi-attribute priority scoring, and pass passability routing.
**Status:** **COMPLETED**

- [x] Implement Days-of-Supply (DoS) calculation engine:
  - $\text{DoS} = \text{Current Stock} / \text{Forward Daily Demand Rate}$.
  - Elevation-scaled burn multiplier: Class III surges +35%/1,000m above 3,000m; Class I surges +10%/1,000m.
  - Safety stock deficit scoring and status classification (`NORMAL`, `WARNING`, `CRITICAL`).
  - Day-by-day forward inventory burn-down simulation trajectory.
- [x] Implement multi-attribute Priority Scoring engine (0–100 scale):
  - Weighted combination: urgency (30%), stock deficit (15%), supply class criticality (15%), lead-time pressure (10%), route feasibility (10%), environmental threat (10%), headcount vulnerability (10%).
  - Priority tiers (`OP_IMMEDIATE`, `HIGH`, `MEDIUM`, `ROUTINE`) and transit mode recommendation (`ROAD`, `AIR_BRIDGE`, `ALL_TERRAIN`).
- [x] Implement Topographic & Slope Physics engine:
  - Empirical road grade resistance formula ($R_g = 1.0 + 0.035|\theta| + 0.002|\theta|^2$).
  - Surface friction multipliers (`HIGHWAY`, `MOUNTAIN_ROAD`, `UNPAVED_TRACK`, `GLACIAL_SNOWCAT_TRAIL`).
  - Dynamic route blockage when mountain passes are closed (`CLOSED_BLIZZARD`, `CLOSED_AVALANCHE`) triggering IAF Mi-17 V5 tactical air-bridge.
- [x] Build REST endpoints and unit tests for inventory risk (`/api/risk`), priority queues (`/api/priority`), and terrain corridors (`/api/terrain`).
- [x] Integrate interactive tactical decision intelligence and physics engine into frontend dashboard (`StrategicIntelligence.tsx`).
- [x] **Phase 3 Checkpoint:** 35/35 pytest tests passing 100%, frontend compiles cleanly with 0 errors, Git checkpoint created.

---

## Phase 4: Predictive & Optimization Features
**Target:** Quantile demand forecasting and Google OR-Tools multimodal fleet solver.
**Status:** **COMPLETED**

- [x] Implement Quantile Demand Forecaster (`services/forecasting.py`):
  - Train gradient-boosted quantile regressors (`HistGradientBoostingRegressor`) for $P_{10}$ (low burn), $P_{50}$ (median), and $P_{90}$ (tactical surge).
  - Feature engineering: consumption lags (7, 14, 21 d), rolling stats, ambient temperature, snowfall, troop headcount.
  - Compute rolling walk-forward evaluation metrics (WAPE, MAE, RMSE) against rolling average baseline.
  - Heuristic confidence index and explainability feature attribution tags.
- [x] Implement Multimodal Fleet Optimizer (`services/optimizer.py`):
  - Formulate and solve multi-vehicle CVRPTW with payload capacity constraints.
  - High-altitude vehicle and helicopter payload de-rating above 3,500m MSL ($1.0 - \max(0, (\text{elevation}-3000)/10000)$).
  - Daylight transit window enforcement (0600–1700 hrs, 11h max).
  - Multimodal fallback: automatically deploy contingency air-bridges (IAF Mi-17 V5) when road passes are severed.
- [x] Implement Explainability Engine (`services/explainability.py`):
  - Provide human-readable "Why this recommendation?" causal breakdowns with evidence and severity.
  - Provide route alternative evaluations ("Why not alternate route?") with casualty and freezeout hazard trade-offs.
  - Military doctrine compliance citations (`HQ Northern Command XIV Corps SOP / ASC-LOG-2026-CH7`).
- [x] Write rigorous unit and integration tests (11 new tests, 46/46 passing 100%).
- [x] Implement frontend tactical UI (`PredictiveOptimization.tsx`) with quantile fan bands, dispatch sequence stepper, and causal tree.
- [x] **Phase 4 Checkpoint:** 46/46 pytest tests passing 100%, frontend compiles cleanly with 0 errors, Git checkpoint created.

---

## Phase 5: Integration, Military Workflows & Offline Field PWA
**Target:** End-to-end tactical workflows, formal requisition indents, and offline field capability.
**Status:** **COMPLETED**

- [x] Implement IAF-Z-2096 Military Requisition Indent workflow:
  - Requisition form capturing unit, formation, priority (`OP_IMMEDIATE`, `PRIORITY`, `ROUTINE`), officer service number, and justification.
  - Generation of unique voucher numbers with SHA-256 cryptographic verification hashes.
  - Printable tactical dispatch slips and CSV movement orders export (`/api/indents/movement-orders/export-csv`).
- [x] Implement Bilingual Offline Field PWA (`/field`):
  - Lightweight stocktaking view supporting English and Hindi (हिंदी).
  - Service Worker offline caching (`sw.js`, `manifest.json`) and local voucher storage (LocalStorage).
  - Offline mode simulation toggle ("Simulate No Signal").
  - Idempotent batch synchronization endpoint (`POST /api/indents/sync`).
- [x] Implement What-If Disruption Simulator:
  - 5 selectable disruption scenarios: `BASELINE`, `SEVERE_BLIZZARD`, `PASS_AVALANCHE_BLOCKAGE`, `TROOP_REINFORCEMENT_SURGE`, `AIRLIFT_CONTINGENCY`.
  - Interactive sliders for temperature drop, pass closures, and troop surges.
  - Before-and-after operational comparison table ($\Delta$ Stockouts, $\Delta$ DoS, $\Delta$ Lift Tonnage).
  - Recommended response action generator.
- [x] Implement IoT Sensor Telemetry Simulator:
  - Telemetry generation for fuel bladder temperatures, anti-waxing heaters, and cryo-cooler plasma chambers.
  - Discrepancy detection alerting on physical vs book stock differences (fuel leak/pilferage alerts).
- [x] **Phase 5 Checkpoint:** Verify complete end-to-end user workflows, 55/55 pytest tests passing (100%), 0 build errors in 15.5s, update documentation, create commit.


---

## Phase 6: Quality Assurance, Security & Performance Hardening
**Target:** Production-grade reliability, test coverage, and security compliance.

- [ ] Execute comprehensive automated test suite (pytest unit + integration tests).
- [ ] Test frontend production build (`npm run build`) ensuring zero TypeScript compilation or lint errors.
- [ ] Validate API inputs using strict Pydantic v2 schemas; verify predictable HTTP error codes (400, 404, 422, 500).
- [ ] Security audit: verify zero committed secrets, safe default configurations, and CORS boundary protection.
- [ ] Verify accessibility across all screens in both Dark and Light tactical themes (contrast $\ge 4.5:1$).
- [ ] Author `TESTING.md` documenting all executed tests, benchmarks, and coverage figures.
- [ ] **Phase 6 Checkpoint:** Update all state documents, resolve any defects, create Git checkpoint.

---

## Phase 7: SIH Demonstration & Delivery Package
**Target:** Flawless local demonstration package, jury walkthrough runbook, and presentation assets.

- [ ] Create one-click launcher script (`demo.py` / `start.ps1`) for seamless zero-config startup.
- [ ] Author production `README.md` with architectural diagrams, feature-to-requirement mapping, and quickstart instructions.
- [ ] Create safe example environment file (`.env.example`).
- [ ] Document SIH Jury Presentation Walkthrough:
  - Step-by-step 3-minute click-path demonstrating core problem solution.
  - Replay of real mountain pass closure and automated air-bridge response.
  - Offline field voucher entry and live synchronization demonstration.
  - Forecast evaluation metrics and explainability breakdown.
- [ ] Document known limitations and future military operational roadmap.
- [ ] **Phase 7 Exit & Delivery:** Final project sign-off and Git release tag.
