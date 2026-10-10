"""
Deterministic Synthetic Military Logistics Generator
Northern Command XIV Corps (Ladakh / Siachen / Kargil Theater)
Fixed Seed: 26251 (SIH Problem Statement PS 26251)
"""

import random
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.location import Location
from app.models.supply import SupplyItem, InventoryRecord
from app.models.route import Route, StrategicPass
from app.models.vehicle import Vehicle
from app.models.indent import IndentVoucher
from app.models.telemetry import TelemetryRecord


def get_deterministic_locations() -> List[Location]:
    """Returns canonical locations for Northern Command XIV Corps theater."""
    return [
        Location(
            id="LOC-LEH",
            name="14 Corps HQ & Transit Logistics Hub, Leh",
            node_type="BASE_DEPOT",
            sector="LEH_CENTRAL",
            latitude=34.1526,
            longitude=77.5771,
            elevation_m=3524.0,
            mgrs_grid="43S YD 4281 7712",
            storage_capacity_tons=5000.0,
            current_headcount=1200,
            is_air_accessible=True,
            weather_risk_level="LOW",
        ),
        Location(
            id="LOC-SRINAGAR",
            name="BB Cantt Srinagar Forward Base Logistics Depot",
            node_type="BASE_DEPOT",
            sector="KASHMIR_VALLEY",
            latitude=34.0837,
            longitude=74.7973,
            elevation_m=1585.0,
            mgrs_grid="43S XD 1120 5410",
            storage_capacity_tons=10000.0,
            current_headcount=2500,
            is_air_accessible=True,
            weather_risk_level="LOW",
        ),
        Location(
            id="LOC-THOISE",
            name="Thoise Air Base & Nubra Logistics Staging Area",
            node_type="AIR_LOGISTICS_HUB",
            sector="NUBRA_VALLEY",
            latitude=34.6542,
            longitude=77.4244,
            elevation_m=3067.0,
            mgrs_grid="43S YD 3190 2840",
            storage_capacity_tons=3000.0,
            current_headcount=650,
            is_air_accessible=True,
            weather_risk_level="MODERATE",
        ),
        Location(
            id="LOC-SBC",
            name="Siachen Base Camp (102 Infantry Brigade)",
            node_type="FORWARD_POST",
            sector="SIACHEN_SUB_SECTOR",
            latitude=35.1683,
            longitude=77.1642,
            elevation_m=3658.0,
            mgrs_grid="43S YD 1520 8910",
            storage_capacity_tons=800.0,
            current_headcount=450,
            is_air_accessible=True,
            weather_risk_level="HIGH",
        ),
        Location(
            id="LOC-KUMAR",
            name="Kumar Post (Central Siachen Glacier)",
            node_type="FORWARD_POST",
            sector="SIACHEN_GLACIER",
            latitude=35.4210,
            longitude=77.0850,
            elevation_m=4876.0,
            mgrs_grid="43S YD 0940 1620",
            storage_capacity_tons=120.0,
            current_headcount=85,
            is_air_accessible=True,
            weather_risk_level="EXTREME",
        ),
        Location(
            id="LOC-DBO",
            name="Daulat Beg Oldi (DBO) ALG & Outpost",
            node_type="FORWARD_POST",
            sector="SUB_SECTOR_NORTH",
            latitude=35.4022,
            longitude=77.9272,
            elevation_m=5065.0,
            mgrs_grid="43S YD 8410 1430",
            storage_capacity_tons=250.0,
            current_headcount=180,
            is_air_accessible=True,
            weather_risk_level="EXTREME",
        ),
        Location(
            id="LOC-GALWAN",
            name="Galwan Valley Tactical Outpost (PP-14 Axis)",
            node_type="FORWARD_POST",
            sector="GALWAN_VALLEY",
            latitude=34.7610,
            longitude=78.2250,
            elevation_m=4267.0,
            mgrs_grid="43S ZD 1200 4500",
            storage_capacity_tons=150.0,
            current_headcount=110,
            is_air_accessible=False,
            weather_risk_level="HIGH",
        ),
        Location(
            id="LOC-DRAS",
            name="Dras Forward Logistics Node (8 Mountain Division)",
            node_type="FORWARD_POST",
            sector="DRAS_KARGIL",
            latitude=34.4294,
            longitude=75.7601,
            elevation_m=3280.0,
            mgrs_grid="43S XD 7890 9820",
            storage_capacity_tons=600.0,
            current_headcount=320,
            is_air_accessible=True,
            weather_risk_level="HIGH",
        ),
        Location(
            id="LOC-CHUSHUL",
            name="Chushul Outpost & Spanggur Gap Defensive Line",
            node_type="FORWARD_POST",
            sector="CHUSHUL_SECTOR",
            latitude=33.5930,
            longitude=78.6533,
            elevation_m=4334.0,
            mgrs_grid="43S ZD 5530 0810",
            storage_capacity_tons=350.0,
            current_headcount=210,
            is_air_accessible=True,
            weather_risk_level="MODERATE",
        ),
        Location(
            id="LOC-DEMCHOK",
            name="Demchok Tactical Forward Observation Post",
            node_type="FORWARD_POST",
            sector="SOUTHERN_LADAKH",
            latitude=32.7000,
            longitude=79.4400,
            elevation_m=4210.0,
            mgrs_grid="44R NA 2410 1980",
            storage_capacity_tons=180.0,
            current_headcount=95,
            is_air_accessible=False,
            weather_risk_level="MODERATE",
        ),
    ]


