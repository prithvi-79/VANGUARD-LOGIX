# Repository Audit — Four Source Implementations for SIH PS 26251

**Audit Date:** 2026-10-09  
**Lead Auditor:** Senior Full-Stack Software Engineer & System Architect  
**Scope:** Complete source code inspection, architectural evaluation, data pipeline analysis, and feature audit of the four candidate repositories for Smart India Hackathon Problem Statement 26251 (*Indian Army — Predictive Logistics & Forward Supply Chain*).

---

## 1. Executive Summary & Reconnaissance Overview

All four repositories were successfully accessed, cloned/extracted, and inspected in full detail:

| Repository Identifier | Owner / Repository Name | Primary Language / Stack | Accessibility Status | Verified Origin & Intent |
|---|---|---|---|---|
| **Repo 1** | `Subodh-17/Predictive_Logistics_SIH_26251` | Python (FastAPI), React 18, PostgreSQL/PostGIS | Public, Fully Inspected | Full-stack upgrade of v3 prototype; emphasis on pure engines, explainable decisions, and automated tests. |
| **Repo 2** | `jjayesh364/SupplyFlow` | Python (FastAPI), Next.js 15, PostgreSQL/PostGIS | Public, Fully Inspected | High-altitude terrain modeling, OR-Tools CVRPTW optimizer, Quantile gradient boosted forecaster (P10/P50/P90). |
| **Repo 3** | `Mistique707/forward-logistics` | Python (FastAPI), React, SQLite, Open Data | Public, Fully Inspected | Grounded in real Himalayan open data (BRO Zojila closures, PPAC fuel sales); multimodal routing (truck/mule/heli); bilingual offline field PWA. |
| **Repo 4** | `SubhadeepAtta/ILOG-SHAKTI` | TypeScript, React 18, Vite 6, Tailwind CSS | Public, Fully Inspected | Deep Indian Army military doctrine (Northern Command XIV Corps, ASC/AOC Class I–V, IAF-Z-2096 indents, engine de-rating). |

---

## 2. Deep Dive: Repository 1 — `Subodh-17/Predictive_Logistics_SIH_26251`

### 2.1 Metadata & Architecture
- **Repository URL:** `https://github.com/Subodh-17/Predictive_Logistics_SIH_26251.git`
- **Frontend Stack:** React 18, Vite 5, TypeScript 5, Tailwind CSS 3, Recharts 2, Leaflet 1.9 / React-Leaflet 4.
- **Backend Stack:** Python 3.12, FastAPI, Pydantic 2, SQLAlchemy 2, GeoAlchemy2, psycopg 3, scikit-learn.
- **Database:** PostgreSQL 16 with PostGIS 3.4 spatial extension.
- **Directory Layout:** Clean monorepo split: `/backend` (routers, services, repository, models), `/frontend` (pages, components, state), `/iot-simulator`, `/db` (`schema.sql`, `seed.sql`), `/tests/e2e`.

### 2.2 Key Features & Implementations
1. **Decision Flow Pipeline:** Unifies the lifecycle into an intuitive visual strip: `DATA → FORECAST → RISK → PRIORITY → ALLOCATION → ROUTE → DECISION`.
2. **Pure Service Engines:** `backend/app/services/` contains pure mathematical functions over dataclasses without direct database coupling (`forecasting.py`, `terrain.py`, `routing.py`, `priority.py`, `allocation.py`, `simulation.py`). This allows rapid unit testing without mock databases.
3. **Priority Scoring (0–100):** Weighted multi-attribute scoring combining urgency ($30\%$), shortage volume ($15\%$), stock deficit ($15\%$), supply criticality ($15\%$), lead-time pressure ($10\%$), route risk ($10\%$), and vehicle transport capacity ($5\%$).
4. **Honest Explainability & Disclaimers:** Explicitly labels rule-based heuristics vs AI; displays "Why this recommendation?" and "Why not alternate routes?" breakdown.
5. **Simulated IoT Stream:** Dedicated stdlib Python script simulating ESP32/RFID pallet scans updating backend inventory with timestamped event logging.

