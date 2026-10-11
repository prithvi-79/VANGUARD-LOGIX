"""
What-If Disruption Scenario Simulator Engine
Pure deterministic military stress-testing engine evaluating operational resilience under extreme conditions.
"""

import math
from typing import List, Dict, Any, Optional
from app.schemas.disruption import (
    DisruptionScenarioPreset,
    DisruptionSimulationRequest,
    DisruptionSimulationResponse,
    LocationDisruptionDelta,
    StrategicResponseAction,
)
from app.services.seed_data import (
    get_deterministic_locations,
    get_deterministic_passes,
    get_deterministic_supplies,
    generate_inventory_records,
)

# 5 Authoritative Scenario Presets
DISRUPTION_PRESETS: Dict[str, DisruptionScenarioPreset] = {
    "BASELINE": DisruptionScenarioPreset(
        id="BASELINE",
        name="Baseline Winter Operations",
        code="OP-BASE-NORM",
        description="Standard Northern Command winter garrison posture with predictable burn rates and open pass corridors.",
        severity="NORMAL",
        default_temp_delta_c=0.0,
        default_troop_surge_pct=0.0,
        default_closed_passes=[],
        default_fleet_availability_pct=100.0,
        tactical_rationale="Reference operating model under routine high-altitude supply rotation guidelines (ASC-LOG-2026-CH7).",
    ),
    "SEVERE_BLIZZARD": DisruptionScenarioPreset(
        id="SEVERE_BLIZZARD",
        name="Severe Himalayan Blizzard & Cold Wave",
        code="OP-WHITE-OUT",
        description="Western Disturbance brings sudden -25°C temperature drop (-42°C ambient) with heavy snowfall and zero visibility.",
        severity="CRITICAL",
        default_temp_delta_c=-25.0,
        default_troop_surge_pct=0.0,
        default_closed_passes=["PASS-ZOJILA", "PASS-CHANG"],
        default_fleet_availability_pct=60.0,
        tactical_rationale="Bukhari heaters and arctic generator fuel consumption surges +45%; mountain passes choked by 85cm snow drifts.",
    ),
    "PASS_AVALANCHE_BLOCKAGE": DisruptionScenarioPreset(
        id="PASS_AVALANCHE_BLOCKAGE",
        name="Strategic Pass Avalanche Blockade",
        code="OP-AVALANCHE-SEVER",
        description="Simultaneous Class-4 avalanches sever Zoji La (Project Beacon) and Khardung La (Project Himank) axes.",
        severity="CRITICAL",
        default_temp_delta_c=-8.0,
        default_troop_surge_pct=0.0,
        default_closed_passes=["PASS-ZOJILA", "PASS-KHARDUNG", "PASS-ROHTANG"],
        default_fleet_availability_pct=45.0,
        tactical_rationale="Complete cutoff of ground convoy replenishment to Nubra, Siachen, and Dras sectors; forces reliance on aerial delivery.",
    ),
    "TROOP_REINFORCEMENT_SURGE": DisruptionScenarioPreset(
        id="TROOP_REINFORCEMENT_SURGE",
        name="Forward Outpost Troop Reinforcement Surge",
        code="OP-SURGE-REINFORCE",
        description="Urgent deployment of 40% additional personnel across LAC/LOC forward posts in response to mobilization.",
        severity="HIGH",
        default_temp_delta_c=-5.0,
        default_troop_surge_pct=45.0,
        default_closed_passes=[],
        default_fleet_availability_pct=90.0,
        tactical_rationale="Ration and heating consumption accelerates drastically; forward Days-of-Supply drops without urgent replenishment.",
    ),
    "AIRLIFT_CONTINGENCY": DisruptionScenarioPreset(
        id="AIRLIFT_CONTINGENCY",
        name="Combined Disaster & Tactical Air-Bridge Activation",
        code="OP-AIR-BRIDGE-EMERGENCY",
        description="Worst-case compound disruption: sub-zero freezeout, multiple severed passes, and garrison headcount surge.",
        severity="CRITICAL",
        default_temp_delta_c=-20.0,
        default_troop_surge_pct=35.0,
        default_closed_passes=["PASS-ZOJILA", "PASS-KHARDUNG"],
        default_fleet_availability_pct=50.0,
        tactical_rationale="Full-theater air-bridge deployment mobilizing 153 HU Mi-17 V5 and 205 AAC ALH helicopters from Leh & Thoise airfields.",
    ),
}