def get_deterministic_passes() -> List[StrategicPass]:
    """Returns strategic mountain pass choke points monitored by BRO."""
    return [
        StrategicPass(
            id="PASS-ZOJILA",
            name="Zoji La Pass",
            highway="NH-1D Srinagar-Leh Strategic Highway",
            elevation_m=3528.0,
            latitude=34.2811,
            longitude=75.4789,
            status="OPEN",
            snow_accumulation_cm=18.5,
            temperature_c=-12.0,
            bro_detachment="Project Beacon / 753 BRTF",
            predicted_reopen_hours=0.0,
            closure_reason=None,
        ),
        StrategicPass(
            id="PASS-KHARDUNGLA",
            name="Khardung La Pass",
            highway="Leh-Nubra-Siachen Gateway Road",
            elevation_m=5359.0,
            latitude=34.2789,
            longitude=77.6044,
            status="RESTRICTED_CONVOY",
            snow_accumulation_cm=45.0,
            temperature_c=-24.0,
            bro_detachment="Project Himank / 111 RCC",
            predicted_reopen_hours=3.5,
            closure_reason="Black ice and single-lane convoy timing restriction",
        ),
        StrategicPass(
            id="PASS-CHANGLA",
            name="Chang La Pass",
            highway="Leh to Pangong Tso & Chushul Axis",
            elevation_m=5360.0,
            latitude=34.0478,
            longitude=77.9300,
            status="OPEN",
            snow_accumulation_cm=28.0,
            temperature_c=-19.0,
            bro_detachment="Project Himank / 81 RCC",
            predicted_reopen_hours=0.0,
            closure_reason=None,
        ),
        StrategicPass(
            id="PASS-ROHTANG",
            name="Rohtang / Atal Axis Gateway",
            highway="Manali-Leh Strategic Highway",
            elevation_m=3978.0,
            latitude=32.3716,
            longitude=77.2466,
            status="OPEN",
            snow_accumulation_cm=12.0,
            temperature_c=-8.0,
            bro_detachment="Project Deepak / 70 RCC",
            predicted_reopen_hours=0.0,
            closure_reason=None,
        ),
        StrategicPass(
            id="PASS-MARSIMIK",
            name="Marsimik La Pass",
            highway="Pangong North Axis to Hot Springs",
            elevation_m=5582.0,
            latitude=34.1167,
            longitude=78.6167,
            status="CLOSED_BLIZZARD",
            snow_accumulation_cm=85.0,
            temperature_c=-31.0,
            bro_detachment="Project Himank / 111 RCC",
            predicted_reopen_hours=18.0,
            closure_reason="Active blizzard and heavy snow drifts exceeding 85cm",
        ),
    ]