### 2.3 Strengths
- Outstanding software engineering quality: pure functional services, clear interfaces, strict typing.
- Rigorous automated testing: 70 pytest unit/integration tests and extensive Playwright E2E suites (`e2e_playwright.py`, `e2e_ui_enhancements.py`, `e2e_v4_polish.py`).
- Accessible, polished dual-theme UI (WCAG AA compliant contrast in Dark and Light themes).
- Transparent failure recovery: backend background bootstrapping with retry loops; nginx reverse-proxy resilience.

### 2.4 Weaknesses & Gaps
- Demand forecasting relies primarily on statistical EWMA + trend; the Random Forest model is only a secondary challenger rather than an active multi-quantile regressor.
- Route coordinates are set in an abstract fictional grid rather than real Himalayan operational corridors.
- Fleet allocation lacks multimodal support (does not model helicopters, mule tracks, or airdrops).
- No offline mobile field application for disconnected posts.

---

## 3. Deep Dive: Repository 2 — `jjayesh364/SupplyFlow`

### 3.1 Metadata & Architecture
- **Repository URL:** `https://github.com/jjayesh364/SupplyFlow.git`
- **Frontend Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, MapLibre GL, Vector Mesh Renderer.
- **Backend Stack:** Python 3.12+, FastAPI, SQLAlchemy async, Pydantic, scikit-learn, Google OR-Tools.
- **Database:** PostgreSQL 18 with PostGIS 3.6 extension, Alembic migrations.
- **Directory Layout:** Turborepo-style structure: `apps/web/`, `services/api/`, `infrastructure/docker/`, `docs/architecture/`.

### 3.2 Key Features & Implementations
1. **Quantile Gradient-Boosted Demand Forecasting:** Uses `HistGradientBoostingRegressor` to predict $P_{10}$ (low burn), $P_{50}$ (expected median), and $P_{90}$ (tactical surge) demand envelopes. Evaluated with rolling walk-forward validation (reported WAPE = 9.15%, MAE = 11.99 units on synthetic benchmark).
2. **Topographic Physics & Grade Resistance:** Formal mathematical slope and friction modeling:
   $$\text{Grade Multiplier} = 1.0 + 0.035 \cdot |\theta| + 0.002 \cdot |\theta|^2$$
   Road surface factors (`HIGHWAY`: 1.0, `MOUNTAIN_ROAD`: 1.25, `UNPAVED_TRACK`: 1.55).
3. **Google OR-Tools Multi-Depot CVRPTW:** Multi-depot capacitated vehicle routing with strict daylight delivery windows (0600–1700 hrs).
4. **Resilient Weather Service:** Open-Meteo REST integration with TTL in-memory caching and deterministic offline Himalayan fallback.
5. **What-If Disruption Simulator:** 5 structured operational scenarios (`NORMAL`, `SEVERE_WEATHER`, `ROUTE_BLOCKAGE`, `DEMAND_SURGE`, `REPLENISHMENT_DISPATCH`) displaying quantitative operational deltas.

### 3.3 Strengths
- Exceptional mathematical and physical modeling of high-altitude logistics friction.
- Rigorous ML evaluation methodology (rolling walk-forward time series splits preventing target leakage).
- Integration of Google OR-Tools for genuine combinatorial optimization.
- Comprehensive system architecture blueprint and step-by-step jury demo runbook.

### 3.4 Weaknesses & Gaps
- Heavy architectural complexity: Next.js 15 App Router adds unnecessary server-side rendering overhead for a tactical operations dashboard compared to a streamlined Vite SPA.
- Hard dependency on an active PostgreSQL/PostGIS container; lacks lightweight in-memory/SQLite demonstration fallback for constrained environments.
- Lacks Indian Army specific military administrative workflows (no formal indent forms, army supply classes, or officer vouchers).

---

## 4. Deep Dive: Repository 3 — `Mistique707/forward-logistics`

### 4.1 Metadata & Architecture
- **Repository URL:** `https://github.com/Mistique707/forward-logistics.git`
- **Frontend Stack:** React, Vite, Leaflet, Recharts, Custom CSS.
- **Backend Stack:** Python 3.13, FastAPI, LightGBM, Google OR-Tools, SQLite.
- **Data Assets:** `data/real/zojila_closures.csv` (BRO reports 2020–2025), `data/real/ppac_statewise.csv` (PPAC fuel sales), `data/network.json` (Copernicus 90m DEM + OSM road graph).
- **Directory Layout:** Single root backend with static frontend build and offline PWA under `frontend/public/field/`.

