import React, { useState, useMemo } from 'react';
import { Truck, Sliders } from 'lucide-react';
import type { Vehicle, Location } from '../types';

interface FleetReadinessProps {
  vehicles: Vehicle[];
  locations: Location[];
}

export const FleetReadiness: React.FC<FleetReadinessProps> = ({ vehicles, locations }) => {
  const [selectedMode, setSelectedMode] = useState<string>('ALL');
  const [calcAltitude, setCalcAltitude] = useState<number>(4500); // meters MSL

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      return selectedMode === 'ALL' || v.mode === selectedMode;
    });
  }, [vehicles, selectedMode]);

  // Altitude payload de-rating factor: max(0.40, 1.0 - (alt - 3000) / 10000) for alt > 3000
  const deRatingFactor = useMemo(() => {
    if (calcAltitude <= 3000) return 1.0;
    return Math.max(0.4, 1.0 - (calcAltitude - 3000) / 10000);
  }, [calcAltitude]);

  const deRatingLossPercent = Math.round((1 - deRatingFactor) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* High-Altitude Payload De-Rating Interactive Calculator */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="tactical-badge badge-info">Altitude Physics Model</span>
              <span className="tactical-badge badge-warning">Air Density Correction Active</span>
            </div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 600, marginTop: '6px', margin: 0 }}>
              High-Altitude Fleet Payload De-Rating Calculator
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Above 3,000m MSL, lower atmospheric pressure degrades internal combustion torque and rotor lift capacity.
            </p>
          </div>

          <div
            style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              textAlign: 'right',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              Payload Deration
            </div>
            <div
              style={{
                fontSize: '1.4rem',
                fontWeight: 700,
                color: deRatingLossPercent > 15 ? 'var(--accent-crimson)' : 'var(--accent-amber)',
              }}
            >
              -{deRatingLossPercent}% Capacity
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Operating multiplier: {(deRatingFactor * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="panel-body">
          {/* Altitude Slider Control */}
          <div
            style={{
              padding: '14px',
              background: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sliders size={14} style={{ color: 'var(--accent-primary)' }} />
                Target Elevation Envelope:
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {calcAltitude.toLocaleString()} m MSL ({Math.round(calcAltitude * 3.28084).toLocaleString()} ft)
              </span>
            </div>

            <input
              type="range"
              min="1500"
              max="6000"
              step="100"
              value={calcAltitude}
              onChange={(e) => setCalcAltitude(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: 'var(--accent-primary)',
                cursor: 'pointer',
              }}
            />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.7rem',
                color: 'var(--text-tertiary)',
                marginTop: '6px',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <span>Srinagar (1,585m)</span>
              <span>Leh Base (3,524m)</span>
              <span>Khardung La (5,359m)</span>
              <span>Marsimik / Siachen (5,582m)</span>
            </div>
          </div>

          {/* Dynamic De-Rated Payload Comparison Grid */}
          <div
            style={{
              marginTop: '14px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '10px',
            }}
          >
            {[
              { name: 'Ashok Leyland 4x4', basePayload: 2500, mode: 'ROAD' },
              { name: 'Stallion 6x6', basePayload: 5000, mode: 'ROAD' },
              { name: 'Bv-206 Snowcat', basePayload: 2000, mode: 'ALL_TERRAIN' },
              { name: 'Mi-17 V5 Helicopter', basePayload: 4000, mode: 'AIR' },
              { name: 'ALH Dhruv Helicopter', basePayload: 1200, mode: 'AIR' },
            ].map((item) => {
              const effective = Math.round(item.basePayload * deRatingFactor);
              const lossKg = item.basePayload - effective;

              return (
                <div
                  key={item.name}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.75rem',
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Nominal: {item.basePayload.toLocaleString()} kg
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '6px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      {effective.toLocaleString()} kg
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-crimson)' }}>
                      -{lossKg.toLocaleString()} kg
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fleet Roster Header & Filter */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={16} style={{ color: 'var(--accent-primary)' }} />
              Northern Command XIV Corps — Vehicle Fleet Register
            </h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Operational readiness, payload ratings, stationing depot, and fuel consumption profiles.
            </div>
          </div>

          {/* Mode Filter */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {['ALL', 'ROAD', 'AIR', 'ALL_TERRAIN', 'ANIMAL_TRANSPORT'].map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className="tactical-btn"
                style={{
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  background: selectedMode === mode ? 'var(--accent-primary)' : 'transparent',
                  color: selectedMode === mode ? 'var(--text-inverse)' : 'var(--text-secondary)',
                  borderColor: selectedMode === mode ? 'var(--accent-primary)' : 'var(--border-subtle)',
                }}
              >
                {mode.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Vehicle Roster Table */}
        <div className="enterprise-table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Callsign / Unit ID</th>
                <th>Vehicle Type</th>
                <th>Transport Mode</th>
                <th>Nominal Payload</th>
                <th>Service Ceiling</th>
                <th>Stationed Hub</th>
                <th>Fuel & Consumption</th>
                <th>Readiness</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((v) => {
                const loc = locations.find((l) => l.id === v.current_location_id);
                const isAvail = v.operational_status === 'AVAILABLE';

                return (
                  <tr key={v.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{v.callsign}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                        {v.id}
                      </div>
                    </td>

                    <td style={{ fontWeight: 500 }}>
                      {v.vehicle_type.replace(/_/g, ' ')}
                    </td>

                    <td>
                      <span className="tactical-badge badge-info" style={{ fontSize: '0.68rem' }}>
                        {v.mode.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {v.max_payload_kg.toLocaleString()} kg
                    </td>

                    <td>
                      <span className="elevation-tag">{v.service_ceiling_m}m MSL</span>
                    </td>

                    <td>
                      <div style={{ fontWeight: 500 }}>{loc?.name.split('(')[0].trim() || v.current_location_id}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{loc?.sector.replace(/_/g, ' ')}</div>
                    </td>

                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                      <div>{v.fuel_type.replace(/_/g, ' ')}</div>
                      <div style={{ color: 'var(--text-tertiary)' }}>
                        {v.fuel_consumption_rate} {v.mode === 'AIR' ? 'L/flight hr' : 'L/km'}
                      </div>
                    </td>

                    <td>
                      <span
                        className={`tactical-badge ${
                          isAvail ? 'badge-normal' : 'badge-warning'
                        }`}
                        style={{ fontSize: '0.68rem' }}
                      >
                        {v.operational_status}
                      </span>
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
