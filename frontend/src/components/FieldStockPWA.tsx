import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  Send,
  CloudLightning,
  CheckCircle,
  Clock,
  Shield,
  Trash2,
  FileText,
  Boxes,
} from 'lucide-react';
import { api } from '../services/api';
import { translations, type Language } from '../services/translations';
import type { Location, SupplyItem, InventoryRecord } from '../types';


interface FieldStockPWAProps {
  locations: Location[];
  supplies: SupplyItem[];
  inventory: InventoryRecord[];
  onIndentCreated?: () => void;
}

interface QueuedVoucher {
  id: string;
  originating_unit: string;
  forward_post_id: string;
  priority: string;
  officer_service_number: string;
  officer_name: string;
  items: Array<{
    supply_id: string;
    supply_name: string;
    supply_class: string;
    quantity_requested: number;
    unit: string;
    urgency_reason?: string;
  }>;
  justification: string;
  verification_hash: string;
  queued_at: string;
}

const STORAGE_KEY = 'vanguard_offline_vouchers_queue';

export const FieldStockPWA: React.FC<FieldStockPWAProps> = ({
  locations,
  supplies,
  inventory,
  onIndentCreated,
}) => {
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];

  // Offline Simulation State
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [queuedVouchers, setQueuedVouchers] = useState<QueuedVoucher[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Selected Outpost
  const forwardLocations = locations.filter((l) => l.node_type !== 'BASE_DEPOT');
  const [selectedPostId, setSelectedPostId] = useState<string>(forwardLocations[0]?.id || 'LOC-KUMAR');

  // Form State
  const [unit, setUnit] = useState<string>('3 LADAKH SCOUTS (High Altitude Warfare)');
  const [officerNo, setOfficerNo] = useState<string>('IC-78219M Maj R. Sharma');
  const [officerName, setOfficerName] = useState<string>('Maj R. Sharma');
  const [priority, setPriority] = useState<string>('OP_IMMEDIATE');
  const [selectedSupplyId, setSelectedSupplyId] = useState<string>(supplies[0]?.id || 'SUP-POL-DIESEL-ARCTIC');
  const [quantity, setQuantity] = useState<number>(2500);
  const [justification, setJustification] = useState<string>(
    'Sub-zero -38C freezeout accelerating bukhari heater diesel burn rate; safety buffer depleted.'
  );

  // Load offline vouchers from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setQueuedVouchers(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to read localStorage:', e);
    }
  }, []);

  // Save offline vouchers to localStorage on state change
  const saveQueueToStorage = (queue: QueuedVoucher[]) => {
    setQueuedVouchers(queue);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  };

  // Compute SHA-256 hash locally in browser for offline integrity
  const computeLocalSha256 = async (
    voucherId: string,
    unitName: string,
    postId: string,
    itemsRaw: string,
    officer: string
  ): Promise<string> => {
    try {
      const payload = `${voucherId}:${unitName}:${postId}:${itemsRaw}:${officer}`;
      const msgBuffer = new TextEncoder().encode(payload);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return `OFFLINE-DIGEST-${Date.now().toString(16)}`;
    }
  };

  const handleSubmitVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    const sup = supplies.find((s) => s.id === selectedSupplyId);
    if (!sup) return;

    const itemsPayload = [
      {
        supply_id: sup.id,
        supply_name: sup.name,
        supply_class: sup.supply_class,
        quantity_requested: quantity,
        unit: sup.unit,
        urgency_reason: justification,
      },
    ];

    const timestamp = Date.now();
    const voucherId = `IAF-Z-2096/${new Date().getFullYear()}/FIELD-${timestamp}`;
    const hash = await computeLocalSha256(
      voucherId,
      unit,
      selectedPostId,
      JSON.stringify(itemsPayload),
      officerNo
    );

    const newVoucher: QueuedVoucher = {
      id: voucherId,
      originating_unit: unit,
      forward_post_id: selectedPostId,
      priority,
      officer_service_number: officerNo,
      officer_name: officerName,
      items: itemsPayload,
      justification,
      verification_hash: hash,
      queued_at: new Date().toISOString(),
    };

    if (isSimulatedOffline) {
      // Offline mode: store locally in queue
      const updated = [newVoucher, ...queuedVouchers];
      saveQueueToStorage(updated);
      setSyncFeedback(t.vouchersSavedSuccess);
    } else {
      // Online mode: attempt direct sync or fallback to local
      try {
        await api.createIndent({
          originating_unit: unit,
          forward_post_id: selectedPostId,
          priority,
          officer_service_number: officerNo,
          officer_name: officerName,
          items: itemsPayload,
          justification,
        });
        setSyncFeedback('Voucher submitted directly to HQ XIV Corps ledger.');
        if (onIndentCreated) onIndentCreated();
      } catch (err: any) {
        // Fallback to offline queue if network fails
        const updated = [newVoucher, ...queuedVouchers];
        saveQueueToStorage(updated);
        setSyncFeedback(`Network unavailable (${err.message}). Stored safely to offline field queue.`);
      }
    }
  };

  const handleSyncQueue = async () => {
    if (queuedVouchers.length === 0) return;
    setIsSyncing(true);
    setSyncFeedback(t.syncing);

    try {
      const syncItems = queuedVouchers.map((v) => ({
        originating_unit: v.originating_unit,
        forward_post_id: v.forward_post_id,
        priority: v.priority,
        officer_service_number: v.officer_service_number,
        officer_name: v.officer_name,
        items: v.items,
        justification: v.justification,
      }));

      await api.syncOfflineIndents('DEVICE-FIELD-PWA-01', syncItems);
      saveQueueToStorage([]);
      setSyncFeedback(t.syncedSuccess);
      if (onIndentCreated) onIndentCreated();
    } catch (err: any) {
      setSyncFeedback(`Sync failed: ${err.message}. Records remain preserved on device storage.`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDiscardVoucher = (voucherId: string) => {
    const updated = queuedVouchers.filter((v) => v.id !== voucherId);
    saveQueueToStorage(updated);
  };

  const selectedLocation = locations.find((l) => l.id === selectedPostId);
  const locationInventory = inventory.filter((i) => i.location_id === selectedPostId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Tactical Field Banner */}
      <div
        className="tactical-card"
        style={{
          padding: '20px 24px',
          borderLeft: `4px solid ${isSimulatedOffline ? 'var(--accent-crimson)' : 'var(--accent-emerald)'}`,
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
                color: isSimulatedOffline ? 'var(--accent-crimson)' : 'var(--accent-emerald)',
                fontWeight: 700,
                letterSpacing: '0.08em',
              }}
            >
              {t.theaterSector}
            </span>
            <span className={`badge ${isSimulatedOffline ? 'badge-crimson' : 'badge-emerald'}`}>
              {isSimulatedOffline ? t.signalOffline : t.signalOnline}
            </span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px' }}>{t.systemTitle}</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {t.systemSubtitle}
          </p>
        </div>

        {/* Controls: Language Toggle & Offline Simulator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Language Switcher */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              padding: '2px',
            }}
          >
            <button
              onClick={() => setLang('en')}
              className="tactical-btn"
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                background: lang === 'en' ? 'var(--accent-cyan)' : 'transparent',
                color: lang === 'en' ? '#000000' : 'var(--text-secondary)',
                fontWeight: lang === 'en' ? 700 : 500,
              }}
            >
              English
            </button>
            <button
              onClick={() => setLang('hi')}
              className="tactical-btn"
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                background: lang === 'hi' ? 'var(--accent-cyan)' : 'transparent',
                color: lang === 'hi' ? '#000000' : 'var(--text-secondary)',
                fontWeight: lang === 'hi' ? 700 : 500,
              }}
            >
              हिन्दी (Hindi)
            </button>
          </div>

          {/* Simulate No Signal Toggle */}
          <button
            onClick={() => setIsSimulatedOffline(!isSimulatedOffline)}
            className="tactical-btn"
            style={{
              background: isSimulatedOffline ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: isSimulatedOffline ? 'var(--accent-crimson)' : 'var(--border-subtle)',
              color: isSimulatedOffline ? 'var(--accent-crimson)' : 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {isSimulatedOffline ? <WifiOff size={14} /> : <Wifi size={14} />}
            {isSimulatedOffline ? t.simulateRestore : t.simulateNoSignal}
          </button>

          {/* Sync Button */}
          <button
            onClick={handleSyncQueue}
            disabled={queuedVouchers.length === 0 || isSimulatedOffline || isSyncing}
            className="tactical-btn tactical-btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <CloudLightning size={14} />
            {t.syncButton} ({queuedVouchers.length})
          </button>
        </div>
      </div>

      {syncFeedback && (
        <div
          className="tactical-card"
          style={{
            padding: '12px 16px',
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid var(--accent-cyan)',
            fontSize: '0.8rem',
            color: 'var(--accent-cyan)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle size={16} />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Main Grid: Requisition Form + Stocktake View */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left Column: IAF-Z-2096 Requisition Form */}
        <div className="tactical-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <FileText size={20} className="text-cyan" />
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>{t.formTitle}</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.formSubtitle}</p>
            </div>
          </div>

          <form onSubmit={handleSubmitVoucher} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                {t.selectOutpost}
              </label>
              <select
                value={selectedPostId}
                onChange={(e) => setSelectedPostId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.85rem',
                }}
              >
                {forwardLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.elevation_m}m MSL — {loc.sector})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                {t.unitLabel}
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                required
                placeholder={t.unitPlaceholder}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  {t.officerServiceNo}
                </label>
                <input
                  type="text"
                  value={officerNo}
                  onChange={(e) => setOfficerNo(e.target.value)}
                  required
                  placeholder={t.officerPlaceholder}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  {t.officerName}
                </label>
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  required
                  placeholder={t.officerNamePlaceholder}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                {t.priorityTier}
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.85rem',
                }}
              >
                <option value="OP_IMMEDIATE">{t.opImmediate}</option>
                <option value="PRIORITY">{t.priority}</option>
                <option value="ROUTINE">{t.routine}</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  {t.selectSupply}
                </label>
                <select
                  value={selectedSupplyId}
                  onChange={(e) => setSelectedSupplyId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem',
                  }}
                >
                  {supplies.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.supply_class})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  {t.quantityRequested}
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                {t.justification}
              </label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                required
                rows={3}
                placeholder={t.justificationPlaceholder}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.85rem',
                  resize: 'vertical',
                }}
              />
            </div>

            <button
              type="submit"
              className="tactical-btn tactical-btn-primary"
              style={{
                marginTop: '8px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Send size={16} />
              {t.submitOfflineBtn}
            </button>
          </form>
        </div>

        {/* Right Column: Outpost Stocktake Ledger + Offline Queue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Outpost Live Stocktake Card */}
          <div className="tactical-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Boxes size={18} className="text-cyan" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
                  {selectedLocation?.name} — {t.outpostStockSummary}
                </h4>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {t.troopHeadcount}: <strong>{selectedLocation?.current_headcount} PAX</strong>
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '6px' }}>{t.supplyItem}</th>
                    <th style={{ padding: '6px' }}>{t.currentStock}</th>
                    <th style={{ padding: '6px' }}>{t.dailyBurn}</th>
                    <th style={{ padding: '6px' }}>{t.daysOfSupply}</th>
                    <th style={{ padding: '6px' }}>{t.status}</th>
                  </tr>
                </thead>
                <tbody>
                  {locationInventory.map((item) => {
                    const isCrit = item.status === 'CRITICAL';
                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '8px 6px', fontWeight: 600 }}>{item.supply?.name || item.supply_id}</td>
                        <td style={{ padding: '8px 6px', fontFamily: 'var(--font-mono)' }}>
                          {item.current_stock.toLocaleString()}
                        </td>
                        <td style={{ padding: '8px 6px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                          {item.daily_consumption_rate}/d
                        </td>
                        <td style={{ padding: '8px 6px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: isCrit ? 'var(--accent-crimson)' : 'inherit' }}>
                          {item.days_of_supply}d
                        </td>
                        <td style={{ padding: '8px 6px' }}>
                          <span className={`badge ${isCrit ? 'badge-crimson' : item.status === 'WARNING' ? 'badge-amber' : 'badge-emerald'}`} style={{ fontSize: '0.65rem' }}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Local Device Queue */}
          <div className="tactical-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} className="text-amber" />
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>{t.queueTitle}</h4>
              </div>
              <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>
                {queuedVouchers.length} {t.queuedVouchers}
              </span>
            </div>

            {queuedVouchers.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '12px 0' }}>
                {t.queueEmpty}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {queuedVouchers.map((voucher) => (
                  <div
                    key={voucher.id}
                    style={{
                      padding: '12px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                        {voucher.id}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge badge-crimson" style={{ fontSize: '0.65rem' }}>
                          {voucher.priority}
                        </span>
                        <button
                          onClick={() => handleDiscardVoucher(voucher.id)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.75rem', marginTop: '4px', color: 'var(--text-secondary)' }}>
                      {voucher.originating_unit} &bull; Officer: {voucher.officer_service_number}
                    </div>

                    <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                      <strong>Items: </strong>
                      {voucher.items.map((it) => `${it.supply_name} (${it.quantity_requested} ${it.unit})`).join(', ')}
                    </div>

                    <div style={{ marginTop: '8px', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', wordBreak: 'break-all' }}>
                      <Shield size={10} style={{ display: 'inline', marginRight: '4px' }} />
                      SHA-256: {voucher.verification_hash}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