### 4.2 Key Features & Implementations
1. **Grounded Real Himalayan Operational Data:** Uses real historical Border Roads Organisation (BRO) Zoji La opening/closing dates to calibrate pass closure forecasting rules (average fit error 2.8 days). Includes PPAC per-capita fuel consumption and DRDO high-altitude ration scales (4,088 kcal/man/day).
2. **Multimodal Fleet & Air-Bridge Routing:** OR-Tools solver dynamically balances multi-modal transport: heavy trucks on open highways, pack mules/porters on unpaved mountain tracks, and Mi-17 / ALH helicopter sorties or airdrops when passes are blocked.
3. **High-Altitude Payload De-Rating:** De-rates helicopter and vehicle payload envelopes based on destination elevation (combustion air density loss above 3,000m MSL).
4. **Self-Learning Loop & Continuous Adaptation:**
   - Field inventory audits generate observed daily burn rates.
   - Per-site correction factor adjusts base model forecasts.
   - Automated champion/challenger retraining promoted only when walk-forward test error improves.
5. **Bilingual Offline Field PWA:** Standalone Progressive Web App (`/field/`) in English and Hindi (हिंदी) with service worker offline queuing for VSAT-severed forward posts.
6. **Physical vs Book Stock Discrepancy Detection:** Flags tank sensor telemetry anomalies indicating fuel leaks or pilferage.
7. **Movement Orders Export:** Generates printable/loadable CSV dispatch orders.

### 4.3 Strengths
- Unrivaled domain fidelity grounded in real Ladakh geographic and meteorological datasets.
- Practical multimodal routing: seamlessly shifts from blocked road passes to helicopter air-bridges.
- Field-ready offline PWA with bilingual English/Hindi interface.
- One-click launcher (`demo.py`) that sets up dependencies, builds data, and opens the browser.

### 4.4 Weaknesses & Gaps
- Written in vanilla JavaScript JSX without TypeScript strict mode.
- Uses SQLite without spatial PostGIS vector indexing.
- Custom CSS interface lacks the modern tactical visual hierarchy, dark mode contrast, and refined component design of Repos 1 and 4.

---

## 5. Deep Dive: Repository 4 — `SubhadeepAtta/ILOG-SHAKTI`

### 4.1 Metadata & Architecture
- **Repository URL:** `https://github.com/SubhadeepAtta/ILOG-SHAKTI.git`
- **Frontend Stack:** React 18, Vite 6, TypeScript 5, Tailwind CSS 3, Lucide Icons.
- **Backend Stack:** None (client-side mock data and local reactive state).
- **Directory Layout:** Single frontend repository: `/src/components` (convoy, forecasting, inventory, layout, map, requisition, workflow), `/src/data`, `/src/types`.

### 5.2 Key Features & Implementations
1. **Strict Indian Army Doctrine & Nomenclature:**
   - Deployed theater: Northern Command (XIV Corps), covering Ladakh North, Siachen Sub-Sector, DBO (SSN Sector), Galwan KM-120, Dras/Tololing, and Chushul.
   - Military supply ledger: ASC/AOC Class I (Rations), Class II (Clothing/General), Class III (POL / Arctic Diesel), Class IV (Defence Works), Class V (Ammunition).
   - Real military fleet platforms: Ashok Leyland 4x4 (ALS 2.5T), Stallion 6x6 (5T), Hägglunds Bv-206 Snowcat (2T), IAF Mi-17 V5 (4T).
2. **Strategic Mountain Pass Passability Monitor:** Real-time monitoring of Zojila, Khardung La, Chang La, and Rohtang with snow depth, BRO clearing dozers, and military pass conditions (`OPEN`, `CHAINS_REQD`, `ONE_WAY_TIMED`, `CLOSED_BLIZZARD`, `CLOSED_AVALANCHE`).
3. **IAF-Z-2096 Requisition Indent Workflow:** Formal military voucher generation with priority grading (`OP_IMMEDIATE`, `PRIORITY`, `ROUTINE`), officer service numbers, justification logs, and printable tactical dispatch slips with SHA-256 verification hashes.
4. **Interactive Cargo Load Optimizer:** Interactive load builder with gross vehicle weight validation and altitude de-rating penalty calculation above 3,000m MSL.
5. **Tactical Military Visual Design:** Authentic utilitarian command center aesthetic (`steel`, `khaki`, `drab` tactical indicators, MGRS coordinates).

