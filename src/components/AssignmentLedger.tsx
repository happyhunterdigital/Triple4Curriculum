import React, { useState } from 'react';

interface AssignmentRow {
  id: string;
  code: string;
  title: string;
  deadline: string;
  status: 'GRANTED' | 'PENDING' | 'OVERDUE';
}

const ACADEMIC_ASSIGNMENTS: AssignmentRow[] = [
  { id: "A-01", code: "PROJ-401", title: "Infrastructure Optimization Matrix", deadline: "2026-09-01", status: "PENDING" },
  { id: "A-02", code: "LAB-402", title: "Stochastic Pipeline Stress-Analysis", deadline: "2026-08-15", status: "GRANTED" }
];

export const AssignmentLedger: React.FC = () => {
  const [submissions, setSubmissions] = useState<AssignmentRow[]>(ACADEMIC_ASSIGNMENTS);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const handleFileRegistration = (id: string) => {
    setUploadingId(id);
    setTimeout(() => {
      setSubmissions(prev => prev.map(row =>
        row.id === id ? { ...row, status: 'GRANTED' } : row
      ));
      setUploadingId(null);
    }, 1500);
  };

  return (
    <section className="w-full">
      <div className="mb-4 sm:mb-6 md:mb-8">
        <p className="font-mono text-[9px] xs:text-[10px] sm:text-xs uppercase tracking-[0.2em] text-neutral-400 mb-1">
          Academic Submissions
        </p>
        <h2 className="font-display text-lg xs:text-xl sm:text-2xl lg:text-3xl font-medium text-[var(--color-t4c-black)] tracking-tight">
          Assignment Registry
        </h2>
      </div>

      {/* Desktop / Laptop Table View (>= 768px) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-[var(--color-t4c-black)]/10 font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase tracking-wider">
              <th className="py-3 sm:py-4 font-normal w-14 sm:w-16">ID</th>
              <th className="py-3 sm:py-4 font-normal w-24 sm:w-28">Code</th>
              <th className="py-3 sm:py-4 font-normal">Task Documentation</th>
              <th className="py-3 sm:py-4 font-normal w-28 sm:w-32">Deadline</th>
              <th className="py-3 sm:py-4 font-normal w-28 sm:w-32">Status</th>
              <th className="py-3 sm:py-4 font-normal w-36 sm:w-40 text-right">System Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-t4c-black)]/10 font-sans text-sm">
            {submissions.map((row) => (
              <tr key={row.id} className="group hover:bg-neutral-50/50 transition-colors">
                <td className="py-4 sm:py-5 font-mono text-neutral-400 text-xs sm:text-sm">{row.id}</td>
                <td className="py-4 sm:py-5 font-mono text-neutral-500 text-xs sm:text-sm">{row.code}</td>
                <td className="py-4 sm:py-5 font-display text-sm sm:text-base font-medium text-[var(--color-t4c-black)] pr-4">{row.title}</td>
                <td className="py-4 sm:py-5 font-mono text-xs text-neutral-500">{row.deadline}</td>
                <td className="py-4 sm:py-5">
                  <span className={`font-mono text-[9px] sm:text-[10px] px-2 py-0.5 border whitespace-nowrap rounded-[4px] ${
                    row.status === 'GRANTED' ? 'border-emerald-200 text-emerald-700 bg-emerald-50/30' :
                    row.status === 'PENDING' ? 'border-amber-200 text-amber-700 bg-amber-50/30' :
                    'border-rose-200 text-rose-700 bg-rose-50/30'
                  }`}>
                    [{row.status}]
                  </span>
                </td>
                <td className="py-4 sm:py-5 text-right">
                  {row.status === 'GRANTED' ? (
                    <span className="font-mono text-xs text-neutral-400 uppercase">[ VERIFIED ]</span>
                  ) : (
                    <label className="font-mono text-xs text-neutral-600 uppercase tracking-wider cursor-pointer hover:text-black underline underline-offset-4 active:text-[var(--color-t4c-green)]">
                      {uploadingId === row.id ? '[ REGISTERING... ]' : '[ TRANSMIT FILE ]'}
                      <input type="file" className="hidden" disabled={uploadingId === row.id} onChange={() => handleFileRegistration(row.id)} />
                    </label>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Stack (< 768px) */}
      <div className="md:hidden space-y-2.5 xs:space-y-3">
        {submissions.map((row) => (
          <div key={row.id} className="border border-[var(--color-t4c-black)]/10 rounded-[10px] p-3.5 xs:p-4 bg-[var(--color-canvas-soft)] space-y-2.5 xs:space-y-3">
            <div className="flex items-start justify-between gap-2.5">
              <div className="min-w-0">
                <p className="font-mono text-[9px] xs:text-[10px] text-neutral-400 uppercase tracking-wider">
                  {row.id} • {row.code}
                </p>
                <h3 className="font-display font-semibold text-sm xs:text-[15px] leading-snug text-[var(--color-t4c-black)] mt-0.5">
                  {row.title}
                </h3>
              </div>
              <span className={`font-mono text-[8px] xs:text-[9px] px-2 py-0.5 border shrink-0 whitespace-nowrap rounded-[4px] ${
                row.status === 'GRANTED' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' :
                row.status === 'PENDING' ? 'border-amber-200 text-amber-700 bg-amber-50' :
                'border-rose-200 text-rose-700 bg-rose-50'
              }`}>
                {row.status}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-black/5">
              <span className="font-mono text-[10px] xs:text-[11px] text-neutral-500">
                Due: {row.deadline}
              </span>
              {row.status === 'GRANTED' ? (
                <span className="font-mono text-[10px] xs:text-[11px] text-emerald-700 font-bold">
                  [ VERIFIED ]
                </span>
              ) : (
                <label className="font-mono text-[10px] xs:text-[11px] font-bold text-[var(--color-t4c-black)] uppercase cursor-pointer active:scale-95 transition-transform bg-[var(--color-t4c-yellow)] px-3 py-1.5 rounded-[6px] border border-amber-600 shadow-xs">
                  {uploadingId === row.id ? 'Registering...' : 'Transmit File +'}
                  <input type="file" className="hidden" disabled={uploadingId === row.id} onChange={() => handleFileRegistration(row.id)} />
                </label>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
