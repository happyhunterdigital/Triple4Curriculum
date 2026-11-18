import React, { useEffect, useMemo, useState } from 'react';
import {
  Users, GraduationCap, Search, Download, Loader2, FileText, CheckCircle2,
  Clock, Shield, X, BellRing, Check, XCircle, ExternalLink, AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';
import { sendNudge } from '../../lib/functions';
import { LearnerRegistration, TeacherApplication, RegistrationDocument } from '../../types';

type Tab = 'learners' | 'teachers';
type LearnerFilter = 'all' | 'invoice_pending' | 'paid' | 'scholarship_pending_verification';
type TeacherFilter = 'all' | 'pending' | 'approved' | 'rejected';

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
const TEACHER_STYLE: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-900 border-yellow-300',
  approved: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  rejected: 'bg-rose-100 text-rose-900 border-rose-200',
};

interface DocSection {
  title: string;
  docs: RegistrationDocument[];
}

const fmtSize = (bytes: number) =>
  bytes <= 0 ? '—' : bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
const fmtDate = (iso: string) => (iso ? new Date(iso).toLocaleDateString('en-ZA') : '—');

export const AdminApprovals: React.FC = () => {
  const { triggerToast } = useAuth();
  const [tab, setTab] = useState<Tab>('learners');
  const [learners, setLearners] = useState<LearnerRegistration[]>([]);
  const [teachers, setTeachers] = useState<TeacherApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [learnerFilter, setLearnerFilter] = useState<LearnerFilter>('all');
  const [teacherFilter, setTeacherFilter] = useState<TeacherFilter>('pending');
  const [reminding, setReminding] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [docModal, setDocModal] = useState<{ title: string; sections: DocSection[] } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [l, t] = await Promise.allSettled([
          api.getLearnerRegistrations(),
          api.getTeacherApplications(),
        ]);
        if (cancelled) return;
        if (l.status === 'fulfilled') setLearners(l.value); else console.error(l.reason);
        if (t.status === 'fulfilled') setTeachers(t.value); else console.error(t.reason);
        if (l.status === 'rejected' && t.status === 'rejected') {
          triggerToast({
            id: `toast_${Date.now()}`,
            title: 'Load Error',
            message: 'Could not load registrations. You may not have staff permission.',
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const q = searchQuery.trim().toLowerCase();

  const filteredLearners = useMemo(
    () => learners.filter((r) => {
      if (learnerFilter !== 'all' && (r.paymentStatus || '') !== learnerFilter) return false;
      if (!q) return true;
      return [r.name, r.email, r.guardianName, r.guardianContact, r.previousSchool, r.department]
        .some((v) => (v || '').toLowerCase().includes(q));
    }),
    [learners, learnerFilter, q],
  );

  const filteredTeachers = useMemo(
    () => teachers.filter((t) => {
      if (teacherFilter !== 'all' && (t.status || 'pending') !== teacherFilter) return false;
      if (!q) return true;
      return [t.name, t.email, t.highestDegree, t.degreeField, t.teachingPhase, t.referenceContact]
        .some((v) => (v || '').toLowerCase().includes(q));
    }),
    [teachers, teacherFilter, q],
  );

  const learnersPending = learners.filter((r) => r.paymentStatus === 'invoice_pending').length;
  const teachersPending = teachers.filter((t) => (t.status || 'pending') === 'pending').length;

  const learnerDocSections = (r: LearnerRegistration): DocSection[] => [
    { title: 'Academic / transcripts', docs: r.academicDocuments },
    { title: 'Scholarship documents', docs: r.paymentDocuments },
  ];
  const learnerMissing = (r: LearnerRegistration): string[] => {
    const missing: string[] = [];
    if (r.academicDocuments.length === 0) missing.push('Academic transcripts');
    const wantsScholarship =
      (r.paymentMethod || '').toLowerCase() === 'scholarship' ||
      r.paymentStatus === 'scholarship_pending_verification';
    if (wantsScholarship && r.paymentDocuments.length === 0) missing.push('Scholarship documents');
    return missing;
  };

  const teacherDocSections = (t: TeacherApplication): DocSection[] => [
    { title: 'Identity document', docs: t.idDocuments },
    { title: 'Proof of address', docs: t.addressDocuments },
    { title: 'Qualifications', docs: t.degreeDocuments },
    { title: 'Resume / CV', docs: t.resumeDocuments },
  ];
  const teacherMissing = (t: TeacherApplication): string[] => {
    const missing: string[] = [];
    if (t.idDocuments.length === 0) missing.push('ID document');
    if (t.addressDocuments.length === 0) missing.push('Address proof');
    if (t.degreeDocuments.length === 0) missing.push('Qualification');
    if (t.resumeDocuments.length === 0) missing.push('CV / resume');
    return missing;
  };

  const toast = (title: string, message: string, category: 'announcement' | 'urgent' = 'announcement') =>
    triggerToast({
      id: `toast_${Date.now()}`,
      title,
      message,
      category,
      timestamp: 'Just now',
      read: false,
      priority: category === 'urgent' ? 'high' : 'normal',
    });

  const sendPaymentReminder = async (r: LearnerRegistration) => {
    setReminding(r.id);
    try {
      const result = await sendNudge({
        recipientId: r.id,
        email: r.email,
        title: 'Payment reminder - Term 1, 2027 tuition',
        message:
          `Dear ${r.guardianName || r.name},\n\n` +
          `This is a friendly reminder that the Term 1, 2027 tuition invoice for ${r.name} is still outstanding ` +
          `(payment reference: ${r.id}). Live classes begin Monday 11 January 2027.\n\n` +
          `You can pay securely at https://triple4c.com or reply to this email if you need the invoice resent or ` +
          `have any questions. Classes are capped at sixteen learners, so early payment secures ${r.name}'s place.\n\n` +
          `Warm regards,\nThe Triple 4C admissions team`,
      });
      if (result.success) {
        toast('Reminder sent', result.emailSent
          ? `Payment reminder emailed to ${r.email}.`
          : 'Reminder recorded, but the email could not be sent (Resend not configured or rejected). Check the learner dashboard notification.');
      } else {
        toast('Reminder failed', 'The reminder could not be sent. Check functions logs.', 'urgent');
      }
    } catch (e) {
      console.error(e);
      toast('Reminder failed', 'The reminder could not be sent.', 'urgent');
    } finally {
      setReminding(null);
    }
  };

  const review = async (t: TeacherApplication, status: 'approved' | 'rejected') => {
    const verb = status === 'approved' ? 'approve' : 'reject';
    if (!window.confirm(`${verb === 'approve' ? 'Approve' : 'Reject'} ${t.name}'s educator application?`)) return;
    setReviewing(t.id);
    try {
      await api.setTeacherApplicationStatus(t.id, status);
      setTeachers((prev) => prev.map((x) => (x.id === t.id ? { ...x, status } : x)));
      toast(
        status === 'approved' ? 'Application approved' : 'Application rejected',
        status === 'approved'
          ? `${t.name} marked approved. Grant staff claims via scripts/set-claims.mjs to complete provisioning.`
          : `${t.name} marked rejected.`,
      );
    } catch (e) {
      console.error(e);
      toast('Update failed', 'The application status could not be updated.', 'urgent');
    } finally {
      setReviewing(null);
    }
  };

  const exportCsv = () => {
    const isLearners = tab === 'learners';
    const header = isLearners
      ? ['Name', 'Email', 'DOB', 'Minor', 'Guardian', 'Guardian contact', 'Previous school', 'Department', 'Enrollment', 'Payment', 'Documents', 'Missing documents', 'Registered']
      : ['Name', 'Email', 'Highest degree', 'Field', 'Certificate', 'Phase', 'Years experience', 'Background check', 'Documents received', 'Status', 'Submitted', 'Missing documents'];
    const rows = isLearners
      ? filteredLearners.map((r) => [
          r.name, r.email, r.dob, r.isMinor ? 'yes' : 'no', r.guardianName, r.guardianContact,
          r.previousSchool, r.department, r.enrollmentStatus,
          PAYMENT_LABEL[r.paymentStatus] || r.paymentStatus,
          String(r.academicDocuments.length + r.paymentDocuments.length),
          learnerMissing(r).join('; ') || 'none',
          fmtDate(r.createdAt),
        ])
      : filteredTeachers.map((t) => [
          t.name, t.email, t.highestDegree, t.degreeField, t.teachingCertificate, t.teachingPhase,
          t.yearsExperience, t.backgroundCheckStatus, `${t.documentsReceived}/${t.documentsRequired}`,
          t.status, fmtDate(t.submittedAt), teacherMissing(t).join('; ') || 'none',
        ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\r\n');
    const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `t4c-${tab}-approvals-${new Date().toISOString().slice(0, 10)}.csv`;
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
            <span className="text-xs font-semibold text-neutral-500">Review queue</span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 mt-1 flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-800" /> Registrations & Approvals
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Educator applications and learner registrations for Term 1, 2027. Staff only. Handled under POPIA.
          </p>
        </div>

        <button
          onClick={exportCsv}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-yellow-300 text-xs font-black shadow-sm flex items-center gap-2 transition"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setTab('learners')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 border transition ${
            tab === 'learners'
              ? 'bg-emerald-800 text-yellow-300 border-emerald-800 shadow-sm'
              : 'bg-white text-neutral-600 border-neutral-200 hover:border-emerald-700'
          }`}
        >
          <Users className="w-4 h-4" /> Learners
          {learnersPending > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-yellow-300 text-emerald-950 text-[10px] font-black">
              {learnersPending} awaiting payment
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('teachers')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 border transition ${
            tab === 'teachers'
              ? 'bg-emerald-800 text-yellow-300 border-emerald-800 shadow-sm'
              : 'bg-white text-neutral-600 border-neutral-200 hover:border-emerald-700'
          }`}
        >
          <GraduationCap className="w-4 h-4" /> Teachers
          {teachersPending > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-yellow-300 text-emerald-950 text-[10px] font-black">
              {teachersPending} pending
            </span>
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={tab === 'learners' ? 'Search learner, email, guardian, school...' : 'Search teacher, email, qualification...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-neutral-300 bg-[#fbfcf8] focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
          />
        </div>
        {tab === 'learners' ? (
          <select
            value={learnerFilter}
            onChange={(e) => setLearnerFilter(e.target.value as LearnerFilter)}
            className="w-48 px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white"
          >
            <option value="all">All payment statuses</option>
            <option value="invoice_pending">Invoice pending</option>
            <option value="paid">Paid</option>
            <option value="scholarship_pending_verification">Scholarship review</option>
          </select>
        ) : (
          <select
            value={teacherFilter}
            onChange={(e) => setTeacherFilter(e.target.value as TeacherFilter)}
            className="w-48 px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white"
          >
            <option value="pending">Pending review</option>
            <option value="all">All statuses</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        )}
      </div>

      {/* Tables */}
      {loading ? (
        <div className="bg-white rounded-3xl p-10 border border-emerald-950/10 flex items-center justify-center text-neutral-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading registrations...
        </div>
      ) : tab === 'learners' ? (
        <div className="bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider">
                <th className="pb-3 pr-4">Learner</th>
                <th className="pb-3 pr-4">Guardian</th>
                <th className="pb-3 pr-4">Previous school</th>
                <th className="pb-3 pr-4">Documents</th>
                <th className="pb-3 pr-4">Payment</th>
                <th className="pb-3 pr-4">Registered</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredLearners.map((r) => {
                const missing = learnerMissing(r);
                const docCount = r.academicDocuments.length + r.paymentDocuments.length;
                return (
                  <tr key={r.id} className="hover:bg-neutral-50/80 transition align-top">
                    <td className="py-3 pr-4">
                      <p className="font-bold text-neutral-900">{r.name || '(no name)'}</p>
                      <p className="font-mono text-[11px] text-neutral-500">{r.email}</p>
                      {r.isMinor && (
                        <span className="inline-block mt-1 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">Minor</span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-neutral-800">{r.guardianName || '—'}</p>
                      <p className="font-mono text-[11px] text-neutral-500">{r.guardianContact}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-neutral-800">{r.previousSchool || '—'}</p>
                      <p className="text-[10px] text-neutral-500">{r.lastGrade}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <button
                        onClick={() => setDocModal({ title: `Documents - ${r.name}`, sections: learnerDocSections(r) })}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-neutral-200 hover:border-emerald-700 hover:text-emerald-800 transition text-neutral-700"
                        title="View documents"
                      >
                        <FileText className="w-3 h-3" /> {docCount}
                        {missing.length === 0
                          ? <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          : <AlertTriangle className="w-3 h-3 text-amber-600" />}
                      </button>
                      {missing.length > 0 && (
                        <p className="text-[9px] text-rose-700 mt-1 max-w-[140px]">Missing: {missing.join(', ')}</p>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold whitespace-nowrap ${PAYMENT_STYLE[r.paymentStatus] || 'bg-neutral-100 text-neutral-700 border-neutral-200'}`}>
                        {r.paymentStatus === 'paid' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {PAYMENT_LABEL[r.paymentStatus] || r.paymentStatus || 'Unknown'}
                      </span>
                      {r.payerName && <p className="text-[10px] text-neutral-500 mt-1">{r.payerName}</p>}
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap text-neutral-600">{fmtDate(r.createdAt)}</td>
                    <td className="py-3 text-right">
                      {r.paymentStatus === 'invoice_pending' && (
                        <button
                          onClick={() => sendPaymentReminder(r)}
                          disabled={reminding === r.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 disabled:opacity-60 text-emerald-950 text-[10px] font-black uppercase tracking-wide transition whitespace-nowrap"
                          title="Send payment reminder email"
                        >
                          {reminding === r.id
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <BellRing className="w-3 h-3" />}
                          Remind
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredLearners.length === 0 && (
                <tr><td colSpan={7} className="py-10 text-center text-neutral-500">No learners match this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider">
                <th className="pb-3 pr-4">Applicant</th>
                <th className="pb-3 pr-4">Qualification</th>
                <th className="pb-3 pr-4">Background</th>
                <th className="pb-3 pr-4">Documents</th>
                <th className="pb-3 pr-4">Submitted</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 text-right">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredTeachers.map((t) => {
                const missing = teacherMissing(t);
                return (
                  <tr key={t.id} className="hover:bg-neutral-50/80 transition align-top">
                    <td className="py-3 pr-4">
                      <p className="font-bold text-neutral-900">{t.name || '(no name)'}</p>
                      <p className="font-mono text-[11px] text-neutral-500">{t.email}</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">{t.yearsExperience ? `${t.yearsExperience} yrs experience` : ''}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-neutral-800">{t.highestDegree || '—'}{t.degreeField ? ` · ${t.degreeField}` : ''}</p>
                      <p className="text-[10px] text-neutral-500">{t.teachingCertificate}{t.teachingPhase ? ` · ${t.teachingPhase}` : ''}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${t.backgroundCheckStatus === 'clear' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-amber-50 text-amber-900 border-amber-300'}`}>
                        {t.backgroundCheckStatus === 'clear' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {t.backgroundCheckStatus || 'clearance_pending'}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <button
                        onClick={() => setDocModal({ title: `Documents - ${t.name}`, sections: teacherDocSections(t) })}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-neutral-200 hover:border-emerald-700 hover:text-emerald-800 transition text-neutral-700"
                        title="View documents"
                      >
                        <FileText className="w-3 h-3" /> {t.documentsReceived}/{t.documentsRequired}
                        {missing.length === 0
                          ? <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          : <AlertTriangle className="w-3 h-3 text-amber-600" />}
                      </button>
                      {missing.length > 0 && (
                        <p className="text-[9px] text-rose-700 mt-1 max-w-[160px]">Missing: {missing.join(', ')}</p>
                      )}
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap text-neutral-600">{fmtDate(t.submittedAt)}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${TEACHER_STYLE[t.status] || TEACHER_STYLE.pending}`}>
                        {t.status || 'pending'}
                      </span>
                    </td>
                    <td className="py-3 text-right whitespace-nowrap">
                      {(t.status || 'pending') === 'pending' ? (
                        <div className="inline-flex gap-1.5">
                          <button
                            onClick={() => review(t, 'approved')}
                            disabled={reviewing === t.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 disabled:opacity-60 text-yellow-300 text-[10px] font-black uppercase transition"
                          >
                            {reviewing === t.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                            Approve
                          </button>
                          <button
                            onClick={() => review(t, 'rejected')}
                            disabled={reviewing === t.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-rose-50 disabled:opacity-60 border border-rose-200 text-rose-800 text-[10px] font-black uppercase transition"
                          >
                            <XCircle className="w-3 h-3" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-neutral-400 font-bold uppercase">Reviewed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredTeachers.length === 0 && (
                <tr><td colSpan={7} className="py-10 text-center text-neutral-500">No teachers match this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Documents modal */}
      {docModal && (
        <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 shadow-2xl border border-emerald-950/10">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 sticky top-0 bg-white">
              <h3 className="text-base font-black text-neutral-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-800" /> {docModal.title}
              </h3>
              <button onClick={() => setDocModal(null)} className="text-neutral-400 hover:text-neutral-700" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[10px] text-neutral-500 mt-2 flex items-center gap-1">
              <Shield className="w-3 h-3" /> Staff only. Documents open via the applicant-provided link; Storage rules additionally allow admin read.
            </p>
            <div className="mt-3 space-y-4">
              {docModal.sections.map((section) => (
                <div key={section.title}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center justify-between">
                    {section.title}
                    <span className={section.docs.length > 0 ? 'text-emerald-700' : 'text-rose-700'}>
                      {section.docs.length > 0 ? `${section.docs.length} received` : 'pending'}
                    </span>
                  </p>
                  {section.docs.length === 0 ? (
                    <p className="text-xs text-neutral-400 mt-1 italic">Nothing uploaded yet.</p>
                  ) : (
                    <ul className="mt-1 divide-y divide-neutral-100">
                      {section.docs.map((doc, i) => (
                        <li key={`${section.title}-${i}`} className="py-2 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-neutral-800 truncate" title={doc.name}>{doc.name}</p>
                            <p className="text-[9px] font-mono text-neutral-500">{fmtSize(doc.size)}{doc.type ? ` · ${doc.type.split('/').pop()}` : ''}</p>
                          </div>
                          {doc.downloadURL ? (
                            <a
                              href={doc.downloadURL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-[10px] font-bold transition"
                            >
                              <ExternalLink className="w-3 h-3" /> Open
                            </a>
                          ) : (
                            <span className="shrink-0 text-[9px] text-rose-700 font-bold">No link</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-neutral-100 mt-4">
              <button
                onClick={() => setDocModal(null)}
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
