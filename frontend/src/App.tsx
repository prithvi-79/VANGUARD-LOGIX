import React, { useEffect, useState } from 'react';
import { CommandHeader } from './components/CommandHeader';
import { CommandBriefing } from './components/CommandBriefing';
import { api } from './services/api';
import type { Location, StrategicPass, Vehicle, InventoryRecord, IndentVoucher, DBStatusResponse } from './types';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [passes, setPasses] = useState<StrategicPass[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [indents, setIndents] = useState<IndentVoucher[]>([]);
  const [dbStatus, setDbStatus] = useState<DBStatusResponse | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadTheaterData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [locsData, passesData, fleetData, invData, indentsData, statusData] =
        await Promise.all([
          api.getLocations(),
          api.getPasses(),
          api.getFleet(),
          api.getInventory(),
          api.getIndents(),
          api.getDBStatus(),
        ]);

      setLocations(locsData);
      setPasses(passesData);
      setVehicles(fleetData);
      setInventory(invData.items);
      setIndents(indentsData);
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
      const reason = isCurrentlyOpen ? 'Simulated blizzard: active snowstorm' : undefined;

      await api.updatePassStatus(passId, {
        status: newStatus,
        snow_accumulation_cm: isCurrentlyOpen ? 75.0 : 5.0,
        temperature_c: isCurrentlyOpen ? -28.0 : -10.0,
        closure_reason: reason,
        predicted_reopen_hours: isCurrentlyOpen ? 12.0 : 0.0,
      });

      // Reload passes to reflect downstream route closures
      const [updatedPasses, updatedStatus] = await Promise.all([
        api.getPasses(),
        api.getDBStatus(),
      ]);
      setPasses(updatedPasses);
      setDbStatus(updatedStatus);
    } catch (err: any) {
      alert(`Pass status update failed: ${err.message}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <CommandHeader dbStatus={dbStatus} onRefresh={loadTheaterData} isLoading={isLoading} />

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
              height: '350px',
              gap: '16px',
            }}
          >
            <div className="pulse-indicator" style={{ width: '20px', height: '20px', background: 'var(--accent-cyan)' }}></div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              INITIALIZING TACTICAL SECURE STREAM • NORTHERN COMMAND XIV CORPS...
            </div>
          </div>
        ) : (
          <CommandBriefing
            locations={locations}
            passes={passes}
            vehicles={vehicles}
            inventory={inventory}
            indents={indents}
            onTogglePass={handleTogglePass}
          />
        )}
      </main>

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
