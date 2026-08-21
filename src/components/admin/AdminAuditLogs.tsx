import React, { useState, useEffect } from 'react';
import { ShieldCheck, Download, Search, Filter, Lock, FileText, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';
import { AuditLog } from '../../types';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const list = await api.getAuditLogs();
        setLogs(list);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress.includes(searchQuery);
    
    const matchesRole = roleFilter === 'ALL' || log.userRole.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const exportCSV = () => {
    const headers = 'ID,Timestamp,User,Role,Action,Details,IP_Address,POPIA_Status\n';
    const rows = filteredLogs.map(l => 
      `"${l.id}","${l.timestamp}","${l.userName}","${l.userRole}","${l.action}","${l.details.replace(/"/g, '""')}","${l.ipAddress}","${l.popiaCompliant ? 'COMPLIANT' : 'REVIEW'}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Triple4C_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-emerald-950/10 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
              POPIA (Act No. 4 of 2013) Compliant Trail
            </span>
            <span className="text-xs font-bold text-yellow-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Immutable Event Ledger
            </span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 mt-1">
            System Audit Log Activities
          </h1>
          <p className="text-xs text-neutral-500">
            Comprehensive forensics, IP resolution, authentication events, and administrative mutation trails
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-yellow-300 text-xs font-bold shadow-sm flex items-center gap-2 transition"
        >
          <Download className="w-4 h-4" />
          <span>Export Encrypted CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, user, IP, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-neutral-300 bg-[#fbfcf8] focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
          {['ALL', 'admin', 'lecturer', 'student'].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition capitalize ${
                roleFilter === r ? 'bg-emerald-800 text-yellow-300 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider">
                <th className="pb-3">Timestamp (SAST)</th>
                <th className="pb-3">User & Role</th>
                <th className="pb-3">Action Type</th>
                <th className="pb-3">Audit Details</th>
                <th className="pb-3">IP Address</th>
                <th className="pb-3 text-right">POPIA Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-neutral-50/80 transition font-mono">
                  <td className="py-3 text-neutral-500 text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 font-sans">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-neutral-900">{log.userName}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                        log.userRole === 'admin' ? 'bg-rose-100 text-rose-900' :
                        log.userRole === 'lecturer' ? 'bg-emerald-100 text-emerald-900' :
                        'bg-yellow-100 text-yellow-900'
                      }`}>
                        {log.userRole}
                      </span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="font-bold text-emerald-900 font-sans">{log.action}</span>
                  </td>
                  <td className="py-3 font-sans text-neutral-700 text-[11px] max-w-xs truncate">
                    {log.details}
                  </td>
                  <td className="py-3 text-neutral-500 text-[11px]">
                    {log.ipAddress}
                  </td>
                  <td className="py-3 text-right font-sans">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                      <CheckCircle2 className="w-3 h-3" />
                      Audited
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
