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
import { QuickSearchModal } from './components/QuickSearchModal';
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
  TrendingUp,
  Sliders,
  Activity,
  Smartphone,
  FileCheck2,
  Bell,
} from 'lucide-react';

export type TabView =
  | 'briefing'
  | 'map'
  | 'inventory'
  | 'optimization'
  | 'fleet'
  | 'passes'
  | 'disruption'
  | 'indents'
  | 'telemetry'
  | 'alerts'
  | 'field'
  | 'analytics';

interface NavItem {
  id: TabView;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  badge?: number | string;
  badgeVariant?: 'critical' | 'warning' | 'normal' | 'info';
}

export const App: React.FC = () => {
  const { theme } = useTheme();
  // Default to executive dashboard so first-time users immediately understand the platform posture
  const [activeTab, setActiveTab] = useState<TabView>('briefing');
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
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);

  // Check URL hash on initial mount (e.g. #field for direct link)
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'field') {
      setActiveTab('field');
    }
  }, []);

  // Global keyboard shortcut for search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

  const handleNavigate = (tab: TabView, _context?: any) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Badge calculations
  const criticalCount = useMemo(() => inventory.filter((i) => i.status === 'CRITICAL').length, [inventory]);
  const blockedPassCount = useMemo(() => passes.filter((p) => !p.is_passable).length, [passes]);
  const pendingIndentsCount = useMemo(() => indents.filter((i) => i.status === 'PENDING_APPROVAL').length, [indents]);

  // Clean, single-tier, commercial SaaS navigation items
  const primaryNavItems: NavItem[] = useMemo(
    () => [
      {
        id: 'briefing',
        label: 'Dashboard',
        icon: LayoutDashboard,
      },
      {
        id: 'map',
        label: 'Corridor Map',
        icon: Compass,
      },
      {
        id: 'inventory',
        label: 'Inventory',
        icon: Boxes,
        badge: criticalCount > 0 ? `${criticalCount} Critical` : undefined,
        badgeVariant: 'critical',
      },
      {
        id: 'optimization',
        label: 'Forecasting & Dispatch',
        icon: TrendingUp,
      },
      {
        id: 'fleet',
        label: 'Fleet & Altitude',
        icon: Truck,
      },
      {
        id: 'passes',
        label: 'Mountain Passes',
        icon: Mountain,
        badge: blockedPassCount > 0 ? `${blockedPassCount} Closed` : undefined,
        badgeVariant: 'critical',
      },
      {
        id: 'disruption',
        label: 'Disruption Simulator',
        icon: Sliders,
      },
      {
        id: 'indents',
        label: 'Requisitions',
        icon: FileCheck2,
        badge: pendingIndentsCount > 0 ? `${pendingIndentsCount} Pending` : undefined,
        badgeVariant: 'warning',
      },
      {
        id: 'telemetry',
        label: 'Sensors & Telemetry',
        icon: Activity,
      },
      {
        id: 'alerts',
        label: 'Alerts',
        icon: Bell,
        badge: criticalCount + blockedPassCount > 0 ? criticalCount + blockedPassCount : undefined,
        badgeVariant: 'critical',
      },
      {
        id: 'field',
        label: 'Field Portal (Offline)',
        icon: Smartphone,
      },
    ],
    [criticalCount, blockedPassCount, pendingIndentsCount]
  );

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
      {/* Top Global Command Header */}
      <CommandHeader
        dbStatus={dbStatus}
        onRefresh={loadTheaterData}
        isLoading={isLoading}
        onOpenDecisionFlow={() => setIsDecisionFlowOpen(true)}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onNavigateHome={() => handleNavigate('briefing')}
        criticalCount={criticalCount}
        blockedPassCount={blockedPassCount}
      />

      {/* Primary Navigation Ribbon (Single-tier, scannable, intuitive) */}
      <nav
        aria-label="Primary Platform Navigation"
        style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        <div style={{ display: 'flex', gap: '0px', width: '100%' }}>
          {primaryNavItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '13px 16px',
                  borderRadius: '0px',
                  border: 'none',
                  borderBottom: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                  background: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '0.84rem',
                  letterSpacing: '0.12px',
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={15} style={{ color: isActive ? 'var(--accent-primary)' : 'var(--text-tertiary)' }} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`tactical-badge ${
                      item.badgeVariant === 'critical'
                        ? 'badge-critical'
                        : item.badgeVariant === 'warning'
                        ? 'badge-warning'
                        : 'badge-info'
                    }`}
                    style={{
                      fontSize: '0.64rem',
                      padding: '1px 5px',
                      borderRadius: '0px',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content Viewport */}
      <main style={{ flex: 1, padding: '24px', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
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
                Tactical Gateway Connection Error
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {error}. Ensure the FastAPI server is active on port 8000.
              </p>
              <button
                onClick={loadTheaterData}
                className="tactical-btn"
                style={{ marginTop: '12px' }}
              >
                <RefreshCw size={14} /> Reconnect Server
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
              Loading Northern Command stock ledgers, road corridors, and pass conditions...
            </div>
          </div>
        ) : activeTab === 'briefing' ? (
          <CommandBriefing
            locations={locations}
            passes={passes}
            vehicles={vehicles}
            inventory={inventory}
            indents={indents}
            onTogglePass={handleTogglePass}
            onNavigate={handleNavigate}
          />
        ) : activeTab === 'map' ? (
          <TacticalGISMap
            locations={locations}
            routes={routes}
            passes={passes}
            inventory={inventory}
            onTogglePass={handleTogglePass}
            onNavigate={handleNavigate}
          />
        ) : activeTab === 'inventory' ? (
          <InventoryRegisters
            inventory={inventory}
            locations={locations}
            onNavigate={handleNavigate}
          />
        ) : activeTab === 'passes' ? (
          <PassMonitor
            passes={passes}
            routes={routes}
            onTogglePass={handleTogglePass}
            onNavigate={handleNavigate}
          />
        ) : activeTab === 'fleet' ? (
          <FleetReadiness
            vehicles={vehicles}
            locations={locations}
            onNavigate={handleNavigate}
          />
        ) : activeTab === 'indents' ? (
          <MilitaryIndents
            indents={indents}
            onRefresh={loadTheaterData}
            onNavigate={handleNavigate}
          />
        ) : activeTab === 'field' ? (
          <FieldStockPWA
            locations={locations}
            supplies={supplies}
            inventory={inventory}
            onIndentCreated={loadTheaterData}
            onNavigate={handleNavigate}
          />
        ) : activeTab === 'disruption' ? (
          <DisruptionSimulator
            passes={passes}
            onNavigate={handleNavigate}
          />
        ) : activeTab === 'telemetry' ? (
          <TelemetryMonitor
            locations={locations}
            onNavigate={handleNavigate}
          />
        ) : activeTab === 'analytics' ? (
          <StrategicIntelligence
            locations={locations}
            supplies={supplies}
            onNavigate={handleNavigate}
          />
        ) : activeTab === 'optimization' ? (
          <PredictiveOptimization
            locations={locations}
            supplies={supplies}
            onNavigate={handleNavigate}
          />
        ) : (
          <OperationalAlerts
            inventory={inventory}
            passes={passes}
            indents={indents}
            locations={locations}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Decision Flow Modal */}
      <DecisionFlowModal
        isOpen={isDecisionFlowOpen}
        onClose={() => setIsDecisionFlowOpen(false)}
      />

      {/* Quick Command Search Modal (Ctrl + K) */}
      <QuickSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onNavigate={handleNavigate}
        locations={locations}
        passes={passes}
        supplies={supplies}
      />

      {/* Modern SaaS Footer */}
      <footer
        style={{
          padding: '24px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface)',
          color: 'var(--text-secondary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.78rem',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>VANGUARD-LOGIX</span>
          <span>•</span>
          <span>Indian Army Predictive Logistics Engine</span>
          <span>•</span>
          <span>Northern Command XIV Corps (HQ Leh)</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', color: 'var(--text-tertiary)' }}>
          <span>Deterministic Seeding (seed=26251)</span>
          <span>•</span>
          <span>Dual Architecture (PostgreSQL / SQLite)</span>
          <span>•</span>
          <span>WCAG AA Compliant</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
