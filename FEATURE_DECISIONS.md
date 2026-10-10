# Feature Decisions & Comparative Evaluation Matrix

**Document Status:** Approved Baseline (Phase 0)  
**Problem Statement:** Smart India Hackathon 2026 — PS 26251 (*Indian Army — Predictive Logistics & Forward Supply Chain*)

---

## 1. Feature Comparison Matrix

The table below contrasts the technical implementation of key logistics capabilities across the four candidate source repositories and outlines the strategic decision for our integrated application.

| Capability / Feature Area | Repo 1 (`Subodh-17`) | Repo 2 (`SupplyFlow`) | Repo 3 (`Mistique707`) | Repo 4 (`ILOG-SHAKTI`) | Integrated Architecture Decision | Rationale & Evidence |
|---|---|---|---|---|---|---|
| **Demand Forecasting Architecture** | Statistical EWMA + trend; Random Forest challenger sidecar | Quantile `HistGradientBoostingRegressor` ($P_{10}, P_{50}, P_{90}$) | LightGBM Mean + $P_{90}$ with lag features (14/21/28 d) | Fictional client-side linear sliders | **Adopt & Harmonize:** Multi-Quantile Gradient-Boosted Forecaster ($P_{10}, P_{50}, P_{90}$) with walk-forward WAPE/MAE backtesting + Statistical baseline fallbacks. | Combines the mathematical rigor of Repo 2 and lag robustness of Repo 3 with Repo 1's transparent confidence metric. |
| **Operational Geography & Terrain** | Abstract grid coordinates | Dynamic slope gradient & surface friction formula | Real OSM road graph + Copernicus 90m DEM + BRO pass closures | Real Northern Command / XIV Corps military nodes (MGRS 43S EU) | **Adopt & Synthesize:** Northern Command / XIV Corps tactical network (Leh, Siachen, DBO, Galwan, Dras, Chushul) with physical slope-grade resistance and pass monitoring. | Combines military operational authenticity (Repo 4) with physical slope friction formulas (Repo 2) and real pass data (Repo 3). |
| **Fleet & Route Optimization** | Greedy capacity heuristic | Google OR-Tools Multi-Depot CVRPTW | Google OR-Tools Multimodal (Trucks, Mules, Helicopters, Airdrops) | Interactive load builder with altitude penalty | **Adopt & Enhance:** Google OR-Tools Multimodal Fleet Optimizer with high-altitude engine/payload de-rating and daylight transit windows. | Pure truck routing is operationally unrealistic for high-altitude passes. Multimodal fallback to helicopters/mules (Repo 3) and altitude de-rating (Repo 4) are vital. |
| **Military Indent & Requisition Workflow** | None | None | Movement orders CSV export only | Formal IAF-Z-2096 military voucher with priority & offline mesh | **Adopt:** Full IAF-Z-2096 Indent Management module with cryptographic offline voucher queuing and printable dispatch slips. | Crucial for realistic Indian Army standard operating procedures (SOP). Sets our project apart from civilian commercial logistics. |
| **Offline-First Field Capability** | None | None | Standalone bilingual (EN/HI) PWA (`/field/`) with Service Worker | Mock offline UI flag | **Adopt & Modernize:** Lightweight bilingual (English / हिंदी) offline field app with service worker, local audit storage, and idempotent sync. | Directly solves the SIH requirement for forward posts operating in VSAT/connectivity shadow zones. |
| **Cold-Chain & Sensor Discrepancy Monitoring** | Simulated ESP32/RFID pallet update script | Simulated alert flags | Tank sensor telemetry with fuel leak/pilferage detection | Medical cryo-plasma and fuel heating core telemetry | **Adopt & Synthesize:** Unified telemetry ingestion engine detecting physical vs book stock discrepancies (fuel leaks) and thermal excursions. | Bridges operational physical inventory with predictive digital twins. |
| **What-If Disruption Simulator** | Sliders for demand, weather, road, vehicle availability | 5 discrete operational disruption scenarios with before/after deltas | Historical replay of 2025 Zoji La winter disturbance | Interactive pass incident toggles | **Adopt & Enhance:** Disruption Simulator offering 5 extreme scenarios with quantitative before/after operational deltas and recommended response. | High demonstration value for SIH jury, proving system resilience under extreme disruptions. |
| **Decision Explainability** | "Why this recommendation" and "Why not alternate route" | Feature attribution tags | SHAP explainability notes | Tactical justification logs | **Adopt:** Multi-layered explainability cards breaking down priority score factors, route choice trade-offs, and disclaimer of decision support. | Prevents "black-box" AI skepticism; critical for military decision-makers. |

---

## 2. Adopted Features (With Justifications)

1. **Quantile Gradient-Boosted Demand Forecaster ($P_{10}, P_{50}, P_{90}$):**
   - *Source:* Derived from Repo 2 (`SupplyFlow`) and Repo 3 (`forward-logistics`).
   - *Justification:* Standard single-point regression models cannot plan safety buffers for high-altitude survival. Predicting $P_{10}$ (lean burn), $P_{50}$ (expected median), and $P_{90}$ (tactical surge) allows planners to hold rational, weather-adjusted safety stock.
   - *Verification:* Measured using rolling walk-forward time-series cross-validation on synthetic historical records, outputting genuine WAPE, MAE, and RMSE against a rolling average baseline.

