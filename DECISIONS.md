# Architectural Decision Records (ADR)

**Project:** Indian Army — Predictive Logistics & Forward Supply Chain (SIH PS 26251)  
**System Name:** VANGUARD-LOGIX  
**Document Status:** Approved Baseline (Phase 0)  

---

## ADR-001: Selection of React 18 + Vite SPA Over Next.js 15 SSR

### Context
Repository 2 (`SupplyFlow`) utilized Next.js 15 with App Router, while Repositories 1, 3, and 4 utilized React with Vite or standalone SPA bundles. Next.js introduces significant server-side runtime dependencies (Node.js backend process, heavy compilation overhead, SSR hydration requirements) that complicate local hackathon execution, container orchestration, and portable offline field packaging.

### Decision
Adopt **React 18 + Vite 6 + TypeScript 5** as a client-side Single Page Application (SPA), served by FastAPI / Nginx.

### Consequences
- **Positive:** Instant sub-second local dev startup; lightweight static bundle generation (`dist/`); zero Node.js server required in production; clean separation of concerns with backend REST API; ability to bundle static assets into an offline PWA.
- **Negative:** Search engine optimization (SEO) is not server-rendered (irrelevant for an internal military command intranet application).

---

## ADR-002: Dual-Mode Persistence Strategy (PostgreSQL + PostGIS & SQLite Fallback)

### Context
Repositories 1 and 2 relied heavily on PostgreSQL with the PostGIS spatial extension. While PostGIS provides spatial indexing (`GiST`, `ST_Distance`, `ST_Length`), requiring a running Dockerized or cloud PostgreSQL container presents a barrier during rapid local evaluation or offline hackathon jury presentations. Repository 3 demonstrated that SQLite with in-memory distance functions can run effortlessly on any developer workstation.

### Decision
Implement a **Dual-Mode Persistence Architecture** using SQLAlchemy 2.0 async. The default configuration automatically detects an available PostgreSQL/PostGIS database via `DATABASE_URL`. If no database is reachable, the backend gracefully degrades to a local SQLite database (`vanguard.db`) using pure mathematical Haversine and Euclidean distance calculations for route geometry.

### Consequences
- **Positive:** 100% portable zero-setup execution on any laptop running Python, while retaining full enterprise PostGIS capability for containerized production environments.
- **Negative:** Must maintain portable SQL queries and avoid proprietary PostGIS-only SQL dialect functions in core business logic.

---

## ADR-003: Pure Stateless Service Engines Pattern

### Context
In Repository 1 (`Subodh-17`), mathematical logic was encapsulated in `backend/app/services/` using pure Python dataclasses and functions without database session or HTTP request dependencies. This contrasted with Repository 2 where database sessions were deeply coupled into the forecasting and routing classes.

### Decision
Enforce the **Pure Stateless Engine Pattern**. All core algorithmic modules (`forecasting.py`, `terrain.py`, `optimizer.py`, `inventory_risk.py`, `simulation.py`, `explainability.py`) must operate strictly on in-memory dataclasses, returning pure results. Database retrieval and persistence are handled exclusively by endpoint handlers and repository layers.

### Consequences
- **Positive:** Instantaneous unit testing without mocking databases or network calls; zero test flakiness; high mathematical transparency and test coverage.
- **Negative:** Requires mapping between ORM database entities and engine dataclasses at the boundary.

---

## ADR-004: Quantile Gradient-Boosted Forecasting ($P_{10}, P_{50}, P_{90}$) Over Single-Point Regression

### Context
In extreme high-altitude defense environments, mean expected demand ($P_{50}$) is insufficient. If a severe blizzard occurs, fuel consumption for bukhari heaters spikes drastically; a safety buffer based on mean demand will lead to catastrophic forward outpost stockouts. Repository 2 introduced Quantile Gradient Boosting (`HistGradientBoostingRegressor`), while Repository 3 introduced a LightGBM P90 safety stock model.

