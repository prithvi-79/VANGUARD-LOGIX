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
    const interval = setInterval(loadTelemetry, 25000);
    return () => clearInterval(interval);
  }, []);

  const handleInjectLeak = async (locId: string) => {
    setIsInjecting(true);
    try {
      await api.simulateTelemetryAnomaly(locId, 'FUEL_LEAK', 'CRITICAL');
      await loadTelemetry();
    } catch (err: any) {
      alert(`Anomaly simulation failed: ${err.message}`);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div className="panel">
        <div
          className="panel-header"
          style={{
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>
                Cold-Chain & Bulk Fuel Telemetry Stream
              </h2>
              <span className={`tactical-badge ${isLoading ? 'badge-warning' : 'badge-normal'}`}>
                {isLoading ? 'Streaming...' : 'Telemetry Live'}
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px', maxWidth: '850px' }}>
              Real-time telemetry across {locations.length > 0 ? locations.length : 10} installations monitoring arctic fuel bladders, anti-waxing heating blankets, and temperature-controlled medical stores with automated ledger reconciliation.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleInjectLeak('LOC-KUMAR')}
              disabled={isInjecting}
              className="tactical-btn"
              style={{
                fontSize: '0.75rem',
                padding: '5px 10px',
                borderColor: 'var(--accent-crimson)',
                color: 'var(--accent-crimson)',
              }}
            >
              <Zap size={13} /> Simulate Fuel Leak
            </button>

            <button
              onClick={handleResetAnomalies}
              disabled={isInjecting}
              className="tactical-btn"
              style={{ fontSize: '0.75rem', padding: '5px 10px' }}
            >
              <RefreshCw size={13} /> Refresh Sensors
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="panel" style={{ padding: '14px 16px', borderLeft: '4px solid var(--accent-crimson)' }}>
          <p style={{ color: 'var(--accent-crimson)', fontSize: '0.82rem', margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Sensor Overview KPI Cards */}
      {overview && (
        <div className="grid-kpi-4">
          <div className="panel" style={{ padding: '14px 16px', borderLeft: '4px solid var(--accent-primary)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Active Sensors
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '2px', color: 'var(--text-primary)' }}>
              {overview.total_active_sensors}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
              Fuel, thermal & weather probes
            </div>
          </div>

          <div className="panel" style={{ padding: '14px 16px', borderLeft: '4px solid var(--accent-emerald)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Sensors Nominal
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '2px', color: 'var(--accent-emerald)' }}>
              {overview.sensors_normal}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
              Within operational parameters
            </div>
          </div>

          <div className="panel" style={{ padding: '14px 16px', borderLeft: '4px solid var(--accent-amber)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Sensors Warning
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '2px', color: 'var(--accent-amber)' }}>
              {overview.sensors_warning}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
              Threshold deviations logged
            </div>
          </div>

          <div className="panel" style={{ padding: '14px 16px', borderLeft: '4px solid var(--accent-crimson)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Critical Discrepancies
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '2px', color: 'var(--accent-crimson)' }}>
              {overview.active_discrepancies.length}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-crimson)' }}>
              Physical vs. ledger variance
            </div>
          </div>
        </div>
      )}

      {/* Discrepancy & Theft/Leak Alarms Panel */}
      {overview && overview.active_discrepancies.length > 0 && (
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-crimson)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertOctagon size={15} /> Active Ledger-Physical Discrepancy Alerts ({overview.active_discrepancies.length})
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '12px' }}>
            {overview.active_discrepancies.map((alert) => {
              const isCrit = alert.severity === 'CRITICAL';
              return (
                <div
                  key={alert.id}
                  className="panel"
                  style={{
                    padding: '16px',
                    borderLeft: `4px solid ${isCrit ? 'var(--accent-crimson)' : 'var(--accent-amber)'}`,
                    background: 'var(--bg-surface-elevated)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`tactical-badge ${isCrit ? 'badge-critical' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>
                          {alert.alert_type.replace(/_/g, ' ')}
                        </span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{alert.location_name}</span>
                      </div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '6px 0 0 0' }}>{alert.supply_name}</h4>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Variance:</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-crimson)' }}>
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
                      marginTop: '12px',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.75rem',
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Book Stock: </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {alert.book_stock_quantity.toLocaleString()} L
                      </span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Physical Sensor: </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-crimson)' }}>
                        {alert.physical_sensor_reading.toLocaleString()} L
                      </span>
                    </div>
                  </div>

                  {/* Diagnosis & Action */}
                  <div style={{ marginTop: '10px', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    <strong>Diagnosis:</strong> {alert.detection_message}
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '0.74rem', color: 'var(--accent-primary)', fontWeight: 500 }}>
                    <strong>Required Action:</strong> {alert.recommended_action}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Live Sensors Table */}
      <div className="panel">
        <div
          className="panel-header"
          style={{
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>Active IoT Sensor Stream</h3>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {['ALL', 'FUEL_BLADDER_LEVEL', 'FUEL_HEATING_BLANKET_TEMP', 'COLD_CHAIN_CRYO_TEMP', 'AMBIENT_AIR_TEMP'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedSensorType(type)}
                className="tactical-btn"
                style={{
                  fontSize: '0.7rem',
                  padding: '3px 8px',
                  background: selectedSensorType === type ? 'var(--accent-primary)' : 'transparent',
                  color: selectedSensorType === type ? 'var(--text-inverse)' : 'var(--text-secondary)',
                  borderColor: selectedSensorType === type ? 'var(--accent-primary)' : 'var(--border-subtle)',
                }}
              >
                {type === 'ALL' ? 'All Probes' : type.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="enterprise-table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Installation</th>
                <th>Sensor Type</th>
                <th>Sensor Reading</th>
                <th>Status</th>
                <th>Diagnostic Notice</th>
                <th>Timestamp</th>
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
                      background: isCrit ? 'rgba(239, 68, 68, 0.04)' : undefined,
                    }}
                  >
                    <td style={{ fontWeight: 600 }}>{reading.location_name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {reading.sensor_type.replace(/_/g, ' ')}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {reading.reading_value.toLocaleString()} {reading.unit}
                    </td>
                    <td>
                      <span className={`tactical-badge ${isCrit ? 'badge-critical' : isWarn ? 'badge-warning' : 'badge-normal'}`}>
                        {reading.status}
                      </span>
                    </td>
                    <td style={{ color: isCrit ? 'var(--accent-crimson)' : 'var(--text-secondary)', fontSize: '0.74rem' }}>
                      {reading.alert_message || 'Nominal reading within range'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
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
