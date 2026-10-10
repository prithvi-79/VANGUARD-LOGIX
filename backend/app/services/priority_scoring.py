"""
Pure Stateless Multi-Attribute Priority Scoring Engine
Calculates composite 0–100 priority scores to rank replenishment indents
and forward post emergency dispatches in Northern Command XIV Corps.
"""

from dataclasses import dataclass, asdict
from typing import List, Dict, Any


@dataclass(frozen=True)
class PriorityInput:
    location_id: str
    location_name: str
    elevation_m: float
    supply_id: str
    supply_name: str
    supply_class: str
    current_stock: float
    daily_consumption_rate: float
    safety_stock_threshold: float
    lead_time_days: float = 3.0
    route_status: str = "OPEN"  # OPEN, RESTRICTED, CLOSED
    weather_risk_level: str = "LOW"  # LOW, MODERATE, HIGH, EXTREME
    headcount: int = 50


@dataclass(frozen=True)
class PriorityScoreResult:
    location_id: str
    location_name: str
    supply_id: str
    supply_name: str
    supply_class: str
    composite_score: float  # 0.0 to 100.0
    priority_tier: str  # OP_IMMEDIATE (>=80), HIGH (65-79), MEDIUM (45-64), ROUTINE (<45)
    factor_breakdown: Dict[str, float]
    recommended_action: str
    recommended_mode: str  # ROAD, AIR_BRIDGE, ALL_TERRAIN, MULE_TRAIN


def get_supply_class_criticality(supply_class: str) -> float:
    """Relative strategic importance of Indian Army supply classes (0.0 to 1.0)."""
    mapping = {
        "CLASS_III": 1.00,  # POL: Arctic Diesel & Bukhari kerosene (survival imperative)
        "CLASS_I": 0.95,    # Rations: RTE retort pouches & survival bars
        "CLASS_V": 0.85,    # Ammunition: Defensive perimeter cartridges
        "CLASS_II": 0.75,   # ECC winter warfare gear & sub-zero tents
        "CLASS_IV": 0.50,   # Defence works: corrugated sheets & cement
    }
    return mapping.get(supply_class, 0.60)


def compute_priority_score(item: PriorityInput) -> PriorityScoreResult:
    """
    Computes deterministic multi-attribute priority score (0–100 scale).

    Factor Weighting:
    - Urgency / Days-of-Supply: 30%
    - Safety Stock Shortfall Deficit: 15%
    - Supply Class Criticality: 15%
    - Lead-Time Pressure: 10%
    - Route Feasibility: 10%
    - Elevation & Weather Risk: 10%
    - Headcount Vulnerability: 10%
    """
    daily_rate = max(0.1, item.daily_consumption_rate)
    dos = item.current_stock / daily_rate

    # 1. Urgency Component (30 pts max)
    if dos <= 2.0:
        urgency_score = 30.0
    elif dos <= 5.0:
        urgency_score = 25.0 + (5.0 - dos) * (5.0 / 3.0)
    elif dos <= 12.0:
        urgency_score = 12.0 + (12.0 - dos) * (13.0 / 7.0)
    elif dos <= 25.0:
        urgency_score = max(2.0, (25.0 - dos) * (10.0 / 13.0))
    else:
        urgency_score = 1.0

    # 2. Stock Deficit Component (15 pts max)
    if item.current_stock < item.safety_stock_threshold:
        shortfall = item.safety_stock_threshold - item.current_stock
        deficit_ratio = min(1.0, shortfall / max(1.0, item.safety_stock_threshold))
        deficit_score = round(15.0 * deficit_ratio, 2)
    else:
        deficit_score = 0.0

    # 3. Supply Class Criticality Component (15 pts max)
    class_factor = get_supply_class_criticality(item.supply_class)
    crit_score = round(15.0 * class_factor, 2)

    # 4. Lead-Time Pressure Component (10 pts max)
    # If lead time >= Days-of-Supply, post will experience complete stockout during transit!
    if dos <= 0.1:
        lead_time_score = 10.0
    else:
        ratio = item.lead_time_days / max(1.0, dos)
        lead_time_score = round(min(10.0, 10.0 * ratio), 2)

    # 5. Route Feasibility Component (10 pts max)
    if item.route_status == "OPEN":
        route_score = 10.0
        rec_mode = "ROAD"
    elif item.route_status == "RESTRICTED":
        route_score = 7.5
        rec_mode = "ROAD"
    else:  # CLOSED
        # If road pass closed, airlift or snowcat required
        route_score = 4.0
        if item.elevation_m >= 4500.0:
            rec_mode = "AIR_BRIDGE"
        else:
            rec_mode = "ALL_TERRAIN"

    # 6. Elevation & Weather Threat Component (10 pts max)
    elev_pts = min(6.0, max(0.0, (item.elevation_m - 3000.0) / 500.0))
    weather_map = {"LOW": 1.0, "MODERATE": 2.0, "HIGH": 3.0, "EXTREME": 4.0}
    weather_pts = weather_map.get(item.weather_risk_level, 1.0)
    env_score = round(min(10.0, elev_pts + weather_pts), 2)

    # 7. Headcount Vulnerability Component (10 pts max)
    # Larger garrisons stationed at forward posts face larger cumulative casualty/freeze risk
    pax_score = round(min(10.0, (item.headcount / 300.0) * 10.0), 2)

    # Total composite score
    composite = round(
        urgency_score + deficit_score + crit_score + lead_time_score + route_score + env_score + pax_score,
        1,
    )
    composite = max(0.0, min(100.0, composite))

    # Priority Tier classification
    if composite >= 80.0:
        tier = "OP_IMMEDIATE"
        action = f"Immediate priority dispatch via {rec_mode}; emergency replenishment directive active."
    elif composite >= 65.0:
        tier = "HIGH"
        action = f"High-priority dispatch via {rec_mode} within 24 hours."
    elif composite >= 45.0:
        tier = "MEDIUM"
        action = f"Schedule replenishment in next routine transit window via {rec_mode}."
    else:
        tier = "ROUTINE"
        action = "Monitor forward stock levels; buffer currently adequate."

    breakdown = {
        "urgency_dos": round(urgency_score, 2),
        "safety_deficit": round(deficit_score, 2),
        "supply_criticality": round(crit_score, 2),
        "lead_time_pressure": round(lead_time_score, 2),
        "route_feasibility": round(route_score, 2),
        "environmental_threat": round(env_score, 2),
        "headcount_vulnerability": round(pax_score, 2),
    }

    return PriorityScoreResult(
        location_id=item.location_id,
        location_name=item.location_name,
        supply_id=item.supply_id,
        supply_name=item.supply_name,
        supply_class=item.supply_class,
        composite_score=composite,
        priority_tier=tier,
        factor_breakdown=breakdown,
        recommended_action=action,
        recommended_mode=rec_mode,
    )


def rank_priority_queue(items: List[PriorityInput]) -> List[PriorityScoreResult]:
    """Scores and sorts items in descending order of composite priority score."""
    scored = [compute_priority_score(item) for item in items]
    scored.sort(key=lambda s: s.composite_score, reverse=True)
    return scored
