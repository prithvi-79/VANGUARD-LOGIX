# Changelog & Milestone Record

All notable changes, milestones, and architectural checkpoints for **VANGUARD-LOGIX (Indian Army Predictive Logistics SIH Application)** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to strict phased milestone checkpoints.

---

## [Phase 0: Reconnaissance & Project Definition] — 2026-10-09

### Completed Milestones
- **Repository Reconnaissance:**
  - Cloned, extracted, and inspected all 4 source repositories in isolated scratch environment:
    1. `Subodh-17/Predictive_Logistics_SIH_26251` (Full-stack FastAPI + React 18 SPA + PostGIS).
    2. `jjayesh364/SupplyFlow` (Quantile HistGradientBoosting + OR-Tools CVRPTW + Next.js).
    3. `Mistique707/forward-logistics` (BRO Zoji La open data + multimodal OR-Tools + bilingual PWA).
    4. `SubhadeepAtta/ILOG-SHAKTI` (Northern Command XIV Corps doctrine + IAF-Z-2096 indents + pass monitor).
- **Requirements Verification:**
  - Formally verified Smart India Hackathon Problem Statement 26251 (*Indian Army — Predictive Logistics & Forward Supply Chain*, Ministry of Defence / DSSC).
  - Defined comprehensive functional (P0, P1, P2) and non-functional requirements in `REQUIREMENTS.md`.
- **Architectural Specification:**
  - Authored `ARCHITECTURE.md` establishing the decoupled engine pattern and dual-mode database strategy (PostgreSQL/PostGIS + SQLite).
  - Selected stack: React 18 + Vite 6 + TypeScript 5 (Frontend) and Python 3.12+ + FastAPI + Google OR-Tools + scikit-learn (Backend).
- **Feature Decisions & Strategy:**
  - Evaluated feature tradeoffs in `FEATURE_DECISIONS.md`.
  - Approved Quantile Forecaster ($P_{10}/P_{50}/P_{90}$), Multimodal OR-Tools solver with altitude de-rating, BRO Mountain Pass Monitor, and IAF-Z-2096 Indent workflow.
  - Rejected unnecessary Next.js SSR complexity and unverified black-box AI marketing claims.
- **Architectural Decision Records:**
  - Recorded ADR-001 through ADR-007 in `DECISIONS.md`.
- **Legal & Intellectual Property Compliance:**
  - Audited source licenses in `LICENSES_AND_ATTRIBUTION.md`.
  - Established a clean-room implementation policy honoring original authors' copyright by implementing concepts from first principles.
- **Implementation & QA Roadmap:**
  - Formulated phased roadmap (Phase 0 to Phase 7) in `IMPLEMENTATION_PLAN.md`.
  - Defined test matrix and execution runbook in `TESTING.md`.

---

## [Phase 1: Foundation & Core Architecture] — 2026-10-10

### Completed Milestones
- **Host Runtime Environment Provisioning:**
  - Installed and verified Node.js v24.20.0 LTS and npm 11.19.0.
  - Installed and configured Git CLI (MinGit v2.56.0.2).
  - Configured Python 3.14.4 scientific and backend environment (FastAPI 0.143, SQLAlchemy 2.1.4, aiosqlite, pydantic-settings, pytest 9.1.1, greenlet).
- **Backend Architecture & Dual-Mode Persistence:**
  - Implemented modular monorepo layout (`/backend` and `/frontend`).
  - Implemented dual-mode SQLAlchemy 2 async engine supporting PostgreSQL with PostGIS in production, with seamless zero-config fallback to SQLite (`sqlite+aiosqlite:///./vanguard.db`) and pure mathematical Haversine distance calculations.
  - Authored comprehensive SQLAlchemy models: `Location` (with MGRS coordinates and elevation), `SupplyItem` & `InventoryRecord` (ASC/AOC Classes I-V), `Route` & `StrategicPass` (with empirical topographic slope grade resistance $R_g$ and surface friction), `Vehicle` (with altitude payload de-rating), `IndentVoucher` (IAF-Z-2096 with SHA-256 verification), and `TelemetryRecord`.
  - Built deterministic synthetic generator (`seed=26251`) populating Northern Command XIV Corps defense theater (10 locations, 5 passes, 9 corridors, 12 supplies, 10 vehicles, 120 inventory ledgers).
  - Implemented FastAPI application factory, CORS middleware, global exception handlers, and endpoints for `/api/health`, `/api/db-status`, `/api/locations`, `/api/supplies`, `/api/inventory`, `/api/routes`, `/api/passes`, `/api/fleet`, and `/api/indents`.
