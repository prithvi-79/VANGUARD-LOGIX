import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertOctagon,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';
import type {
  TelemetryOverviewResponse,
  Location,
} from '../types';

interface TelemetryMonitorProps {
  locations?: Location[];
}

export const TelemetryMonitor: React.FC<TelemetryMonitorProps> = ({ locations = [] }) => {
  const [overview, setOverview] = useState<TelemetryOverviewResponse | null>(null);
  const [selectedSensorType, setSelectedSensorType] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInjecting, setIsInjecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  const loadTelemetry = async () => {
    setIsLoading(true);
    try {
      const data = await api.getTelemetryOverview();
      setOverview(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load telemetry stream');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTelemetry();
    const interval = setInterval(loadTelemetry, 25000); // 25s polling
    return () => clearInterval(interval);
  }, []);

  const handleInjectLeak = async (locId: string) => {
    setIsInjecting(true);
    try {
      await api.simulateTelemetryAnomaly(locId, 'FUEL_LEAK', 'CRITICAL');
      await loadTelemetry();
    } catch (err: any) {
      alert(`Anomaly injection failed: ${err.message}`);
    } finally {
      setIsInjecting(false);
    }
  };

  const handleResetAnomalies = async () => {
    setIsInjecting(true);
    try {
      await api.simulateTelemetryAnomaly('GLOBAL', 'RESET_ALL');
      await loadTelemetry();
    } catch (err: any) {
      alert(`Reset failed: ${err.message}`);
    } finally {
      setIsInjecting(false);
    }
  };

  const filteredReadings = overview?.readings.filter((r) => {
    if (selectedSensorType === 'ALL') return true;
    return r.sensor_type === selectedSensorType;
  }) || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div
        className="tactical-card"
        style={{
          padding: '20px 24px',
          borderLeft: '4px solid var(--accent-cyan)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--accent-cyan)',
                fontWeight: 700,
                letterSpacing: '0.08em',
              }}
            >
              IOT SENSOR STREAM & AUDIT — P1-REQ-04
            </span>
            <span className="badge badge-cyan">
              {isLoading ? 'STREAMING...' : 'TELEMETRY LIVE'}
            </span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px', letterSpacing: '-0.01em' }}>
            IoT Fuel Bladder & Cold-Chain Telemetry Monitor
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px', maxWidth: '850px' }}>
            Live sensor streams across {locations.length > 0 ? locations.length : 10} military nodes monitoring high-altitude Arctic Diesel bladders, anti-waxing heating blankets, and Class II medical plasma cryo-chambers with automated book-stock discrepancy and pilferage detection.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => handleInjectLeak('LOC-KUMAR')}
            disabled={isInjecting}
            className="tactical-btn"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              borderColor: 'var(--accent-crimson)',
              color: 'var(--accent-crimson)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Zap size={14} /> Simulate Bladder Leak
          </button>

          <button
            onClick={handleResetAnomalies}
            disabled={isInjecting}
            className="tactical-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} /> Refresh Sensors

          </button>
        </div>
      </div>

      {error && (
        <div className="tactical-card" style={{ padding: '16px', borderColor: 'var(--accent-crimson)' }}>
          <p style={{ color: 'var(--accent-crimson)', fontSize: '0.85rem' }}>{error}</p>
        </div>
      )}

      {/* Sensor Overview KPI Cards */}
      {overview && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div className="tactical-card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Total Active Sensors
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: '4px', color: 'var(--text-primary)' }}>
              {overview.total_active_sensors}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Fuel, Thermal & Meteorological
            </div>
          </div>

          <div className="tactical-card" style={{ padding: '16px', borderLeft: '4px solid var(--accent-emerald)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Sensors Nominal
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: '4px', color: 'var(--accent-emerald)' }}>
              {overview.sensors_normal}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Operating within safe envelope
            </div>
          </div>

          <div className="tactical-card" style={{ padding: '16px', borderLeft: '4px solid var(--accent-amber)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Sensors Warning
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: '4px', color: 'var(--accent-amber)' }}>
              {overview.sensors_warning}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Threshold excursion flagged
            </div>
          </div>

          <div className="tactical-card" style={{ padding: '16px', borderLeft: '4px solid var(--accent-crimson)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Critical Discrepancies
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: '4px', color: 'var(--accent-crimson)' }}>
              {overview.active_discrepancies.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-crimson)', marginTop: '4px', fontWeight: 700 }}>
              Physical vs Book Stock Mismatch
            </div>
          </div>
        </div>
      )}

      {/* Discrepancy & Theft/Leak Alarms Panel */}
      {overview && overview.active_discrepancies.length > 0 && (
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--accent-crimson)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertOctagon size={16} /> ACTIVE INVENTORY DISCREPANCY & THEFT/LEAK ALARMS ({overview.active_discrepancies.length})
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '16px' }}>
            {overview.active_discrepancies.map((alert) => {
              const isCrit = alert.severity === 'CRITICAL';
              return (
                <div
                  key={alert.id}
                  className="tactical-card"
                  style={{
                    padding: '20px',
                    border: `1px solid ${isCrit ? 'var(--accent-crimson)' : 'var(--accent-amber)'}`,
                    background: isCrit ? 'rgba(239, 68, 68, 0.05)' : 'rgba(245, 158, 11, 0.05)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`badge ${isCrit ? 'badge-crimson' : 'badge-amber'}`} style={{ fontSize: '0.65rem' }}>
                          {alert.alert_type}
                        </span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{alert.location_name}</span>
                      </div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '6px' }}>{alert.supply_name}</h4>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Discrepancy:</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-crimson)' }}>
                        -{alert.discrepancy_amount.toLocaleString()} L ({alert.discrepancy_pct}%)
                      </div>
                    </div>
                  </div>

                  {/* Comparison Row */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '12px',
                      marginTop: '14px',
                      padding: '10px 14px',
                      borderRadius: '4px',
                      background: 'rgba(0, 0, 0, 0.2)',
                      fontSize: '0.75rem',
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Book Stock (Ledger): </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        {alert.book_stock_quantity.toLocaleString()} L
                      </span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Physical Sensor: </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-crimson)' }}>
                        {alert.physical_sensor_reading.toLocaleString()} L
                      </span>
                    </div>
                  </div>

                  {/* Detection Message & Recommended Action */}
                  <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    <strong>Diagnosis:</strong> {alert.detection_message}
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--accent-gold)', fontStyle: 'italic' }}>
                    <strong>Tactical Action:</strong> {alert.recommended_action}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Live Sensors Grid */}
      <div className="tactical-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} className="text-cyan" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Live IoT Sensor Feed</h3>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {['ALL', 'FUEL_BLADDER_LEVEL', 'FUEL_HEATING_BLANKET_TEMP', 'COLD_CHAIN_CRYO_TEMP', 'AMBIENT_AIR_TEMP'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedSensorType(type)}
                className="tactical-btn"
                style={{
                  fontSize: '0.7rem',
                  padding: '4px 8px',
                  background: selectedSensorType === type ? 'var(--accent-cyan)' : 'transparent',
                  color: selectedSensorType === type ? '#000000' : 'var(--text-secondary)',
                  fontWeight: selectedSensorType === type ? 700 : 500,
                }}
              >
                {type === 'ALL' ? 'All Types' : type.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '10px 8px' }}>Node / Post</th>
                <th style={{ padding: '10px 8px' }}>Sensor Type</th>
                <th style={{ padding: '10px 8px' }}>Reading Value</th>
                <th style={{ padding: '10px 8px' }}>Status</th>
                <th style={{ padding: '10px 8px' }}>Diagnostic Alert</th>
                <th style={{ padding: '10px 8px' }}>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredReadings.map((reading) => {
                const isCrit = reading.status === 'CRITICAL';
                const isWarn = reading.status === 'WARNING';
                return (
                  <tr
                    key={reading.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      background: isCrit ? 'rgba(239, 68, 68, 0.04)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '10px 8px', fontWeight: 600 }}>{reading.location_name}</td>
                    <td style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>
                      {reading.sensor_type.replace(/_/g, ' ')}
                    </td>
                    <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {reading.reading_value.toLocaleString()} {reading.unit}
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <span className={`badge ${isCrit ? 'badge-crimson' : isWarn ? 'badge-amber' : 'badge-emerald'}`} style={{ fontSize: '0.65rem' }}>
                        {reading.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px', color: isCrit ? 'var(--accent-crimson)' : 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {reading.alert_message || 'Nominal readings'}
                    </td>
                    <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {new Date(reading.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
