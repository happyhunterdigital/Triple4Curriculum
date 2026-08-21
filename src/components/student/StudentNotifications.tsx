import React, { useState, useEffect } from 'react';
import { Bell, Flame, CheckCircle2, AlertTriangle, Shield, Check, Filter } from 'lucide-react';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';
import { PushNotification } from '../../types';

export const StudentNotifications: React.FC = () => {
  const { setUnreadCount } = useAuth();
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const list = await api.getNotifications();
        setNotifications(list);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = filterCategory === 'all' 
    ? notifications 
    : notifications.filter(n => n.category === filterCategory);

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'streak':
        return <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">🔥 STREAK</span>;
      case 'grading':
        return <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px]">SPEEDGRADER</span>;
      case 'urgent':
        return <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-900 font-bold text-[10px]">URGENT</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-900 font-bold text-[10px]">ANNOUNCEMENT</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-emerald-950/10 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-yellow-100 text-yellow-900 border border-yellow-300">
              Integrated Push Notification Service
            </span>
            <span className="text-xs font-semibold text-neutral-500">
              Real-Time Academic & Campus Alerts
            </span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 mt-1">
            Push Notifications & Alerts Center
          </h1>
          <p className="text-xs text-neutral-500">
            Instant updates on grade releases, schedule shifts, and daily learning milestones
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
          {['all', 'streak', 'grading', 'announcement'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition capitalize ${
                filterCategory === cat ? 'bg-emerald-800 text-yellow-300 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.map(notif => (
          <div 
            key={notif.id}
            className={`p-5 rounded-2xl border transition flex items-start justify-between gap-4 ${
              !notif.read 
                ? 'bg-white border-yellow-400 shadow-sm ring-1 ring-yellow-300' 
                : 'bg-white/80 border-neutral-200 opacity-90'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-yellow-50 border border-yellow-200 flex-shrink-0 mt-0.5">
                <Bell className="w-5 h-5 text-yellow-700" />
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getCategoryBadge(notif.category)}
                  <span className="text-[11px] text-neutral-400 font-mono">
                    {notif.timestamp}
                  </span>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-ping" />
                  )}
                </div>

                <h3 className="text-sm font-black text-neutral-900">
                  {notif.title}
                </h3>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed max-w-2xl">
                  {notif.message}
                </p>
              </div>
            </div>

            {!notif.read && (
              <button
                onClick={() => handleMarkAsRead(notif.id)}
                className="px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-emerald-50 hover:text-emerald-900 text-xs font-bold text-neutral-600 transition flex items-center gap-1 flex-shrink-0"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark Read</span>
              </button>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};
