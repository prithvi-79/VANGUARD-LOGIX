import React, { useState, useMemo } from 'react';
import {
  Compass,
  Layers,
  AlertTriangle,
  Radio,
  ArrowRight,
  TrendingUp,
  Plane,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { Location, Route, StrategicPass, InventoryRecord } from '../types';

interface TacticalGISMapProps {
  locations: Location[];
  routes: Route[];
  passes: StrategicPass[];
  inventory: InventoryRecord[];
  onTogglePass: (passId: string, currentStatus: string) => void;
}

// Coordinate projection helper
const projectCoord = (lat: number, lon: number): { x: number; y: number } => {
  const minLat = 32.2;
  const maxLat = 35.8;
  const minLon = 74.4;
  const maxLon = 79.8;

  const x = Math.round(((lon - minLon) / (maxLon - minLon)) * 840 + 50);
  const y = Math.round(((maxLat - lat) / (maxLat - minLat)) * 500 + 40);
  return { x, y };
};

export const TacticalGISMap: React.FC<TacticalGISMapProps> = ({
  locations,
  routes,
  passes,
  inventory,
  onTogglePass,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('LOC-KUMAR');
  const [selectedPassId, setSelectedPassId] = useState<string | null>(null);
  const [filterSector, setFilterSector] = useState<string>('ALL');
  const [showContours, setShowContours] = useState<boolean>(true);
  const [showRoutesLayer, setShowRoutesLayer] = useState<boolean>(true);
  const [showConvoyPulse, setShowConvoyPulse] = useState<boolean>(true);

  // Projected node locations
  const projectedNodes = useMemo(() => {
    return locations.map((loc) => {
      const { x, y } = projectCoord(loc.latitude, loc.longitude);
      const locInv = inventory.filter((item) => item.location_id === loc.id);
      const criticalCount = locInv.filter((item) => item.status === 'CRITICAL').length;
      const minDoS =
        locInv.length > 0 ? Math.min(...locInv.map((item) => item.days_of_supply)) : 999;
      return {
        ...loc,
        x,
        y,
        inventoryCount: locInv.length,
        criticalCount,
        minDoS,
      };
    });
  }, [locations, inventory]);

  // Projected passes
  const projectedPasses = useMemo(() => {
    return passes.map((pass) => {
      const { x, y } = projectCoord(pass.latitude, pass.longitude);
      return { ...pass, x, y };
    });
  }, [passes]);

  // Selected node details
  const selectedNode = useMemo(() => {
    return projectedNodes.find((n) => n.id === selectedNodeId) || null;
  }, [projectedNodes, selectedNodeId]);

  const selectedNodeInventory = useMemo(() => {
    if (!selectedNodeId) return [];
    return inventory.filter((i) => i.location_id === selectedNodeId);
  }, [inventory, selectedNodeId]);

  // Selected pass details
  const selectedPass = useMemo(() => {
    if (!selectedPassId) return null;
    return passes.find((p) => p.id === selectedPassId) || null;
  }, [passes, selectedPassId]);

  // High-altitude elevation profile across key supply axis:
  // Srinagar (1585m) -> Zojila (3528m) -> Dras (3280m) -> Leh (3524m) -> Khardung La (5359m) -> SBC (3658m) -> Kumar Post (4876m) -> DBO (5065m)
  const elevationProfileData = useMemo(() => {
    return [
      { name: 'Srinagar Base', elevation: 1585, distance: 0, tag: 'Base Depot' },
      { name: 'Zoji La Pass', elevation: 3528, distance: 105, tag: 'Choke Pass' },
      { name: 'Dras Post', elevation: 3280, distance: 145, tag: 'Forward Post' },
      { name: 'Kargil Transit', elevation: 2676, distance: 205, tag: 'Transit Node' },
      { name: 'Leh 14 Corps HQ', elevation: 3524, distance: 420, tag: 'HQ Logistics' },
      { name: 'Khardung La Pass', elevation: 5359, distance: 460, tag: 'Strategic Pass' },
      { name: 'Thoise Air Hub', elevation: 3067, distance: 580, tag: 'Air Hub' },
      { name: 'Siachen Base Camp', elevation: 3658, distance: 655, tag: 'Brigade HQ' },
      { name: 'Kumar Post (Glacier)', elevation: 4876, distance: 683, tag: 'Extreme Altitude' },
      { name: 'DBO Outpost (SSN)', elevation: 5065, distance: 820, tag: 'ALG Perimeter' },
    ];
  }, []);

  const sectors = useMemo(() => {
    const s = Array.from(new Set(locations.map((l) => l.sector)));
    return ['ALL', ...s];
  }, [locations]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* GIS Sector Control Banner */}
      <div className="panel">
        <div
          className="panel-header"
          style={{
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                padding: '8px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                color: 'var(--accent-primary)',
              }}
            >
              <Compass size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Theater Cartographic GIS & Topography
                <span className="tactical-badge badge-info" style={{ fontSize: '0.65rem' }}>
                  WGS-84 / MGRS Zone 43S & 44R
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Operational picture with real-time BRO pass status, elevation contours, and corridor transit dynamics.
              </div>
            </div>
          </div>

          {/* Sector Filter & Layer Toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Sector:</span>
              <select
                value={filterSector}
                onChange={(e) => setFilterSector(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '3px 8px', fontSize: '0.75rem' }}
              >
                {sectors.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowContours(!showContours)}
              className="tactical-btn"
              style={{
                padding: '4px 9px',
                fontSize: '0.75rem',
                background: showContours ? 'var(--accent-primary)' : 'transparent',
                color: showContours ? 'var(--text-inverse)' : 'var(--text-secondary)',
                borderColor: showContours ? 'var(--accent-primary)' : 'var(--border-subtle)',
              }}
            >
              <Layers size={13} /> Contours
            </button>

            <button
              onClick={() => setShowRoutesLayer(!showRoutesLayer)}
              className="tactical-btn"
              style={{
                padding: '4px 9px',
                fontSize: '0.75rem',
                background: showRoutesLayer ? 'var(--accent-primary)' : 'transparent',
                color: showRoutesLayer ? 'var(--text-inverse)' : 'var(--text-secondary)',
                borderColor: showRoutesLayer ? 'var(--accent-primary)' : 'var(--border-subtle)',
              }}
            >
              <ArrowRight size={13} /> Corridors
            </button>

            <button
              onClick={() => setShowConvoyPulse(!showConvoyPulse)}
              className="tactical-btn"
              style={{
                padding: '4px 9px',
                fontSize: '0.75rem',
                background: showConvoyPulse ? 'var(--accent-primary)' : 'transparent',
                color: showConvoyPulse ? 'var(--text-inverse)' : 'var(--text-secondary)',
                borderColor: showConvoyPulse ? 'var(--accent-primary)' : 'var(--border-subtle)',
              }}
            >
              <Radio size={13} /> Convoy Radar
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Canvas + Right Inspector Drawer */}
      {/* Main Map Canvas + Right Inspector Drawer */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '20px' }}>
        {/* SVG Tactical Map Canvas */}
        <div
          className="panel"
          style={{
            position: 'relative',
            background: 'var(--bg-map-canvas)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '0px',
            overflow: 'hidden',
            minHeight: '620px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Subtle Grid Coordinates Overlay */}
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 14,
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-secondary)',
              pointerEvents: 'none',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <span>NORTHERN COMMAND LADAKH SECTOR • XIV CORPS</span>
            <span>LAT: 32°12'N - 35°48'N • LON: 74°24'E - 79°48'E</span>
            <span style={{ color: 'var(--accent-primary)' }}>ELEVATION: 1,585m - 5,582m MSL</span>
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: 14,
              display: 'flex',
              gap: '12px',
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono)',
              background: 'var(--bg-map-legend)',
              color: 'var(--text-primary)',
              padding: '6px 12px',
              borderRadius: '0px',
              border: '1px solid var(--border-subtle)',
              zIndex: 10,
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '0px', background: 'var(--accent-emerald)' }}></span>
              Normal DoS (&gt;12d)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '0px', background: 'var(--accent-amber)' }}></span>
              Warning (&lt;12d)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '0px', background: 'var(--accent-crimson)' }}></span>
              Critical (&lt;5d)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '12px', height: '2px', background: 'var(--accent-primary)' }}></span>
              Corridor Open
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '12px', height: '2px', borderTop: '2px dashed var(--accent-crimson)' }}></span>
              Pass Blocked
            </span>
          </div>

          <svg
            viewBox="0 0 960 620"
            style={{ width: '100%', height: '100%', maxHeight: '680px' }}
          >
            <defs>
              {/* Radar pulse animation for active convoys */}
              <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="glow-crimson" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <linearGradient id="corridor-gradient-open" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0f62fe" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#24a148" stopOpacity="0.95" />
              </linearGradient>
            </defs>

            {/* MGRS Grid lines */}
            <g stroke="var(--map-grid-stroke)" strokeWidth="1" strokeDasharray="3,6">
              {[120, 240, 360, 480, 600, 720, 840].map((x) => (
                <line key={`grid-x-${x}`} x1={x} y1="20" x2={x} y2="600" />
              ))}
              {[100, 200, 300, 400, 500].map((y) => (
                <line key={`grid-y-${y}`} x1="30" y1={y} x2="930" y2={y} />
              ))}
            </g>

            {/* Topographic Elevation Contours (Himalayan / Karakoram Range Lines) */}
            {showContours && (
              <g stroke="var(--map-contour-stroke)" fill="none" strokeWidth="1.5">
                {/* Karakoram Ridge (North) */}
                <path d="M 420 80 Q 480 90, 540 100 T 660 120 T 780 180" />
                <path d="M 400 110 Q 470 125, 530 140 T 640 160 T 750 220" />
                {/* Ladakh Range (Central) */}
                <path d="M 220 250 Q 340 270, 460 280 T 580 300 T 720 340" />
                <path d="M 240 280 Q 360 300, 480 310 T 600 330 T 750 380" />
                {/* Zanskar & Pir Panjal (South) */}
                <path d="M 120 340 Q 240 360, 360 390 T 500 440 T 640 480" />
                <path d="M 150 380 Q 280 410, 420 460 T 560 520 T 700 560" />
              </g>
            )}

            {/* Tactical Corridors / Routes */}
            {showRoutesLayer && (
              <g>
                {routes.map((route) => {
                  const orig = projectedNodes.find((n) => n.id === route.origin_id);
                  const dest = projectedNodes.find((n) => n.id === route.destination_id);
                  if (!orig || !dest) return null;

                  const isClosed = route.status === 'CLOSED';
                  const isRestricted = route.status === 'RESTRICTED';

                  const strokeColor = isClosed
                    ? 'var(--accent-crimson)'
                    : isRestricted
                    ? 'var(--accent-amber)'
                    : 'url(#corridor-gradient-open)';

                  const strokeDash = isClosed ? '4,4' : isRestricted ? '6,3' : 'none';
                  const strokeW = isClosed ? 2 : 2.5;

                  // Slightly curved bezier path for mountain road realism
                  const midX = (orig.x + dest.x) / 2 + (orig.y < dest.y ? -15 : 15);
                  const midY = (orig.y + dest.y) / 2;
                  const pathD = `M ${orig.x} ${orig.y} Q ${midX} ${midY} ${dest.x} ${dest.y}`;

                  return (
                    <g key={route.id}>
                      <path
                        d={pathD}
                        stroke={strokeColor}
                        strokeWidth={strokeW}
                        strokeDasharray={strokeDash}
                        fill="none"
                        opacity={isClosed ? 0.8 : 0.9}
                      />

                      {/* Moving convoy pulse animation on open corridors */}
                      {showConvoyPulse && !isClosed && (
                        <circle r="3.5" fill="var(--accent-primary)" opacity="0.9">
                          <animateMotion
                            path={pathD}
                            dur={isRestricted ? '8s' : '5s'}
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}
                    </g>
                  );
                })}
              </g>
            )}

            {/* Mountain Pass Choke Points */}
            <g>
              {projectedPasses.map((pass) => {
                const isSelected = selectedPassId === pass.id;
                const isBlocked = !pass.is_passable;
                const isRestricted = pass.status === 'RESTRICTED_CONVOY';

                return (
                  <g
                    key={pass.id}
                    transform={`translate(${pass.x}, ${pass.y})`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedPassId(pass.id);
                      setSelectedNodeId(null);
                    }}
                  >
                    {/* Pass Diamond Icon */}
                    <polygon
                      points="0,-11 11,0 0,11 -11,0"
                      fill={isBlocked ? 'var(--accent-crimson)' : isRestricted ? 'var(--accent-amber)' : 'var(--accent-emerald)'}
                      stroke={isSelected ? 'var(--accent-primary)' : 'var(--border-prominent)'}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                      filter={isBlocked ? 'url(#glow-crimson)' : 'none'}
                    />
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="var(--font-mono)"
                    >
                      ▲
                    </text>
                    <text
                      x="14"
                      y="3"
                      fill={isBlocked ? 'var(--accent-crimson)' : 'var(--map-node-label)'}
                      fontSize="10"
                      fontWeight="700"
                      fontFamily="var(--font-mono)"
                    >
                      {pass.name.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* Tactical Military Nodes (Bases & Forward Posts) */}
            <g>
              {projectedNodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                const isBase = node.node_type === 'BASE_DEPOT';
                const isCritical = node.criticalCount > 0;
                const isWarning = !isCritical && node.minDoS <= 12;

                const nodeColor = isCritical
                  ? 'var(--accent-crimson)'
                  : isWarning
                  ? 'var(--accent-amber)'
                  : isBase
                  ? 'var(--accent-primary)'
                  : 'var(--accent-emerald)';

                const matchesFilter =
                  filterSector === 'ALL' || node.sector === filterSector;
                const nodeOpacity = matchesFilter ? 1 : 0.35;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                    opacity={nodeOpacity}
                    onClick={() => {
                      setSelectedNodeId(node.id);
                      setSelectedPassId(null);
                    }}
                  >
                    {/* Pulsing halo if critical stockout */}
                    {isCritical && (
                      <circle
                        r="18"
                        fill="none"
                        stroke="var(--accent-crimson)"
                        strokeWidth="1.5"
                        opacity="0.6"
                      >
                        <animate
                          attributeName="r"
                          values="14;24;14"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.8;0.1;0.8"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}

                    {/* Node Shape: Square for Base Depot (rx=0), Circle for Forward Outpost */}
                    {isBase ? (
                      <rect
                        x="-10"
                        y="-10"
                        width="20"
                        height="20"
                        rx="0"
                        fill={nodeColor}
                        stroke={isSelected ? 'var(--accent-primary)' : 'var(--border-prominent)'}
                        strokeWidth={isSelected ? '3' : '1.5'}
                      />
                    ) : (
                      <circle
                        r={isSelected ? '10' : '8'}
                        fill={nodeColor}
                        stroke={isSelected ? 'var(--accent-primary)' : 'var(--border-prominent)'}
                        strokeWidth={isSelected ? '3' : '1.5'}
                      />
                    )}

                    {/* Node Label & Elevation */}
                    <text
                      x="14"
                      y="-4"
                      fill="var(--map-node-label)"
                      fontSize="11"
                      fontWeight={isSelected ? '800' : '600'}
                      fontFamily="var(--font-sans)"
                    >
                      {node.name.split('(')[0].replace('Outpost', '').replace('Node', '').trim()}
                    </text>
                    <text
                      x="14"
                      y="9"
                      fill="var(--text-secondary)"
                      fontSize="9"
                      fontFamily="var(--font-mono)"
                      fontWeight="600"
                    >
                      {node.elevation_m}m MSL
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Right Tactical Node / Pass Detail Inspector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {selectedPass ? (
            /* Mountain Pass Inspector */
            <div className="panel" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className="tactical-badge badge-info" style={{ marginBottom: '6px' }}>
                    BRO Pass Choke Point
                  </span>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>
                    {selectedPass.name}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {selectedPass.highway}
                  </div>
                </div>
                <span
                  className={`tactical-badge ${
                    selectedPass.status === 'OPEN'
                      ? 'badge-normal'
                      : selectedPass.status === 'RESTRICTED_CONVOY'
                      ? 'badge-warning'
                      : 'badge-critical'
                  }`}
                >
                  {selectedPass.status.replace('_', ' ')}
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  marginTop: '14px',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <div style={{ padding: '8px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.68rem' }}>ALTITUDE</div>
                  <div style={{ fontWeight: 600, marginTop: '2px' }}>{selectedPass.elevation_m}m MSL</div>
                </div>
                <div style={{ padding: '8px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.68rem' }}>AMBIENT TEMP</div>
                  <div style={{ fontWeight: 600, marginTop: '2px', color: 'var(--accent-primary)' }}>
                    {selectedPass.temperature_c}°C
                  </div>
                </div>
                <div style={{ padding: '8px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.68rem' }}>SNOW DEPTH</div>
                  <div style={{ fontWeight: 600, marginTop: '2px' }}>
                    {selectedPass.snow_accumulation_cm} cm
                  </div>
                </div>
                <div style={{ padding: '8px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.68rem' }}>DETACHMENT</div>
                  <div style={{ fontWeight: 600, marginTop: '2px', fontSize: '0.72rem' }}>
                    {selectedPass.bro_detachment.split('/')[0]}
                  </div>
                </div>
              </div>

              {selectedPass.closure_reason && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--badge-critical-bg)',
                    border: '1px solid var(--badge-critical-border)',
                    fontSize: '0.75rem',
                    color: 'var(--accent-crimson)',
                  }}
                >
                  <AlertTriangle size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  {selectedPass.closure_reason}
                </div>
              )}

              <div style={{ marginTop: '14px' }}>
                <button
                  onClick={() => onTogglePass(selectedPass.id, selectedPass.status)}
                  className="tactical-btn"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    color: selectedPass.is_passable ? 'var(--accent-crimson)' : 'var(--accent-emerald)',
                    borderColor: selectedPass.is_passable ? 'var(--badge-critical-border)' : 'var(--badge-normal-border)',
                  }}
                >
                  {selectedPass.is_passable ? 'Simulate Blizzard (Close)' : 'Mark Cleared (Open)'}
                </button>
              </div>
            </div>
          ) : selectedNode ? (
            /* Tactical Node Inspector */
            <div className="panel" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className="tactical-badge badge-info" style={{ marginBottom: '6px' }}>
                    {selectedNode.node_type.replace('_', ' ')}
                  </span>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>
                    {selectedNode.name}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Sector: {selectedNode.sector.replace(/_/g, ' ')}
                  </div>
                </div>
                <span
                  className={`tactical-badge ${
                    selectedNode.weather_risk_level === 'EXTREME'
                      ? 'badge-critical'
                      : selectedNode.weather_risk_level === 'HIGH'
                      ? 'badge-warning'
                      : 'badge-normal'
                  }`}
                >
                  {selectedNode.weather_risk_level}
                </span>
              </div>

              {/* Coordinates & Physical Envelope */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  marginTop: '14px',
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <div style={{ padding: '8px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.68rem' }}>ELEVATION</div>
                  <div style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                    {selectedNode.elevation_m}m MSL
                  </div>
                </div>
                <div style={{ padding: '8px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.68rem' }}>TROOPS (PAX)</div>
                  <div style={{ fontWeight: 600 }}>{selectedNode.current_headcount} PAX</div>
                </div>
                <div style={{ padding: '8px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.68rem' }}>MGRS GRID</div>
                  <div style={{ fontWeight: 600, fontSize: '0.72rem' }}>{selectedNode.mgrs_grid || '—'}</div>
                </div>
                <div style={{ padding: '8px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.68rem' }}>AIR ACCESSIBLE</div>
                  <div style={{ fontWeight: 600 }}>
                    {selectedNode.is_air_accessible ? 'Helipad / ALG' : 'Surface Only'}
                  </div>
                </div>
              </div>

              {/* Inventory Shortages Summary */}
              <div style={{ marginTop: '14px' }}>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginBottom: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>CRITICAL STOCK LEDGERS</span>
                  <span style={{ color: 'var(--accent-crimson)', fontFamily: 'var(--font-mono)' }}>
                    {selectedNode.criticalCount} Critical
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    maxHeight: '220px',
                    overflowY: 'auto',
                  }}
                >
                  {selectedNodeInventory.slice(0, 5).map((inv) => (
                    <div
                      key={inv.id}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.75rem',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>
                          {inv.supply?.name.split('(')[0] || inv.supply_id}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.68rem' }}>
                          Stock: {inv.current_stock.toLocaleString()} • Burn: {inv.daily_consumption_rate}/day
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                        <span
                          className={`tactical-badge ${
                            inv.status === 'CRITICAL'
                              ? 'badge-critical'
                              : inv.status === 'WARNING'
                              ? 'badge-warning'
                              : 'badge-normal'
                          }`}
                          style={{ fontSize: '0.68rem' }}
                        >
                          {inv.days_of_supply}d DoS
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="panel" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
              Select a node or pass on the map to inspect operational metrics.
            </div>
          )}

          {/* Air Corridor Advisory Card */}
          <div
            className="panel"
            style={{
              padding: '14px',
              borderLeft: '4px solid var(--accent-primary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.82rem' }}>
              <Plane size={15} style={{ color: 'var(--accent-primary)' }} />
              <span>Contingency Air-Bridge Corridor</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              When road axes are severed by blizzards or avalanches, IAF Mi-17 V5 sorties coordinate from Leh and Thoise base air logistics hubs.
            </p>
          </div>
        </div>
      </div>

      {/* High-Altitude Elevation Profile Cross-Section */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={16} style={{ color: 'var(--accent-primary)' }} />
              Main Supply Axis — High-Altitude Elevation Profile (Srinagar → Leh → Khardung La → DBO)
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              High-altitude passes (&gt;5,300m MSL) severely de-rate internal combustion engine torque and rotor thrust envelope.
            </p>
          </div>
          <span className="elevation-tag">Peak Pass: 5,359m (Khardung La)</span>
        </div>

        <div className="panel-body" style={{ width: '100%', height: '180px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={elevationProfileData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="elevationGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis
                dataKey="name"
                tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }}
                axisLine={{ stroke: 'var(--border-subtle)' }}
              />
              <YAxis
                unit="m"
                domain={[1000, 5600]}
                tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }}
                axisLine={{ stroke: 'var(--border-subtle)' }}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  color: 'var(--text-primary)',
                }}
              />
              <Area
                type="monotone"
                dataKey="elevation"
                stroke="var(--accent-primary)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#elevationGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
