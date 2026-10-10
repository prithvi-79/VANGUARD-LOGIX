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

  // Altitude payload de-rating factor
  // factor = max(0.40, 1.0 - (alt - 3000) / 10000) for alt > 3000
  const deRatingFactor = useMemo(() => {
    if (calcAltitude <= 3000) return 1.0;
    return Math.max(0.4, 1.0 - (calcAltitude - 3000) / 10000);
  }, [calcAltitude]);

  const deRatingLossPercent = Math.round((1 - deRatingFactor) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* High-Altitude Payload De-Rating Interactive Calculator */}
      <div
        className="tactical-card"
        style={{
          padding: '24px',
          background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-elevated) 100%)',
          border: '1px solid var(--border-prominent)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="tactical-badge badge-cyan">PHYSICS & FLIGHT ENVELOPE</span>
              <span className="tactical-badge badge-warning">AIR DENSITY LOSS APPLIED</span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '6px', margin: 0 }}>
              High-Altitude Fleet Payload De-Rating Calculator
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              At extreme altitudes (&gt; 3,000m MSL), reduced air density and lower oxygen partial pressure severely degrade internal combustion engine torque and rotor lift.
            </p>
          </div>

          <div
            style={{
              padding: '12px 18px',
              borderRadius: '8px',
              background: 'var(--bg-surface-active)',
              border: '1px solid var(--border-subtle)',
              textAlign: 'right',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>CURRENT DE-RATING LOSS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: deRatingLossPercent > 15 ? 'var(--accent-crimson)' : 'var(--accent-amber)' }}>
              -{deRatingLossPercent}% Envelope
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Capacity multiplier: {(deRatingFactor * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Altitude Slider Control */}
        <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sliders size={15} className="text-cyan" />
              Target Operating Altitude:
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
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
              accentColor: 'var(--accent-cyan)',
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
        <div style={{ marginTop: '18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
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
                  borderRadius: '6px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.75rem',
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.name}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                  Rated: {item.basePayload.toLocaleString()} kg
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '8px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
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

      {/* Fleet Roster Header & Filter */}
      <div
        className="tactical-card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={18} className="text-cyan" />
            Northern Command XIV Corps — Multimodal Vehicle Fleet Register
          </h3>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Real-time status, payload ratings, stationing depot, and fuel consumption profiles.
          </div>
        </div>

        {/* Mode Filter */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {['ALL', 'ROAD', 'AIR', 'ALL_TERRAIN', 'ANIMAL_TRANSPORT'].map((mode) => (
            <button
              key={mode}
              onClick={() => setSelectedMode(mode)}
              className={`tactical-btn ${selectedMode === mode ? 'tactical-btn-primary' : ''}`}
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            >
              {mode.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Vehicle Roster Table */}
      <div className="tactical-card" style={{ padding: '20px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--border-prominent)',
                  textAlign: 'left',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                }}
              >
                <th style={{ padding: '10px 12px' }}>VEHICLE ID / CALLSIGN</th>
                <th style={{ padding: '10px 12px' }}>TYPE</th>
                <th style={{ padding: '10px 12px' }}>MODE</th>
                <th style={{ padding: '10px 12px' }}>NOMINAL PAYLOAD</th>
                <th style={{ padding: '10px 12px' }}>SERVICE CEILING</th>
                <th style={{ padding: '10px 12px' }}>STATIONED HUB</th>
                <th style={{ padding: '10px 12px' }}>FUEL / CONSUMPTION</th>
                <th style={{ padding: '10px 12px' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((v) => {
                const loc = locations.find((l) => l.id === v.current_location_id);
                const isAvail = v.operational_status === 'AVAILABLE';

                return (
                  <tr
                    key={v.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontWeight: 700 }}>{v.callsign}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                        {v.id}
                      </div>
                    </td>

                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                      {v.vehicle_type.replace(/_/g, ' ')}
                    </td>

                    <td style={{ padding: '10px 12px' }}>
                      <span className="tactical-badge badge-cyan" style={{ fontSize: '0.68rem' }}>
                        {v.mode.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {v.max_payload_kg.toLocaleString()} kg
                    </td>

                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)' }}>
                      <span className="elevation-tag">{v.service_ceiling_m}m MSL</span>
                    </td>

                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontWeight: 600 }}>{loc?.name.split('(')[0].trim() || v.current_location_id}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{loc?.sector.replace(/_/g, ' ')}</div>
                    </td>

                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                      <div>{v.fuel_type.replace(/_/g, ' ')}</div>
                      <div style={{ color: 'var(--text-tertiary)' }}>
                        {v.fuel_consumption_rate} {v.mode === 'AIR' ? 'L/flight hr' : 'L/km'}
                      </div>
                    </td>

                    <td style={{ padding: '10px 12px' }}>
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