### Decision
Adopt **Quantile Gradient-Boosted Trees** modeling three distinct prediction percentiles:
1. $P_{10}$ (Lean Burn): Minimum baseline consumption under mild weather conditions.
2. $P_{50}$ (Expected Median): Normal operational demand planning.
3. $P_{90}$ (Tactical Surge Buffer): High-risk extreme weather demand driving safety stock replenishment.
Include transparent walk-forward time-series validation metrics (WAPE, MAE, RMSE) and a moving-average baseline fallback.

### Consequences
- **Positive:** Mathematically sound safety stock buffers; handles non-linear weather covariates (freezing temperatures, snowfall); transparent and explainable.
- **Negative:** Slightly higher training time than simple exponential smoothing (though still < 3 seconds on standard CPU).

---

## ADR-005: Google OR-Tools Multimodal CVRPTW with High-Altitude De-rating

### Context
Civilian logistics solvers assume road transit with constant payload capacity. In the Northern Command theater (Ladakh/Siachen), road passes frequently close due to avalanches, requiring diversion to air-bridges (IAF Mi-17 V5) or mule transport. Furthermore, air density loss above 3,500m MSL de-rates truck and helicopter payload envelopes by 15% to 30%.

### Decision
Implement fleet dispatch optimization using **Google OR-Tools** solving Capacitated Vehicle Routing with Time Windows (CVRPTW), incorporating:
1. Dynamic altitude payload de-rating ($1 - \max(0, (\text{elevation} - 3000)/10000)$).
2. Daylight transit window enforcement (0600–1700 hrs).
3. Multimodal fallback: automatically dispatching tactical airlift or mule legs when road passes are severed.

### Consequences
- **Positive:** Defense-grade operational fidelity; handles disjunctive modal choices; produces actionable movement orders.
- **Negative:** Requires `ortools` library dependency; solve time is constrained with a strict 5-second timeout.

---

## ADR-006: Indian Army ASC/AOC Class I–V Doctrine & IAF-Z-2096 Indent Workflow

### Context
Repository 4 (`ILOG-SHAKTI`) established authentic military terminology: Northern Command XIV Corps, ASC/AOC supply classifications, and formal IAF-Z-2096 requisition vouchers with officer credentials. Civilian commercial logistics terms ("warehouse", "customer order", "e-commerce delivery") fail to resonate with defense evaluators.

### Decision
Standardize all data models, UI components, and workflows on **Indian Army Operational Doctrine**:
- Supply Classes: Class I (Rations), Class II (Clothing/General), Class III (POL / Arctic Diesel), Class IV (Defence Works), Class V (Ammunition).
- Tactical Nodes: Northern Command XIV Corps forward posts (Siachen, DBO, Galwan, Dras, Chushul) and base depots (Leh, Srinagar).
- Requisition Indents: IAF-Z-2096 voucher specification with cryptographic SHA-256 validation.

### Consequences
- **Positive:** Unrivaled operational credibility during hackathon evaluation.
- **Negative:** Requires precise domain vocabulary throughout the application.

---

## ADR-007: Bilingual (English / Hindi) Offline Field PWA

### Context
Forward military outposts in high-altitude glaciated sectors operate in VSAT/DDN communication shadow zones. Repository 3 featured a standalone bilingual PWA (`/field/`), and Repository 4 highlighted offline voucher storage. Forward post personnel need an intuitive, localized interface to audit stock and queue vouchers without internet connectivity.

### Decision
Implement a **Bilingual (English / हिंदी) Offline Field Progressive Web App** (`/field`):
- Service Worker caching enabling full offline loading.
- Local storage queuing of stock audits and requisition vouchers.
- Idempotent batch synchronization (`POST /api/indents/sync`) upon network restoration.

### Consequences
- **Positive:** Directly fulfills SIH intermittent connectivity requirements; accessible to field personnel; exceptional demonstration impact.
- **Negative:** Requires managing offline queue synchronization logic and idempotency keys.
