// Crash/error monitoring. Sentry is optional third-party monitoring, so it
// must not initialise before the visitor accepts the cookie banner.
import { hasConsent, onConsentChange } from './consent';

const dsn = import.meta.env?.VITE_SENTRY_DSN as string | undefined;
let initialised = false;

async function initMonitoring(): Promise<void> {
  if (initialised || !dsn || !hasConsent()) {
    if (!dsn) console.info('[monitoring] VITE_SENTRY_DSN not set - console stub active.');
    return;
  }
  try {
    // @ts-ignore - optional dependency; stub fallback below when missing.
    const Sentry = await import('@sentry/react');
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
    });
    initialised = true;
    console.info('[monitoring] Sentry initialised after consent.');
  } catch {
    console.warn('[monitoring] @sentry/react not installed - console stub active.');
  }
}

if (typeof window !== 'undefined') {
  void initMonitoring();
  onConsentChange((choice) => {
    if (choice === 'accepted') void initMonitoring();
  });
}

export { initMonitoring };