- **Frontend Architecture & Tactical UI Design System:**
  - Scaffolded React 18 + Vite + TypeScript application with Tailwind CSS design tokens.
  - Implemented dual-theme provider (`tactical-dark` Command Center & `tactical-light` High-Contrast WCAG AA Mode).
  - Built tactical component foundation: `CommandHeader` (operational status ribbon, decision strip `DATA → FORECAST → RISK → PRIORITY → ALLOCATION → ROUTE → DECISION`), `CommandBriefing` (metric cards, BRO pass monitor with real-time pass condition toggles, locations table).
  - Configured Vite development proxy routing `/api` to port 8000.
- **Verification & QA Benchmarks:**
  - Executed automated backend unit test suite: **8 tests passed in 2.37s (100% pass rate, 0 warnings)**.
  - Executed frontend production build (`npm run build`): **0 TypeScript errors, clean bundle generation in 17.5s**.
  - Verified local database initialization and seeding on disk (`vanguard.db`).

## [Phase 2: Tactical Dashboard & UI] — 2026-10-10

### Completed Milestones
- **Tactical GIS Sector Map Component (`TacticalGISMap.tsx`):**
  - Built high-performance, self-contained SVG topographic map of Northern Command XIV Corps (WGS-84 / MGRS Zone 43S/44R projection).
  - Positioned 10 military logistics nodes (Bases: Leh, Srinagar, Thoise; Forward Outposts: Siachen Base Camp, Kumar Post 4,876m, DBO 5,065m, Galwan, Dras, Chushul, Demchok).
  - Topographic contour ridges across the Karakoram, Ladakh, and Zanskar mountain ranges.
  - Interactive route corridors with real-time status styling (solid cyan/green for OPEN, amber dashed for RESTRICTED, crimson dotted for CLOSED).
  - Animated convoy pulse radar tracking along active supply axes.
  - Mountain pass diamond markers with status indicators and quick-select interaction.
  - Interactive node & pass inspection drawer displaying live elevation, MGRS grid, troop PAX count, and critical stockout ledgers.
  - High-altitude elevation profile cross-section chart (AreaChart via Recharts) displaying elevation rise across the theater up to 5,359m MSL.
- **Border Roads Organisation (BRO) Pass Monitor (`PassMonitor.tsx`):**
  - Dedicated strategic choke point control panel for Zoji La, Khardung La, Chang La, Rohtang, and Marsimik La.
  - Displays real-time temperatures, snow accumulation depths, reopen estimates, and BRO detachments (Projects Beacon, Himank, Deepak).
  - Interactive status toggles allowing commanders to simulate blizzard closures or mark passes cleared by BRO with live downstream route propagation.
- **Inventory & Days-of-Supply Registers (`InventoryRegisters.tsx`):**
  - Searchable and filterable stock ledger audit across Army ASC/AOC Classes I–V.
  - Days-of-Supply countdown progress bars with color progression (CRITICAL <5d, WARNING <12d, NORMAL >12d).
  - Forward daily burn rate calculations and safety threshold monitors.
- **Multimodal Fleet Readiness & Altitude De-Rating Calculator (`FleetReadiness.tsx`):**
  - Comprehensive fleet register across road trucks, snowcats, tactical helicopters, and animal transport.
  - Dynamic interactive commander slider (3,000m to 6,000m MSL) demonstrating physics-based air density loss and payload envelope degradation ($1.0 - \max(0, (\text{elevation}-3000)/10000)$).
- **Operational Alerts & Cryptographic Indents Feed (`OperationalAlerts.tsx`):**
  - Live situational feed alerting on critical stockout risks, severed passes, and pending IAF-Z-2096 vouchers.
  - Cryptographic verification table displaying SHA-256 integrity signatures.
