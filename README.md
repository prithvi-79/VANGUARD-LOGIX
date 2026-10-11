# VANGUARD-LOGIX
### Indian Army Forward Supply Chain & Predictive Logistics Engine
**Smart India Hackathon 2026 — Problem Statement 26251**  
*Ministry of Defence (MoD) / Defence Services Staff College (DSSC)*  
*Operational Theater: Northern Command XIV Corps (Ladakh, Kargil & Siachen Sectors)*

---

[![Tests: 67/67 Passing](https://img.shields.io/badge/Tests-67%2F67%20Passing%20(100%25)-success?style=for-the-badge&logo=pytest)](TESTING.md)
[![TypeScript: Strict Mode](https://img.shields.io/badge/TypeScript-Strict%20Mode-blue?style=for-the-badge&logo=typescript)](frontend)
[![Python: 3.12+](https://img.shields.io/badge/Python-3.12%2B-blue?style=for-the-badge&logo=python)](backend)
[![Framework: FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.143-009688?style=for-the-badge&logo=fastapi)](backend)
[![Frontend: React 18 + Vite](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react)](frontend)
[![Optimization: Google OR-Tools](https://img.shields.io/badge/Solver-Google%20OR--Tools-EA4335?style=for-the-badge&logo=google)](backend/app/services/optimizer.py)
[![Accessibility: WCAG AA](https://img.shields.io/badge/Accessibility-WCAG%20AA%20Compliant-green?style=for-the-badge)](TESTING.md)
[![Zero-Config: SQLite + PostGIS](https://img.shields.io/badge/Database-Dual--Mode%20Zero--Config-orange?style=for-the-badge)](backend/app/core/database.py)

---

## 1. Executive Summary & Defense Operational Challenge

Forward combat formations in the **Northern Command XIV Corps theater** (encompassing Leh, Srinagar, Thoise Air Base, Siachen Glacier, and the Line of Actual Control up to Daulat Beg Oldi at 5,065m MSL) operate under the world's most severe logistical constraints:

1. **Extreme Sub-Zero Winter Environments:** Operating temperatures plummeting to $-35^\circ\text{C}$ to $-50^\circ\text{C}$, accelerating fuel gelatinization and spiking daily kerosene/diesel burn rates by over $2.5\times$.
2. **Topographic Altitude Payload Degradation:** Heavy internal combustion engines experience a $10\%$ power loss per $1,000\text{m}$ elevation rise above $3,000\text{m}$ MSL; transport helicopters (Mi-17 V5) experience a $15\%$ rotor lift degradation per $1,000\text{m}$, requiring dynamic payload de-rating.
3. **Mountain Pass Choke Points:** Critical arterial passes (Zoji La, Khardung La, Chang La, Rohtang, Marsimik La) suffer unpredictable snow-avalanche closures, severing road axes and necessitating immediate tactical air-bridge allocation.
4. **Himalayan VSAT Communication Shadows:** Forward posts in glaciated gorges frequently face severed satellite connectivity, demanding an offline-first resilient architecture capable of cryptographic client signing and automated batch reconciliation.

**VANGUARD-LOGIX** solves these challenges by combining **Quantile Machine Learning Demand Forecasting ($P_{10}/P_{50}/P_{90}$)**, **Empirical Topographic Terrain Physics ($R_g$)**, **Constrained Multimodal Fleet Optimization (CVRPTW via Google OR-Tools)**, **Cryptographic Military Indent Vouchers (IAF-Z-2096)**, and a **Bilingual Offline Field PWA** into a mission-critical, explainable decision-support engine.

---

## 2. 7-Stage Tactical Decision Pipeline

Every logistics recommendation in VANGUARD-LOGIX moves through a rigorous, auditable operational pipeline:

```
[1. DATA]       -> Northern Command XIV Corps inventory ledgers, BRO pass sensors, IoT fuel bladder telemetry
      |
[2. FORECAST]   -> Quantile HistGradientBoosting ($P_{10}/P_{50}/P_{90}$) with walk-forward WAPE validation
      |
[3. RISK]       -> Elevation-scaled burn multiplier & Days-of-Supply (DoS) burn-down depletion trajectories
      |
[4. PRIORITY]   -> 0–100 Multi-attribute weighted ranking (Urgency, Deficit, Class, Lead Time, Route, Weather)
      |
[5. ALLOCATION] -> Multimodal fleet assignment (ALS trucks, snowcats, Mi-17 V5, animal transport)
      |
[6. ROUTE]      -> CVRPTW solver with altitude payload de-rating & strict 0600-1700 daylight window checks
      |
[7. DECISION]   -> Causal explainability trees, counterfactual trade-offs & Indian Army ASC doctrine citations
```

---

## 3. System Architecture

```mermaid
graph TB
    subgraph Frontend ["Tactical Frontend Layer (React 18 + Vite + TypeScript)"]
        UI["Tactical Command Center (Dual-Theme WCAG AA)"]
        GIS["Tactical GIS Sector Map (WGS-84/MGRS Topographic ridges)"]
        PWA["Bilingual Offline Field PWA (English / हिंदी)"]
        SIM["What-If Disruption Simulator (5 Presets)"]
        IOT["IoT Cold-Chain & Fuel Bladder Monitor"]
    end

    subgraph API ["FastAPI 0.143 REST Gateway"]
        E_MAP["/api/locations, /api/routes, /api/passes"]
        E_PRED["/api/forecast, /api/risk, /api/priority"]
        E_OPT["/api/optimize, /api/terrain, /api/explain"]
        E_IND["/api/indents, /api/disruption, /api/telemetry"]
    end

    subgraph Engines ["Pure Stateless Dataclass Intelligence Engines"]
        ENG_FC["Quantile Forecaster (HistGradientBoosting P10/P50/P90)"]
        ENG_RISK["Inventory Risk & Elevation Burn-Down Engine"]
        ENG_PHYS["Slope Grade Resistance & Terrain Physics Engine (Rg)"]
        ENG_OPT["Multimodal CVRPTW Solver (Google OR-Tools)"]
        ENG_EXP["Causal Decision Trees & Doctrine Compliance Engine"]
        ENG_DISR["What-If Disruption Simulator Engine"]
    end

    subgraph Persistence ["Dual-Mode Database Architecture"]
        DB_POSTGIS[("Production PostgreSQL 16 + PostGIS")]
        DB_SQLITE[("Zero-Config SQLite Portable Fallback (vanguard.db)")]
    end

    UI --> API
    GIS --> API
    PWA --> API
    SIM --> API
    IOT --> API

    E_MAP --> Engines
    E_PRED --> Engines
    E_OPT --> Engines
    E_IND --> Engines

    Engines --> DB_SQLITE
    Engines -.-> DB_POSTGIS
```

---

## 4. Key Feature Modules

### 4.1 Tactical GIS Sector Map
- Self-contained SVG topographic map of Northern Command XIV Corps (MGRS Zone 43S/44R).
- 10 logistics nodes: 3 Base Depots (Leh, Srinagar, Thoise) and 7 Forward Combat Outposts (Siachen Base Camp, Kumar Post 4,876m, DBO 5,065m, Galwan Valley PP-14 Axis, Dras Sector, Chushul, Demchok).
- 9 strategic supply corridors with animated convoy radar pulses.
- Real-time elevation profile cross-section chart up to 5,359m MSL.

### 4.2 Border Roads Organisation (BRO) Pass Monitor
- Strategic choke point control panel for Zoji La, Khardung La, Chang La, Rohtang, and Marsimik La.
- Real-time temperature sensors, snow accumulation depths, reopen estimates, and BRO detachments (Projects Beacon, Himank, Deepak).
- Interactive status toggles (`OPEN`, `RESTRICTED_CONVOY`, `CLOSED_BLIZZARD`, `CLOSED_AVALANCHE`) with live downstream route propagation.

### 4.3 Topographic Terrain Physics & Payload De-Rating Engine
- Empirical road slope grade resistance formula:
  $$R_g = 1.0 + 0.035|\theta| + 0.002|\theta|^2$$
- Surface friction factors: Highway (1.00), Mountain Road (1.25), Unpaved Track (1.55), Glacial Trail (1.85).
- High-altitude payload de-rating:
  $$\text{Effective Payload} = \text{Nominal Payload} \times \left(1.0 - \max\left(0, \frac{\text{Elevation} - 3000}{10000}\right)\right)$$

### 4.4 Quantile Demand Forecaster ($P_{10}/P_{50}/P_{90}$)
- Quantile regression models capturing demand asymmetry:
  - $P_{10}$: Conservative baseline consumption.
  - $P_{50}$: Expected median operational demand.
  - $P_{90}$: Tactical surge / harsh winter storm consumption spike.
- Walk-forward WAPE validation benchmark ($9.15\%$), beating naive rolling average baselines.
- Relative supply criticality weighting across Indian Army ASC/AOC Classes I–V (POL Class III survival imperative = 1.00).

### 4.5 Multimodal Fleet Routing & Allocation Optimizer (CVRPTW)
- Multi-vehicle dispatch optimization powered by Google OR-Tools.
- Enforces strict daylight transit windows (0600–1700 hrs) to eliminate high-risk nocturnal Himalayan mountain convoys.
- Automatic air-bridge trigger: When ground passes close, critical demands automatically route to Mi-17 V5 tactical airlift sorties.

### 4.6 Causal Decision Explainability Engine
- Full transparency: Every priority rank and modal recommendation provides a causal factor breakdown tree.
- Counterfactual trade-off analysis (e.g. why road convoy was deferred in favor of tactical airlift).
- Military doctrine compliance citations (Army Service Corps Logistics Manual *ASC-LOG-2026-CH7*).

### 4.7 IAF-Z-2096 Requisition Workflow & Movement Orders
- Digital military indent lifecycle with unique voucher numbers (`VOU-2026-XXXX`).
- Cryptographic SHA-256 non-repudiation signatures computed over officer credentials, items, and timestamps.
- Printable formal tactical dispatch slips (`window.print()`).
- Downloadable CSV movement orders export for convoy drivers and staging post dispatchers.

### 4.8 Bilingual Offline Field PWA (`/field`)
- Dedicated field stocktaking view fully localized in English and Hindi (`हिंदी`).
- Caches UI and assets using Service Workers (`sw.js`) and stores indents in LocalStorage.
- "Simulate No Signal" toggle demonstrating offline operation in glaciated satellite dead zones.
- Client-side SHA-256 signing via Web Crypto API and idempotent batch sync (`POST /api/indents/sync`).

### 4.9 What-If Disruption Scenario Simulator
- 5 defense presets: `BASELINE`, `SEVERE_BLIZZARD`, `PASS_AVALANCHE_BLOCKAGE`, `TROOP_REINFORCEMENT_SURGE`, `AIRLIFT_CONTINGENCY`.
- Interactive stress sliders: Sub-zero temperature drop, pass closures, headcount surges (+60%), and fleet availability degradation.
- Real-time operational impact calculation: $\Delta$ Days-of-Supply drop, $\Delta$ stockouts, emergency lift tonnage, and Mi-17 sorties.

### 4.10 IoT Cold-Chain & Fuel Bladder Telemetry Monitor
- Real-time sensor telemetry: 50,000L Arctic Diesel fuel bladder volume and heating blankets (+4.5°C).
- Medical plasma cryo-cooler chambers (-24°C) with temperature excursion alerts (> -18°C).
- Automated book-stock vs physical sensor discrepancy detection (-2,150L / -14.8% anomaly) flagging leaks and punctures.
- Anomaly injection endpoint (`POST /api/telemetry/simulate-anomaly`) for live hackathon jury demonstrations.

---

## 5. Problem Statement Traceability Matrix

| Requirement ID | Operational Requirement Description | VANGUARD-LOGIX Implementation Module | Verification Status |
|---|---|---|:---:|
| **P0-1** | Northern Command XIV Corps GIS & Outpost Mapping | `TacticalGISMap.tsx`, `Location` model | **100% VERIFIED** |
| **P0-2** | Days-of-Supply (DoS) & Burn-Down Trajectories | `inventory_risk.py`, `InventoryRegisters.tsx` | **100% VERIFIED** |
| **P0-3** | Topographic Slope Physics ($R_g$) & Pass Choke Points | `terrain.py`, `PassMonitor.tsx` | **100% VERIFIED** |
| **P0-4** | High-Altitude Payload De-Rating Calculator | `fleet.py`, `FleetReadiness.tsx` | **100% VERIFIED** |
| **P1-1** | Quantile Demand Forecasting ($P_{10}/P_{50}/P_{90}$) | `forecasting.py`, `PredictiveOptimization.tsx` | **100% VERIFIED** |
| **P1-2** | Multimodal Fleet Optimization (CVRPTW OR-Tools) | `optimizer.py`, `FleetOptimizer` component | **100% VERIFIED** |
| **P1-3** | Causal Explainability & Military Doctrine Citations | `explainability.py`, Decision Drawer | **100% VERIFIED** |
| **P1-4** | IAF-Z-2096 Requisitions & SHA-256 Integrity | `indents.py`, `MilitaryIndents.tsx` | **100% VERIFIED** |
| **P2-1** | Bilingual Offline Field PWA (English / हिंदी) | `FieldStockPWA.tsx`, `sw.js`, `manifest.json` | **100% VERIFIED** |
| **P2-2** | What-If Disruption Wargaming Simulator | `disruption.py`, `DisruptionSimulator.tsx` | **100% VERIFIED** |
| **P2-3** | IoT Telemetry & Fuel Bladder Leak Detection | `telemetry.py`, `TelemetryMonitor.tsx` | **100% VERIFIED** |
| **P2-4** | Dual-Mode Database (PostGIS + SQLite Zero-Config) | `database.py`, `seed_data.py` (seed=26251) | **100% VERIFIED** |

---

## 6. Quickstart & Demonstration Runbook

### Prerequisites
- Python 3.12+ (Python 3.14.4 verified)
- Node.js v20+ (Node.js v24.20.0 LTS verified)
- No external database required &mdash; runs out of the box on zero-configuration SQLite.

### One-Click Launch (Windows)

#### Option A: PowerShell Launcher (Recommended)
```powershell
.\run_dev.ps1
```

#### Option B: Windows Batch Launcher
Double-click `run_dev.bat` or run in terminal:
```cmd
run_dev.bat
```

#### Option C: Python CLI Launcher
```bash
python demo_launcher.py
```

### Manual Launch

#### Terminal 1 — Backend API Server
```bash
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Terminal 2 — Tactical Frontend
```bash
cd frontend
npm run dev -- --host
```

### Service Endpoints
- **Tactical Command Center:** [http://localhost:5173](http://localhost:5173)
- **Bilingual Offline Field PWA:** [http://localhost:5173/#field](http://localhost:5173/#field)
- **Interactive OpenAPI / Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check & Diagnostics:** [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## 7. Automated Verification & Quality Assurance

VANGUARD-LOGIX includes an exhaustive automated verification test suite:

```bash
# Run complete test suite (67 tests across 11 files)
python -m pytest backend/tests -v

# Run end-to-end API sweep contract tests (12 tests)
python -m pytest backend/tests/test_api_sweep.py -v

# Run frontend TypeScript typecheck & production build
cd frontend && npm run build
```

### Verification Results:
- **Pytest Suite:** **67 / 67 Tests Passing (100%) in 11.14s**.
- **Frontend Production Build:** **2,490 modules bundled with 0 errors in 18.87s**.
- **Frontend Linter (`oxlint`):** **0 errors, 0 warnings**.
- **Accessibility:** **WCAG AA contrast compliant (&ge; 4.5:1) in both Dark and Light modes**.
- **Security Audit:** **0 hardcoded secrets, 100% parameterized queries**.

Detailed test logs and latency benchmarks are available in [`TESTING.md`](TESTING.md).

---

## 8. SIH Jury Presentation Guide

For step-by-step 3-minute and 5-minute hackathon jury presentation scripts, interactive scenario walkthroughs, and answers to tough technical defense questions, see the dedicated **[DEMO_RUNBOOK.md](DEMO_RUNBOOK.md)**.

---

## 9. License & Attribution

This software is developed for the **Smart India Hackathon 2026** (Ministry of Defence / DSSC).  
Implemented under a clean-room software engineering protocol from first principles.  
See [`LICENSES_AND_ATTRIBUTION.md`](LICENSES_AND_ATTRIBUTION.md) for full licensing and attribution details.
