import React, { useEffect, useMemo, useState } from 'react';
import { Users, Search, Download, Loader2, FileText, CheckCircle2, Clock, Shield } from 'lucide-react';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';
import { LearnerRegistration } from '../../types';

type PaymentFilter = 'all' | 'invoice_pending' | 'paid' | 'scholarship_pending_verification';

const PAYMENT_LABEL: Record<string, string> = {
  invoice_pending: 'Invoice pending',
  paid: 'Paid',
  scholarship_pending_verification: 'Scholarship review',
};

const PAYMENT_STYLE: Record<string, string> = {
  invoice_pending: 'bg-yellow-100 text-yellow-900 border-yellow-300',
  paid: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  scholarship_pending_verification: 'bg-sky-100 text-sky-900 border-sky-300',
};

export const AdminLearners: React.FC = () => {
  const { triggerToast } = useAuth();
  const [registrations, setRegistrations] = useState<LearnerRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const items = await api.getLearnerRegistrations();
        if (!cancelled) setRegistrations(items);
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          triggerToast({
            id: `toast_${Date.now()}`,
            title: 'Load Error',
            message: 'Could not load learner registrations. You may not have staff permission.',
            category: 'urgent',
            timestamp: 'Just now',
            read: false,
            priority: 'high',
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return registrations.filter((r) => {
      const matchesPayment = paymentFilter === 'all' || (r.paymentStatus || '') === paymentFilter;
      if (!matchesPayment) return false;
      if (!q) return true;
      return [
        r.name, r.email, r.guardianName, r.guardianContact,
        r.previousSchool, r.lastGrade, r.department, r.payerName,
      ].some((v) => (v || '').toLowerCase().includes(q));
    });
  }, [registrations, searchQuery, paymentFilter]);

  const counts = useMemo(() => ({
    total: registrations.length,
    invoicePending: registrations.filter((r) => r.paymentStatus === 'invoice_pending').length,
    paid: registrations.filter((r) => r.paymentStatus === 'paid').length,
    scholarship: registrations.filter((r) => r.paymentStatus === 'scholarship_pending_verification').length,
  }), [registrations]);

  const exportCsv = () => {
    const header = [
      'Name', 'Email', 'DOB', 'Minor', 'Guardian', 'Guardian contact', 'Home address',
      'Previous school', 'Last grade', 'Department', 'Level', 'Enrollment status',
      'Payment status', 'Payment method', 'Payer', 'Transcripts provided', 'Documents', 'Registered',
    ];
    const rows = filtered.map((r) => [
      r.name, r.email, r.dob, r.isMinor ? 'yes' : 'no', r.guardianName, r.guardianContact, r.homeAddress,
      r.previousSchool, r.lastGrade, r.department, r.level, r.enrollmentStatus,
      PAYMENT_LABEL[r.paymentStatus] || r.paymentStatus, r.paymentMethod, r.payerName,
      r.transcriptsProvided ? 'yes' : 'no', String(r.documentsCount),
      r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-ZA') : '',
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\r\n');
    const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `t4c-learner-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-emerald-950/10 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
              Admissions
            </span>
            <span className="text-xs font-semibold text-neutral-500">
              Term 1, 2027 intake
            </span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 mt-1 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-800" /> Registered Learners
          </h1>
          <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
            <Shield className="w-3 h-3" /> Registrations from the students collection. Staff only. Handled under POPIA.
          </p>
        </div>

        <button
          onClick={exportCsv}
          disabled={loading || filtered.length === 0}
          className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-yellow-300 text-xs font-black shadow-sm flex items-center gap-2 transition"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV ({filtered.length})</span>
        </button>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: counts.total, tone: 'text-neutral-900' },
          { label: 'Invoice pending', value: counts.invoicePending, tone: 'text-yellow-800' },
          { label: 'Paid', value: counts.paid, tone: 'text-emerald-800' },
          { label: 'Scholarship review', value: counts.scholarship, tone: 'text-sky-800' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-emerald-950/10 shadow-xs">
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl font-black mt-1 ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search learner, email or guardian..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-neutral-300 bg-[#fbfcf8] focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as PaymentFilter)}
            className="w-48 px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white"
          >
            <option value="all">All payment statuses</option>
            <option value="invoice_pending">Invoice pending</option>
            <option value="paid">Paid</option>
            <option value="scholarship_pending_verification">Scholarship review</option>
          </select>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-neutral-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading registrations...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-neutral-600">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No registered learners found{searchQuery || paymentFilter !== 'all' ? ' for this filter' : ''}.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider">
                  <th className="pb-3 pr-4">Learner</th>
                  <th className="pb-3 pr-4">DOB</th>
                  <th className="pb-3 pr-4">Guardian</th>
                  <th className="pb-3 pr-4">Previous school</th>
                  <th className="pb-3 pr-4">Docs</th>
                  <th className="pb-3 pr-4">Payment</th>
                  <th className="pb-3">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-50/80 transition align-top">
                    <td className="py-3 pr-4">
                      <p className="font-bold text-neutral-900">{r.name || '(no name)'}</p>
                      <p className="font-mono text-[11px] text-neutral-500">{r.email}</p>
                      {r.isMinor && (
                        <span className="inline-block mt-1 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">Minor</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 font-mono text-neutral-600 whitespace-nowrap">{r.dob || '—'}</td>
                    <td className="py-3 pr-4">
                      <p className="text-neutral-800">{r.guardianName || '—'}</p>
                      <p className="font-mono text-[11px] text-neutral-500">{r.guardianContact}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-neutral-800">{r.previousSchool || '—'}</p>
                      <p className="text-[10px] text-neutral-500">{r.lastGrade}</p>
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-neutral-600">
                        <FileText className="w-3 h-3" /> {r.documentsCount}
                        {r.transcriptsProvided && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold whitespace-nowrap ${PAYMENT_STYLE[r.paymentStatus] || 'bg-neutral-100 text-neutral-700 border-neutral-200'}`}>
                        {r.paymentStatus === 'paid' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {PAYMENT_LABEL[r.paymentStatus] || r.paymentStatus || 'Unknown'}
                      </span>
                      {r.payerName && <p className="text-[10px] text-neutral-500 mt-1">{r.payerName}</p>}
                    </td>
                    <td className="py-3 whitespace-nowrap text-neutral-600">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-ZA') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
