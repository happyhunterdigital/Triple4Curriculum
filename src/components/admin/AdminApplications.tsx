import React, { useState, useEffect } from 'react';
import { FileText, Loader2, Search, TrendingUp, AlertCircle, Download } from 'lucide-react';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';
import { AssignmentSubmission } from '../../types';

export const AdminApplications: React.FC = () => {
  const { triggerToast } = useAuth();
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'graded'>('all');

  useEffect(() => {
    async function load() {
      try {
        const page = await api.getSubmissionsPaged(undefined, 100);
        setSubmissions(page.items || []);
      } catch (e) {
        console.error(e);
        triggerToast({
          id: `toast_${Date.now()}`,
          title: '⚠️ Load Error',
          message: 'Failed to load learner applications. Check console for details.',
          category: 'error',
          timestamp: 'Just now',
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredSubmissions = submissions.filter((s) => {
    const matchesSearch =
      s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.assignmentTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'submitted' && s.status === 'submitted') ||
      (statusFilter === 'graded' && s.status === 'graded');
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-emerald-950/10 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
              Learner Applications
            </span>
            <span className="text-xs font-semibold text-neutral-500">
              View and manage assignment submissions from all learners
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Track submission status, grades, and feedback for the full cohort.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Search className="w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by student name, email, or assignment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-neutral-300 bg-[#fbfcf8] focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="ml-2 w-32 sm:w-48 px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white"
          >
            <option value="all">All Applications</option>
            <option value="submitted">Pending Review ({filteredSubmissions.filter((s) => s.status === 'submitted').length})</option>
            <option value="graded">Graded ({filteredSubmissions.filter((s) => s.status === 'graded').length})</option>
          </select>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-xs space-y-4">
        {loading ? (
          <div className="h-64 flex items-center justify-center text-neutral-500">
            <Loader2 className="w-6 h-6" /> Loading submissions...
          </div>
        : submissions.length === 0
          ? (
              <div className="p-8 text-center text-neutral-600">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No learner applications found.</p>
                <p className="text-xs mt-2">Applications appear here after students submit assignments.</p>
              </div>
            )
          : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider">
                      <th className="pb-3">Student</th>
                      <th className="pb-3">Email</th>
                      <th className="pb-3">Assignment</th>
                      <th className="pb-3">Submitted</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredSubmissions.map((sub) => (
                      <tr
                        key={sub.id}
                        className="hover:bg-neutral-50/80 transition"
                        style={{ backgroundColor: sub.status === 'graded' ? '#e8f5e9' : '#fffbea' }}
                      >
                        <td className="py-3 font-medium text-neutral-900">
                          {sub.studentName}
                        </td>
                        <td className="py-3 font-mono text-neutral-600">
                          {sub.studentEmail}
                        </td>
                        <td className="py-3 text-neutral-700">
                          {sub.assignmentTitle}
                        </td>
                        <td className="py-3 font-small text-neutral-500">
                          {new Date(sub.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold ${
                              sub.status === 'submitted'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : 'bg-rose-100 text-rose-900 border border-rose-200'
                            }`}
                          >
                            {sub.status === 'submitted' ? 'Submitted' : 'Graded'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          {sub.grade !== undefined
                            ? `${sub.grade}/${sub.maxGrade}`
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
      </div>

      {/* Action summary */}
      {!loading && (
        <div className="bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Total</p>
              <p className="text-3xl font-black text-neutral-900">{submissions.length}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Submitted</p>
              <p className="text-3xl font-black text-emerald-800">{submissions.filter((s) => s.status === 'submitted').length}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Graded</p>
              <p className="text-3xl font-black text-rose-800">{submissions.filter((s) => s.status === 'graded').length}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Avg Grade</p>
              <p className="text-3xl font-black text-emerald-800">
                {(
                  submissions
                    .filter((s) => s.grade !== undefined && s.status === 'graded')
                    .reduce((acc, s) => acc + (s.grade || 0), 0) /
                  Math.max(submissions.filter((s) => s.status === 'graded').length, 1)
                ).toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};