def get_deterministic_routes() -> List[Route]:
    """Returns strategic supply corridors connecting bases to forward posts."""
    return [
        Route(
            id="RTE-SRN-LEH",
            name="Srinagar Base to Leh (NH-1D Strategic Axis)",
            origin_id="LOC-SRINAGAR",
            destination_id="LOC-LEH",
            distance_km=420.0,
            surface_type="HIGHWAY",
            max_slope_deg=7.5,
            average_elevation_m=2800.0,
            transit_mode="ROAD",
            base_transit_hours=14.0,
            status="OPEN",
            choke_pass_id="PASS-ZOJILA",
        ),
        Route(
            id="RTE-LEH-THOISE",
            name="Leh to Thoise via Khardung La",
            origin_id="LOC-LEH",
            destination_id="LOC-THOISE",
            distance_km=160.0,
            surface_type="MOUNTAIN_ROAD",
            max_slope_deg=11.0,
            average_elevation_m=4200.0,
            transit_mode="ROAD",
            base_transit_hours=7.0,
            status="RESTRICTED",
            choke_pass_id="PASS-KHARDUNGLA",
        ),
        Route(
            id="RTE-THOISE-SBC",
            name="Thoise to Siachen Base Camp (Nubra-Siachen Axis)",
            origin_id="LOC-THOISE",
            destination_id="LOC-SBC",
            distance_km=75.0,
            surface_type="MOUNTAIN_ROAD",
            max_slope_deg=6.0,
            average_elevation_m=3350.0,
            transit_mode="ROAD",
            base_transit_hours=3.5,
            status="OPEN",
            choke_pass_id=None,
        ),
        Route(
            id="RTE-SBC-KUMAR",
            name="Siachen Base Camp to Kumar Post (Glacier Trail)",
            origin_id="LOC-SBC",
            destination_id="LOC-KUMAR",
            distance_km=28.0,
            surface_type="GLACIAL_SNOWCAT_TRAIL",
            max_slope_deg=14.0,
            average_elevation_m=4400.0,
            transit_mode="ALL_TERRAIN",
            base_transit_hours=4.0,
            status="OPEN",
            choke_pass_id=None,
        ),
        Route(
            id="RTE-LEH-DBO",
            name="Leh to Daulat Beg Oldi (Darbuk-Shyok-DBO Axis)",
            origin_id="LOC-LEH",
            destination_id="LOC-DBO",
            distance_km=255.0,
            surface_type="UNPAVED_TRACK",
            max_slope_deg=9.0,
            average_elevation_m=4600.0,
            transit_mode="ROAD",
            base_transit_hours=11.5,
            status="OPEN",
            choke_pass_id=None,
        ),
        Route(
            id="RTE-LEH-GALWAN",
            name="Leh to Galwan Outpost via Shyok River Axis",
            origin_id="LOC-LEH",
            destination_id="LOC-GALWAN",
            distance_km=220.0,
            surface_type="MOUNTAIN_ROAD",
            max_slope_deg=8.5,
            average_elevation_m=3950.0,
            transit_mode="ROAD",
            base_transit_hours=9.0,
            status="OPEN",
            choke_pass_id=None,
        ),
        Route(
            id="RTE-LEH-DRAS",
            name="Leh to Dras via Kargil Axis",
            origin_id="LOC-LEH",
            destination_id="LOC-DRAS",
            distance_km=280.0,
            surface_type="HIGHWAY",
            max_slope_deg=6.0,
            average_elevation_m=3400.0,
            transit_mode="ROAD",
            base_transit_hours=8.5,
            status="OPEN",
            choke_pass_id=None,
        ),
        Route(
            id="RTE-LEH-CHUSHUL",
            name="Leh to Chushul via Chang La Pass",
            origin_id="LOC-LEH",
            destination_id="LOC-CHUSHUL",
            distance_km=205.0,
            surface_type="MOUNTAIN_ROAD",
            max_slope_deg=10.5,
            average_elevation_m=4450.0,
            transit_mode="ROAD",
            base_transit_hours=8.0,
            status="OPEN",
            choke_pass_id="PASS-CHANGLA",
        ),
        Route(
            id="RTE-CHUSHUL-DEMCHOK",
            name="Chushul to Demchok LAC Lateral Link",
            origin_id="LOC-CHUSHUL",
            destination_id="LOC-DEMCHOK",
            distance_km=145.0,
            surface_type="UNPAVED_TRACK",
            max_slope_deg=7.0,
            average_elevation_m=4280.0,
            transit_mode="ROAD",
            base_transit_hours=6.5,
            status="OPEN",
            choke_pass_id=None,
        ),
    ]


