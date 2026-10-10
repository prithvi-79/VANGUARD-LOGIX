# Licenses, Attribution & Intellectual Property Policy

**Project:** Indian Army — Predictive Logistics & Forward Supply Chain (SIH PS 26251)  
**System Name:** VANGUARD-LOGIX  
**Document Status:** Approved Baseline (Phase 0)  

---

## 1. Source Repository License Audit

During Phase 0 reconnaissance, all four candidate repositories were verified to be publicly hosted on GitHub. Each repository was audited for licensing files (`LICENSE`, `COPYING`, `LICENSE.md`) and package metadata fields (`package.json`, `pyproject.toml`):

| Source Repository | Owner | License File Present? | Package Metadata License | Legal Copyright Status |
|---|---|---|---|---|
| `Predictive_Logistics_SIH_26251` | `Subodh-17` | None | None | Public viewable; All Rights Reserved by original author |
| `SupplyFlow` | `jjayesh364` | None | None | Public viewable; All Rights Reserved by original author |
| `forward-logistics` | `Mistique707` | None | None | Public viewable; All Rights Reserved by original author |
| `ILOG-SHAKTI` | `SubhadeepAtta` | None | None | Public viewable; All Rights Reserved by original author |

### Intellectual Property & Clean-Room Implementation Policy
Under GitHub's Terms of Service and international copyright law:
1. When source code is published publicly on GitHub without an explicit open-source license (such as MIT, Apache 2.0, or BSD), the public is granted the right to view and fork the code, but the author retains copyright.
2. Direct verbatim copying or reproduction of substantial code blocks is legally impermissible.
3. **Compliance Strategy:** Our integrated application (**VANGUARD-LOGIX**) follows a clean-room implementation approach:
   - We inspect and acknowledge the technical concepts, data structures, and algorithmic ideas from the four projects.
   - We independently implement all code, API schemas, engines, frontend components, and styling from first principles.
   - We give explicit conceptual attribution to the original innovators for their unique contributions.

---

## 2. Conceptual Attributions to Source Projects

| Innovation / Conceptual Contribution | Original Source Attributed | How Integrated in VANGUARD-LOGIX |
|---|---|---|
| **System Decision Flow & Explainability Layout** | `Subodh-17/Predictive_Logistics_SIH_26251` | Reimplemented as the core visual pipeline: `DATA → FORECAST → RISK → PRIORITY → ALLOCATION → ROUTE → DECISION` with WCAG AA dual-theme contrast. |
| **Quantile Gradient-Boosted Forecaster & Slope Grade Physics** | `jjayesh364/SupplyFlow` | Reimplemented using scikit-learn `HistGradientBoostingRegressor` ($P_{10}/P_{50}/P_{90}$) and empirical mountain slope friction formulas. |
| **Multimodal OR-Tools Solver, BRO Pass Rules & Bilingual PWA** | `Mistique707/forward-logistics` | Reimplemented multimodal CVRPTW (truck/mule/helicopter), BRO pass closure thresholds, and bilingual (English/Hindi) offline stocktaking PWA. |
| **Northern Command XIV Corps Theater & IAF-Z-2096 Indent Workflow** | `SubhadeepAtta/ILOG-SHAKTI` | Reimplemented authentic military taxonomy: ASC/AOC Class I–V, Northern Command forward posts, and cryptographic IAF-Z-2096 requisition vouchers. |

---

## 3. Third-Party Open Source Software (OSS) Dependencies

Our application integrates the following industry-standard open-source libraries, each governed by permissive licenses:

### 3.1 Backend & Machine Learning Stack
- **FastAPI** (`tiangolo/fastapi`): MIT License. High-performance asynchronous web framework.
- **Pydantic v2** (`pydantic/pydantic`): MIT License. Data validation and settings management.
- **SQLAlchemy 2.0** (`sqlalchemy/sqlalchemy`): MIT License. Database toolkit and async ORM.
- **Google OR-Tools** (`google/or-tools`): Apache License 2.0. Combinatorial optimization suite.
- **scikit-learn** (`scikit-learn/scikit-learn`): BSD 3-Clause License. Machine learning and quantile gradient boosting.
- **NumPy & Pandas**: BSD 3-Clause License. Numerical computing and tabular data analysis.
- **Uvicorn**: BSD 3-Clause License. Lightning-fast ASGI server.
- **Pytest**: MIT License. Testing framework.

### 3.2 Frontend & UI Stack
- **React 18 & React-DOM** (`facebook/react`): MIT License. Declarative UI library.
- **Vite 6** (`vitejs/vite`): MIT License. Next-generation frontend build tool.
- **TypeScript 5** (`microsoft/TypeScript`): Apache License 2.0. Typed superset of JavaScript.
- **Tailwind CSS 3** (`tailwindlabs/tailwindcss`): MIT License. Utility-first CSS framework.
- **Lucide React** (`lucide-icons/lucide`): ISC License. Modern icon set for tactical UI.
- **Recharts** (`recharts/recharts`): MIT License. Composable charting library built on React and SVG.
- **Leaflet** (`Leaflet/Leaflet`): BSD 2-Clause License. Interactive mobile-friendly map library.

---

## 4. Public Datasets & Reference Attribution

1. **Border Roads Organisation (BRO):** Historical opening and closing dates for the Zoji La pass (2020–2025) derived from public BRO official releases and press records.
2. **Petroleum Planning & Analysis Cell (PPAC), MoPNG, GoI:** Historical per-capita petroleum consumption benchmarks for high-altitude northern territories, sourced from open government statistical reports.
3. **Defence Research and Development Organisation (DRDO):** High-altitude nutritional and caloric scale guidelines (4,088 kcal/man/day) published in the *Defence Science Journal*.
4. **OpenStreetMap Contributors:** Public road corridor topology and mountain pass coordinate anchors, used under the Open Database License (ODbL).
