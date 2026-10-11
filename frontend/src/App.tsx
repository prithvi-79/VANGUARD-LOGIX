import React, { useEffect, useState, useMemo } from 'react';
import { useTheme } from './theme/ThemeContext';
import { CommandHeader } from './components/CommandHeader';
import { CommandBriefing } from './components/CommandBriefing';
import { TacticalGISMap } from './components/TacticalGISMap';
import { InventoryRegisters } from './components/InventoryRegisters';
import { PassMonitor } from './components/PassMonitor';
import { FleetReadiness } from './components/FleetReadiness';
import { OperationalAlerts } from './components/OperationalAlerts';
import { DecisionFlowModal } from './components/DecisionFlowModal';
import { StrategicIntelligence } from './components/StrategicIntelligence';
import { PredictiveOptimization } from './components/PredictiveOptimization';
import { DisruptionSimulator } from './components/DisruptionSimulator';
import { TelemetryMonitor } from './components/TelemetryMonitor';
import { FieldStockPWA } from './components/FieldStockPWA';
import { MilitaryIndents } from './components/MilitaryIndents';
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
  Brain,
  Sliders,
  Activity,
  Smartphone,
  FileCheck2,
} from 'lucide-react';

export type TabView =
  | 'map'
  | 'briefing'
  | 'inventory'
  | 'passes'
  | 'fleet'
  | 'indents'
  | 'field'
  | 'disruption'
  | 'telemetry'
  | 'alerts'
  | 'analytics'
  | 'optimization';

type DomainId = 'operations' | 'inventory' | 'planning' | 'contingency' | 'field_indents';

interface NavDomain {
  id: DomainId;
  label: string;
  tabs: Array<{
    id: TabView;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    badge?: number | string;
    badgeVariant?: 'critical' | 'warning' | 'normal' | 'info';
  }>;
}

