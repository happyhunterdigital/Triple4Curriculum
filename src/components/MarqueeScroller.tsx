import React from 'react';

// PDF credibility strip — no fake logos (replaces prior svgl.app placeholders)
const STRIP = 'SACCAI-track  ·  CAPS + International  ·  Grade R–12  ·  Live classes  ·  16 per class  ·  ZA  ·  UK  ·  Global  ·  Preserving Fresh Minds Globally  ·';

export const MarqueeScroller: React.FC = () => {
  const doubled = `${STRIP} ${STRIP}`;
  return (
    <div className="w-full overflow-hidden relative py-2 sm:py-3 border-y border-black/10 bg-white">
      <style>{`
        .animate-marquee { display: flex; width: max-content; animation: marquee 28s linear infinite; }
        .animate-marquee:hover { animation-play-state: paused; }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>
      <div className="animate-marquee gap-6">
        <span className="whitespace-nowrap text-xs font-mono uppercase tracking-widest text-neutral-700 px-4">{doubled}</span>
        <span className="whitespace-nowrap text-xs font-mono uppercase tracking-widest text-neutral-700 px-4" aria-hidden>{doubled}</span>
      </div>
    </div>
  );
};
