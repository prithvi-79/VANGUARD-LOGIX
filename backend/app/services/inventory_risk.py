"""
Pure Stateless Inventory Risk & Days-of-Supply (DoS) Engine
Implements defense-grade burn-rate analysis, safety deficit calculations,
and multi-day burn-down simulation trajectories.
"""

from dataclasses import dataclass
from typing import List, Dict, Any, Optional


@dataclass(frozen=True)
class InventoryItemState:
    location_id: str
    supply_id: str
    supply_name: str
    supply_class: str
    current_stock: float
    daily_consumption_rate: float
    safety_stock_threshold: float
    reorder_point: float
    elevation_m: float = 3500.0
    unit: str = "KG"


@dataclass(frozen=True)
class RiskAssessment:
    location_id: str
    supply_id: str
    supply_name: str
    supply_class: str
    current_stock: float
    daily_consumption_rate: float
    days_of_supply: float
    status: str  # CRITICAL, WARNING, NORMAL
    safety_deficit: float
    reorder_deficit: float
    days_until_safety_breach: float
    requires_emergency_replenishment: bool
    burn_rate_elevation_multiplier: float
    unit: str


def calculate_elevation_burn_multiplier(supply_class: str, elevation_m: float) -> float:
    """
    Computes burn-rate multiplier based on extreme high altitude (>3,000m MSL).
    Class III (Fuel/Heating Oil) consumption surges drastically at extreme altitudes.
    Class I (High-Calorie Rations) increases slightly due to metabolic burn.
    """
    if elevation_m <= 3000.0:
        return 1.0

    delta_km = (elevation_m - 3000.0) / 1000.0

    if supply_class == "CLASS_III":
        # Heating fuel and generator fuel spike ~35% per 1,000m above 3,000m
        return round(1.0 + 0.35 * delta_km, 3)
    elif supply_class == "CLASS_I":
        # Caloric intake requirement increases ~10% per 1,000m
        return round(1.0 + 0.10 * delta_km, 3)
    elif supply_class == "CLASS_II":
        # ECC clothing wear and tear in glacial moraine
        return round(1.0 + 0.05 * delta_km, 3)
    return 1.0


def compute_days_of_supply(current_stock: float, daily_rate: float) -> float:
    """Calculate Days of Supply: DoS = Current Stock / Daily Consumption Rate."""
    if daily_rate <= 0:
        return 999.0
    if current_stock <= 0:
        return 0.0
    return round(current_stock / daily_rate, 1)


def compute_safety_deficit(current_stock: float, safety_threshold: float) -> float:
    """Safety stock shortfall in native units: max(0, safety_threshold - current_stock)."""
    return round(max(0.0, safety_threshold - current_stock), 1)


def assess_item_risk(item: InventoryItemState) -> RiskAssessment:
    """
    Evaluates risk state for an individual inventory item.
    Classifies into:
    - CRITICAL: DoS <= 5.0 OR Current Stock < Safety Threshold
    - WARNING:  DoS <= 12.0 OR Current Stock < Reorder Point
    - NORMAL:   DoS > 12.0 AND Current Stock >= Reorder Point
    """
    elev_multiplier = calculate_elevation_burn_multiplier(item.supply_class, item.elevation_m)
    effective_daily_burn = round(item.daily_consumption_rate * elev_multiplier, 1)

    dos = compute_days_of_supply(item.current_stock, effective_daily_burn)
    safety_deficit = compute_safety_deficit(item.current_stock, item.safety_stock_threshold)
    reorder_deficit = round(max(0.0, item.reorder_point - item.current_stock), 1)

    if dos <= 5.0 or item.current_stock < item.safety_stock_threshold:
        status = "CRITICAL"
        requires_emergency = True
    elif dos <= 12.0 or item.current_stock < item.reorder_point:
        status = "WARNING"
        requires_emergency = False
    else:
        status = "NORMAL"
        requires_emergency = False

    # Days until safety stock threshold is breached
    if effective_daily_burn > 0 and item.current_stock > item.safety_stock_threshold:
        days_to_breach = round((item.current_stock - item.safety_stock_threshold) / effective_daily_burn, 1)
    else:
        days_to_breach = 0.0

    return RiskAssessment(
        location_id=item.location_id,
        supply_id=item.supply_id,
        supply_name=item.supply_name,
        supply_class=item.supply_class,
        current_stock=item.current_stock,
        daily_consumption_rate=effective_daily_burn,
        days_of_supply=dos,
        status=status,
        safety_deficit=safety_deficit,
        reorder_deficit=reorder_deficit,
        days_until_safety_breach=days_to_breach,
        requires_emergency_replenishment=requires_emergency,
        burn_rate_elevation_multiplier=elev_multiplier,
        unit=item.unit,
    )


def simulate_burn_down(
    initial_stock: float,
    daily_rates: List[float],
    safety_threshold: float,
    reorder_point: float,
    num_days: int = 14,
) -> List[Dict[str, Any]]:
    """
    Generates a deterministic day-by-day forward inventory burn-down trajectory.
    Tracks stock depletion, DoS, and threshold crossings.
    """
    trajectory = []
    stock = initial_stock

    for day in range(1, num_days + 1):
        rate = daily_rates[(day - 1) % len(daily_rates)]
        stock = max(0.0, stock - rate)
        dos = compute_days_of_supply(stock, rate)

        if stock == 0:
            status = "STOCKOUT"
        elif dos <= 5.0 or stock < safety_threshold:
            status = "CRITICAL"
        elif dos <= 12.0 or stock < reorder_point:
            status = "WARNING"
        else:
            status = "NORMAL"

        trajectory.append({
            "day": day,
            "projected_stock": round(stock, 1),
            "burn_rate": round(rate, 1),
            "days_of_supply": dos,
            "safety_threshold": safety_threshold,
            "reorder_point": reorder_point,
            "status": status,
        })

    return trajectory
