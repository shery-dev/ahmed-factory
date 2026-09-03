'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface StockAdjustPopupProps {
  stockId: number;
  currentQty: number;
  unitLabel: string;
  sizeLabel?: string;
  productName?: string;
  onClose: () => void;
}

export function StockAdjustPopup({ stockId, currentQty, unitLabel, sizeLabel, productName, onClose }: StockAdjustPopupProps) {
  const [delta, setDelta] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
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
  const isAdd = Number(delta) > 0;
  const isRemove = Number(delta) < 0;

  // Render via portal directly into document.body — no card DOM interference
  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)',
        width: '100%', maxWidth: 400, padding: '24px 28px',
      }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Adjust Stock
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {productName && <span style={{ fontWeight: 600 }}>{productName}</span>}
            {productName && sizeLabel && <span> {'\u2014'} </span>}
            {sizeLabel && <span>Size {sizeLabel}</span>}
          </div>
        </div>

        {/* Current stock display */}
        <div style={{
          background: 'var(--bg-main)', borderRadius: 'var(--radius-md)',
          padding: '12px 16px', marginBottom: 20, textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
            Current Stock
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>
            {currentQty.toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{unitLabel}</div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Delta input */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
              Change Quantity ({unitLabel})
            </label>
            <input
              className="input num"
              type="number"
              step="any"
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              placeholder="e.g. +50 or -10"
              autoFocus
              style={{ width: '100%', fontSize: 16, padding: '10px 14px', textAlign: 'center' }}
            />
            {/* Quick preview */}
            {delta && Number(delta) !== 0 && (
              <div style={{
                marginTop: 8, fontSize: 13, textAlign: 'center',
                color: isAdd ? 'var(--success)' : isRemove ? 'var(--danger)' : 'var(--text-muted)',
                fontWeight: 600,
              }}>
                {isAdd ? '+' : ''}{delta} {unitLabel} {'\u2192'} New total: <strong>{newQty.toLocaleString()}</strong> {unitLabel}
              </div>
            )}
          </div>

          {/* Reason input */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
              Reason
            </label>
            <input
              className="input"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you adjusting this stock?"
              required
              style={{ width: '100%', fontSize: 14, padding: '10px 14px' }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={busy || !delta || Number(delta) === 0 || !reason.trim()}
              style={{ flex: 1, padding: '12px 16px', fontSize: 14, fontWeight: 600 }}
            >
              {busy ? 'Applying...' : 'Apply Adjustment'}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              style={{ padding: '12px 16px', fontSize: 14 }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