def get_deterministic_supplies() -> List[SupplyItem]:
    """Returns authentic Indian Army ASC/AOC supply items across Classes I-V."""
    return [
        # Class I: Rations
        SupplyItem(
            id="SUP-RAT-FRESH",
            name="Fresh Ration Pack (Potatoes, Onions, Fresh Meat/Poultry)",
            supply_class="CLASS_I",
            class_label="Class I — Fresh Rations",
            unit="KG",
            unit_weight_kg=1.0,
            priority_weight=2.0,
            shelf_life_days=10,
            storage_type="COLD_CHAIN",
        ),
        SupplyItem(
            id="SUP-RAT-RTE",
            name="High Altitude One-Man Ready-to-Eat (RTE) Retort Pouch Ration",
            supply_class="CLASS_I",
            class_label="Class I — Operational Rations (RTE)",
            unit="PACKS",
            unit_weight_kg=1.2,
            priority_weight=2.5,
            shelf_life_days=720,
            storage_type="DRY",
        ),
        SupplyItem(
            id="SUP-RAT-SURVIVAL",
            name="Glacier High-Calorie Survival Ration Bars & Electrolytes",
            supply_class="CLASS_I",
            class_label="Class I — Emergency Survival Ration",
            unit="SETS",
            unit_weight_kg=0.8,
            priority_weight=2.8,
            shelf_life_days=365,
            storage_type="DRY",
        ),

        # Class II: Clothing & General Stores
        SupplyItem(
            id="SUP-CLOTH-ECC",
            name="Extreme Cold Climate (ECC) Clothing Set (Down Jackets, Mittens, Thermal Boots)",
            supply_class="CLASS_II",
            class_label="Class II — ECC Winter Warfare Gear",
            unit="SETS",
            unit_weight_kg=8.5,
            priority_weight=2.2,
            shelf_life_days=1800,
            storage_type="DRY",
        ),
        SupplyItem(
            id="SUP-TENT-ARCTIC",
            name="Insulated Sub-Zero Arctic Bunker Tent (10-Man)",
            supply_class="CLASS_II",
            class_label="Class II — Arctic Shelter",
            unit="UNITS",
            unit_weight_kg=65.0,
            priority_weight=2.0,
            shelf_life_days=1800,
            storage_type="DRY",
        ),

        # Class III: Petroleum, Oil & Lubricants (POL)
        SupplyItem(
            id="SUP-POL-DIESEL-ARCTIC",
            name="Arctic Grade Diesel (Pour Point -50°C, Anti-Waxing Additives)",
            supply_class="CLASS_III",
            class_label="Class III — Arctic High-Altitude Diesel",
            unit="LITERS",
            unit_weight_kg=0.84,
            priority_weight=3.0,
            shelf_life_days=365,
            storage_type="HAZMAT_FUEL",
        ),
        SupplyItem(
            id="SUP-POL-KEROSENE",
            name="Superior Kerosene Oil (SKO) for Bukhari Space Heaters",
            supply_class="CLASS_III",
            class_label="Class III — Heating Fuel (Bukhari SKO)",
            unit="LITERS",
            unit_weight_kg=0.80,
            priority_weight=3.0,
            shelf_life_days=365,
            storage_type="HAZMAT_FUEL",
        ),
        SupplyItem(
            id="SUP-POL-ATF",
            name="Aviation Turbine Fuel (ATF K-60) for Mi-17 / ALH Operations",
            supply_class="CLASS_III",
            class_label="Class III — Aviation Turbine Fuel",
            unit="LITERS",
            unit_weight_kg=0.81,
            priority_weight=2.7,
            shelf_life_days=365,
            storage_type="HAZMAT_FUEL",
        ),

        # Class IV: Defence Works & Engineering
        SupplyItem(
            id="SUP-ENG-CORRUGATED",
            name="Heavy-Gauge Corrugated Galvanized Iron (CGI) Shelter Sheets",
            supply_class="CLASS_IV",
            class_label="Class IV — Defence Construction Materials",
            unit="BUNDLES",
            unit_weight_kg=45.0,
            priority_weight=1.5,
            shelf_life_days=3650,
            storage_type="DRY",
        ),
        SupplyItem(
            id="SUP-ENG-CEMENT-SUBZERO",
            name="Rapid-Hardening Sub-Zero Fortification Cement (Anti-Freeze Formulation)",
            supply_class="CLASS_IV",
            class_label="Class IV — Fortification Cement",
            unit="BAGS",
            unit_weight_kg=50.0,
            priority_weight=1.6,
            shelf_life_days=180,
            storage_type="DRY",
        ),

        # Class V: Ammunition
        SupplyItem(
            id="SUP-AMMO-556",
            name="5.56x45mm NATO / INSAS Ball Combat Cartridges",
            supply_class="CLASS_V",
            class_label="Class V — Small Arms Ammunition",
            unit="ROUNDS",
            unit_weight_kg=0.012,
            priority_weight=2.9,
            shelf_life_days=3650,
            storage_type="SECURE_MAGAZINE",
        ),
        SupplyItem(
            id="SUP-AMMO-81MORTAR",
            name="81mm High Explosive (HE) Mortar Bombs with High-Altitude Fuzes",
            supply_class="CLASS_V",
            class_label="Class V — Artillery / Mortar Munitions",
            unit="ROUNDS",
            unit_weight_kg=4.2,
            priority_weight=2.8,
            shelf_life_days=3650,
            storage_type="SECURE_MAGAZINE",
        ),
    ]


