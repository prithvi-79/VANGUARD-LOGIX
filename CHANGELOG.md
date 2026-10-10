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

---

## [Phase 2: Tactical Dashboard & UI] — Planned
- Northern Command interactive tactical GIS map and route visualization.
- Real-time Border Roads Organisation (BRO) pass monitor integration.
- Operational alerts ribbon and decision support flow.