2. **Multimodal Fleet Optimizer with High-Altitude De-rating (Google OR-Tools):**
   - *Source:* Derived from Repo 3 (`forward-logistics`), Repo 2 (`SupplyFlow`), and Repo 4 (`ILOG-SHAKTI`).
   - *Justification:* In extreme Himalayan terrain, when a mountain pass is severed by an avalanche, road trucks cannot pass. The system must automatically schedule contingency air-bridges (IAF Mi-17 V5 / ALH Dhruv) or mule transport, while calculating payload loss due to thin air above 3,500m MSL.
   - *Verification:* Solver tests confirming vehicle capacity constraints, altitude de-rating penalties, time window feasibility, and air-bridge activation when road passes are closed.

3. **Strategic Mountain Pass Passability & BRO Monitor:**
   - *Source:* Derived from Repo 4 (`ILOG-SHAKTI`) and Repo 3 (`forward-logistics`).
   - *Justification:* Passes like Zojila, Khardung La, and Chang La are the sole lifelines for Ladakh and Siachen. Modeling pass states (`OPEN`, `CHAINS_REQD`, `ONE_WAY_TIMED`, `CLOSED_BLIZZARD`, `CLOSED_AVALANCHE`) grounds the entire supply chain in reality.
   - *Verification:* Dynamic state toggle tests verifying that closing a pass updates route impedance, triggers alerts, and redirects shipments.

4. **IAF-Z-2096 Indent Requisition & Offline Voucher Queuing:**
   - *Source:* Derived from Repo 4 (`ILOG-SHAKTI`).
   - *Justification:* Defense logistics operates on strict administrative accountability. Field commanders requisition supplies using IAF-Z-2096 vouchers with priority ratings (`OP_IMMEDIATE`, `PRIORITY`, `ROUTINE`).
   - *Verification:* End-to-end form submission, SHA-256 hash generation, and offline queue transmission upon link restoration.

5. **Bilingual (English / Hindi) Offline Field PWA:**
   - *Source:* Derived from Repo 3 (`forward-logistics`).
   - *Justification:* Indian Army jawans and storekeepers in forward posts often operate with intermittent connectivity and benefit from bilingual interfaces for rapid, error-free stocktaking.
   - *Verification:* Offline audit test in browser disconnecting network, saving stock count, and verifying local persistence.

6. **Explainable Decision Support Cards:**
   - *Source:* Derived from Repo 1 (`Predictive_Logistics_SIH_26251`).
   - *Justification:* Decision makers must understand *why* an item is at risk (days of cover, stock deficit, route friction, lead time) and *why* a particular route was chosen over alternatives.
   - *Verification:* Asserting presence and numerical accuracy of explanation deltas in API responses.

---

## 3. Modified & Improved Features

1. **Topographic Physics Model:**
   - *Original Implementation (Repo 2):* Calculated basic slope and applied arbitrary multipliers.
   - *Improvement:* Enhanced to integrate elevation gain across verified Northern Command axes (Leh–Khardung La–Nubra–Siachen Base Camp; Srinagar–Sonamarg–Zojila–Kargil–Leh) with road classification friction (`HIGHWAY`, `MOUNTAIN_ROAD`, `UNPAVED_TRACK`) and weather degradation.

2. **Dual-Theme Tactical UI Design:**
   - *Original Implementations:* Repo 1 provided Dark/Light WCAG contrast; Repo 4 provided military styling (`drab`, `steel`, `khaki`).
   - *Improvement:* Harmonized into an ultra-premium dual-mode tactical design system combining Repo 4's authentic military typography and MGRS markers with Repo 1's accessible WCAG AA contrast, smooth transitions, and responsive layout.

3. **Database Architecture & Portability:**
   - *Original Implementations:* Repo 1 and Repo 2 required a running PostGIS instance; Repo 3 used single-file SQLite; Repo 4 had no database.
   - *Improvement:* Built with a dual-mode database engine: native PostgreSQL/PostGIS support for production deployment, with a self-contained SQLite / spatial fallback ensuring that judges or developers can run the entire system locally without requiring complex external database services.

---

## 4. Rejected Features (With Reasons)

1. **Black-box "AI Magic" Marketing Claims:**
   - *Rejected From:* Common hackathon patterns claiming "autonomous AI generals" or unverified neural networks.
   - *Reason:* Military command software requires deterministic predictability, auditability, and explainability. Pure rule-based solvers (OR-Tools) and statistical/gradient-boosted quantile regressions are operationally sound and verifiably tested. All recommendations are explicitly presented as advisory decision support.
2. **Next.js 15 Full-Stack SSR Monorepo Overhead:**
   - *Rejected From:* Repo 2 (`SupplyFlow`).
   - *Reason:* A tactical operations dashboard requires responsive client-side interactivity, fast local rendering, and direct REST API communication. Next.js App Router adds heavy Node server runtime dependencies that complicate local hackathon execution and portable offline deployment. Vite + React 18 SPA delivers faster load times, cleaner separation of concerns, and instant local launching.
3. **Fictional Abstract Coordinate Systems:**
   - *Rejected From:* Repo 1 (`Predictive_Logistics_SIH_26251`).
   - *Reason:* Abstract test grids (`Base_01`, `Forward_01` on arbitrary axes) lack defense credibility. Replacing them with authentic Northern Command nodes (Leh, Dras, Kargil, Siachen, DBO, Chushul) provides genuine domain relevance while strictly using public geographic landmarks without sensitive troop data.
