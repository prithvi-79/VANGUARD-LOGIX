/**
 * Tactical Data Models & Types for VANGUARD-LOGIX
 */

export interface Location {
  id: string;
  name: string;
  node_type: 'BASE_DEPOT' | 'FORWARD_POST' | 'AIR_LOGISTICS_HUB' | 'TRANSIT_CAMP';
  sector: string;
  latitude: number;
  longitude: number;
  elevation_m: number;
  mgrs_grid: string;
  storage_capacity_tons: number;
  current_headcount: number;
  is_air_accessible: boolean;
  weather_risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  updated_at?: string;
}

export interface SupplyItem {
  id: string;
  name: string;
  supply_class: 'CLASS_I' | 'CLASS_II' | 'CLASS_III' | 'CLASS_IV' | 'CLASS_V';
  class_label: string;
  unit: string;
  unit_weight_kg: number;
  priority_weight: number;
  shelf_life_days: number;
  storage_type: string;
}

export interface InventoryRecord {
  id: string;
  location_id: string;
  supply_id: string;
  current_stock: number;
  daily_consumption_rate: number;
  safety_stock_threshold: number;
  reorder_point: number;
  batch_number: string;
  days_of_supply: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  updated_at?: string;
  supply?: SupplyItem;
}

export interface StrategicPass {
  id: string;
  name: string;
  highway: string;
  elevation_m: number;
  latitude: number;
  longitude: number;
  status: 'OPEN' | 'RESTRICTED_CONVOY' | 'CLOSED_BLIZZARD' | 'CLOSED_AVALANCHE';
  snow_accumulation_cm: number;
  temperature_c: number;
  bro_detachment: string;
  predicted_reopen_hours: number;
  closure_reason?: string;
  is_passable: boolean;
  last_status_update?: string;
}

export interface Route {
  id: string;
  name: string;
  origin_id: string;
  destination_id: string;
  distance_km: number;
  surface_type: string;
  max_slope_deg: number;
  average_elevation_m: number;
  transit_mode: string;
  base_transit_hours: number;
  status: 'OPEN' | 'RESTRICTED' | 'CLOSED';
  choke_pass_id?: string;
  grade_resistance_factor: number;
  surface_friction_factor: number;
}

export interface Vehicle {
  id: string;
  callsign: string;
  vehicle_type: string;
  mode: 'ROAD' | 'AIR' | 'ALL_TERRAIN' | 'ANIMAL_TRANSPORT';
  max_payload_kg: number;
  service_ceiling_m: number;
  fuel_type: string;
  fuel_consumption_rate: number;
  current_location_id: string;
  operational_status: 'AVAILABLE' | 'DISPATCHED' | 'MAINTENANCE' | 'GROUNDED_WEATHER';
}

export interface IndentVoucher {
  id: string;
  originating_unit: string;
  forward_post_id: string;
  priority: 'OP_IMMEDIATE' | 'PRIORITY' | 'ROUTINE';
  officer_service_number: string;
  officer_name: string;
  items: Array<{
    supply_id: string;
    supply_name: string;
    supply_class: string;
    quantity_requested: number;
    unit: string;
    urgency_reason?: string;
  }>;
  justification: string;
  status: string;
  verification_hash: string;
  created_at?: string;
  synchronized_at?: string;
}

export interface HealthResponse {
  status: string;
  version: string;
  project: string;
  theater: string;
  database: string;
  environment: string;
  timestamp: string;
}

export interface DBStatusResponse {
  database_url: string;
  database_type: string;
  is_connected: boolean;
  tables_count: number;
  locations_count: number;
  supplies_count: number;
  routes_count: number;
  passes_count: number;
  vehicles_count: number;
  inventory_records_count: number;
  details?: Record<string, any>;
}

export interface RiskAssessment {
  location_id: string;
  supply_id: string;
  supply_name: string;
  supply_class: string;
  current_stock: number;
  daily_consumption_rate: number;
  days_of_supply: number;
  status: 'CRITICAL' | 'WARNING' | 'NORMAL';
  safety_deficit: number;
  reorder_deficit: number;
  days_until_safety_breach: number;
  requires_emergency_replenishment: boolean;
  burn_rate_elevation_multiplier: number;
  unit: string;
}

export interface RiskEvaluationResponse {
  total_evaluated: number;
  critical_count: number;
  warning_count: number;
  normal_count: number;
  items: RiskAssessment[];
}

export interface BurnDownPoint {
  day: number;
  projected_stock: number;
  days_of_supply: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'STOCKOUT';
  safety_threshold: number;
  reorder_point: number;
}

export interface BurnDownResponse {
  location_id: string;
  location_name: string;
  elevation_m: number;
  supply_id: string;
  supply_name: string;
  initial_stock: number;
  unit: string;
  horizon_days: number;
  trajectory: BurnDownPoint[];
}

export interface PriorityScoreResult {
  location_id: string;
  location_name: string;
  supply_id: string;
  supply_name: string;
  supply_class: string;
  composite_score: number;
  priority_tier: 'OP_IMMEDIATE' | 'HIGH' | 'MEDIUM' | 'ROUTINE';
  factor_breakdown: {
    urgency_dos: number;
    safety_deficit: number;
    supply_criticality: number;
    lead_time_pressure: number;
    route_feasibility: number;
    environmental_threat: number;
    headcount_vulnerability: number;
  };
  recommended_action: string;
  recommended_mode: 'ROAD' | 'AIR_BRIDGE' | 'ALL_TERRAIN' | 'MULE_TRAIN';
}

export interface PriorityQueueResponse {
  total_items: number;
  op_immediate_count: number;
  high_count: number;
  medium_count: number;
  routine_count: number;
  items: PriorityScoreResult[];
}

export interface RoutePhysicsOutput {
  route_id: string;
  route_name: string;
  distance_km: number;
  max_slope_deg: number;
  grade_resistance_factor: number;
  surface_friction_factor: number;
  weather_friction_factor: number;
  composite_terrain_friction: number;
  base_transit_hours: number;
  effective_transit_hours: number;
  is_passable: boolean;
  status: 'OPEN' | 'RESTRICTED' | 'CLOSED';
  contingency_fallback?: string;
  notes: string;
}

export interface RoutePhysicsResponse {
  total_corridors: number;
  open_count: number;
  restricted_count: number;
  closed_count: number;
  air_bridge_required_count: number;
  corridors: RoutePhysicsOutput[];
}