- **Tactical Decision Pipeline Modal (`DecisionFlowModal.tsx`):**
  - Interactive walkthrough of the 7-stage engine (`DATA → FORECAST → RISK → PRIORITY → ALLOCATION → ROUTE → DECISION`) detailing mathematical models and defense outputs.
- **Navigation & Integration (`App.tsx` & `CommandHeader.tsx`):**
  - Sticky tactical navigation tabs with live critical notification badges.
  - Clickable operational pipeline stepper.
  - Dual-theme support (Dark Command Center and High-Contrast Daylight Mode).
- **Verification & Build Benchmarks:**
  - Frontend production build (`npm run build`): **0 TypeScript errors, 2,483 modules bundled in 19.05s**.
  - Backend pytest suite: **8/8 unit tests passing in 3.03s (100%)**.

---

## [Phase 3: Logistics Business Logic & Risk Engines] — 2026-10-10

### Completed Milestones
- **Days-of-Supply (DoS) & Burn-Down Engine (`backend/app/services/inventory_risk.py`):**
  - Pure stateless mathematical dataclass engine computing DoS ($\text{Stock} / \text{Effective Rate}$).
  - High-altitude elevation burn multiplier: Class III heating/diesel fuel surges +35% per 1,000m above 3,000m MSL; Class I rations surges +10% per 1,000m; Class II surges +5%.
  - Safety stock deficit scoring and risk classification (`CRITICAL`, `WARNING`, `NORMAL`).
  - Multi-day forward burn-down simulation predicting exact day of safety breach and stockout.
  - REST endpoints: `GET /api/risk/evaluate` and `GET /api/risk/burn-down`.
- **Multi-Attribute Priority Scoring Engine (`backend/app/services/priority_scoring.py`):**
  - Composite 0–100 priority scoring combining 7 defense factors: Urgency/DoS (30%), Safety Deficit (15%), Class Criticality (15%), Lead-Time Pressure (10%), Route Feasibility (10%), Environmental Threat (10%), Headcount Vulnerability (10%).
  - Priority tier classification (`OP_IMMEDIATE` $\ge 80$, `HIGH` 65–79, `MEDIUM` 45–64, `ROUTINE` $<45$).
  - Automated transit mode recommendation (`ROAD`, `AIR_BRIDGE`, `ALL_TERRAIN`).
  - REST endpoints: `GET /api/priority/queue` (ranked descending dispatch queue) and `POST /api/priority/score` (ad-hoc requisition scoring).
- **Topographic & Route Slope Physics Engine (`backend/app/services/terrain.py`):**
  - Empirical road grade resistance formula: $R_g = 1.0 + 0.035|\theta| + 0.002|\theta|^2$.
  - Terrain surface friction multipliers (Highway 1.00x, Mountain Road 1.25x, Unpaved Track 1.55x, Glacial Snowcat Trail 1.85x).
  - Weather degradation multipliers (Normal 1.00x, Rain/Slush 1.20x, Snow/Ice 1.45x, Blizzard 3.50x).
  - Mountain pass choke-point severance detection triggering automated contingency fallback ("IAF Mi-17 V5 Tactical Air-Bridge Sortie / Airdrop").
  - REST endpoints: `GET /api/terrain/route-physics`, `GET /api/terrain/route-physics/{route_id}`, `POST /api/terrain/simulate`.
- **Frontend Strategic Intelligence Dashboard (`StrategicIntelligence.tsx`):**
  - Live priority scoring table with tier badges, 7-factor breakdown tags, and mode recommendations.
  - Interactive 14-day forward burn-down trajectory with elevation burn multipliers and day-by-day status badges.
  - Interactive topographic slope physics simulator with real-time sliders for slope ($\theta$), distance, surface classification, and weather degradation.
  - Integrated into main app via sticky navigation tab `Cpu Priority & Terrain Physics Engines`.
- **Verification & QA Benchmarks:**
  - Full automated backend test suite: **35/35 tests passing in 5.81s (100% pass rate, 0 failures, 0 warnings)**.
  - Frontend production build (`npm run build`): **0 TypeScript errors, 2,484 modules bundled in 1.56s**.