def get_deterministic_vehicles() -> List[Vehicle]:
    """Returns multimodal fleet vehicles stationed across XIV Corps depots."""
    return [
        Vehicle(
            id="VEH-ALS-01",
            callsign="KARGIL-EXPRESS-1",
            vehicle_type="ASHOK_LEYLAND_4X4",
            mode="ROAD",
            max_payload_kg=2500.0,
            service_ceiling_m=4200.0,
            fuel_type="ARCTIC_DIESEL",
            fuel_consumption_rate=0.38,
            current_location_id="LOC-LEH",
            operational_status="AVAILABLE",
        ),
        Vehicle(
            id="VEH-ALS-02",
            callsign="KARGIL-EXPRESS-2",
            vehicle_type="ASHOK_LEYLAND_4X4",
            mode="ROAD",
            max_payload_kg=2500.0,
            service_ceiling_m=4200.0,
            fuel_type="ARCTIC_DIESEL",
            fuel_consumption_rate=0.38,
            current_location_id="LOC-LEH",
            operational_status="AVAILABLE",
        ),
        Vehicle(
            id="VEH-STL-01",
            callsign="LADAKH-STALLION-ALPHA",
            vehicle_type="STALLION_6X6",
            mode="ROAD",
            max_payload_kg=5000.0,
            service_ceiling_m=4500.0,
            fuel_type="ARCTIC_DIESEL",
            fuel_consumption_rate=0.52,
            current_location_id="LOC-LEH",
            operational_status="AVAILABLE",
        ),
        Vehicle(
            id="VEH-STL-02",
            callsign="LADAKH-STALLION-BRAVO",
            vehicle_type="STALLION_6X6",
            mode="ROAD",
            max_payload_kg=5000.0,
            service_ceiling_m=4500.0,
            fuel_type="ARCTIC_DIESEL",
            fuel_consumption_rate=0.52,
            current_location_id="LOC-THOISE",
            operational_status="AVAILABLE",
        ),
        Vehicle(
            id="VEH-BV-01",
            callsign="GLACIER-CAT-01",
            vehicle_type="BV206_SNOWCAT",
            mode="ALL_TERRAIN",
            max_payload_kg=2000.0,
            service_ceiling_m=5800.0,
            fuel_type="ARCTIC_DIESEL",
            fuel_consumption_rate=0.65,
            current_location_id="LOC-SBC",
            operational_status="AVAILABLE",
        ),
        Vehicle(
            id="VEH-BV-02",
            callsign="GLACIER-CAT-02",
            vehicle_type="BV206_SNOWCAT",
            mode="ALL_TERRAIN",
            max_payload_kg=2000.0,
            service_ceiling_m=5800.0,
            fuel_type="ARCTIC_DIESEL",
            fuel_consumption_rate=0.65,
            current_location_id="LOC-SBC",
            operational_status="AVAILABLE",
        ),
        Vehicle(
            id="VEH-MI17-01",
            callsign="HIMALAYAN-EAGLE-1 (153 HU IAF)",
            vehicle_type="MI17_V5_HELI",
            mode="AIR",
            max_payload_kg=4000.0,
            service_ceiling_m=6000.0,
            fuel_type="ATF",
            fuel_consumption_rate=680.0,  # liters per flight hr
            current_location_id="LOC-LEH",
            operational_status="AVAILABLE",
        ),
        Vehicle(
            id="VEH-MI17-02",
            callsign="HIMALAYAN-EAGLE-2 (153 HU IAF)",
            vehicle_type="MI17_V5_HELI",
            mode="AIR",
            max_payload_kg=4000.0,
            service_ceiling_m=6000.0,
            fuel_type="ATF",
            fuel_consumption_rate=680.0,
            current_location_id="LOC-THOISE",
            operational_status="AVAILABLE",
        ),
        Vehicle(
            id="VEH-ALH-01",
            callsign="SIAC_DHRUV-1 (205 AAC)",
            vehicle_type="ALH_DHRUV",
            mode="AIR",
            max_payload_kg=1200.0,
            service_ceiling_m=6500.0,
            fuel_type="ATF",
            fuel_consumption_rate=320.0,
            current_location_id="LOC-LEH",
            operational_status="AVAILABLE",
        ),
        Vehicle(
            id="VEH-MULE-01",
            callsign="876-AT-COY-CONVOY-1",
            vehicle_type="MULE_TRAIN",
            mode="ANIMAL_TRANSPORT",
            max_payload_kg=600.0,
            service_ceiling_m=5600.0,
            fuel_type="FODDER",
            fuel_consumption_rate=12.0,  # kg grain/fodder
            current_location_id="LOC-SBC",
            operational_status="AVAILABLE",
        ),
    ]


