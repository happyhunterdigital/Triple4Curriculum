import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export const Privacy: React.FC = () => {
  const [notice, setNotice] = useState<{ title: string; summary: string; contact: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.getPrivacy()
      .then((n) => { if (!cancelled) setNotice(n); })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load notice'); });
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="max-w-3xl mx-auto bg-white border rounded-xl p-6 sm:p-8" aria-labelledby="privacy-title">
      <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-500">Triple4C • Privacy</p>
      <h1 id="privacy-title" className="text-2xl font-bold mt-2">Privacy Notice (POPIA) - Demo</h1>
      {error && (
        <div role="alert" className="mt-4 border border-red-300 bg-red-50 rounded-lg p-4 text-sm">
          {error}{' '}
          <button className="underline" onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}
      <p className="mt-4 text-sm leading-relaxed text-neutral-700">
        {notice?.summary || 'Loading notice…'}
      </p>
      <ul className="mt-4 text-sm list-disc pl-5 space-y-1 text-neutral-700">
        <li>Consent is required at registration (agreePrivacy checkbox).</li>
        <li>Network identifiers in logs are truncated + hashed - raw IPs are never shown to clients.</li>
        <li>You may request an export of your demo data or deletion of your demo account.</li>
        <li>Production use requires an appointed Information Officer and a full POPIA assessment.</li>
      </ul>
      <p className="mt-4 text-sm">Contact: <span className="font-mono">{notice?.contact || 'privacy@triple4c.com'}</span></p>
      <div className="mt-6 flex gap-3">
        <Link to="/onboarding" className="underline text-sm">Back to onboarding</Link>
        <Link to="/dashboard" className="underline text-sm">Dashboard</Link>
      </div>
    </main>
  );
};
