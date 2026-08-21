import React from 'react';
import { Bell, Flame, CheckCircle2, AlertTriangle, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../lib/authContext';

interface ToastBannerProps {
  onNavigate?: (route: string) => void;
}

export const ToastBanner: React.FC<ToastBannerProps> = ({ onNavigate }) => {
  const { latestToast, dismissToast } = useAuth();

  if (!latestToast) return null;

  const getIcon = () => {
    switch (latestToast.category) {
      case 'streak':
        return <Flame className="w-4 h-4 text-achievement-gold" />;
      case 'grading':
        return <CheckCircle2 className="w-4 h-4 text-academic-green" />;
      case 'urgent':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      default:
        return <Bell className="w-4 h-4 text-achievement-gold" />;
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-white rounded-none p-4 border border-deep-onyx shadow-none animate-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-[#FAF9F5] border border-neutral-300 flex-shrink-0 rounded-none">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase tracking-widest text-deep-onyx bg-neutral-100 px-1.5 py-0.2 border border-neutral-200 rounded-none">
              ALERT // {latestToast.category}
            </span>
            <button
              onClick={dismissToast}
              className="text-neutral-400 hover:text-deep-onyx transition cursor-pointer"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <h4 className="text-xs font-serif font-bold text-deep-onyx mt-1 truncate">
            {latestToast.title}
          </h4>
          <p className="text-xs font-sans text-neutral-600 mt-0.5 line-clamp-2 leading-relaxed">
            {latestToast.message}
          </p>

          {latestToast.actionUrl && onNavigate && (
            <button
              onClick={() => {
                onNavigate(latestToast.actionUrl!);
                dismissToast();
              }}
              className="mt-2 inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-academic-green hover:underline cursor-pointer"
            >
              <span>Inspect Record</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
