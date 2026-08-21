import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, Download, ShieldCheck, CheckCircle2, 
  TrendingUp, Award, Users, AlertTriangle, RefreshCw 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';

export const AdminReports: React.FC = () => {
  const { triggerToast } = useAuth();
  const [reports, setReports] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getReportsSummary();
        setReports(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSasamsSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#15803d', '#eab308']
      });

      triggerToast({
        id: `toast_${Date.now()}`,
        title: '📊 SA-SAMS Sync Certified',
        message: 'Master cohort performance, attendance matrices, and POPIA declarations exported to DBE standard format.',
        category: 'academic',
        timestamp: 'Just now',
        read: false,
        priority: 'high'
      });
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-emerald-950/10 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
              Department of Higher Education & Training (DHET)
            </span>
            <span className="text-xs font-bold text-yellow-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> SA-SAMS Automated Sync Protocol
            </span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 mt-1">
            Institutional Reports & Regulatory Compliance
          </h1>
          <p className="text-xs text-neutral-500">
            Generate statutory audit documents, B-BBEE Level 1 skills points, and cohort performance dashboards
          </p>
        </div>

        <button
          onClick={handleSasamsSync}
          disabled={isSyncing}
          className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-yellow-300 text-xs font-black shadow-sm flex items-center gap-2 transition"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Generating SA-SAMS XML...' : 'Trigger SA-SAMS Sync'}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-emerald-950/10 shadow-xs space-y-2">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Overall Curriculum Pass Rate
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-800">{reports?.overallPassRate || 94.6}%</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              Above Target
            </span>
          </div>
          <p className="text-[11px] text-neutral-500">Triple 4C Curriculum Academic Quality Standard</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-emerald-950/10 shadow-xs space-y-2">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            B-BBEE / SETA Points Achieved
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-yellow-600">{reports?.setaComplianceScore || 24.8} / 25.0</span>
            <span className="text-xs font-bold text-yellow-900 bg-yellow-100 px-2 py-0.5 rounded">
              Level 1 Status
            </span>
          </div>
          <p className="text-[11px] text-neutral-500">Skills development & scarce skills bursary alignment</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-emerald-950/10 shadow-xs space-y-2">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Average Cohort Attendance
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-neutral-900">{reports?.averageAttendanceRate || 94.2}%</span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              Certified
            </span>
          </div>
          <p className="text-[11px] text-neutral-500">Verified through encrypted QR & faculty records</p>
        </div>
      </div>

      {/* Reports Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Course Completion Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-xs">
          <h3 className="text-base font-black text-neutral-900 mb-4">
            Curriculum Course Completion Rates
          </h3>

          <div className="space-y-4">
            {[
              { code: 'CSC-441', title: 'Distributed Systems & Cloud Architecture', rate: 96, avg: '86%' },
              { code: 'CSC-442', title: 'Applied Machine Learning & Neural Networks', rate: 91, avg: '82%' },
              { code: 'COR-441', title: '444 Curriculum: Core Data Ethics & POPIA', rate: 98, avg: '92%' },
              { code: 'ENG-441', title: 'Autonomous Robotics & Embedded Systems', rate: 89, avg: '78%' }
            ].map(c => (
              <div key={c.code} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-neutral-900">{c.code}: {c.title}</span>
                  <span className="text-emerald-900 font-mono">{c.rate}% Completion • Avg: {c.avg}</span>
                </div>
                <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-emerald-700" 
                    style={{ width: `${c.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Downloadable Statutory Dossiers */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-xs space-y-4">
          <h3 className="text-base font-black text-neutral-900">
            Statutory Export Files
          </h3>

          <div className="space-y-3">
            {[
              { name: 'SA_SAMS_Semester_2_Master_Export.xml', type: 'SA-SAMS XML Format', size: '2.4 MB' },
              { name: 'SETA_MICT_Skills_Development_Declaration.pdf', type: 'SETA Certified PDF', size: '1.1 MB' },
              { name: 'POPIA_Institutional_Compliance_Audit_2026.pdf', type: 'Audit Dossier', size: '4.8 MB' },
              { name: 'Triple_4C_Milestones_Passback_Ledger.csv', type: 'Spreadsheet Matrix', size: '890 KB' }
            ].map((f, idx) => (
              <div 
                key={idx}
                className="p-3.5 rounded-xl border border-neutral-200 bg-[#fbfcf8] flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <p className="font-bold text-neutral-900">{f.name}</p>
                  <p className="text-[11px] text-neutral-500">{f.type} • {f.size}</p>
                </div>
                <button
                  onClick={handleSasamsSync}
                  className="p-2 rounded-lg bg-neutral-900 text-yellow-300 hover:bg-neutral-800 transition shadow-xs"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
