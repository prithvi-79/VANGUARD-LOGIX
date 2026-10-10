# Testing Strategy, Test Log & Verification Results

**Project:** Indian Army — Predictive Logistics & Forward Supply Chain (SIH PS 26251)  
**System Name:** VANGUARD-LOGIX  
**Document Status:** Phase 0 Baseline  

---

## 1. Testing Philosophy & Verification Framework

Reliability in military decision-support systems is non-negotiable. Our verification strategy adheres to three strict principles:
1. **Never Claim Without Verifying:** No API endpoint, ML prediction, optimization run, or test suite is reported as working unless it has been explicitly executed and validated with reproducible logs.
2. **Pure Service Testability:** By designing the intelligence services (`forecasting.py`, `terrain.py`, `optimizer.py`, `inventory_risk.py`) as pure functions over dataclasses, unit tests run in milliseconds without requiring database spin-ups, mock networks, or flaky external services.
3. **Deterministic Testing:** All test fixtures and synthetic datasets use fixed random seeds (`seed=26251`) ensuring 100% deterministic, repeatable assertions.

---

## 2. Phase 0 Verification & Reconnaissance Audit

### 2.1 Repository Accessibility & Inspection Verification
| Target Repository | Branch | Method of Inspection | Result | Status |
|---|---|---|---|---|
| `Subodh-17/Predictive_Logistics_SIH_26251` | `main` | Full zipball extraction & tree audit | 100% inspected (2.5MB, 60+ files) | **PASSED** |
| `jjayesh364/SupplyFlow` | `main` | Full zipball extraction & tree audit | 100% inspected (1.2MB, 55+ files) | **PASSED** |
| `Mistique707/forward-logistics` | `main` | Full zipball extraction & tree audit | 100% inspected (3.8MB, 35+ files) | **PASSED** |
| `SubhadeepAtta/ILOG-SHAKTI` | `main` | Full zipball extraction & tree audit | 100% inspected (0.8MB, 30+ files) | **PASSED** |

### 2.2 System & Tooling Verification
- **Host Operating System:** Windows 11 (AMD64 architecture).
- **Python Runtime:** Python 3.14.4 verified (`C:\Users\Admin\AppData\Local\Python\bin\python.exe`).
- **Package Manager:** `winget` v1.29.380 verified; Chocolatey v2.6.0 inspected.
- **Git Version Control:** Automated installation initiated via `winget` for clean local repository initialization.

---

## 3. Comprehensive Verification Matrix for Implementation Phases

### 3.1 Phase 1 Tests (Foundation & Dual Database)
- [ ] `test_db_initialization`: Verify SQLAlchemy async engine initializes SQLite fallback database when PostgreSQL is absent.
- [ ] `test_seed_generator`: Verify synthetic Northern Command dataset generates expected counts (2 depots, 6 forward posts, 5 supply classes, 8 routes, 8 vehicles).
- [ ] `test_health_endpoints`: Verify `/api/health` returns HTTP 200 with database status, environment flags, and simulation clock.

### 3.2 Phase 2 Tests (Core UI & Tactical Layout)
- [ ] `test_frontend_typecheck`: Verify `npm run typecheck` passes with zero TypeScript errors under strict mode.
- [ ] `test_frontend_production_build`: Verify `npm run build` succeeds generating optimized assets in `dist/`.
- [ ] `test_theme_contrast`: Verify WCAG AA contrast ratio ($\ge 4.5:1$) for both Dark Command and Light Tactical themes.

### 3.3 Phase 3 Tests (Logistics Business Logic)
- [ ] `test_days_of_supply_calculation`: Verify $\text{DoS} = \text{Current Stock} / \text{Forward Daily Burn Rate}$.
- [ ] `test_risk_state_classification`: Verify threshold boundaries (`CRITICAL` if $\text{DoS} < 5$, `WARNING` if $\text{DoS} < 10$, `NORMAL` otherwise).
- [ ] `test_priority_scoring_weights`: Verify 0–100 weighted priority score matches exact formula and ranks urgent items first.
- [ ] `test_slope_grade_resistance`: Verify $R_g$ formula matches slope angles correctly and increases with steep gradients.
- [ ] `test_pass_closure_impedance`: Verify route impedance becomes infinite when a mountain pass is closed by avalanche.

### 3.4 Phase 4 Tests (Predictive & OR-Tools Optimization)
- [ ] `test_quantile_forecast_hierarchy`: Verify $P_{10} \le P_{50} \le P_{90}$ holds across all forecast horizons.
- [ ] `test_walk_forward_evaluation`: Assert WAPE and MAE metrics computed on hold-out validation set beat naive rolling average.
- [ ] `test_ortools_cvrptw_capacity`: Verify solved dispatch manifests never violate vehicle payload capacities.
- [ ] `test_altitude_payload_derating`: Verify vehicle safe capacity drops by expected percentage for posts above 3,500m MSL.
- [ ] `test_pass_closure_airbridge_fallback`: Verify closing Zoji La automatically schedules Mi-17 V5 tactical airlift for urgent stockouts.

### 3.5 Phase 5 Tests (Integration, Indents & PWA)
- [ ] `test_iaf_z_2096_indent_voucher`: Verify unique voucher generation, required military fields, and SHA-256 hash.
- [ ] `test_offline_field_sync`: Verify batch submission of queued vouchers updates stock ledger idempotently.
- [ ] `test_whatif_disruption_deltas`: Verify all 5 disruption scenarios return non-zero, mathematically correct before/after deltas.
- [ ] `test_iot_leak_detection`: Verify physical stock audit below sensor reading triggers a high-priority leak alert.

---

## 4. Test Execution Runbook

Once Phase 1 is initialized, automated tests can be executed via:

```bash
# Backend pytest suite (unit + integration)
pytest backend/tests -v

# Run with coverage report
pytest backend/tests --cov=app --cov-report=term-missing

# Frontend TypeScript strict check
cd frontend && npm run typecheck

# Full API contract sweep
python backend/scripts/api_sweep.py http://localhost:8000
```
