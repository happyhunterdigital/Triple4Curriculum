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
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <main className="w-full min-h-screen bg-[var(--color-prestige-canvas)] text-[var(--color-prestige-dark)] flex flex-col">
      <header className="w-full border-b border-[var(--color-prestige-line)] px-6 md:px-12 py-4 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center space-x-6">
          <span className="font-mono text-xs uppercase tracking-wider text-neutral-400">{LECTURE_DATA.id}</span>
          <span className="font-mono text-xs text-neutral-300">|</span>
          <h2 className="font-serif text-lg tracking-tight">{LECTURE_DATA.title}</h2>
        </div>
        <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest hidden sm:inline">
          [ Active Learning Session Node ]
        </span>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 lg:h-[calc(100vh-57px)] w-full gap-0 overflow-hidden">
        <div className="bg-[var(--color-prestige-dark)] relative flex flex-col justify-center items-center overflow-hidden border-r border-[var(--color-prestige-line)] aspect-video lg:aspect-auto">
          <div className="w-full max-w-5xl aspect-[16/9] border-t border-b lg:border border-[var(--color-prestige-line-dark)] relative bg-neutral-950">
            <video
              ref={videoRef}
              className="w-full h-full object-cover filtering-none grayscale-[10%]"
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
            <div className="absolute top-4 left-4 pointer-events-none">
              <span className="font-mono text-[9px] bg-black/60 text-neutral-400 px-2 py-1 tracking-widest uppercase border border-neutral-800">
                {isPlaying ? "STREAM ACTIVE // FEED_01" : "STREAM PAUSED"}
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto px-6 md:px-16 py-12 bg-[var(--color-prestige-canvas)] selection:bg-neutral-200">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="border-b border-[var(--color-prestige-line)] pb-4 mb-8">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-400 mb-1">
                {LECTURE_DATA.chapter}
              </p>
              <h1 className="font-serif text-3xl font-normal text-[var(--color-prestige-dark)] tracking-tight">
                Analytical Documentation & Text Schema
              </h1>
            </div>

            <article className="font-sans text-base text-neutral-800 leading-relaxed space-y-6 prose prose-neutral prose-headings:font-serif prose-headings:font-normal prose-headings:tracking-tight prose-headings:text-[var(--color-prestige-dark)] prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-neutral-700 prose-p:leading-relaxed prose-ul:list-none prose-ul:pl-0 prose-ul:space-y-2 prose-strong:font-medium prose-strong:text-black">
              <ReactMarkdown>{LECTURE_DATA.transcriptMarkdown}</ReactMarkdown>
            </article>
          </div>
        </div>
      </div>
    </main>
  );
};
