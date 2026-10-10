"""
Pure Stateless Topographic & Terrain Physics Engine
Implements empirical mountain transport physics: road slope grade resistance,
surface friction multipliers, weather degradation, and pass choke-point severance.
"""

from dataclasses import dataclass
from typing import List, Dict, Any, Optional


@dataclass(frozen=True)
class RoutePhysicsInput:
    route_id: str
    route_name: str
    distance_km: float
    max_slope_deg: float
    average_elevation_m: float
    surface_type: str  # HIGHWAY, MOUNTAIN_ROAD, UNPAVED_TRACK, GLACIAL_SNOWCAT_TRAIL
    base_transit_hours: float
    pass_status: str = "OPEN"  # OPEN, RESTRICTED_CONVOY, CLOSED_BLIZZARD, CLOSED_AVALANCHE
    pass_name: Optional[str] = None
    weather_condition: str = "NORMAL"  # NORMAL, RAIN_SLUSH, SNOW_ICE, BLIZZARD


@dataclass(frozen=True)
class RoutePhysicsOutput:
    route_id: str
    route_name: str
    distance_km: float
    max_slope_deg: float
    grade_resistance_factor: float
    surface_friction_factor: float
    weather_friction_factor: float
    composite_terrain_friction: float
    base_transit_hours: float
    effective_transit_hours: float
    is_passable: bool
    status: str
    contingency_fallback: Optional[str]
    notes: str


def calculate_grade_resistance(slope_deg: float) -> float:
    """
    Computes empirical road slope grade resistance factor:
    Rg = 1.0 + 0.035 * |slope| + 0.002 * |slope|^2
    """
    theta = abs(slope_deg)
    return round(1.0 + 0.035 * theta + 0.002 * (theta ** 2), 3)


def get_surface_friction_multiplier(surface_type: str) -> float:
    """Terrain surface friction multiplier."""
    mapping = {
        "HIGHWAY": 1.00,
        "MOUNTAIN_ROAD": 1.25,
        "UNPAVED_TRACK": 1.55,
        "GLACIAL_SNOWCAT_TRAIL": 1.85,
    }
    return mapping.get(surface_type.upper(), 1.25)


def get_weather_friction_multiplier(weather_condition: str) -> float:
    """Environmental degradation multiplier."""
    mapping = {
        "NORMAL": 1.00,
        "RAIN_SLUSH": 1.20,
        "SNOW_ICE": 1.45,
        "BLIZZARD": 3.50,
    }
    return mapping.get(weather_condition.upper(), 1.00)


def compute_route_physics(route: RoutePhysicsInput) -> RoutePhysicsOutput:
    """
    Calculates composite terrain physics and passability for a military supply corridor.
    """
    grade_factor = calculate_grade_resistance(route.max_slope_deg)
    surface_factor = get_surface_friction_multiplier(route.surface_type)
    weather_factor = get_weather_friction_multiplier(route.weather_condition)

    # Pass condition takes absolute precedence
    pass_blocked = route.pass_status in ("CLOSED_BLIZZARD", "CLOSED_AVALANCHE")
    pass_restricted = route.pass_status == "RESTRICTED_CONVOY"

    if pass_blocked or route.weather_condition == "BLIZZARD":
        is_passable = False
        status = "CLOSED"
        effective_hours = 999.0
        composite_friction = round(grade_factor * surface_factor * weather_factor, 2)
        contingency = "IAF Mi-17 V5 Tactical Air-Bridge Sortie / Airdrop"
        notes = f"Corridor blocked by {route.pass_name or 'severe weather'}. Road transit impassable."
    elif pass_restricted:
        is_passable = True
        status = "RESTRICTED"
        weather_factor = max(weather_factor, 1.35)
        composite_friction = round(grade_factor * surface_factor * weather_factor, 2)
        effective_hours = round(route.base_transit_hours * composite_friction, 1)
        contingency = "Single-lane convoy timing restriction; tire-chains and heavy recovery escort mandatory."
        notes = f"Controlled convoy transit over {route.pass_name or 'pass'}."
    else:
        is_passable = True
        status = "OPEN"
        composite_friction = round(grade_factor * surface_factor * weather_factor, 2)
        effective_hours = round(route.base_transit_hours * composite_friction, 1)
        contingency = None
        notes = "Corridor fully open with standard mountain convoy operating speeds."

    return RoutePhysicsOutput(
        route_id=route.route_id,
        route_name=route.route_name,
        distance_km=route.distance_km,
        max_slope_deg=route.max_slope_deg,
        grade_resistance_factor=grade_factor,
        surface_friction_factor=surface_factor,
        weather_friction_factor=weather_factor,
        composite_terrain_friction=composite_friction,
        base_transit_hours=route.base_transit_hours,
        effective_transit_hours=effective_hours,
        is_passable=is_passable,
        status=status,
        contingency_fallback=contingency,
        notes=notes,
    )