export const App: React.FC = () => {
  const { theme } = useTheme();
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

  // Check URL hash on initial mount (e.g. #field for PWA direct link)
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'field') {
      setActiveTab('field');
    }
  }, []);

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
        ? 'Active blizzard: snow accumulation exceeding 80cm and visibility < 20m'
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

  // Badge calculations
  const criticalCount = useMemo(() => inventory.filter((i) => i.status === 'CRITICAL').length, [inventory]);
  const blockedPassCount = useMemo(() => passes.filter((p) => !p.is_passable).length, [passes]);
  const pendingIndentsCount = useMemo(() => indents.filter((i) => i.status === 'PENDING_APPROVAL').length, [indents]);

  // Structured 5-domain navigation schema
  const navDomains: NavDomain[] = useMemo(
    () => [
      {
        id: 'operations',
        label: 'Operations & Map',
        tabs: [
          { id: 'map', label: 'Theater Map & Routes', icon: Compass },
          { id: 'briefing', label: 'Operational Overview', icon: LayoutDashboard },
          {
            id: 'passes',
            label: 'Mountain Passes',
            icon: Mountain,
            badge: blockedPassCount > 0 ? `${blockedPassCount} Closed` : undefined,
            badgeVariant: 'critical',
          },
          { id: 'fleet', label: 'Fleet & Altitude Rating', icon: Truck },
        ],
      },
      {
        id: 'inventory',
        label: 'Supply & Stock',
        tabs: [
          {
            id: 'inventory',
            label: 'Supply Stock Ledgers',
            icon: Boxes,
            badge: criticalCount > 0 ? criticalCount : undefined,
            badgeVariant: 'critical',
          },
          { id: 'analytics', label: 'Priority & Physics Engine', icon: Cpu },
        ],
      },
      {
        id: 'planning',
        label: 'Demand & Dispatch',
        tabs: [
          { id: 'optimization', label: 'Demand Forecast & Fleet Dispatch', icon: Brain },
        ],
      },
      {
        id: 'contingency',
        label: 'Contingency & Audit',
        tabs: [
          { id: 'disruption', label: 'Disruption Simulator', icon: Sliders },
          { id: 'telemetry', label: 'Storage Telemetry & Leaks', icon: Activity },
          { id: 'alerts', label: 'Operational Alerts', icon: Bell },
        ],
      },
      {
        id: 'field_indents',
        label: 'Requisitions & Field Office',
        tabs: [
          {
            id: 'indents',
            label: 'IAF-Z-2096 Movement Orders',
            icon: FileCheck2,
            badge: pendingIndentsCount > 0 ? pendingIndentsCount : undefined,
            badgeVariant: 'warning',
          },
          { id: 'field', label: 'Field Outpost Portal (Offline / हिन्दी)', icon: Smartphone },
        ],
      },
    ],
    [criticalCount, blockedPassCount, pendingIndentsCount]
  );

  // Determine current active domain
  const activeDomain = useMemo(() => {
    for (const d of navDomains) {
      if (d.tabs.some((t) => t.id === activeTab)) {
        return d;
      }
    }
    return navDomains[0];
  }, [navDomains, activeTab]);

  return (
    <div
      id="vanguard-app-container"
      data-theme={theme}
      className={theme}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-app)',
        color: 'var(--text-primary)',
        transition: 'background-color 0.15s ease, color 0.15s ease',
      }}
    >
      {/* Top Header */}
      <CommandHeader
        dbStatus={dbStatus}
        onRefresh={loadTheaterData}
        isLoading={isLoading}
        onOpenDecisionFlow={() => setIsDecisionFlowOpen(true)}
      />

      {/* Primary Domain Navigation Ribbon */}
      <nav
        aria-label="Primary Navigation"
        style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: '73px',
          zIndex: 40,
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        {/* Domain Tabs (Carbon Product Tab Strip) */}
        <div style={{ display: 'flex', gap: '0px', overflowX: 'auto', padding: '0' }}>
          {navDomains.map((domain) => {
            const isDomainActive = activeDomain.id === domain.id;
            return (
              <button
                key={domain.id}
                onClick={() => {
                  if (!isDomainActive) {
                    setActiveTab(domain.tabs[0].id);
                  }
                }}
                style={{
                  padding: '14px 18px',
                  borderRadius: '0px',
                  border: 'none',
                  borderBottom: isDomainActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  background: 'transparent',
                  color: isDomainActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: isDomainActive ? 600 : 400,
                  fontSize: '0.84rem',
                  letterSpacing: '0.16px',
                  cursor: 'pointer',
                  transition: 'color 0.12s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{domain.label}</span>
              </button>
            );
          })}
        </div>

        {/* Secondary Sub-View Actions for Active Domain */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 0', overflowX: 'auto' }}>
          {activeDomain.tabs.map((tab) => {
            const isTabActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="tactical-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  borderRadius: '0px',
                  background: isTabActive ? 'var(--accent-primary)' : 'var(--bg-surface-elevated)',
                  borderColor: isTabActive ? 'var(--accent-primary)' : 'var(--border-subtle)',
                  color: isTabActive ? 'var(--text-inverse)' : 'var(--text-primary)',
                  fontWeight: isTabActive ? 600 : 400,
                }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`tactical-badge ${
                      tab.badgeVariant === 'critical'
                        ? 'badge-critical'
                        : tab.badgeVariant === 'warning'
                        ? 'badge-warning'
                        : 'badge-info'
                    }`}
                    style={{
                      fontSize: '0.65rem',
                      padding: '1px 5px',
                      borderRadius: '0px',
                      background: isTabActive ? 'rgba(0, 0, 0, 0.25)' : undefined,
                      color: isTabActive ? '#ffffff' : undefined,
                      borderColor: isTabActive ? 'transparent' : undefined,
                    }}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content Viewport */}
      <main style={{ flex: 1, padding: '20px 24px', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
        {error ? (
          <div
            className="panel"
            style={{
              padding: '24px',
              border: '1px solid var(--accent-crimson)',
              background: 'var(--badge-critical-bg)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <AlertCircle size={28} className="text-crimson" />
            <div>
              <h3 style={{ fontWeight: 600, color: 'var(--accent-crimson)', margin: 0, fontSize: '1rem' }}>
                Service Gateway Connection Error
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {error}. Verify the backend API server is active on port 8000.
              </p>
              <button
                onClick={loadTheaterData}
                className="tactical-btn"
                style={{ marginTop: '12px' }}
              >
                <RefreshCw size={14} /> Reconnect Gateway
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
              height: '380px',
              gap: '14px',
            }}
          >
            <RefreshCw size={24} className="animate-spin text-sky" />
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Loading theater stock, road corridors, and pass conditions...
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
        ) : activeTab === 'indents' ? (
          <MilitaryIndents
            indents={indents}
            onRefresh={loadTheaterData}
          />
        ) : activeTab === 'field' ? (
          <FieldStockPWA
            locations={locations}
            supplies={supplies}
            inventory={inventory}
            onIndentCreated={loadTheaterData}
          />
        ) : activeTab === 'disruption' ? (
          <DisruptionSimulator
            passes={passes}
          />
        ) : activeTab === 'telemetry' ? (
          <TelemetryMonitor
            locations={locations}
          />
        ) : activeTab === 'analytics' ? (
          <StrategicIntelligence
            locations={locations}
            supplies={supplies}
          />
        ) : activeTab === 'optimization' ? (
          <PredictiveOptimization
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

      {/* Carbon Inverted Footer */}
      <footer
        style={{
          padding: '28px 24px',
          borderTop: '1px solid var(--footer-border)',
          background: 'var(--footer-bg)',
          color: 'var(--footer-text)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.78rem',
          letterSpacing: '0.16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <span style={{ color: 'var(--footer-heading)', fontWeight: 600 }}>Vanguard Logistics Operations Platform</span>
          <span style={{ margin: '0 8px', color: 'var(--footer-border)' }}>•</span>
          <span>Northern Command XIV Corps</span>
          <span style={{ margin: '0 8px', color: 'var(--footer-border)' }}>•</span>
          <span>Directorate General of Supplies & Transport</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', color: 'var(--footer-text)' }}>
          <span>Deterministic Modeling Engine</span>
          <span>•</span>
          <span>Dual-Mode Architecture (PostgreSQL / SQLite)</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
