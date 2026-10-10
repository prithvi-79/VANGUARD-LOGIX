/**
 * REST API Client for VANGUARD-LOGIX Backend
 */

import type {
  HealthResponse,
  DBStatusResponse,
  Location,
  SupplyItem,
  InventoryRecord,
  Route,
  StrategicPass,
  Vehicle,
  IndentVoucher,
  RiskEvaluationResponse,
  BurnDownResponse,
  PriorityQueueResponse,
  PriorityScoreResult,
  RoutePhysicsResponse,
  RoutePhysicsOutput,
} from '../types';

const BASE_URL = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || errorBody.message || `HTTP error ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Diagnostics
  getHealth: (): Promise<HealthResponse> => fetchJson(`${BASE_URL}/health`),
  getDBStatus: (): Promise<DBStatusResponse> => fetchJson(`${BASE_URL}/db-status`),
  seedDatabase: (force = false): Promise<any> =>
    fetchJson(`${BASE_URL}/seed?force=${force}`, { method: 'POST' }),

  // Tactical Locations
  getLocations: async (params?: { sector?: string; node_type?: string }): Promise<Location[]> => {
    const query = new URLSearchParams(params as any).toString();
    const data = await fetchJson<{ total: number; items: Location[] }>(
      `${BASE_URL}/locations${query ? `?${query}` : ''}`
    );
    return data.items;
  },

  getLocationById: (id: string): Promise<Location> =>
    fetchJson(`${BASE_URL}/locations/${id}`),

  // Supplies & Inventory
  getSupplies: (supplyClass?: string): Promise<SupplyItem[]> => {
    const query = supplyClass ? `?supply_class=${supplyClass}` : '';
    return fetchJson(`${BASE_URL}/supplies${query}`);
  },

  getInventory: async (params?: {
    location_id?: string;
    supply_class?: string;
    status?: string;
  }): Promise<{ total: number; items: InventoryRecord[] }> => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson(`${BASE_URL}/inventory${query ? `?${query}` : ''}`);
  },

  // Routes & Passes
  getRoutes: (params?: { origin_id?: string; destination_id?: string }): Promise<Route[]> => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson(`${BASE_URL}/routes${query ? `?${query}` : ''}`);
  },

  getPasses: (): Promise<StrategicPass[]> => fetchJson(`${BASE_URL}/passes`),

  updatePassStatus: (
    passId: string,
    data: {
      status: string;
      snow_accumulation_cm?: number;
      temperature_c?: number;
      closure_reason?: string;
      predicted_reopen_hours?: number;
    }
  ): Promise<StrategicPass> =>
    fetchJson(`${BASE_URL}/passes/${passId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Multimodal Fleet
  getFleet: async (params?: { mode?: string; status?: string }): Promise<Vehicle[]> => {
    const query = new URLSearchParams(params as any).toString();
    const data = await fetchJson<{ total: number; items: Vehicle[] }>(
      `${BASE_URL}/fleet${query ? `?${query}` : ''}`
    );
    return data.items;
  },

  checkVehicleAltitude: (vehicleId: string, elevationM: number): Promise<any> =>
    fetchJson(`${BASE_URL}/fleet/${vehicleId}/altitude-rating?elevation_m=${elevationM}`),

  // Military Indents (IAF-Z-2096)
  getIndents: (): Promise<IndentVoucher[]> => fetchJson(`${BASE_URL}/indents`),

  createIndent: (indent: any): Promise<IndentVoucher> =>
    fetchJson(`${BASE_URL}/indents`, {
      method: 'POST',
      body: JSON.stringify(indent),
    }),

  syncOfflineIndents: (deviceId: string, indents: any[]): Promise<any> =>
    fetchJson(`${BASE_URL}/indents/sync`, {
      method: 'POST',
      body: JSON.stringify({ device_id: deviceId, indents }),
    }),

  // Phase 3: Risk & Burn-Down Engine
  getRiskEvaluations: (params?: { location_id?: string; status?: string }): Promise<RiskEvaluationResponse> => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson(`${BASE_URL}/risk/evaluate${query ? `?${query}` : ''}`);
  },

  getBurnDownTrajectory: (locationId: string, supplyId: string, days = 14): Promise<BurnDownResponse> =>
    fetchJson(`${BASE_URL}/risk/burn-down?location_id=${locationId}&supply_id=${supplyId}&days=${days}`),

  // Phase 3: Multi-Attribute Priority Scoring & Queue
  getPriorityQueue: (params?: {
    tier?: string;
    supply_class?: string;
    location_id?: string;
    limit?: number;
  }): Promise<PriorityQueueResponse> => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson(`${BASE_URL}/priority/queue${query ? `?${query}` : ''}`);
  },

  scoreCustomPriority: (data: any): Promise<PriorityScoreResult> =>
    fetchJson(`${BASE_URL}/priority/score`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Phase 3: Topographic & Terrain Physics Engine
  getRoutePhysics: (params?: {
    weather_condition?: string;
    pass_id?: string;
  }): Promise<RoutePhysicsResponse> => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson(`${BASE_URL}/terrain/route-physics${query ? `?${query}` : ''}`);
  },

  getRoutePhysicsById: (routeId: string, params?: { weather_condition?: string }): Promise<RoutePhysicsOutput> => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson(`${BASE_URL}/terrain/route-physics/${routeId}${query ? `?${query}` : ''}`);
  },

  simulateTerrainPhysics: (data: {
    distance_km: number;
    max_slope_deg: number;
    surface_type?: string;
    base_transit_hours?: number;
    pass_status?: string;
    weather_condition?: string;
  }): Promise<RoutePhysicsOutput> =>
    fetchJson(`${BASE_URL}/terrain/simulate`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
