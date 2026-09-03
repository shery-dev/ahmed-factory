'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface RateEditPopupProps {
  stockId: number;
  currentRate: number;
  sizeLabel?: string;
  productName?: string;
  onClose: () => void;
}

export function RateEditPopup({ stockId, currentRate, sizeLabel, productName, onClose }: RateEditPopupProps) {
  const [newRate, setNewRate] = useState(String(currentRate));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const rate = Number(newRate);
    if (isNaN(rate) || rate < 0) return;
    setBusy(true);

    const res = await fetch('/api/stock-rate', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stockId, newRate: rate }),
    });

    if (res.ok) {
      onClose();
    } else {
      setBusy(false);
    }
  }

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
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Edit Rate
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {productName && <span style={{ fontWeight: 600 }}>{productName}</span>}
            {productName && sizeLabel && <span> {'\u2014'} </span>}
            {sizeLabel && <span>Size {sizeLabel}</span>}
          </div>
        </div>

        <div style={{
          background: 'var(--bg-main)', borderRadius: 'var(--radius-md)',
          padding: '12px 16px', marginBottom: 20, textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
            Current Rate
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>
            PKR {currentRate.toLocaleString()}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
              New Rate (PKR)
            </label>
            <input
              className="input num"
              type="number"
              min="0"
              step="any"
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
              placeholder="Enter new rate"
              autoFocus
              style={{ width: '100%', fontSize: 16, padding: '10px 14px', textAlign: 'center' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={busy || !newRate || Number(newRate) < 0}
              style={{ flex: 1, padding: '12px 16px', fontSize: 14, fontWeight: 600 }}
            >
              {busy ? 'Saving...' : 'Update Rate'}
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
