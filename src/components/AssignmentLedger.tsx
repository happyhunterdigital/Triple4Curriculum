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
    <section className="w-full max-w-7xl mx-auto py-16 px-6 md:px-12 border-t border-[var(--color-prestige-line)]">
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-400 mb-1">Academic Submissions</p>
        <h2 className="font-serif text-3xl font-normal text-[var(--color-prestige-dark)] tracking-tight">Assignment Registry</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-prestige-line)] font-mono text-[11px] text-neutral-400 uppercase tracking-wider">
              <th className="py-4 font-normal w-16">ID</th>
              <th className="py-4 font-normal w-28">Code</th>
              <th className="py-4 font-normal">Task Documentation</th>
              <th className="py-4 font-normal w-32">Deadline</th>
              <th className="py-4 font-normal w-32">Status</th>
              <th className="py-4 font-normal w-40 text-right">System Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-prestige-line)] font-sans text-sm">
            {submissions.map((row) => (
              <tr key={row.id} className="group hover:bg-neutral-50/50 transition-colors">
                <td className="py-5 font-mono text-neutral-400">{row.id}</td>
                <td className="py-5 font-mono text-neutral-500">{row.code}</td>
                <td className="py-5 font-serif text-lg text-[var(--color-prestige-dark)]">{row.title}</td>
                <td className="py-5 font-mono text-xs text-neutral-500">{row.deadline}</td>
                <td className="py-5">
                  <span className={`font-mono text-[10px] px-2 py-0.5 border ${
                    row.status === 'GRANTED' ? 'border-emerald-200 text-emerald-700 bg-emerald-50/30' :
                    row.status === 'PENDING' ? 'border-amber-200 text-amber-700 bg-amber-50/30' :
                    'border-rose-200 text-rose-700 bg-rose-50/30'
                  }`}>
                    [{row.status}]
                  </span>
                </td>
                <td className="py-5 text-right">
                  {row.status === 'GRANTED' ? (
                    <span className="font-mono text-xs text-neutral-400 uppercase">[ VERIFIED ]</span>
                  ) : (
                    <label className="font-mono text-xs text-neutral-600 uppercase tracking-wider cursor-pointer hover:text-black underline underline-offset-4">
                      {uploadingId === row.id ? '[ REGISTERING... ]' : '[ TRANSMIT FILE ]'}
                      <input
                        type="file"
                        className="hidden"
                        disabled={uploadingId === row.id}
                        onChange={() => handleFileRegistration(row.id)}
                      />
                    </label>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
