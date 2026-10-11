"""
IoT Cold-Chain & Fuel Bladder Telemetry Service
Models real-time sensor streams, detects physical vs book stock discrepancies,
and triggers fuel leak/pilferage and cold-chain temperature excursion alarms.
"""

from typing import List, Dict, Optional
from datetime import datetime, timezone
import random

from app.schemas.telemetry import (
    TelemetryRecordResponse,
    DiscrepancyAlert,
    TelemetryOverviewResponse,
    TelemetryAnomalyRequest,
)
from app.services.seed_data import (
    get_deterministic_locations,
    get_deterministic_supplies,
    generate_inventory_records,
)

# In-memory simulated anomalies for live jury demonstration
ACTIVE_SIMULATED_ANOMALIES: Dict[str, Dict[str, Any]] = {
    "LOC-KUMAR": {
        "anomaly_type": "FUEL_LEAK",
        "severity": "CRITICAL",
        "discrepancy_pct": 14.8,
        "discrepancy_amount": 2150.0,
        "message": "Physical fuel bladder level 2,150 L below book inventory (-14.8%). High-risk bladder puncture or unlogged siphon under blizzard cover.",
        "action": "Immediate dispatch of 2-soldier engineering survey team to inspect high-altitude bladder valves and manifold.",
    },
    "LOC-DBO": {
        "anomaly_type": "COLD_CHAIN_EXCURSION",
        "severity": "WARNING",
        "discrepancy_pct": 0.0,
        "discrepancy_amount": 0.0,
        "temperature_reading": -8.4,
        "message": "Class II Medical Plasma Cryo-Chamber temperature rose to -8.4°C (Safe limit: ≤ -18.0°C). Anti-freeze generator backup voltage dipping.",
        "action": "Activate auxiliary solar-battery inverter and verify thermal seals on medical cryo-box.",
    },
}


def get_deterministic_telemetry_stream(seed: int = 26251) -> List[TelemetryRecordResponse]:
    """Generates deterministic real-time telemetry readings across XIV Corps logistics nodes."""
    rng = random.Random(seed)
    now = datetime.now(timezone.utc)
    locations = get_deterministic_locations()
    readings: List[TelemetryRecordResponse] = []

    for loc in locations:
        elev = loc.elevation_m

        # 1. Fuel Bladder Level Sensor
        is_anomalous_fuel = loc.id in ACTIVE_SIMULATED_ANOMALIES and ACTIVE_SIMULATED_ANOMALIES[loc.id]["anomaly_type"] == "FUEL_LEAK"
        fuel_capacity = 60000.0 if loc.node_type == "BASE_DEPOT" else 20000.0
        fuel_level = rng.uniform(42000.0, 56000.0) if loc.node_type == "BASE_DEPOT" else rng.uniform(7000.0, 16000.0)
        if is_anomalous_fuel:
            fuel_level -= ACTIVE_SIMULATED_ANOMALIES[loc.id]["discrepancy_amount"]

        fuel_status = "CRITICAL" if is_anomalous_fuel else ("WARNING" if fuel_level < 8000.0 else "NORMAL")
        alert_msg = ACTIVE_SIMULATED_ANOMALIES[loc.id]["message"] if is_anomalous_fuel else None

        readings.append(
            TelemetryRecordResponse(
                id=f"TEL-FUEL-{loc.id}",
                location_id=loc.id,
                location_name=loc.name,
                sensor_type="FUEL_BLADDER_LEVEL",
                reading_value=round(fuel_level, 1),
                unit="LITERS",
                status=fuel_status,
                alert_message=alert_msg,
                timestamp=now,
            )
        )

        # 2. Fuel Bladder Heating Blanket Temperature
        # Keeps arctic diesel fluid (-35°C ambient requires heater to maintain > -10°C)
        ambient_temp = round(-12.0 - (elev - 3000.0) / 180.0, 1)
        blanket_temp = round(4.5 + rng.uniform(-1.0, 1.5), 1)

        readings.append(
            TelemetryRecordResponse(
                id=f"TEL-HEAT-{loc.id}",
                location_id=loc.id,
                location_name=loc.name,
                sensor_type="FUEL_HEATING_BLANKET_TEMP",
                reading_value=blanket_temp,
                unit="CELSIUS",
                status="NORMAL",
                alert_message=None,
                timestamp=now,
            )
        )

        # 3. Medical Cold-Chain Cryo-Chamber (for locations holding medical items)
        is_cryo_anomaly = loc.id in ACTIVE_SIMULATED_ANOMALIES and ACTIVE_SIMULATED_ANOMALIES[loc.id]["anomaly_type"] == "COLD_CHAIN_EXCURSION"
        cryo_temp = ACTIVE_SIMULATED_ANOMALIES[loc.id].get("temperature_reading", -24.5) if is_cryo_anomaly else round(-24.0 + rng.uniform(-4.0, 2.0), 1)
        cryo_status = "WARNING" if is_cryo_anomaly else "NORMAL"
        cryo_alert = ACTIVE_SIMULATED_ANOMALIES[loc.id]["message"] if is_cryo_anomaly else None

        readings.append(
            TelemetryRecordResponse(
                id=f"TEL-CRYO-{loc.id}",
                location_id=loc.id,
                location_name=loc.name,
                sensor_type="COLD_CHAIN_CRYO_TEMP",
                reading_value=cryo_temp,
                unit="CELSIUS",
                status=cryo_status,
                alert_message=cryo_alert,
                timestamp=now,
            )
        )

        # 4. Ambient Weather & Barometric Sensor
        readings.append(
            TelemetryRecordResponse(
                id=f"TEL-AMB-{loc.id}",
                location_id=loc.id,
                location_name=loc.name,
                sensor_type="AMBIENT_AIR_TEMP",
                reading_value=ambient_temp,
                unit="CELSIUS",
                status="WARNING" if ambient_temp < -25.0 else "NORMAL",
                alert_message=f"Extreme high-altitude cold ({ambient_temp}°C) at {loc.elevation_m}m MSL" if ambient_temp < -25.0 else None,
                timestamp=now,
            )
        )

    return readings


