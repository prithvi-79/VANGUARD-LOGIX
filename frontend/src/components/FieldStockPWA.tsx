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
        setSyncFeedback('Voucher submitted directly to Corps ledger.');
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Field Banner */}
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
              <span className={`tactical-badge ${isSimulatedOffline ? 'badge-critical' : 'badge-normal'}`}>
                {isSimulatedOffline ? t.signalOffline : t.signalOnline}
              </span>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>{t.systemTitle}</h2>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              {t.systemSubtitle}
            </p>
          </div>

          {/* Controls: Language Toggle & Offline Simulator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Language Switcher */}
            <div style={{ display: 'flex', gap: '2px', background: 'var(--bg-surface-elevated)', padding: '2px', borderRadius: 'var(--radius-sm)' }}>
              <button
                onClick={() => setLang('en')}
                className="tactical-btn"
                style={{
                  fontSize: '0.72rem',
                  padding: '3px 8px',
                  background: lang === 'en' ? 'var(--accent-primary)' : 'transparent',
                  color: lang === 'en' ? 'var(--text-inverse)' : 'var(--text-secondary)',
                  borderColor: 'transparent',
                }}
              >
                English
              </button>
              <button
                onClick={() => setLang('hi')}
                className="tactical-btn"
                style={{
                  fontSize: '0.72rem',
                  padding: '3px 8px',
                  background: lang === 'hi' ? 'var(--accent-primary)' : 'transparent',
                  color: lang === 'hi' ? 'var(--text-inverse)' : 'var(--text-secondary)',
                  borderColor: 'transparent',
                }}
              >
                हिन्दी
              </button>
            </div>

            {/* Simulate No Signal Toggle */}
            <button
              onClick={() => setIsSimulatedOffline(!isSimulatedOffline)}
              className="tactical-btn"
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                borderColor: isSimulatedOffline ? 'var(--accent-crimson)' : 'var(--border-subtle)',
                color: isSimulatedOffline ? 'var(--accent-crimson)' : 'var(--text-secondary)',
              }}
            >
              {isSimulatedOffline ? <WifiOff size={13} style={{ marginRight: '4px' }} /> : <Wifi size={13} style={{ marginRight: '4px' }} />}
              {isSimulatedOffline ? t.simulateRestore : t.simulateNoSignal}
            </button>

            {/* Sync Button */}
            <button
              onClick={handleSyncQueue}
              disabled={queuedVouchers.length === 0 || isSimulatedOffline || isSyncing}
              className="tactical-btn"
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                background: queuedVouchers.length > 0 && !isSimulatedOffline ? 'var(--accent-primary)' : 'transparent',
                color: queuedVouchers.length > 0 && !isSimulatedOffline ? 'var(--text-inverse)' : 'var(--text-tertiary)',
                borderColor: queuedVouchers.length > 0 && !isSimulatedOffline ? 'var(--accent-primary)' : 'var(--border-subtle)',
              }}
            >
              <CloudLightning size={13} style={{ marginRight: '4px' }} />
              {t.syncButton} ({queuedVouchers.length})
            </button>
          </div>
        </div>
      </div>

      {syncFeedback && (
        <div
          className="panel"
          style={{
            padding: '10px 14px',
            background: 'var(--badge-info-bg)',
            border: '1px solid var(--badge-info-border)',
            fontSize: '0.78rem',
            color: 'var(--badge-info-text)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle size={15} />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Main Grid: Requisition Form + Stocktake View */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* Left Column: IAF-Z-2096 Requisition Form */}
        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <FileText size={18} style={{ color: 'var(--accent-primary)' }} />
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>{t.formTitle}</h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>{t.formSubtitle}</p>
            </div>
          </div>

          <form onSubmit={handleSubmitVoucher} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                {t.selectOutpost}
              </label>
              <select
                value={selectedPostId}
                onChange={(e) => setSelectedPostId(e.target.value)}
                className="form-select"
                style={{ width: '100%', fontSize: '0.8rem' }}
              >
                {forwardLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.elevation_m}m MSL — {loc.sector.replace(/_/g, ' ')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                {t.unitLabel}
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                required
                placeholder={t.unitPlaceholder}
                className="form-input"
                style={{ width: '100%', fontSize: '0.8rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                  {t.officerServiceNo}
                </label>
                <input
                  type="text"
                  value={officerNo}
                  onChange={(e) => setOfficerNo(e.target.value)}
                  required
                  placeholder={t.officerPlaceholder}
                  className="form-input"
                  style={{ width: '100%', fontSize: '0.8rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                  {t.officerName}
                </label>
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  required
                  placeholder={t.officerNamePlaceholder}
                  className="form-input"
                  style={{ width: '100%', fontSize: '0.8rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                {t.priorityTier}
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="form-select"
                style={{ width: '100%', fontSize: '0.8rem' }}
              >
                <option value="OP_IMMEDIATE">{t.opImmediate}</option>
                <option value="PRIORITY">{t.priority}</option>
                <option value="ROUTINE">{t.routine}</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                  {t.selectSupply}
                </label>
                <select
                  value={selectedSupplyId}
                  onChange={(e) => setSelectedSupplyId(e.target.value)}
                  className="form-select"
                  style={{ width: '100%', fontSize: '0.8rem' }}
                >
                  {supplies.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.supply_class.replace(/_/g, ' ')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                  {t.quantityRequested}
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                  className="form-input"
                  style={{ width: '100%', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                {t.justification}
              </label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                required
                rows={3}
                placeholder={t.justificationPlaceholder}
                className="form-input"
                style={{ width: '100%', fontSize: '0.8rem', resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              className="tactical-btn"
              style={{
                marginTop: '6px',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'var(--accent-primary)',
                color: 'var(--text-inverse)',
                borderColor: 'var(--accent-primary)',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              <Send size={15} />
              {t.submitOfflineBtn}
            </button>
          </form>
        </div>

        {/* Right Column: Outpost Stocktake Ledger + Offline Queue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Outpost Live Stocktake Card */}
          <div className="panel">
            <div className="panel-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Boxes size={16} style={{ color: 'var(--accent-primary)' }} />
                <h4 style={{ fontSize: '0.88rem', fontWeight: 600, margin: 0 }}>
                  {selectedLocation?.name} — {t.outpostStockSummary}
                </h4>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                {t.troopHeadcount}: <strong>{selectedLocation?.current_headcount} PAX</strong>
              </span>
            </div>

            <div className="enterprise-table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="enterprise-table">
                <thead>
                  <tr>
                    <th>{t.supplyItem}</th>
                    <th>{t.currentStock}</th>
                    <th>{t.dailyBurn}</th>
                    <th>{t.daysOfSupply}</th>
                    <th>{t.status}</th>
                  </tr>
                </thead>
                <tbody>
                  {locationInventory.map((item) => {
                    const isCrit = item.status === 'CRITICAL';
                    return (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 500 }}>{item.supply?.name || item.supply_id}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>
                          {item.current_stock.toLocaleString()}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                          {item.daily_consumption_rate}/d
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: isCrit ? 'var(--accent-crimson)' : 'inherit' }}>
                          {item.days_of_supply}d
                        </td>
                        <td>
                          <span className={`tactical-badge ${isCrit ? 'badge-critical' : item.status === 'WARNING' ? 'badge-warning' : 'badge-normal'}`} style={{ fontSize: '0.62rem' }}>
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
          <div className="panel">
            <div className="panel-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={15} style={{ color: 'var(--accent-amber)' }} />
                <h4 style={{ fontSize: '0.88rem', fontWeight: 600, margin: 0 }}>{t.queueTitle}</h4>
              </div>
              <span className="tactical-badge badge-warning" style={{ fontSize: '0.65rem' }}>
                {queuedVouchers.length} {t.queuedVouchers}
              </span>
            </div>

            <div className="panel-body">
              {queuedVouchers.length === 0 ? (
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0, padding: '8px 0' }}>
                  {t.queueEmpty}
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {queuedVouchers.map((voucher) => (
                    <div
                      key={voucher.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                          {voucher.id}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="tactical-badge badge-critical" style={{ fontSize: '0.62rem' }}>
                            {voucher.priority.replace(/_/g, ' ')}
                          </span>
                          <button
                            onClick={() => handleDiscardVoucher(voucher.id)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}
                            title="Discard"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.72rem', marginTop: '3px', color: 'var(--text-secondary)' }}>
                        {voucher.originating_unit} &bull; Officer: {voucher.officer_service_number}
                      </div>

                      <div style={{ fontSize: '0.74rem', marginTop: '3px' }}>
                        <strong>Items: </strong>
                        {voucher.items.map((it) => `${it.supply_name} (${it.quantity_requested} ${it.unit})`).join(', ')}
                      </div>

                      <div style={{ marginTop: '6px', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', wordBreak: 'break-all' }}>
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
    </div>
  );
};