def generate_inventory_records(locations: List[Location], supplies: List[SupplyItem], seed: int = 26251) -> List[InventoryRecord]:
    """
    Generates deterministic inventory records anchored at seed 26251.
    Creates intentional tactical shortages at forward outposts (Kumar Post, DBO)
    to drive realistic Days-of-Supply alerts, priority scoring, and dispatches.
    """
    rng = random.Random(seed)
    records = []

    for loc in locations:
        headcount = loc.current_headcount
        is_base = loc.node_type == "BASE_DEPOT"

        for sup in supplies:
            rec_id = f"INV-{loc.id}-{sup.id}"

            # Calculate realistic baseline daily consumption based on headcount & item class
            if sup.supply_class == "CLASS_I":
                daily_burn = round(headcount * 1.25, 1)  # ~1.25 kg rations per soldier/day
            elif sup.supply_class == "CLASS_II":
                daily_burn = round(headcount * 0.05, 2)  # Replacement rate
            elif sup.supply_class == "CLASS_III":
                # Fuel consumption increases drastically with elevation (bukhari heaters & generator sets)
                elev_factor = 1.0 + max(0.0, (loc.elevation_m - 3000.0) / 1500.0)
                daily_burn = round(headcount * 3.5 * elev_factor, 1)  # liters per soldier
            elif sup.supply_class == "CLASS_IV":
                daily_burn = round(headcount * 0.1, 1)
            else:  # CLASS_V
                daily_burn = round(headcount * 0.25, 1)  # Routine training & defensive readiness

            daily_burn = max(1.0, daily_burn)
            safety_threshold = round(daily_burn * (20 if is_base else 10), 1)
            reorder_point = round(daily_burn * (35 if is_base else 18), 1)

            # Determine current stock
            if is_base:
                # Base depots maintain large 45-60 days buffers
                days_stock = rng.uniform(45.0, 75.0)
                current_stock = round(daily_burn * days_stock, 1)
            else:
                # Forward posts have varied stock levels; Kumar Post and DBO have critical shortages
                if loc.id in ("LOC-KUMAR", "LOC-DBO") and sup.supply_class in ("CLASS_III", "CLASS_I"):
                    days_stock = rng.uniform(2.5, 4.8)  # CRITICAL SHORTAGE! (< 5 Days of Supply)
                elif loc.id in ("LOC-GALWAN", "LOC-DEMCHOK"):
                    days_stock = rng.uniform(7.0, 11.0)  # WARNING (< 12 Days of Supply)
                else:
                    days_stock = rng.uniform(15.0, 28.0)  # NORMAL
                current_stock = round(daily_burn * days_stock, 1)

            records.append(
                InventoryRecord(
                    id=rec_id,
                    location_id=loc.id,
                    supply_id=sup.id,
                    current_stock=current_stock,
                    daily_consumption_rate=daily_burn,
                    safety_stock_threshold=safety_threshold,
                    reorder_point=reorder_point,
                    batch_number=f"BATCH-26251-{sup.id[-4:]}",
                )
            )

    return records