def detect_inventory_discrepancies(seed: int = 26251) -> List[DiscrepancyAlert]:
    """
    Compares physical IoT bladder sensor readings against the authoritative book inventory ledger.
    Identifies leaks, siphons/pilferage, and cold-chain temperature excursions.
    """
    now = datetime.now(timezone.utc)
    locations = {loc.id: loc for loc in get_deterministic_locations()}
    supplies = {s.id: s for s in get_deterministic_supplies()}
    inventory = generate_inventory_records(list(locations.values()), list(supplies.values()), seed=seed)

    alerts: List[DiscrepancyAlert] = []

    # Map inventory records for fuel
    fuel_records: Dict[str, float] = {}
    for inv in inventory:
        if inv.supply_id == "SUP-POL-DIESEL-ARCTIC":
            fuel_records[inv.location_id] = inv.current_stock

    for loc_id, anomaly in ACTIVE_SIMULATED_ANOMALIES.items():
        loc = locations.get(loc_id)
        if not loc:
            continue

        if anomaly["anomaly_type"] == "FUEL_LEAK":
            book_stock = fuel_records.get(loc_id, 14500.0)
            discrepancy_amount = anomaly["discrepancy_amount"]
            physical_reading = round(book_stock - discrepancy_amount, 1)
            pct = round((discrepancy_amount / max(1.0, book_stock)) * 100.0, 1)

            alerts.append(
                DiscrepancyAlert(
                    id=f"DISC-LEAK-{loc_id}",
                    location_id=loc_id,
                    location_name=loc.name,
                    supply_id="SUP-POL-DIESEL-ARCTIC",
                    supply_name="Arctic Grade Diesel (50kL Bladder)",
                    supply_class="CLASS_III",
                    physical_sensor_reading=physical_reading,
                    book_stock_quantity=book_stock,
                    discrepancy_amount=discrepancy_amount,
                    discrepancy_pct=pct,
                    severity=anomaly["severity"],
                    alert_type="FUEL_LEAK_OR_PILFERAGE",
                    detection_message=anomaly["message"],
                    recommended_action=anomaly["action"],
                    timestamp=now,
                )
            )

        elif anomaly["anomaly_type"] == "COLD_CHAIN_EXCURSION":
            alerts.append(
                DiscrepancyAlert(
                    id=f"DISC-CRYO-{loc_id}",
                    location_id=loc_id,
                    location_name=loc.name,
                    supply_id="SUP-MED-PLASMA",
                    supply_name="Freeze-Dried Blood Plasma Cryo-Box",
                    supply_class="CLASS_II",
                    physical_sensor_reading=anomaly["temperature_reading"],
                    book_stock_quantity=-25.0,  # nominal setpoint
                    discrepancy_amount=round(anomaly["temperature_reading"] - (-25.0), 1),
                    discrepancy_pct=0.0,
                    severity=anomaly["severity"],
                    alert_type="COLD_CHAIN_EXCURSION",
                    detection_message=anomaly["message"],
                    recommended_action=anomaly["action"],
                    timestamp=now,
                )
            )

    return alerts


def get_telemetry_overview() -> TelemetryOverviewResponse:
    """Returns aggregated live telemetry readings and discrepancy alerts."""
    readings = get_deterministic_telemetry_stream()
    discrepancies = detect_inventory_discrepancies()

    normal = sum(1 for r in readings if r.status == "NORMAL")
    warning = sum(1 for r in readings if r.status == "WARNING")
    critical = sum(1 for r in readings if r.status == "CRITICAL")

    return TelemetryOverviewResponse(
        total_active_sensors=len(readings),
        sensors_normal=normal,
        sensors_warning=warning,
        sensors_critical=critical,
        readings=readings,
        active_discrepancies=discrepancies,
    )


def inject_simulated_anomaly(req: TelemetryAnomalyRequest) -> Dict[str, Any]:
    """Injects or resets simulated sensor discrepancies for jury demonstrations."""
    if req.anomaly_type == "RESET_ALL":
        ACTIVE_SIMULATED_ANOMALIES.clear()
        return {"status": "SUCCESS", "message": "All simulated sensor discrepancies cleared."}

    ACTIVE_SIMULATED_ANOMALIES[req.location_id] = {
        "anomaly_type": req.anomaly_type,
        "severity": req.severity,
        "discrepancy_pct": req.discrepancy_pct,
        "discrepancy_amount": 2400.0,
        "temperature_reading": -6.5 if req.anomaly_type == "COLD_CHAIN_EXCURSION" else -24.0,
        "message": f"Demonstration anomaly: {req.anomaly_type} flagged at {req.location_id}.",
        "action": "Jury demonstration simulated response directive dispatched to field station.",
    }

    return {
        "status": "SUCCESS",
        "anomaly_injected": req.model_dump(),
        "active_discrepancies_count": len(ACTIVE_SIMULATED_ANOMALIES),
    }
