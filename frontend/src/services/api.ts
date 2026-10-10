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
};
