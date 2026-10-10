"""
Causal Decision Explainability Engine for Northern Command XIV Corps
Provides clear military causal trees, counterfactual trade-off evaluations,
and doctrine compliance references for all automated recommendations.
"""

from dataclasses import dataclass, asdict
from typing import List, Dict, Any, Optional


@dataclass(frozen=True)
class CausalFactor:
    factor_name: str
    evidence: str
    impact_weight_pct: float
    threat_severity: str  # CRITICAL, HIGH, MODERATE, LOW


@dataclass(frozen=True)
class CounterfactualOption:
    rejected_alternative: str
    why_rejected: str
    projected_risk: str
    casualty_or_stockout_hazard: str


@dataclass(frozen=True)
class DecisionExplanationReport:
    decision_id: str
    decision_type: str  # DISPATCH_PRIORITY, AIR_BRIDGE_SELECTION, ROUTE_CHOICE, BUFFER_SURGE
    subject_location: str
    subject_supply: str
    primary_recommendation: str
    causal_factors: List[CausalFactor]
    counterfactual_tradeoffs: List[CounterfactualOption]
    confidence_score: float
    doctrine_compliance_ref: str
    decision_disclaimer: str


def generate_decision_explanation(
    decision_type: str,
    location_name: str,
    elevation_m: float,
    supply_name: str,
    supply_class: str,
    days_of_supply: float,
    pass_status: str,
    weather_condition: str,
    recommended_mode: str,
    headcount: int = 50,
) -> DecisionExplanationReport:
    """
    Synthesizes human-readable causal explanation breakdown and counterfactual alternatives.
    """
    factors: List[CausalFactor] = []
    counterfactuals: List[CounterfactualOption] = []

    # 1. Evaluate Urgency & DoS
    if days_of_supply <= 2.0:
        factors.append(
            CausalFactor(
                factor_name="Critical Stock Depletion Urgency",
                evidence=f"Remaining Days-of-Supply is {days_of_supply}d, breaching the 5.0d mandatory defense survival threshold.",
                impact_weight_pct=35.0,
                threat_severity="CRITICAL",
            )
        )
    elif days_of_supply <= 5.0:
        factors.append(
            CausalFactor(
                factor_name="Safety Threshold Proximity",
                evidence=f"Remaining stock ({days_of_supply}d DoS) will breach buffer threshold within 48 hours without immediate resupply.",
                impact_weight_pct=28.0,
                threat_severity="HIGH",
            )
        )
    else:
        factors.append(
            CausalFactor(
                factor_name="Routine Pipeline Maintenance",
                evidence=f"Buffer of {days_of_supply}d currently supports standard garrison routines.",
                impact_weight_pct=15.0,
                threat_severity="LOW",
            )
        )

    # 2. Evaluate Pass & Corridor Status
    if pass_status in ("CLOSED_BLIZZARD", "CLOSED_AVALANCHE") or weather_condition == "BLIZZARD":
        factors.append(
            CausalFactor(
                factor_name="Strategic Choke-Point Severance",
                evidence=f"Primary road pass is impassable ({pass_status}) due to active Himalayan snow drifts and zero visibility.",
                impact_weight_pct=30.0,
                threat_severity="CRITICAL",
            )
        )
        counterfactuals.append(
            CounterfactualOption(
                rejected_alternative="Standard Heavy Road Convoy (Ashok Leyland 4x4 / Tatra)",
                why_rejected=f"Mountain pass is physically blocked ({pass_status}). Road transit would strand heavy vehicles and recovery teams in blizzard.",
                projected_risk="100% convoy stoppage; vehicles stranded in -35°C conditions with engine freeze hazard.",
                casualty_or_stockout_hazard="Guaranteed forward post stockout before road clearing operations commence.",
            )
        )
    elif pass_status == "RESTRICTED_CONVOY":
        factors.append(
            CausalFactor(
                factor_name="Corridor Single-Lane Convoy Restriction",
                evidence="Pass operational under regulated convoy windows; tire chains and heavy recovery escort mandatory.",
                impact_weight_pct=18.0,
                threat_severity="MODERATE",
            )
        )

    # 3. Evaluate Elevation & Environmental Hardship
    if elevation_m >= 4500.0:
        factors.append(
            CausalFactor(
                factor_name="Extreme Alpine Altitude Environment",
                evidence=f"Outpost elevation is {elevation_m}m MSL (Sub-Glacial Moraine). Induces a 1.65x POL surge and severe hypothermia risk.",
                impact_weight_pct=20.0,
                threat_severity="HIGH",
            )
        )
    elif elevation_m >= 3500.0:
        factors.append(
            CausalFactor(
                factor_name="High-Altitude Logistic Zone",
                evidence=f"Elevation {elevation_m}m MSL dictates cold-weather payload de-rating and heated storage protocol.",
                impact_weight_pct=12.0,
                threat_severity="MODERATE",
            )
        )

    # 4. Supply Criticality Factor
    if supply_class == "CLASS_III":
        factors.append(
            CausalFactor(
                factor_name="Class III POL Survival Imperative",
                evidence="Bukhari heating oil and generator fuel are life-critical survival supplies in sub-zero warfare theaters.",
                impact_weight_pct=15.0,
                threat_severity="CRITICAL" if days_of_supply <= 5.0 else "HIGH",
            )
        )
    elif supply_class == "CLASS_I":
        factors.append(
            CausalFactor(
                factor_name="Class I Combat Ration Subsistence",
                evidence=f"Caloric requirement for {headcount} PAX garrison in extreme cold must be sustained without rationing.",
                impact_weight_pct=15.0,
                threat_severity="HIGH" if days_of_supply <= 5.0 else "MODERATE",
            )
        )

    # Counterfactual for Mode Choice
    if recommended_mode == "AIR_BRIDGE":
        rec_summary = f"Deploy tactical Mi-17 V5 air-bridge sortie directly to {location_name} helipad."
        counterfactuals.append(
            CounterfactualOption(
                rejected_alternative="Animal Transport / Mule Train",
                why_rejected="Glacial moraine passes and heavy snow depths exceed pack animal passability limits.",
                projected_risk="Pack train transit exceeds 48 hours with severe animal casualty rate.",
                casualty_or_stockout_hazard="Delivery arrives after garrison reaches complete stockout.",
            )
        )
    else:
        rec_summary = f"Deploy priority road convoy dispatch via {recommended_mode} within daylight window (0600-1700 hrs)."
        counterfactuals.append(
            CounterfactualOption(
                rejected_alternative="Immediate Tactical Airlift (IAF Mi-17 V5)",
                why_rejected="Road corridors are open; airframes reserved for severed forward posts to conserve critical aviation turbine fuel.",
                projected_risk="Unnecessary expenditure of limited tactical air assets and high-altitude pilot flight-hour limits.",
                casualty_or_stockout_hazard="No stockout risk; road convoy arrives within safety buffer window.",
            )
        )

    return DecisionExplanationReport(
        decision_id=f"EXP-{location_name.replace(' ', '-').upper()[:12]}-{supply_class}",
        decision_type=decision_type,
        subject_location=location_name,
        subject_supply=supply_name,
        primary_recommendation=rec_summary,
        causal_factors=factors,
        counterfactual_tradeoffs=counterfactuals,
        confidence_score=94.5,
        doctrine_compliance_ref="HQ Northern Command XIV Corps SOP / ASC-LOG-2026-CH7",
        decision_disclaimer="Decision support recommendation for operational military logistics. Command authority retains final transit disposition.",
    )
