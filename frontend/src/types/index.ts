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

export interface QuantileForecastPoint {
  day: number;
  p10: number;
  p50: number;
  p90: number;
  surge_delta: number;
  unit: string;
}

export interface ForecastModelEvaluation {
  wape: number;
  mae: number;
  rmse: number;
  baseline_wape: number;
  wape_improvement_pct: number;
}

export interface FeatureAttribution {
  feature_name: string;
  impact_pct: number;
  direction: 'POSITIVE' | 'NEGATIVE';
  explanation: string;
}

export interface QuantileForecastResponse {
  location_id: string;
  location_name: string;
  supply_id: string;
  supply_name: string;
  supply_class: string;
  horizon_days: number;
  forecast_points: QuantileForecastPoint[];
  total_projected_p50: number;
  total_projected_p90: number;
  evaluation: ForecastModelEvaluation;
  confidence_score: number;
  feature_attributions: FeatureAttribution[];
}

export interface DispatchStop {
  stop_number: number;
  location_id: string;
  location_name: string;
  arrival_hour: number;
  delivered_kg: number;
  supply_name: string;
}

export interface VehicleDispatchPlan {
  vehicle_id: string;
  callsign: string;
  vehicle_type: string;
  mode: string;
  route_sequence: string[];
  stops: DispatchStop[];
  total_distance_km: number;
  total_transit_hours: number;
  nominal_payload_kg: number;
  effective_payload_kg: number;
  allocated_payload_kg: number;
  payload_utilization_pct: number;
  fits_daylight_window: boolean;
  is_air_bridge: boolean;
  status: string;
  operational_notes: string;
}

export interface OptimizationResponse {
  total_demands_count: number;
  fulfilled_demands_count: number;
  unassigned_demands_count: number;
  total_allocated_kg: number;
  road_convoys_count: number;
  air_bridge_sorties_count: number;
  dispatch_plans: VehicleDispatchPlan[];
  solver_status: string;
  total_mission_hours: number;
}

export interface CausalFactor {
  factor_name: string;
  evidence: string;
  impact_weight_pct: number;
  threat_severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
}

export interface CounterfactualOption {
  rejected_alternative: string;
  why_rejected: string;
  projected_risk: string;
  casualty_or_stockout_hazard: string;
}

export interface DecisionExplanationReport {
  decision_id: string;
  decision_type: string;
  subject_location: string;
  subject_supply: string;
  primary_recommendation: string;
  causal_factors: CausalFactor[];
  counterfactual_tradeoffs: CounterfactualOption[];
  confidence_score: number;
  doctrine_compliance_ref: string;
  decision_disclaimer: string;
}

// Phase 5: What-If Disruption Scenario Types
export interface DisruptionScenarioPreset {
  id: string;
  name: string;
  code: string;
  description: string;
  severity: string;
  default_temp_delta_c: number;
  default_troop_surge_pct: number;
  default_closed_passes: string[];
  default_fleet_availability_pct: number;
  tactical_rationale: string;
}

export interface DisruptionSimulationRequest {
  scenario_id?: string;
  temp_delta_c: number;
  troop_surge_pct: number;
  closed_pass_ids: string[];
  fleet_availability_pct: number;
}

export interface LocationDisruptionDelta {
  location_id: string;
  location_name: string;
  sector: string;
  elevation_m: number;
  headcount_baseline: number;
  headcount_disrupted: number;
  baseline_mean_dos: number;
  disrupted_mean_dos: number;
  delta_dos: number;
  baseline_critical_items: number;
  disrupted_critical_items: number;
  emergency_deficit_kg: number;
  isolation_status: string;
  contingency_mode: string;
}

export interface StrategicResponseAction {
  priority_level: string;
  action_title: string;
  target_formation_or_unit: string;
  operational_order: string;
  justification: string;
}

export interface DisruptionSimulationResponse {
  scenario_id: string;
  scenario_name: string;
  temp_delta_c: number;
  troop_surge_pct: number;
  fleet_availability_pct: number;
  closed_pass_count: number;
  baseline_mean_dos: number;
  disrupted_mean_dos: number;
  dos_drop_pct: number;
  baseline_stockout_events: number;
  disrupted_stockout_events: number;
  delta_stockout_events: number;
  critical_outposts_baseline: number;
  critical_outposts_disrupted: number;
  delta_critical_outposts: number;
  total_emergency_tonnage_kg: number;
  mi17_sorties_required: number;
  projected_transit_delay_hours: number;
  location_deltas: LocationDisruptionDelta[];
  response_actions: StrategicResponseAction[];
}

// Phase 5: IoT Telemetry & Sensor Types
export interface TelemetryRecord {
  id: string;
  location_id: string;
  location_name: string;
  sensor_type: string;
  reading_value: number;
  unit: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  alert_message?: string;
  timestamp: string;
}

export interface DiscrepancyAlert {
  id: string;
  location_id: string;
  location_name: string;
  supply_id: string;
  supply_name: string;
  supply_class: string;
  physical_sensor_reading: number;
  book_stock_quantity: number;
  discrepancy_amount: number;
  discrepancy_pct: number;
  severity: 'CRITICAL' | 'WARNING' | 'MODERATE';
  alert_type: string;
  detection_message: string;
  recommended_action: string;
  timestamp: string;
}

export interface TelemetryOverviewResponse {
  total_active_sensors: number;
  sensors_normal: number;
  sensors_warning: number;
  sensors_critical: number;
  readings: TelemetryRecord[];
  active_discrepancies: DiscrepancyAlert[];
}

// Phase 5: Movement Orders
export interface MovementOrderResponse {
  voucher_id: string;
  movement_order_number: string;
  origin_depot_id: string;
  destination_outpost_id: string;
  priority_level: string;
  assigned_vehicle_callsign: string;
  vehicle_type: string;
  convoy_commander: string;
  authorized_officer: string;
  departure_window: string;
  estimated_arrival: string;
  route_checkpoints: string[];
  cargo_items: Array<Record<string, any>>;
  total_cargo_weight_kg: number;
  verification_hash: string;
  security_classification: string;
}

