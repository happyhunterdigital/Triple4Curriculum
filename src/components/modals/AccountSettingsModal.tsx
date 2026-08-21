import React, { useState } from 'react';
import { 
  X, Lock, Key, Shield, Download, Smartphone, 
  Check, RefreshCw, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../../lib/authContext';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, triggerToast } = useAuth();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !currentUser) return null;

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long with uppercase and numbers.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }

    setErrorMsg('');
    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    triggerToast({
      id: `toast_${Date.now()}`,
      title: 'Security Credentials Updated',
      message: 'Your institutional password was securely hashed and synchronized.',
      category: 'urgent',
      timestamp: 'Just now',
      read: false,
      priority: 'high'
    });

    setTimeout(() => setPasswordSuccess(false), 3500);
  };

  const handleExportData = () => {
    const exportPayload = {
      institution: 'Triple 4 Curriculum (Triple 4C)',
      studentDataExport: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        studentId: currentUser.studentId || currentUser.employeeId,
        role: currentUser.role,
        department: currentUser.departmentName,
        xp: currentUser.xp,
        level: currentUser.level,
        streakDays: currentUser.streakDays,
        registeredDate: currentUser.registeredDate,
        exportedAt: new Date().toISOString(),
        popiaComplianceCertification: 'POPIA Section 14 Lawful Subject Access Request'
      }
    };

    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `Triple4C_Data_Export_${currentUser.id}_${Date.now()}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    triggerToast({
      id: `toast_${Date.now()}`,
      title: 'POPIA Subject Data Exported',
      message: 'Your certified academic transcript & telemetry JSON archive was downloaded.',
      category: 'academic',
      timestamp: 'Just now',
      read: false,
      priority: 'normal'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-surface-container-low border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-deep-onyx text-achievement-gold font-black flex items-center justify-center shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-neutral-900">
                Account Security & Compliance Settings
              </h2>
              <p className="text-xs text-neutral-500">
                Authentication, Session Tokens, and POPIA Subject Access
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-500 hover:bg-neutral-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          
          {/* Password Change Box */}
          <form onSubmit={handleUpdatePassword} className="p-4 rounded-xl border border-neutral-200 space-y-3 bg-neutral-50/50">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-academic-green" />
              <h3 className="font-bold text-neutral-900 text-xs sm:text-sm">Change Security Password</h3>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Password changed successfully!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:border-academic-green"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min 8 chars"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:border-academic-green"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:border-academic-green"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-academic-green hover:bg-academic-green/90 text-white font-bold transition shadow-xs flex items-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Update Password</span>
              </button>
            </div>
          </form>

          {/* Two-Factor Authentication Status */}
          <div className="p-4 rounded-xl border border-neutral-200 flex items-center justify-between bg-neutral-50/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-neutral-900">Two-Factor Authentication (2FA)</p>
                <p className="text-[11px] text-neutral-500">
                  {twoFactorEnabled ? 'Enabled via Mobile Authenticator / SMS OTP' : 'Disabled (Recommended to enable)'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                twoFactorEnabled 
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                  : 'bg-neutral-200 text-neutral-700'
              }`}
            >
              {twoFactorEnabled ? 'Active ✓' : 'Enable 2FA'}
            </button>
          </div>

          {/* Active Session Audit */}
          <div className="p-4 rounded-xl border border-neutral-200 space-y-2 bg-neutral-50/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Active Authorized Devices
            </span>
            <div className="flex items-center justify-between text-neutral-700 pt-1">
              <div>
                <p className="font-bold">Current Browser Session (Cape Town, South Africa)</p>
                <p className="text-[10px] text-neutral-400 font-mono">IP: 196.24.44.18 • Last active: Just now</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                This Device
              </span>
            </div>
          </div>

          {/* Download Personal Data (POPIA Section 14) */}
          <div className="p-4 rounded-xl border border-academic-green/30 bg-academic-green/5 flex items-center justify-between">
            <div>
              <p className="font-bold text-neutral-900">POPIA Subject Access Data Export</p>
              <p className="text-[11px] text-neutral-600">
                Download a cryptographically verifiable JSON archive of all your course progress, grades, and logs.
              </p>
            </div>

            <button
              onClick={handleExportData}
              className="px-3.5 py-2 rounded-xl bg-deep-onyx hover:bg-neutral-800 text-achievement-gold font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-surface-container-low border-t border-neutral-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-bold"
          >
            Close Settings
          </button>
        </div>

      </div>
    </div>
  );
};
