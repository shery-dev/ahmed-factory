'use client';

import { useState, useRef, useEffect } from 'react';

interface StockAdjustPopupProps {
  stockId: number;
  currentQty: number;
  unitLabel: string;
  onClose: () => void;
}

export function StockAdjustPopup({ stockId, currentQty, unitLabel, onClose }: StockAdjustPopupProps) {
  const [delta, setDelta] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const num = Number(delta);
    if (!num || !reason.trim()) return;
    setBusy(true);

    const res = await fetch('/api/stock-adjust', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stockId, delta: num, reason: reason.trim() }),
    });

    if (res.ok) {
      onClose();
    } else {
      setBusy(false);
    }
  }

  const newQty = currentQty + (Number(delta) || 0);

  return (
    <div ref={ref} style={{
      position: 'absolute', zIndex: 200, top: '100%', left: '50%', transform: 'translateX(-50%)',
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
      padding: 16, minWidth: 220, marginTop: 4,
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' }}>
        Adjust Stock
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
            CHANGE ({unitLabel})
          </label>
          <input
            className="input num"
            type="number"
            step="any"
            value={delta}
            onChange={(e) => setDelta(e.target.value)}
            placeholder="+5 or -2"
            autoFocus
            style={{ width: '100%', fontSize: 13 }}
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
            REASON
          </label>
          <input
            className="input"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why?"
            required
            style={{ width: '100%', fontSize: 13 }}
          />
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
          Current: <strong>{currentQty}</strong> → New: <strong>{newQty}</strong>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="submit" className="btn btn-primary" disabled={busy || !delta || !reason.trim()}
                  style={{ flex: 1, padding: '6px 10px', fontSize: 12 }}>
            {busy ? '...' : 'Apply'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onClose}
                  style={{ padding: '6px 10px', fontSize: 12 }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
