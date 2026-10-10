import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import type { InventoryRecord, Location } from '../types';

interface InventoryRegistersProps {
  inventory: InventoryRecord[];
  locations: Location[];
}

export const InventoryRegisters: React.FC<InventoryRegistersProps> = ({
  inventory,
  locations,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');

  // Filtered inventory records
  const filteredRecords = useMemo(() => {
    return inventory.filter((rec) => {
      const matchSearch =
        searchQuery === '' ||
        (rec.supply?.name.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        rec.location_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.supply_id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchClass =
        selectedClass === 'ALL' || (rec.supply?.supply_class === selectedClass);

      const matchStatus =
        selectedStatus === 'ALL' || rec.status === selectedStatus;

      const matchLoc =
        selectedLocation === 'ALL' || rec.location_id === selectedLocation;

      return matchSearch && matchClass && matchStatus && matchLoc;
    });
  }, [inventory, searchQuery, selectedClass, selectedStatus, selectedLocation]);

  // Aggregate stats
  const stats = useMemo(() => {
    const critical = inventory.filter((i) => i.status === 'CRITICAL').length;
    const warning = inventory.filter((i) => i.status === 'WARNING').length;
    const normal = inventory.filter((i) => i.status === 'NORMAL').length;
    return { critical, warning, normal, total: inventory.length };
  }, [inventory]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Overview Stat Ribbon */}
      <div className="tactical-grid-4">
        <div className="tactical-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            TOTAL MONITORED ITEMS
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '2px' }}>
            {stats.total} <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Ledgers</span>
          </div>
        </div>

        <div className="tactical-card" style={{ padding: '16px 20px', borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            CRITICAL SHORTAGES (&lt; 5d DoS)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '2px', color: 'var(--accent-crimson)' }}>
            {stats.critical} <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Urgent Replenish</span>
          </div>
        </div>

        <div className="tactical-card" style={{ padding: '16px 20px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            WARNING LEVEL (&lt; 12d DoS)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '2px', color: 'var(--accent-amber)' }}>
            {stats.warning} <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Reorder Pending</span>
          </div>
        </div>

        <div className="tactical-card" style={{ padding: '16px 20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            NORMAL BUFFER (&gt; 12d DoS)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '2px', color: 'var(--accent-emerald)' }}>
            {stats.normal} <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Secure Stock</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div
        className="tactical-card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Search Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '6px 12px',
            minWidth: '280px',
          }}
        >
          <Search size={15} style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search supply name, item ID, post..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              width: '100%',
              fontFamily: 'var(--font-sans)',
            }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Class Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              style={{
                background: 'var(--bg-surface-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                padding: '5px 8px',
                borderRadius: '6px',
                fontSize: '0.75rem',
              }}
            >
              <option value="ALL">All ASC/AOC Classes</option>
              <option value="CLASS_I">Class I — Rations (Fresh / RTE)</option>
              <option value="CLASS_II">Class II — ECC Winter Gear & Tents</option>
              <option value="CLASS_III">Class III — POL / Arctic Diesel / SKO</option>
              <option value="CLASS_IV">Class IV — Fortification & Cement</option>
              <option value="CLASS_V">Class V — Munitions & Mortars</option>
            </select>
          </div>

          {/* Location Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Location:</span>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              style={{
                background: 'var(--bg-surface-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                padding: '5px 8px',
                borderRadius: '6px',
                fontSize: '0.75rem',
              }}
            >
              <option value="ALL">All Posts & Depots</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name.split('(')[0].trim()} ({loc.elevation_m}m)
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                background: 'var(--bg-surface-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                padding: '5px 8px',
                borderRadius: '6px',
                fontSize: '0.75rem',
              }}
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">Critical (&lt; 5d)</option>
              <option value="WARNING">Warning (&lt; 12d)</option>
              <option value="NORMAL">Normal (&gt; 12d)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Stock Ledgers Table */}
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
                <th style={{ padding: '10px 12px' }}>POST / DEPOT</th>
                <th style={{ padding: '10px 12px' }}>ITEM & CLASS</th>
                <th style={{ padding: '10px 12px' }}>CURRENT STOCK</th>
                <th style={{ padding: '10px 12px' }}>BURN RATE (DAILY)</th>
                <th style={{ padding: '10px 12px' }}>SAFETY THRESHOLD</th>
                <th style={{ padding: '10px 12px', minWidth: '170px' }}>DAYS OF SUPPLY (DOS)</th>
                <th style={{ padding: '10px 12px' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-tertiary)' }}>
                    No inventory records matching active filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const loc = locations.find((l) => l.id === rec.location_id);
                  const dos = rec.days_of_supply;
                  const isCritical = rec.status === 'CRITICAL';
                  const isWarning = rec.status === 'WARNING';

                  // Progress bar percent (cap at 30 days for 100%)
                  const progressPct = Math.min(100, Math.round((dos / 30) * 100));
                  const barColor = isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981';

                  return (
                    <tr
                      key={rec.id}
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
                      {/* Location */}
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 700 }}>
                          {loc?.name.split('(')[0].trim() || rec.location_id}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                          {loc ? `${loc.elevation_m}m MSL` : ''} • {loc?.sector.replace(/_/g, ' ')}
                        </div>
                      </td>

                      {/* Item & Class */}
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 600 }}>
                          {rec.supply?.name.split('(')[0] || rec.supply_id}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                          {rec.supply?.class_label.split('—')[0].trim() || ''}
                        </div>
                      </td>

                      {/* Current Stock */}
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        {rec.current_stock.toLocaleString()}{' '}
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                          {rec.supply?.unit || ''}
                        </span>
                      </td>

                      {/* Daily Burn Rate */}
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)' }}>
                        {rec.daily_consumption_rate.toLocaleString()}{' '}
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                          {rec.supply?.unit}/d
                        </span>
                      </td>

                      {/* Safety Threshold */}
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                        {rec.safety_stock_threshold.toLocaleString()} {rec.supply?.unit}
                      </td>

                      {/* Days of Supply Progress Bar */}
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700,
                              width: '45px',
                              color: barColor,
                            }}
                          >
                            {dos > 99 ? '&gt;99d' : `${dos}d`}
                          </span>
                          <div
                            style={{
                              flex: 1,
                              height: '6px',
                              background: 'var(--bg-surface-active)',
                              borderRadius: '3px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${progressPct}%`,
                                height: '100%',
                                background: barColor,
                                borderRadius: '3px',
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          className={`tactical-badge ${
                            isCritical
                              ? 'badge-critical'
                              : isWarning
                              ? 'badge-warning'
                              : 'badge-normal'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
