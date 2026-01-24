'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const CONSENT_KEY = 'cookie-consent';

function getStoredConsent(): 'accepted' | 'rejected' | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(CONSENT_KEY);
  if (stored === 'accepted' || stored === 'rejected') return stored;
  return null;
}

function updateGoogleConsent(granted: boolean) {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    const gtag = window.gtag as (...args: unknown[]) => void;
    gtag('consent', 'update', {
      ad_storage: granted ? 'granted' : 'denied',
      ad_user_data: granted ? 'granted' : 'denied',
      ad_personalization: granted ? 'granted' : 'denied',
      analytics_storage: granted ? 'granted' : 'denied',
    });
  }
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    if (stored) {
      updateGoogleConsent(stored === 'accepted');
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- initialization from localStorage
      setShowBanner(true);
    }
  }, []);

  const handleAccept = useCallback(() => {
    try {
      localStorage.setItem(CONSENT_KEY, 'accepted');
    } catch { /* storage unavailable */ }
    setShowBanner(false);
    updateGoogleConsent(true);
  }, []);

  const handleReject = useCallback(() => {
    try {
      localStorage.setItem(CONSENT_KEY, 'rejected');
    } catch { /* storage unavailable */ }
    setShowBanner(false);
    updateGoogleConsent(false);
  }, []);

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-slate-800 border-t border-slate-700 shadow-lg">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm text-slate-300 flex-1">
          We use cookies to personalize ads and analyze traffic. See our{' '}
          <Link href="/privacy" className="text-purple-400 hover:text-purple-300 underline">
            Privacy Policy
          </Link>{' '}
          for details.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleReject}
            className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
          >
            Reject
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
