// Phase 3: crash/error monitoring. Reads VITE_SENTRY_DSN; dynamically imports
// @sentry/react when installed, otherwise falls back to a console stub so the
// app never breaks when the DSN or package is missing.
export async function initMonitoring(): Promise<void> {
  const dsn = import.meta.env?.VITE_SENTRY_DSN as string | undefined;
  if (!dsn) {
    console.info('[monitoring] VITE_SENTRY_DSN not set — console stub active.');
    return;
  }
  try {
    // @ts-ignore - optional dependency; stub fallback below when missing.
    const Sentry = await import('@sentry/react');
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
    });
    console.info('[monitoring] Sentry initialised.');
  } catch {
    console.warn('[monitoring] @sentry/react not installed — console stub active. DSN present but reporter missing.');
  }
}