def get_all_scenarios() -> List[DisruptionScenarioPreset]:
    """Return all available disruption scenario presets."""
    return list(DISRUPTION_PRESETS.values())


def simulate_disruption_scenario(req: DisruptionSimulationRequest) -> DisruptionSimulationResponse:
    """
    Simulate impact of environmental, terrain, and operational disruptions on XIV Corps supply chain.
    Computes exact before-and-after deltas across inventory burn-downs, DoS, isolation, and airlift sorties.
    """
    # 1. Resolve preset defaults if scenario_id provided
    preset = DISRUPTION_PRESETS.get(req.scenario_id or "BASELINE", DISRUPTION_PRESETS["BASELINE"])
    temp_delta = req.temp_delta_c if req.temp_delta_c != 0.0 else preset.default_temp_delta_c
    troop_surge = req.troop_surge_pct if req.troop_surge_pct != 0.0 else preset.default_troop_surge_pct
    closed_passes = req.closed_pass_ids if req.closed_pass_ids else preset.default_closed_passes
    fleet_avail = req.fleet_availability_pct if req.fleet_availability_pct != 100.0 else preset.default_fleet_availability_pct

    # 2. Load deterministic baseline theater state
    locations = get_deterministic_locations()
    supplies = {s.id: s for s in get_deterministic_supplies()}
    passes = {p.id: p for p in get_deterministic_passes()}
    baseline_records = generate_inventory_records(locations, list(supplies.values()), seed=26251)

    # Index inventory by location
    inv_by_location: Dict[str, list] = {}
    for r in baseline_records:
        inv_by_location.setdefault(r.location_id, []).append(r)

    # 3. Simulate per-location impact
    location_deltas: List[LocationDisruptionDelta] = []
    total_emergency_tonnage = 0.0
    baseline_stockout_events = 0
    disrupted_stockout_events = 0
    critical_outposts_baseline = 0
    critical_outposts_disrupted = 0

    total_baseline_dos_sum = 0.0
    total_disrupted_dos_sum = 0.0
    evaluated_items_count = 0

    for loc in locations:
        loc_inv = inv_by_location.get(loc.id, [])
        is_forward = loc.node_type != "BASE_DEPOT"

        # Troop headcount surge
        headcount_base = loc.current_headcount
        headcount_disrupted = int(headcount_base * (1.0 + (troop_surge / 100.0))) if is_forward else headcount_base

        # Determine pass isolation
        # Kumar & SBC depend on Khardung La & Marsimik La; DBO on Khardung; Dras on Zoji La
        is_cut_off = False
        if loc.id in ("LOC-KUMAR", "LOC-SBC", "LOC-DBO") and "PASS-KHARDUNG" in closed_passes:
            is_cut_off = True
        elif loc.id == "LOC-DRAS" and "PASS-ZOJILA" in closed_passes:
            is_cut_off = True
        elif loc.id == "LOC-CHUSHUL" and "PASS-CHANG" in closed_passes:
            is_cut_off = True

        isolation_status = "CUT_OFF_AIR_ONLY" if is_cut_off else ("CHOKED_PASS" if len(closed_passes) > 0 else "ACCESSIBLE")
        contingency_mode = "AIR_BRIDGE" if is_cut_off else ("ALL_TERRAIN" if fleet_avail < 60.0 else "ROAD")

        loc_baseline_dos_list = []
        loc_disrupted_dos_list = []
        loc_baseline_crit = 0
        loc_disrupted_crit = 0
        loc_emergency_deficit = 0.0

        for item in loc_inv:
            sup = supplies.get(item.supply_id)
            if not sup:
                continue

            base_burn = item.daily_consumption_rate
            base_stock = item.current_stock
            base_dos = base_stock / max(0.1, base_burn)

            # Burn rate acceleration under disruption:
            # 1) Troop surge factor
            surge_mult = (headcount_disrupted / max(1, headcount_base)) if headcount_base > 0 else 1.0

            # 2) Sub-zero temperature penalty:
            # - Class III (Fuel): +2.5% per °C of sub-zero delta
            # - Class I (Rations): +0.8% per °C of sub-zero delta
            # - Class II (Medical/Clothing): +0.5% per °C
            temp_penalty = 1.0
            if temp_delta < 0:
                sub_zero_drop = abs(temp_delta)
                if sup.supply_class == "CLASS_III":
                    temp_penalty += (sub_zero_drop * 0.025)
                elif sup.supply_class == "CLASS_I":
                    temp_penalty += (sub_zero_drop * 0.008)
                elif sup.supply_class == "CLASS_II":
                    temp_penalty += (sub_zero_drop * 0.005)

            disrupted_burn = base_burn * surge_mult * temp_penalty
            disrupted_dos = base_stock / max(0.1, disrupted_burn)

            loc_baseline_dos_list.append(base_dos)
            loc_disrupted_dos_list.append(disrupted_dos)
            total_baseline_dos_sum += base_dos
            total_disrupted_dos_sum += disrupted_dos
            evaluated_items_count += 1

            # Thresholds
            if base_dos < 5.0:
                loc_baseline_crit += 1
            if base_dos < 2.0:
                baseline_stockout_events += 1

            if disrupted_dos < 5.0:
                loc_disrupted_crit += 1
                # Emergency deficit: tonnage required to restore to 10 days of supply
                deficit_days = max(0.0, 10.0 - disrupted_dos)
                deficit_units = deficit_days * disrupted_burn
                deficit_kg = deficit_units * sup.unit_weight_kg
                loc_emergency_deficit += deficit_kg
                total_emergency_tonnage += deficit_kg

            if disrupted_dos < 2.0:
                disrupted_stockout_events += 1

        loc_base_mean = sum(loc_baseline_dos_list) / max(1, len(loc_baseline_dos_list))
        loc_disr_mean = sum(loc_disrupted_dos_list) / max(1, len(loc_disrupted_dos_list))
        delta_dos = round(loc_disr_mean - loc_base_mean, 1)

        if loc_baseline_crit > 0:
            critical_outposts_baseline += 1
        if loc_disrupted_crit > 0:
            critical_outposts_disrupted += 1

        location_deltas.append(
            LocationDisruptionDelta(
                location_id=loc.id,
                location_name=loc.name,
                sector=loc.sector,
                elevation_m=loc.elevation_m,
                headcount_baseline=headcount_base,
                headcount_disrupted=headcount_disrupted,
                baseline_mean_dos=round(loc_base_mean, 1),
                disrupted_mean_dos=round(loc_disr_mean, 1),
                delta_dos=delta_dos,
                baseline_critical_items=loc_baseline_crit,
                disrupted_critical_items=loc_disrupted_crit,
                emergency_deficit_kg=round(loc_emergency_deficit, 1),
                isolation_status=isolation_status,
                contingency_mode=contingency_mode,
            )
        )

    # 4. Global Theater Aggregates
    baseline_mean_dos = round(total_baseline_dos_sum / max(1, evaluated_items_count), 1)
    disrupted_mean_dos = round(total_disrupted_dos_sum / max(1, evaluated_items_count), 1)
    dos_drop_pct = round(max(0.0, (baseline_mean_dos - disrupted_mean_dos) / max(0.1, baseline_mean_dos) * 100.0), 1)

    # Mi-17 V5 effective altitude payload: ~2,500 kg per sortie at 4,000m MSL
    effective_sortie_capacity = 2500.0
    mi17_sorties = math.ceil(total_emergency_tonnage / effective_sortie_capacity) if total_emergency_tonnage > 0 else 0

    # Projected transit delay (due to closed passes & low fleet availability)
    transit_delay_hours = round((len(closed_passes) * 6.5) + ((100.0 - fleet_avail) * 0.15), 1)

    # 5. Formulate Tactical Response Actions
    actions: List[StrategicResponseAction] = []

    if mi17_sorties > 0:
        actions.append(
            StrategicResponseAction(
                priority_level="OP_IMMEDIATE",
                action_title="Mobilize Tactical Air-Bridge Sorties (153 HU IAF)",
                target_formation_or_unit="HQ XIV Corps Aviation Cell / Air Force Station Leh",
                operational_order=f"Schedule {mi17_sorties} Mi-17 V5 sorties carrying {round(total_emergency_tonnage/1000.0, 1)} tons of Class I/III supplies to isolated outposts.",
                justification="Ground supply lines severed or inadequate; forward DoS critically compromised below safety margins.",
            )
        )

    if len(closed_passes) > 0:
        closed_pass_names = [passes[pid].name for pid in closed_passes if pid in passes]
        actions.append(
            StrategicResponseAction(
                priority_level="HIGH",
                action_title="Task Border Roads Organisation (BRO) Emergency Clearance",
                target_formation_or_unit="BRO Projects Beacon & Himank",
                operational_order=f"Deploy heavy rotary snow blowers and avalanche clearing teams on {', '.join(closed_pass_names)}.",
                justification="Restore primary ground arterial corridors to relieve aerial logistics strain.",
            )
        )

    if troop_surge > 20.0 or temp_delta < -15.0:
        actions.append(
            StrategicResponseAction(
                priority_level="HIGH",
                action_title="Enact Regulated Fuel & Ration Conservation Protocol",
                target_formation_or_unit="Forward Formation ASC Supply Depots",
                operational_order="Enact Level-2 conservation: prioritize kerosene/diesel for bukhari life-support; hold tactical non-essential vehicle movements.",
                justification=f"Sub-zero burn acceleration (-{abs(temp_delta)}°C) depleting Class III buffer 45% faster than baseline.",
            )
        )

    actions.append(
        StrategicResponseAction(
            priority_level="MEDIUM",
            action_title="Pre-stage Secondary Contingency Reserves at Transit Hubs",
            target_formation_or_unit="Base Supply Depot Leh & Thoise Airbase",
            operational_order="Transfer 20 tons of Arctic Diesel and RTE rations to intermediate helipads at Dras and Chushul.",
            justification="Ensures forward-staged buffers in event of extended weather lockout.",
        )
    )

    return DisruptionSimulationResponse(
        scenario_id=preset.id,
        scenario_name=preset.name,
        temp_delta_c=round(temp_delta, 1),
        troop_surge_pct=round(troop_surge, 1),
        fleet_availability_pct=round(fleet_avail, 1),
        closed_pass_count=len(closed_passes),
        baseline_mean_dos=baseline_mean_dos,
        disrupted_mean_dos=disrupted_mean_dos,
        dos_drop_pct=dos_drop_pct,
        baseline_stockout_events=baseline_stockout_events,
        disrupted_stockout_events=disrupted_stockout_events,
        delta_stockout_events=max(0, disrupted_stockout_events - baseline_stockout_events),
        critical_outposts_baseline=critical_outposts_baseline,
        critical_outposts_disrupted=critical_outposts_disrupted,
        delta_critical_outposts=max(0, critical_outposts_disrupted - critical_outposts_baseline),
        total_emergency_tonnage_kg=round(total_emergency_tonnage, 1),
        mi17_sorties_required=mi17_sorties,
        projected_transit_delay_hours=transit_delay_hours,
        location_deltas=location_deltas,
        response_actions=actions,
    )
