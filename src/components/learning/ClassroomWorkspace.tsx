import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface LectureAsset {
  id: string;
  chapter: string;
  title: string;
  videoSrc: string;
  transcriptMarkdown: string;
}

const LECTURE_DATA: LectureAsset = {
  id: "L-101",
  chapter: "Chapter III // Systems Genesis",
  title: "Structural Compounding and Mechanics of High-Throughput Pipelines",
  videoSrc: "https://res.cloudinary.com/dka0498ns/video/upload/v1787426745/Triple_4_Curriculum_Gold_particles_forming_medallion_wgxtl4.mp4",
  transcriptMarkdown: `
### I. Baseline Axioms of High-Throughput Delivery

When building out specialized architectural infrastructure, developers routinely fail by leaning on **generic software layers** rather than optimizing for direct memory bandwidth. System execution is bound entirely by hardware mechanics, not algorithmic abstraction.

*   **Axiom A:** Memory access speed dictates real-world responsiveness.
*   **Axiom B:** Unnecessary dependencies create systemic vulnerabilities.
*   **Axiom C:** Design density always triumphs over aesthetic decoration.

### II. Computational Compounding Metrics

To evaluate structural compression under extreme operational loads, we use a basic linear scaling calculation:

$$\\Xi = \\frac{\\Psi_{throughput} \\times \\delta_{latency}}{\\omega_{overhead}}$$

As the complexity coefficient scales upward, maintaining un-bordered layouts minimizes the processing load required by user interface engines.

### III. Required Technical Executions
1. Eliminate all standard decorative utility configurations.
2. Initialize clean, direct network interfaces manually.
3. Assert strong typing controls natively over all incoming asynchronous endpoints.
  `
};

export const ClassroomWorkspace: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.play().catch(() => {});
          } else {
            el.pause();
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <main className="w-full bg-[var(--color-canvas-soft)] text-[var(--color-t4c-black)] flex flex-col rounded overflow-hidden">
      <header className="w-full border-b border-[var(--color-t4c-black)]/10 px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <span className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-neutral-400 shrink-0">{LECTURE_DATA.id}</span>
          <span className="font-mono text-xs text-neutral-300 hidden sm:inline">|</span>
          <h2 className="font-display text-sm sm:text-base font-semibold tracking-tight truncate leading-tight">{LECTURE_DATA.title}</h2>
        </div>
        <span className="font-mono text-[9px] sm:text-[10px] text-neutral-500 uppercase tracking-widest shrink-0">
          [ Active Learning Session Node ]
        </span>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 w-full gap-0">
        <div className="bg-[var(--color-t4c-black)] relative flex flex-col justify-center items-center overflow-hidden border-b lg:border-b-0 lg:border-r border-[var(--color-t4c-black)]/10">
          <div className="w-full aspect-[16/9] relative bg-neutral-950">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              src={LECTURE_DATA.videoSrc}
              autoPlay
              muted
              loop
              controls
              playsInline
              preload="metadata"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4 pointer-events-none">
              <span className="font-mono text-[8px] sm:text-[9px] bg-black/60 text-neutral-300 px-2 py-1 tracking-widest uppercase border border-neutral-800 rounded">
                {isPlaying ? "STREAM ACTIVE // FEED_01" : "STREAM PAUSED"}
              </span>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 lg:py-10 bg-[var(--color-canvas-soft)] max-h-[60vh] lg:max-h-[520px] overflow-y-auto">
          <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
            <div className="border-b border-[var(--color-t4c-black)]/10 pb-3 sm:pb-4 mb-4 sm:mb-6">
              <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-neutral-400 mb-1">
                {LECTURE_DATA.chapter}
              </p>
              <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-medium text-[var(--color-t4c-black)] tracking-tight leading-tight">
                Analytical Documentation & Text Schema
              </h1>
            </div>
            <article className="font-sans text-[14px] sm:text-[15px] text-neutral-800 leading-relaxed space-y-4 sm:space-y-6 prose prose-neutral max-w-none prose-headings:font-display prose-headings:font-medium prose-headings:tracking-tight prose-headings:text-[var(--color-t4c-black)] prose-h3:text-lg sm:prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:text-neutral-700 prose-p:leading-relaxed prose-ul:space-y-2 prose-strong:font-semibold">
              <ReactMarkdown>{LECTURE_DATA.transcriptMarkdown}</ReactMarkdown>
            </article>
          </div>
        </div>
      </div>
    </main>
  );
};
