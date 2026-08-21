import React from 'react';

export const Hero: React.FC = () => {
  return (
    <section className="w-full bg-[var(--color-prestige-canvas)] border-b border-[var(--color-prestige-line)]">
      {/* 21:9 Widescreen Cinematic Media Vault */}
      <div className="w-full aspect-[21/9] bg-[var(--color-prestige-dark)] relative overflow-hidden border-b border-[var(--color-prestige-line)]">
        <video 
          className="w-full h-full object-cover filtering-none grayscale-[20%] contrast-[105%]"
          src="/hero-cinematic.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
        {/* Architectural Grid Overlay Line */}
        <div className="absolute inset-0 border-l border-r border-[var(--color-prestige-line-dark)] max-w-7xl mx-auto pointer-events-none" />
      </div>

      {/* Asymmetric Typography Framing Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-0">
        <div className="col-span-12 md:col-span-8 pt-16 pb-24 px-6 md:px-12 border-r border-[var(--color-prestige-line)]">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500 mb-6">
            Institutional Ledger // Vol. 04
          </p>
          <h1 className="font-serif text-5xl md:text-7xl font-normal leading-[1.1] tracking-tight text-[var(--color-prestige-dark)] max-w-3xl">
            Rigorous educational architecture built for deep intellectual autonomy.
          </h1>
        </div>
        <div className="hidden md:block col-span-4 bg-neutral-50/50 p-12 self-end">
          <p className="font-mono text-[11px] leading-relaxed text-neutral-400 uppercase">
            [ Coordinates ]<br />
            51.5074° N, 0.1278° W<br />
            Production Environment Active
          </p>
        </div>
      </div>
    </section>
  );
};