### 5.3 Strengths
- Authenticity and operational credibility from a military user's perspective.
- Thorough componentization of tactical workflows (Pass Monitor, Load Optimizer, Indent Form).
- Clean, strict TypeScript interfaces modeling military logistics entities.

### 5.4 Weaknesses & Gaps
- Entirely frontend-only: all calculations, forecasts, and routes are hardcoded in React state without a Python backend, ML pipeline, or persistent database.
- No automated unit or integration tests.
- Static vector map rather than interactive geospatial routing.

---

## 6. Synthesis & Strategic Feature Evaluation

| Capability / Dimension | Repo 1 (Subodh-17) | Repo 2 (SupplyFlow) | Repo 3 (Mistique707) | Repo 4 (ILOG-SHAKTI) | Target Integrated Application |
|---|---|---|---|---|---|
| **Architecture & Types** | FastAPI + React TS | FastAPI + Next.js TS | FastAPI + React JS | React TS (Frontend only) | **FastAPI + React 18 / Vite / TS** |
| **Database & GIS** | PostGIS + PostgreSQL | PostGIS + PostgreSQL | SQLite | Mock in-memory | **PostgreSQL + PostGIS (with SQLite fallback)** |
| **Forecasting Engine** | Statistical EWMA + RF | Quantile HistGB (P10/50/90) | LightGBM Mean + P90 | Client regression heuristic | **Quantile GB (P10/P50/P90) + Explainability** |
| **Route & Fleet Optimizer**| Heuristic Ranker | OR-Tools CVRPTW | OR-Tools Multimodal | Client Manifest Builder | **OR-Tools Multimodal (Truck/Mule/Air)** |
| **High-Altitude Physics** | Basic terrain score | Grade resistance formula | Copernicus DEM profile | Static altitude penalty | **Physical Grade Resistance + DEM + De-rating** |
| **Doctrine & Military Flow**| Generic Base/Forward | Generic Base/Forward | Fictional Ladakh nodes | Real Northern Command/XIV Corps | **Full Northern Command ASC/AOC Doctrine** |
| **Field Offline Capability**| Simulated IoT | None | Bilingual PWA (EN/HI) | Local storage vouchers | **Bilingual Offline Field PWA + IAF-Z Vouchers** |
| **What-If Simulation** | Demand/Road sliders | 5 Disruption Scenarios | Event replay (2025 snow) | Incident Simulator | **Integrated 5-Scenario Disruption Simulator** |
| **Explainability** | "Why this recommendation"| Feature attribution | SHAP notes | Justification logs | **Full Multi-Attribute Decision Explainability** |
| **Automated Testing** | 70 pytest + Playwright | 29 pytest | 22 pytest | 0 tests | **Comprehensive Pytest + Frontend Verification** |

---

## 7. Audit Conclusion & Recommendations

Each repository brings distinct, non-overlapping strengths:
- **Repo 1** provides the architectural blueprint: clean, decoupled FastAPI services, pure dataclass engines, decision-support flow, and automated test discipline.
- **Repo 2** provides the core mathematical rigor: quantile gradient-boosted demand forecasting (P10/P50/P90), walk-forward validation metrics, and formal topographic slope resistance formulas.
- **Repo 3** provides the operational reality: real BRO pass closure datasets, Copernicus elevation profiles, multi-modal OR-Tools routing (trucks, mules, helicopters), and a bilingual offline field PWA.
- **Repo 4** provides the military command authority: Northern Command XIV Corps operational theater, ASC/AOC Class I–V supply classifications, BRO pass monitor, IAF-Z-2096 requisition vouchers, and tactical UI styling.

Building ONE original, integrated application combining these elements will create an authoritative, operationally compelling solution for SIH Problem Statement 26251.
