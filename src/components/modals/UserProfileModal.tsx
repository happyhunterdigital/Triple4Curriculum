import React, { useState } from 'react';
import { 
  X, User, Mail, Shield, Building2, Phone, 
  Sparkles, CheckCircle2, Award, BookOpen, Save, ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../../lib/authContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, refreshCurrentUser, triggerToast } = useAuth();

  const [name, setName] = useState(currentUser?.name || '');
  const [email] = useState(currentUser?.email || '');
  const [bio, setBio] = useState('Passionate about distributed AI systems, neural reasoning, and ethical computing under the Triple 4 Curriculum.');
  const [phone, setPhone] = useState('+27 82 444 8920');
  const [learningGoal, setLearningGoal] = useState('Achieve High Distinction in Distributed Consensus & AI Ethics');
  const [popiaConsent, setPopiaConsent] = useState(true);
  const [shareWithAdvisor, setShareWithAdvisor] = useState(true);
  const [saving, setSaving] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Simulate save and toast
      await new Promise(r => setTimeout(r, 400));
      triggerToast({
        id: `toast_${Date.now()}`,
        title: 'Profile Updated',
        message: 'Your academic profile and POPIA preferences were securely saved.',
        category: 'academic',
        timestamp: 'Just now',
        read: false,
        priority: 'normal'
      });
      onClose();
    } finally {
      setSaving(false);
    }
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
            <div className="w-10 h-10 rounded-xl bg-academic-green text-achievement-gold font-black flex items-center justify-center text-base shadow-xs">
              {name.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-base font-black text-neutral-900">
                Academic Profile Management
              </h2>
              <p className="text-xs text-neutral-500">
                {currentUser.studentId || currentUser.employeeId || 'ID: 444-STU-8821'} • {currentUser.role.toUpperCase()}
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
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          
          {/* Persona Overview Banner */}
          <div className="p-4 rounded-xl bg-academic-green/5 border border-academic-green/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-academic-green">
                Department Affiliation
              </span>
              <p className="text-sm font-bold text-neutral-900 mt-0.5">
                {currentUser.departmentName || 'Department of Computing & Applied AI'}
              </p>
              <p className="text-[11px] text-neutral-500">
                Academic Senate Registered • Level {currentUser.level || 6} ({currentUser.xp || 2450} XP)
              </p>
            </div>

            <div className="text-right">
              <span className="px-2 py-1 rounded-md bg-achievement-gold/30 text-deep-onyx font-bold text-[11px] border border-achievement-gold/60">
                {currentUser.streakDays || 6}-Day Active Streak 🔥
              </span>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:border-academic-green font-medium"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Institutional Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-neutral-100 text-neutral-500 font-mono"
              />
              <span className="text-[10px] text-neutral-400">Locked by Institutional Registrar</span>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Contact Phone (Emergency & OTP)</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:border-academic-green"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Primary Academic Goal</label>
              <input
                type="text"
                value={learningGoal}
                onChange={e => setLearningGoal(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:border-academic-green"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-neutral-700 mb-1">Academic Bio & Research Interests</label>
            <textarea
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:border-academic-green leading-relaxed"
              placeholder="Tell your lecturers and peers about your projects and interests..."
            />
          </div>

          {/* POPIA & Privacy Consent Controls */}
          <div className="p-4 rounded-xl border border-neutral-200 space-y-3 bg-neutral-50/70">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-academic-green" />
              <span className="font-bold text-neutral-900">POPIA Act Data Governance Preferences</span>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={popiaConsent}
                onChange={e => setPopiaConsent(e.target.checked)}
                className="mt-0.5 rounded text-academic-green focus:ring-academic-green"
              />
              <div>
                <p className="font-bold text-neutral-800">Consent for Automated Progress Telemetry</p>
                <p className="text-[11px] text-neutral-500">Allows faculty advisors to monitor quiz completion and lecture engagement for academic support.</p>
              </div>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={shareWithAdvisor}
                onChange={e => setShareWithAdvisor(e.target.checked)}
                className="mt-0.5 rounded text-academic-green focus:ring-academic-green"
              />
              <div>
                <p className="font-bold text-neutral-800">Share SpeedGrader™ Rubric Insights with Assigned Tutor</p>
                <p className="text-[11px] text-neutral-500">Enables your academic tutor to review detailed feedback logs to prepare custom review sessions.</p>
              </div>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-700 font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-academic-green hover:bg-academic-green/90 text-white font-bold flex items-center gap-2 transition shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