def get_deterministic_initial_indents() -> List[IndentVoucher]:
    """Generates initial authentic IAF-Z-2096 vouchers for forward post emergency replenishments."""
    v1_id = "IAF-Z-2096/2026/0481"
    v1_unit = "3 LADAKH SCOUTS (High Altitude Warfare)"
    v1_post = "LOC-KUMAR"
    v1_officer = "IC-78219M Maj R. Sharma"
    v1_items = '[{"supply_id": "SUP-POL-DIESEL-ARCTIC", "supply_name": "Arctic Grade Diesel", "quantity_requested": 4500, "unit": "LITERS", "urgency_reason": "Bukhari heaters burn rate doubled under -42C blizzard conditions"}]'
    v1_hash = IndentVoucher.compute_hash(v1_id, v1_unit, v1_post, v1_items, v1_officer)

    v2_id = "IAF-Z-2096/2026/0482"
    v2_unit = "19 BOMBAY ENGR REGT (Task Force Himank)"
    v2_post = "LOC-DBO"
    v2_officer = "IC-81044A Capt V. Nair"
    v2_items = '[{"supply_id": "SUP-RAT-RTE", "supply_name": "High Altitude Ready-to-Eat Ration Pack", "quantity_requested": 1200, "unit": "PACKS", "urgency_reason": "Air drop schedule delayed due to zero-visibility snowstorm"}]'
    v2_hash = IndentVoucher.compute_hash(v2_id, v2_unit, v2_post, v2_items, v2_officer)

    return [
        IndentVoucher(
            id=v1_id,
            originating_unit=v1_unit,
            forward_post_id=v1_post,
            priority="OP_IMMEDIATE",
            officer_service_number=v1_officer,
            officer_name="Maj R. Sharma",
            items_json=v1_items,
            justification="Emergency heating fuel depletion at Kumar Post; severe freeze injury risk.",
            status="PENDING_APPROVAL",
            verification_hash=v1_hash,
        ),
        IndentVoucher(
            id=v2_id,
            originating_unit=v2_unit,
            forward_post_id=v2_post,
            priority="PRIORITY",
            officer_service_number=v2_officer,
            officer_name="Capt V. Nair",
            items_json=v2_items,
            justification="Reserve operational ration buffer down to 3 days at DBO outpost.",
            status="PENDING_APPROVAL",
            verification_hash=v2_hash,
        ),
    ]


async def seed_database(db: AsyncSession, seed: int = 26251, force: bool = False) -> dict:
    """
    Populates database with Northern Command XIV Corps data if tables are empty or force=True.
    Returns counts of seeded entities.
    """
    # Check if data already exists
    stmt = select(Location)
    result = await db.execute(stmt)
    existing_locations = result.scalars().all()

    if existing_locations and not force:
        return {
            "status": "already_seeded",
            "locations": len(existing_locations),
            "seed": seed,
        }

    # Generate entities
    locations = get_deterministic_locations()
    passes = get_deterministic_passes()
    routes = get_deterministic_routes()
    supplies = get_deterministic_supplies()
    vehicles = get_deterministic_vehicles()
    inventory = generate_inventory_records(locations, supplies, seed=seed)
    indents = get_deterministic_initial_indents()

    # Add all entities to session
    for item in locations:
        await db.merge(item)
    for item in passes:
        await db.merge(item)
    for item in routes:
        await db.merge(item)
    for item in supplies:
        await db.merge(item)
    for item in vehicles:
        await db.merge(item)
    for item in inventory:
        await db.merge(item)
    for item in indents:
        await db.merge(item)

    await db.commit()

    return {
        "status": "success",
        "locations_seeded": len(locations),
        "passes_seeded": len(passes),
        "routes_seeded": len(routes),
        "supplies_seeded": len(supplies),
        "vehicles_seeded": len(vehicles),
        "inventory_records_seeded": len(inventory),
        "indents_seeded": len(indents),
        "seed": seed,
        "theater": "NORTHERN_COMMAND_XIV_CORPS",
    }
