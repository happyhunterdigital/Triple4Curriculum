import React from 'react';

interface LogoItem {
  name: string;
  url: string;
  gradient: string;
}

const BRAND_PARTNERS: LogoItem[] = [
  { name: "Procure", url: "https://svgl.app", gradient: "from-emerald-900 to-green-700" },
  { name: "Shopify", url: "https://svgl.app", gradient: "from-amber-600 to-yellow-500" },
  { name: "Blender", url: "https://svgl.app", gradient: "from-emerald-800 to-emerald-600" },
  { name: "Figma", url: "https://svgl.app", gradient: "from-neutral-900 to-neutral-700" },
  { name: "Spotify", url: "https://svgl.app", gradient: "from-green-900 to-emerald-800" },
  { name: "Lottielab", url: "https://svgl.app", gradient: "from-yellow-600 to-green-700" },
  { name: "Google Cloud", url: "https://svgl.app", gradient: "from-teal-900 to-emerald-700" },
  { name: "Bing", url: "https://svgl.app", gradient: "from-emerald-950 to-amber-700" }
];

export const MarqueeScroller: React.FC = () => {
  const doubleList = [...BRAND_PARTNERS, ...BRAND_PARTNERS];
  return (
    <div className="w-full overflow-hidden relative py-4 mask-gradient my-2 sm:my-6">
      <style>{`
        .animate-marquee { display: flex; width: max-content; animation: marquee 30s linear infinite; }
        .animate-marquee:hover { animation-play-state: paused; }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .mask-gradient { mask-image: linear-gradient(to right, transparent, white 15%, white 85%, transparent); -webkit-mask-image: linear-gradient(to right, transparent, white 15%, white 85%, transparent); }
      `}</style>
      <div className="animate-marquee gap-4 sm:gap-6">
        {doubleList.map((logo, index) => (
          <div
            key={index}
            className="group relative h-16 w-32 sm:h-24 sm:w-40 shrink-0 flex items-center justify-center rounded-full bg-white border border-neutral-200/60 shadow-xs hover:border-[var(--color-t4c-yellow)] transition-all overflow-hidden cursor-pointer"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${logo.gradient} scale-150 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 ease-out z-0`} />
            <img src={logo.url} alt={logo.name} className="h-6 sm:h-7 max-w-[80px] sm:max-w-[100px] object-contain relative z-10 transition-all duration-300 group-hover:brightness-0 group-hover:invert" />
          </div>
        ))}
      </div>
    </div>
  );
};
