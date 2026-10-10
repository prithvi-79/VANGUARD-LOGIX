import React, { useEffect, useState } from 'react';
import { CommandHeader } from './components/CommandHeader';
import { CommandBriefing } from './components/CommandBriefing';
import { TacticalGISMap } from './components/TacticalGISMap';
import { InventoryRegisters } from './components/InventoryRegisters';
import { PassMonitor } from './components/PassMonitor';
import { FleetReadiness } from './components/FleetReadiness';
import { OperationalAlerts } from './components/OperationalAlerts';
import { DecisionFlowModal } from './components/DecisionFlowModal';
import { StrategicIntelligence } from './components/StrategicIntelligence';
import { api } from './services/api';
import type {
  Location,
  StrategicPass,
  Route,
  Vehicle,
  InventoryRecord,
  IndentVoucher,
  SupplyItem,
  DBStatusResponse,
} from './types';
import {
  AlertCircle,
  RefreshCw,
  Compass,
  LayoutDashboard,
  Boxes,
  Mountain,
  Truck,
  Bell,
  Cpu,
} from 'lucide-react';

type TabView = 'map' | 'briefing' | 'inventory' | 'passes' | 'fleet' | 'alerts' | 'analytics';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabView>('map');
  const [locations, setLocations] = useState<Location[]>([]);
  const [passes, setPasses] = useState<StrategicPass[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [indents, setIndents] = useState<IndentVoucher[]>([]);
  const [supplies, setSupplies] = useState<SupplyItem[]>([]);
  const [dbStatus, setDbStatus] = useState<DBStatusResponse | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDecisionFlowOpen, setIsDecisionFlowOpen] = useState<boolean>(false);

  const loadTheaterData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [locsData, passesData, routesData, fleetData, invData, indentsData, suppliesData, statusData] =
        await Promise.all([
          api.getLocations(),
          api.getPasses(),
          api.getRoutes(),
          api.getFleet(),
          api.getInventory(),
          api.getIndents(),
          api.getSupplies(),
          api.getDBStatus(),
        ]);

      setLocations(locsData);
      setPasses(passesData);
      setRoutes(routesData);
      setVehicles(fleetData);
      setInventory(invData.items);
      setIndents(indentsData);
      setSupplies(suppliesData);
      setDbStatus(statusData);
    } catch (err: any) {
      console.error('Failed to load theater state:', err);
      setError(err.message || 'Failed to connect to tactical backend');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTheaterData();
  }, []);

  const handleTogglePass = async (passId: string, currentStatus: string) => {
    try {
      const isCurrentlyOpen = currentStatus === 'OPEN' || currentStatus === 'RESTRICTED_CONVOY';
      const newStatus = isCurrentlyOpen ? 'CLOSED_BLIZZARD' : 'OPEN';
      const reason = isCurrentlyOpen
        ? 'Simulated blizzard: heavy snow accumulation exceeding 80cm and zero visibility'
        : undefined;

      await api.updatePassStatus(passId, {
        status: newStatus,
        snow_accumulation_cm: isCurrentlyOpen ? 85.0 : 8.0,
        temperature_c: isCurrentlyOpen ? -31.0 : -11.0,
        closure_reason: reason,
        predicted_reopen_hours: isCurrentlyOpen ? 18.0 : 0.0,
      });

      // Reload passes & routes to propagate downstream corridor changes
      const [updatedPasses, updatedRoutes, updatedStatus] = await Promise.all([
        api.getPasses(),
        api.getRoutes(),
        api.getDBStatus(),
      ]);
      setPasses(updatedPasses);
      setRoutes(updatedRoutes);
      setDbStatus(updatedStatus);
    } catch (err: any) {
      alert(`Pass status update failed: ${err.message}`);
    }
  };

  // Badge counts
  const criticalCount = inventory.filter((i) => i.status === 'CRITICAL').length;
  const blockedPassCount = passes.filter((p) => !p.is_passable).length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Tactical Header */}
      <CommandHeader
        dbStatus={dbStatus}
        onRefresh={loadTheaterData}
        isLoading={isLoading}
        onOpenDecisionFlow={() => setIsDecisionFlowOpen(true)}
      />

      {/* Navigation Tabs Bar */}
      <div
        style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0 24px',
          display: 'flex',
          gap: '4px',
          overflowX: 'auto',
          position: 'sticky',
          top: '73px',
          zIndex: 40,
        }}
      >
        <button
          onClick={() => setActiveTab('map')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'map' ? '3px solid var(--accent-cyan)' : '3px solid transparent',
            color: activeTab === 'map' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'map' ? 700 : 500,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <Compass size={16} />
          <span>Tactical GIS Sector Map</span>
        </button>

        <button
          onClick={() => setActiveTab('briefing')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'briefing' ? '3px solid var(--accent-cyan)' : '3px solid transparent',
            color: activeTab === 'briefing' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'briefing' ? 700 : 500,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <LayoutDashboard size={16} />
          <span>Theater Overview & Briefing</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'inventory' ? '3px solid var(--accent-cyan)' : '3px solid transparent',
            color: activeTab === 'inventory' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'inventory' ? 700 : 500,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <Boxes size={16} />
          <span>Inventory & DoS Ledgers</span>
          {criticalCount > 0 && (
            <span
              style={{
                background: '#ef4444',
                color: '#ffffff',
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '1px 6px',
                borderRadius: '999px',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {criticalCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('passes')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'passes' ? '3px solid var(--accent-cyan)' : '3px solid transparent',
            color: activeTab === 'passes' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'passes' ? 700 : 500,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <Mountain size={16} />
          <span>BRO Strategic Passes</span>
          {blockedPassCount > 0 && (
            <span
              style={{
                background: '#ef4444',
                color: '#ffffff',
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '1px 6px',
                borderRadius: '999px',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {blockedPassCount} Severed
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('fleet')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'fleet' ? '3px solid var(--accent-cyan)' : '3px solid transparent',
            color: activeTab === 'fleet' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'fleet' ? 700 : 500,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <Truck size={16} />
          <span>Multimodal Fleet Readiness</span>
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'alerts' ? '3px solid var(--accent-cyan)' : '3px solid transparent',
            color: activeTab === 'alerts' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'alerts' ? 700 : 500,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <Bell size={16} />
          <span>Operational Alerts & Indents</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'analytics' ? '3px solid var(--accent-cyan)' : '3px solid transparent',
            color: activeTab === 'analytics' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'analytics' ? 700 : 500,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <Cpu size={16} />
          <span>Priority & Terrain Physics Engines</span>
        </button>
      </div>

      {/* Main Body */}
      <main style={{ flex: 1, padding: '24px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
        {error ? (
          <div
            className="tactical-card"
            style={{
              padding: '24px',
              border: '1px solid var(--accent-crimson)',
              background: 'rgba(239, 68, 68, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <AlertCircle size={28} className="text-crimson" />
            <div>
              <h3 style={{ fontWeight: 700, color: 'var(--accent-crimson)', margin: 0 }}>
                Tactical Gateway Connection Error
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {error}. Ensure the FastAPI backend server is running on port 8000.
              </p>
              <button
                onClick={loadTheaterData}
                className="tactical-btn"
                style={{ marginTop: '12px' }}
              >
                <RefreshCw size={14} /> Retry Gateway Connection
              </button>
            </div>
          </div>
        ) : isLoading && locations.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '420px',
              gap: '16px',
            }}
          >
            <div
              className="pulse-indicator"
              style={{ width: '22px', height: '22px', background: 'var(--accent-cyan)' }}
            />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              SYNCHRONIZING TACTICAL SECURE STREAM • NORTHERN COMMAND XIV CORPS...
            </div>
          </div>
        ) : activeTab === 'map' ? (
          <TacticalGISMap
            locations={locations}
            routes={routes}
            passes={passes}
            inventory={inventory}
            onTogglePass={handleTogglePass}
          />
        ) : activeTab === 'briefing' ? (
          <CommandBriefing
            locations={locations}
            passes={passes}
            vehicles={vehicles}
            inventory={inventory}
            indents={indents}
            onTogglePass={handleTogglePass}
          />
        ) : activeTab === 'inventory' ? (
          <InventoryRegisters
            inventory={inventory}
            locations={locations}
          />
        ) : activeTab === 'passes' ? (
          <PassMonitor
            passes={passes}
            routes={routes}
            onTogglePass={handleTogglePass}
          />
        ) : activeTab === 'fleet' ? (
          <FleetReadiness
            vehicles={vehicles}
            locations={locations}
          />
        ) : activeTab === 'analytics' ? (
          <StrategicIntelligence
            locations={locations}
            supplies={supplies}
          />
        ) : (
          <OperationalAlerts
            inventory={inventory}
            passes={passes}
            indents={indents}
            locations={locations}
          />
        )}
      </main>

      {/* Decision Flow Modal */}
      <DecisionFlowModal
        isOpen={isDecisionFlowOpen}
        onClose={() => setIsDecisionFlowOpen(false)}
      />

      {/* Military Intranet Footer */}
      <footer
        style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-tertiary)',
          fontFamily: 'var(--font-mono)',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div>
          VANGUARD-LOGIX • SMART INDIA HACKATHON 2026 (PS 26251) • MINISTRY OF DEFENCE
        </div>
        <div>
          SYNTHETIC DECISION SUPPORT • SEED: 26251 • DUAL-MODE SQLITE/POSTGRESQL
        </div>
      </footer>
    </div>
  );
};

export default App;
