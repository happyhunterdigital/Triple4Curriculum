import React, { useEffect, useState } from 'react';
import { Award, Download, Loader2, Printer } from 'lucide-react';
import { useAuth } from '../../lib/authContext';
import { myCertificates, printCertificate, type Certificate } from '../../lib/certificates';

export const CertificatesView: React.FC = () => {
  const { currentUser } = useAuth();
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setCerts(await myCertificates());
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not load certificates.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-sm text-neutral-500">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading certificates…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
          Verified Credentials
        </span>
        <h1 className="text-2xl font-black text-neutral-900 mt-1">My Certificates</h1>
        <p className="text-xs text-neutral-500">Issued by faculty via the certificates ledger. Print or save as PDF.</p>
      </div>
      {error && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded px-3 py-2">{error}</p>}
      {certs.length === 0 && !error && (
        <div className="bg-white border rounded-2xl p-8 text-center text-sm text-neutral-500">
          <Award className="w-8 h-8 mx-auto mb-2 text-emerald-700" />
          No certificates yet. Complete a course and your lecturer will issue one here.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {certs.map((c) => (
          <div key={c.id} className="bg-white border border-emerald-950/10 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-800" />
              <h3 className="text-sm font-black text-neutral-900">{c.courseTitle}</h3>
            </div>
            <p className="text-[11px] text-neutral-500 font-mono">
              {c.courseId} · Issued {c.issuedAt || '—'} · {c.status || 'issued'}
            </p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => printCertificate(c, currentUser?.name)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-yellow-300 font-bold text-xs"
              >
                <Printer className="w-3.5 h-3.5" /> Print / PDF
              </button>
              {c.storagePath && (
                <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500" title={c.storagePath}>
                  <Download className="w-3.5 h-3.5" /> {c.storagePath}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
