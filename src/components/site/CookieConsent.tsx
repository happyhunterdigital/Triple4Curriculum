import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CONSENT_OPEN_EVENT, getConsent, setConsent } from '../../lib/consent';

export const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getConsent() === null);
    const open = () => setVisible(true);
    document.addEventListener(CONSENT_OPEN_EVENT, open);
    return () => document.removeEventListener(CONSENT_OPEN_EVENT, open);
  }, []);

  const choose = (value: 'accepted' | 'declined') => {
    setConsent(value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm z-50 bg-white border border-black/10 rounded-xl shadow-xl p-4"
    >
      <p className="text-sm font-semibold">We use minimal cookies</p>
      <p className="mt-1 text-xs leading-relaxed text-neutral-600">
        Strictly-necessary storage (sign-in, preferences) plus a remembered banner choice. Analytics
        and any optional third-party script stay off until you accept. See our{' '}
        <Link to="/privacy" className="underline font-medium">
          Privacy Policy
        </Link>
        .
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => choose('accepted')}
          className="flex-1 bg-[var(--color-t4c-black)] text-white text-xs font-bold uppercase tracking-widest rounded-full px-4 py-2.5 hover:bg-[var(--color-t4c-green)] transition-colors"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => choose('declined')}
          className="flex-1 border border-black/15 text-xs font-bold uppercase tracking-widest rounded-full px-4 py-2.5 hover:border-[var(--color-t4c-green)] transition-colors"
        >
          Decline
        </button>
      </div>
    </div>
  );
};
