import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  X,
  LayoutDashboard,
  Compass,
  Boxes,
  TrendingUp,
  Truck,
  Sliders,
  Mountain,
  FileCheck2,
  Activity,
  Smartphone,
  MapPin,
  Package,
  ArrowRight,
} from 'lucide-react';
import type { TabView } from '../App';
import type { Location, StrategicPass, SupplyItem } from '../types';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: TabView, context?: { locationId?: string; supplyId?: string; passId?: string }) => void;
  locations: Location[];
  passes: StrategicPass[];
  supplies: SupplyItem[];
}

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Feature' | 'Location' | 'Mountain Pass' | 'Supply Item';
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  tab: TabView;
  context?: { locationId?: string; supplyId?: string; passId?: string };
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  locations,
  passes,
  supplies,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Build searchable index
  const allItems: SearchItem[] = useMemo(() => {
    const items: SearchItem[] = [
      {
        id: 'feat-dashboard',
        title: 'Operational Dashboard',
        subtitle: 'Executive overview, stock health, and urgent action items',
        category: 'Feature',
        icon: LayoutDashboard,
        tab: 'briefing',
      },
      {
        id: 'feat-map',
        title: 'Corridor & Topographic Map',
        subtitle: 'Visual route corridors, elevations, and choke points',
        category: 'Feature',
        icon: Compass,
        tab: 'map',
      },
      {
        id: 'feat-inventory',
        title: 'Inventory & Stock Ledgers',
        subtitle: 'Days-of-Supply, current holdings, and deficit monitoring',
        category: 'Feature',
        icon: Boxes,
        tab: 'inventory',
      },
      {
        id: 'feat-forecast',
        title: 'Demand Forecasting',
        subtitle: 'Weather-aware multi-horizon P10 / P50 / P90 burn predictions',
        category: 'Feature',
        icon: TrendingUp,
        tab: 'optimization',
      },
      {
        id: 'feat-fleet',
        title: 'Fleet & Route Dispatch',
        subtitle: 'High-altitude payload de-rating and convoy scheduling (CVRPTW)',
        category: 'Feature',
        icon: Truck,
        tab: 'fleet',
      },
      {
        id: 'feat-simulator',
        title: 'Disruption Simulator',
        subtitle: 'What-If scenario testing: blizzards, pass blocks, and troop surges',
        category: 'Feature',
        icon: Sliders,
        tab: 'disruption',
      },
      {
        id: 'feat-passes',
        title: 'Mountain Pass Monitor',
        subtitle: 'Real-time clearances, snow accumulation, and BRO road status',
        category: 'Feature',
        icon: Mountain,
        tab: 'passes',
      },
      {
        id: 'feat-indents',
        title: 'Requisitions & Indents (IAF-Z-2096)',
        subtitle: 'Tamper-evident requisition vouchers and movement orders',
        category: 'Feature',
        icon: FileCheck2,
        tab: 'indents',
      },
      {
        id: 'feat-telemetry',
        title: 'Storage Telemetry & Sensors',
        subtitle: 'Cold-chain storage temperatures, tank levels, and fuel leak alerts',
        category: 'Feature',
        icon: Activity,
        tab: 'telemetry',
      },
      {
        id: 'feat-field',
        title: 'Field Outpost App (Offline / हिन्दी)',
        subtitle: 'Lightweight field stock auditing with offline sync',
        category: 'Feature',
        icon: Smartphone,
        tab: 'field',
      },
    ];

    // Add locations
    locations.forEach((loc) => {
      items.push({
        id: `loc-${loc.id}`,
        title: loc.name,
        subtitle: `${loc.elevation_m}m MSL • Sector: ${loc.sector.replace(/_/g, ' ')} • ${loc.current_headcount} PAX`,
        category: 'Location',
        icon: MapPin,
        tab: 'map',
        context: { locationId: loc.id },
      });
    });

    // Add passes
    passes.forEach((pass) => {
      items.push({
        id: `pass-${pass.id}`,
        title: `${pass.name} (${pass.highway})`,
        subtitle: `${pass.elevation_m}m MSL • Status: ${pass.status.replace(/_/g, ' ')} • ${pass.snow_accumulation_cm}cm Snow`,
        category: 'Mountain Pass',
        icon: Mountain,
        tab: 'passes',
        context: { passId: pass.id },
      });
    });

    // Add supplies
    supplies.forEach((sup) => {
      items.push({
        id: `sup-${sup.id}`,
        title: sup.name,
        subtitle: `${sup.class_label} • Unit: ${sup.unit}`,
        category: 'Supply Item',
        icon: Package,
        tab: 'inventory',
        context: { supplyId: sup.id },
      });
    });

    return items;
  }, [locations, passes, supplies]);

  // Filter items
  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      return allItems.slice(0, 8); // Top features by default
    }
    const q = query.toLowerCase();
    return allItems
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      )
      .slice(0, 10);
  }, [allItems, query]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredItems[selectedIndex];
      if (selected) {
        onNavigate(selected.tab, selected.context);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '80px',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '640px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-prominent)',
          borderRadius: '0px',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
          }}
        >
          <Search size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a post, pass, supply item, or module (e.g. Siachen, Diesel, Simulator)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '0.95rem',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
            }}
          />
          <button
            onClick={onClose}
            className="tactical-btn"
            style={{
              padding: '4px 8px',
              fontSize: '0.72rem',
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Results List */}
        <div
          style={{
            maxHeight: '380px',
            overflowY: 'auto',
            padding: '8px',
          }}
        >
          {filteredItems.length === 0 ? (
            <div
              style={{
                padding: '32px 20px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem',
              }}
            >
              No matching outpost, pass, supply, or module found for "{query}".
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.tab, item.context);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '0px',
                    background: isSelected ? 'var(--bg-surface-elevated)' : 'transparent',
                    borderLeft: isSelected ? '3px solid var(--accent-primary)' : '3px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        padding: '6px',
                        background: isSelected ? 'var(--accent-primary)' : 'var(--bg-surface-elevated)',
                        color: isSelected ? 'var(--text-inverse)' : 'var(--accent-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        padding: '2px 6px',
                        background: 'var(--bg-surface-active)',
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight size={14} style={{ color: 'var(--accent-primary)' }} />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div
          style={{
            padding: '8px 16px',
            background: 'var(--bg-surface-elevated)',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.72rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', gap: '12px' }}>
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
          <span style={{ color: 'var(--text-tertiary)' }}>Vanguard Rapid Command Finder</span>
        </div>
      </div>
    </div>
  );
};
