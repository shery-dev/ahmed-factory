'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useUi } from './Shell';

/**
 * Privacy toggle button — lives in the dashboard header next to the date
 * presets. Reads/writes privacyOn via the shared UI context (Shell).
 */
export function PrivacyToggle() {
  const { privacyOn, setPrivacyOn } = useUi();
  return (
    <button
      className={`icon-btn privacy-btn ${privacyOn ? 'on' : ''}`}
      onClick={() => setPrivacyOn(!privacyOn)}
      title={privacyOn ? 'Show figures' : 'Hide figures'}
    >
      {privacyOn ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  );
}
