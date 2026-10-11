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
        selectedClass === 'ALL' || rec.supply?.supply_class === selectedClass;

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
      <div className="grid-kpi-4">
        <div className="panel" style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Monitored Stock Ledgers
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '4px' }}>
            {stats.total}{' '}
            <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
              Records
            </span>
          </div>
        </div>

        <div className="panel" style={{ padding: '16px 18px', borderLeft: '4px solid var(--accent-crimson)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Critical Shortages (&lt; 5d DoS)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '4px', color: 'var(--accent-crimson)' }}>
            {stats.critical}{' '}
            <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
              Urgent Replenish
            </span>
          </div>
        </div>

        <div className="panel" style={{ padding: '16px 18px', borderLeft: '4px solid var(--accent-amber)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Warning Level (&lt; 12d DoS)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '4px', color: 'var(--accent-amber)' }}>
            {stats.warning}{' '}
            <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
              Reorder Window
            </span>
          </div>
        </div>

        <div className="panel" style={{ padding: '16px 18px', borderLeft: '4px solid var(--accent-emerald)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Normal Buffer (&gt; 12d DoS)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '4px', color: 'var(--accent-emerald)' }}>
            {stats.normal}{' '}
            <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
              Secure Stock
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="panel">
        <div
          className="panel-header"
          style={{
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Search Input */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '6px 10px',
              minWidth: '260px',
            }}
          >
            <Search size={14} style={{ color: 'var(--text-tertiary)' }} />
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
                fontSize: '0.82rem',
                width: '100%',
                fontFamily: 'var(--font-sans)',
              }}
            />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Class Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Supply Class:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '4px 8px', fontSize: '0.75rem' }}
              >
                <option value="ALL">All Classes (I–V)</option>
                <option value="CLASS_I">Class I — Rations (Fresh / RTE)</option>
                <option value="CLASS_II">Class II — ECC Winter Gear & Tents</option>
                <option value="CLASS_III">Class III — POL / Arctic Diesel / SKO</option>
                <option value="CLASS_IV">Class IV — Fortification & Cement</option>
                <option value="CLASS_V">Class V — Munitions & Mortars</option>
              </select>
            </div>

            {/* Location Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Location:</span>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '4px 8px', fontSize: '0.75rem' }}
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
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Stock Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '4px 8px', fontSize: '0.75rem' }}
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
        <div className="enterprise-table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Formation / Post</th>
                <th>Supply Item & Class</th>
                <th>Current Stock</th>
                <th>Burn Rate (Daily)</th>
                <th>Safety Stock</th>
                <th style={{ minWidth: '160px' }}>Days of Supply (DoS)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '28px', color: 'var(--text-tertiary)' }}>
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
                  const barColor = isCritical
                    ? 'var(--accent-crimson)'
                    : isWarning
                    ? 'var(--accent-amber)'
                    : 'var(--accent-emerald)';

                  return (
                    <tr key={rec.id}>
                      {/* Location */}
                      <td>
                        <div style={{ fontWeight: 600 }}>
                          {loc?.name.split('(')[0].trim() || rec.location_id}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {loc ? `${loc.elevation_m}m MSL` : ''} • {loc?.sector.replace(/_/g, ' ')}
                        </div>
                      </td>

                      {/* Item & Class */}
                      <td>
                        <div style={{ fontWeight: 500 }}>
                          {rec.supply?.name.split('(')[0] || rec.supply_id}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {rec.supply?.class_label.split('—')[0].trim() || ''}
                        </div>
                      </td>

                      {/* Current Stock */}
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {rec.current_stock.toLocaleString()}{' '}
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                          {rec.supply?.unit || ''}
                        </span>
                      </td>

                      {/* Daily Burn Rate */}
                      <td style={{ fontFamily: 'var(--font-mono)' }}>
                        {rec.daily_consumption_rate.toLocaleString()}{' '}
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                          {rec.supply?.unit}/d
                        </span>
                      </td>

                      {/* Safety Threshold */}
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                        {rec.safety_stock_threshold.toLocaleString()} {rec.supply?.unit}
                      </td>

                      {/* Days of Supply Progress Bar */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 600,
                              width: '40px',
                              fontSize: '0.78rem',
                              color: barColor,
                            }}
                          >
                            {dos > 99 ? '>99d' : `${dos}d`}
                          </span>
                          <div
                            style={{
                              flex: 1,
                              height: '5px',
                              background: 'var(--bg-surface-elevated)',
                              borderRadius: 'var(--radius-full)',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${progressPct}%`,
                                height: '100%',
                                background: barColor,
                                borderRadius: 'var(--radius-full)',
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td>
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
