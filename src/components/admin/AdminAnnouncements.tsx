import React, { useState, useEffect } from 'react';
import { Send, Bell, Megaphone, CheckCircle2, AlertTriangle, Sparkles, Users } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';

export const AdminAnnouncements: React.FC = () => {
  const { triggerToast } = useAuth();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<'announcement' | 'urgent' | 'streak'>('announcement');
  const [priority, setPriority] = useState<'normal' | 'high'>('normal');
  const [isSending, setIsSending] = useState(false);
  const [recentBroadcasts, setRecentBroadcasts] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const notifs = await api.getNotifications();
        setRecentBroadcasts(notifs.slice(0, 5));
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSending(true);
    try {
      const newNotif = await api.sendPushNotification({
        title: title.trim(),
        message: message.trim(),
        category,
        priority
      });

      setRecentBroadcasts(prev => [newNotif, ...prev]);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#15803d', '#eab308']
      });

      triggerToast({
        id: `toast_${Date.now()}`,
        title: '📢 Push Alert Transmitted',
        message: `Dispatched to 1,205 registered student devices and portals.`,
        category: 'announcement',
        timestamp: 'Just now',
        read: false,
        priority: 'high'
      });

      setTitle('');
      setMessage('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-emerald-950/10 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-yellow-100 text-yellow-900 border border-yellow-300">
              Admin Operations & Push Dispatch
            </span>
            <span className="text-xs font-semibold text-neutral-500">
              Instant Broadcast Channel
            </span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 mt-1">
            Admin Operation Content & Student Broadcasts
          </h1>
          <p className="text-xs text-neutral-500">
            Publish institutional memos, critical schedule updates, and push notifications to all enrolled scholars
          </p>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Broadcast Form */}
        <form onSubmit={handleBroadcast} className="bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <Megaphone className="w-5 h-5 text-emerald-800" />
            <h3 className="text-base font-black text-neutral-900">
              Compose Push Broadcast
            </h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Broadcast Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mandatory 444 Curriculum Capstone Briefing"
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-[#fbfcf8] focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white"
              >
                <option value="announcement">General Announcement</option>
                <option value="urgent">Urgent Alert</option>
                <option value="streak">Streak & Milestone Motivation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white"
              >
                <option value="normal">Standard Priority</option>
                <option value="high">High (Instant Banner & Haptic)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Broadcast Body
            </label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write the full institutional directive, room allocations, or academic instructions..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-[#fbfcf8] focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-yellow-300 font-black text-xs shadow-md flex items-center justify-center gap-2 transition"
            >
              <Send className="w-4 h-4" />
              <span>{isSending ? 'Transmitting Push...' : 'Broadcast to All Active Students'}</span>
            </button>
          </div>
        </form>

        {/* Right: Broadcast Stream Log */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h3 className="text-base font-black text-neutral-900">
              Live Broadcast Dispatch History
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
              Active Delivery
            </span>
          </div>

          <div className="space-y-3">
            {recentBroadcasts.map(b => (
              <div key={b.id} className="p-4 rounded-xl border border-neutral-200 bg-[#fbfcf8] text-xs">
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="text-neutral-900">{b.title}</span>
                  <span className="font-mono text-[10px] text-neutral-400">{b.timestamp}</span>
                </div>
                <p className="text-neutral-600 text-[11px] leading-relaxed">{b.message}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-200/60 text-[10px]">
                  <span className="font-semibold text-emerald-800 uppercase tracking-wide">{b.category}</span>
                  <span className="text-neutral-400">1,205 Delivered</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
