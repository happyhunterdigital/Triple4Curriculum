import React, { useState } from 'react';

interface LectureChapter {
  timestamp: string;
  seconds: number;
  title: string;
  summary: string;
  formalEquation?: string;
  readingCitation: string;
}

interface LectureMasterclass {
  id: string;
  reelIndex: string;
  courseCode: string;
  title: string;
  subtitle: string;
  runtime: string;
  lecturer: {
    name: string;
    title: string;
    institution: string;
    fellowship: string;
    avatarUrl: string;
  };
  synopsis: string;
  chapters: LectureChapter[];
  requiredReadings: {
    title: string;
    author: string;
    pages: string;
    journal: string;
  }[];
  seminarPrompt: string;
}

const lectureReels: LectureMasterclass[] = [
  {
    id: 'reel_01',
    reelIndex: 'REEL 01 // DISPATCH',
    courseCode: 'CSC-441',
    title: 'The Invariant Proof of Raft Leader Election in Asynchronous Networks',
    subtitle: 'State Transition Monotonicity, Randomized Quorum Timers, and Split-Brain Elimination',
    runtime: '01:24:18',
    lecturer: {
      name: 'Dr. Arthur Vance',
      title: 'Professor of Distributed Computing',
      institution: 'Trinity College // Dept. of Computer Science',
      fellowship: 'Senior Member ACM • Chair of Distributed Safety',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80'
    },
    synopsis: 'This masterclass breaks down the mathematical mechanics of consensus when nodes fail arbitrarily without Byzantine malice. Using inductive logic, Dr. Vance proves that no two leaders can be elected for the same term under a strict majority quorum constraint.',
    chapters: [
      {
        timestamp: '00:00:00',
        seconds: 0,
        title: 'I. Asynchronous Network Models & The Partition Boundary',
        summary: 'Formulating unbounded message latency and packet drop rates across wide-area backbones.',
        readingCitation: 'Ongaro & Ousterhout (2014) §3.1 – §3.4'
      },
      {
        timestamp: '00:18:40',
        seconds: 1120,
        title: 'II. The Term Invariant & RequestVote Monotonicity',
        summary: 'Deriving the term increment monotonic sequence: ∀ candidate c, currentTerm_c(t+1) > currentTerm_c(t).',
        formalEquation: 'Quorum(Q) = { v ∈ V | |v| ≥ ⌊N/2⌋ + 1 }',
        readingCitation: 'Lamport (1998) The Part-Time Parliament, pp. 133–140'
      },
      {
        timestamp: '00:44:12',
        seconds: 2652,
        title: 'III. Log Matching Property & Inductive Proof',
        summary: 'Proving that if two logs contain an entry with the same index and term, they are identical in all preceding entries.',
        formalEquation: 'log_a[i].term == log_b[i].term ⟹ ∀ k ≤ i, log_a[k] == log_b[k]',
        readingCitation: 'Cachin et al. (2011) Chapter 5: Consensus in Crash-Stop Systems'
      },
      {
        timestamp: '01:05:30',
        seconds: 3930,
        title: 'IV. Network Healing & Overwriting Uncommitted Suffixes',
        summary: 'Mechanical execution of leader log replication over conflicting follower state buffers.',
        readingCitation: 'ACM SIGOPS Operating Systems Review, Vol. 48 No. 1'
      }
    ],
    requiredReadings: [
      {
        title: 'In Search of an Understandable Consensus Algorithm',
        author: 'Diego Ongaro and John Ousterhout (Stanford University)',
        pages: 'pp. 305–320',
        journal: 'USENIX Annual Technical Conference (ATC)'
      },
      {
        title: 'Paxos Made Simple',
        author: 'Leslie Lamport',
        pages: 'pp. 51–58',
        journal: 'ACM SIGACT News (Distributed Computing Column)'
      }
    ],
    seminarPrompt: 'Construct a 3-node partition scenario where candidate B times out during leader A heartbeat transit. Derive the exact quorum response packet sequence.'
  },
  {
    id: 'reel_02',
    reelIndex: 'REEL 02 // DISPATCH',
    courseCode: 'AI-442',
    title: 'Differential Privacy Bounds & Statutory POPIA Auditing in Model Training',
    subtitle: 'Laplace Noise Injection, Privacy Loss Budgets, and Empirical Gradient Perturbation',
    runtime: '01:15:42',
    lecturer: {
      name: 'Prof. Sarah Ndlovu',
      title: 'Chair of Algorithmic Ethics & Statistical Machine Learning',
      institution: 'Faculty of Computing & Mathematical Sciences',
      fellowship: 'Fellow of the African Institute for Mathematical Sciences',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=240&q=80'
    },
    synopsis: 'Prof. Ndlovu demonstrates the mathematical rigor required to comply with South Africas POPIA Act 4 when training foundation models on public sector and student telemetry datasets, formulating tight (ε, δ)-differential privacy bounds.',
    chapters: [
      {
        timestamp: '00:00:00',
        seconds: 0,
        title: 'I. The Reconstruction Attack & Membership Inference Risks',
        summary: 'Demonstrating how high-capacity neural networks unintentionally memorize rare training outliers.',
        readingCitation: 'Dwork & Roth (2014) Foundations of DP, Chapter 2'
      },
      {
        timestamp: '00:22:15',
        seconds: 1335,
        title: 'II. The Global Sensitivity Metric of Continuous Queries',
        summary: 'Calculating L1 and L2 sensitivity bounds: Δf = max_{||x - y||_1 ≤ 1} ||f(x) - f(y)||_1.',
        formalEquation: 'Pr[M(D) ∈ S] ≤ e^ε · Pr[M(D\') ∈ S] + δ',
        readingCitation: 'Hardt & Rothblum (2010) Multiplicative Weights for Privacy'
      },
      {
        timestamp: '00:48:50',
        seconds: 2930,
        title: 'III. DP-SGD & R\u00e9nyi Differential Privacy Accounting',
        summary: 'Clipping per-sample gradient vectors and accumulating privacy loss via moment accountants.',
        formalEquation: 'g̃_t = (1/L) · (∑_{i ∈ B_t} clip_C(∇ L(θ_t, x_i)) + N(0, σ^2 C^2 I))',
        readingCitation: 'Abadi et al. (2016) Deep Learning with Differential Privacy'
      },
      {
        timestamp: '01:02:10',
        seconds: 3730,
        title: 'IV. Statutory POPIA Act 4 Compliance Certification',
        summary: 'Translating mathematical epsilon guarantees into legally binding institutional audit reports.',
        readingCitation: 'RSA Information Regulator Statutory Gazette 2024'
      }
    ],
    requiredReadings: [
      {
        title: 'The Algorithmic Foundations of Differential Privacy',
        author: 'Cynthia Dwork and Aaron Roth',
        pages: 'pp. 1–98',
        journal: 'Foundations and Trends in Theoretical Computer Science'
      },
      {
        title: 'Certified Data Auditing under African Privacy Directives',
        author: 'S. Ndlovu & K. Sithole',
        pages: 'pp. 412–430',
        journal: 'Journal of African Law & Technology'
      }
    ],
    seminarPrompt: 'Calculate the total epsilon expenditure for 200 epochs of training on a cohort of 5,000 student records under a noise multiplier σ = 1.2 and clipping norm C = 1.0.'
  },
  {
    id: 'reel_03',
    reelIndex: 'REEL 03 // DISPATCH',
    courseCode: 'SYS-443',
    title: 'Linear Types & Zero-Cost Memory Guarantees in Concurrent Kernels',
    subtitle: 'Curry-Howard Isomorphism, Affine Resource Tracking, and Safe Lock-Free Data Structures',
    runtime: '01:32:04',
    lecturer: {
      name: 'Dr. Tendai Mokoena',
      title: 'Associate Professor of Systems Programming',
      institution: 'Center for High-Performance Computing',
      fellowship: 'Core Contributor Rust Language Foundation',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80'
    },
    synopsis: 'A deep dive into type-theoretic compiler foundations. Dr. Mokoena walks through how linear and affine types turn memory deallocation and concurrency hazard checks into compile-time mathematical proofs.',
    chapters: [
      {
        timestamp: '00:00:00',
        seconds: 0,
        title: 'I. Resource Consumption Logic: Girard Linear Logic',
        summary: 'Deconstructing the structural rules of weakening and contraction in formal type systems.',
        readingCitation: 'Girard, J.-Y. (1987) Linear Logic, Theoretical Computer Science'
      },
      {
        timestamp: '00:26:30',
        seconds: 1590,
        title: 'II. Affine Ownership & Borrowing Type Semantics',
        summary: 'Formulating lifetime invariants: ∀ reference r, lifetime(r) ⊆ lifetime(owner).',
        formalEquation: 'Γ, x:A ⊢ e : B ⟹ Γ ⊢ λx.e : A ⊸ B',
        readingCitation: 'Pierce (2002) Types and Programming Languages, Ch. 15'
      },
      {
        timestamp: '00:58:10',
        seconds: 3490,
        title: 'III. Atomic Compare-And-Swap & Hazard Pointers',
        summary: 'Building lock-free stack and queue runtimes without garbage collection pauses or dangling pointers.',
        readingCitation: 'Herlihy & Shavit (2008) The Art of Multiprocessor Programming'
      }
    ],
    requiredReadings: [
      {
        title: 'Types and Programming Languages',
        author: 'Benjamin C. Pierce',
        pages: 'pp. 210–265',
        journal: 'MIT Press'
      },
      {
        title: 'Memory Safety without Garbage Collection for Real-Time Systems',
        author: 'T. Mokoena',
        pages: 'pp. 88–104',
        journal: 'IEEE Transactions on Software Engineering'
      }
    ],
    seminarPrompt: 'Write out the typing derivation tree for an affine channel transfer function that consumes ownership upon transmission.'
  }
];

export const LectureReel: React.FC = () => {
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const activeReel = lectureReels[activeReelIndex];
  const activeChapter = activeReel.chapters[activeChapterIndex] || activeReel.chapters[0];

  const handlePrevReel = () => {
    setActiveReelIndex(prev => (prev === 0 ? lectureReels.length - 1 : prev - 1));
    setActiveChapterIndex(0);
  };

  const handleNextReel = () => {
    setActiveReelIndex(prev => (prev === lectureReels.length - 1 ? 0 : prev + 1));
    setActiveChapterIndex(0);
  };

  return (
    <section id="lecture-reel" className="w-full bg-white border-t border-b border-neutral-300">
      
      {/* Studio Header & Physical Reel Ribbon */}
      <div className="px-6 sm:px-10 lg:px-14 py-6 border-b border-neutral-300 bg-[#FAF9F5] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 block mb-1">
            [ PHYSICAL MASTERCLASS REEL // STUDIO CONSOLE ]
          </span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-deep-onyx tracking-tight">
            The Masterclass Lecture Reel
          </h2>
        </div>

        {/* Physical Mechanical Reel Control Dial */}
        <div className="flex items-center gap-2 select-none">
          <button
            onClick={handlePrevReel}
            className="px-3 py-1.5 bg-white hover:bg-neutral-100 border border-neutral-300 font-mono text-xs text-deep-onyx uppercase tracking-wider cursor-pointer transition flex items-center gap-1"
          >
            <span>←</span>
            <span>PREV REEL</span>
          </button>

          <div className="px-4 py-1.5 bg-deep-onyx text-white font-mono text-xs tracking-widest uppercase border border-deep-onyx">
            <span>{activeReel.reelIndex}</span>
            <span className="text-neutral-400 ml-2">[{activeReelIndex + 1}/{lectureReels.length}]</span>
          </div>

          <button
            onClick={handleNextReel}
            className="px-3 py-1.5 bg-white hover:bg-neutral-100 border border-neutral-300 font-mono text-xs text-deep-onyx uppercase tracking-wider cursor-pointer transition flex items-center gap-1"
          >
            <span>NEXT REEL</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Main Studio Console Split: Tape Deck + Typeset Syllabus Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-neutral-300 items-stretch">
        
        {/* Left Column (Span 7): Physical Tape Scrubber & High-Definition Clip Player */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-8 bg-white">
          
          <div className="space-y-6">
            
            {/* Header Monospace Meta */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-neutral-500">
              <span className="text-deep-onyx font-bold">{activeReel.courseCode} • ADVANCED HONOURS</span>
              <span className="uppercase tracking-widest">MASTER RUNTIME: {activeReel.runtime}</span>
            </div>

            {/* Authoritative Title in Playfair Display */}
            <div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-deep-onyx tracking-tight leading-tight">
                {activeReel.title}
              </h3>
              <p className="font-sans text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
                {activeReel.subtitle}
              </p>
            </div>

            {/* Physical Scrubber Dial & Frame Indicator */}
            <div className="border border-neutral-300 bg-[#FAF9F5] p-5 space-y-4">
              
              <div className="flex items-center justify-between text-[11px] font-mono text-deep-onyx">
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 ${isPlaying ? 'bg-rose-600 animate-pulse' : 'bg-neutral-400'}`} />
                  <span className="font-bold">{activeChapter.timestamp}</span>
                  <span className="text-neutral-400">/</span>
                  <span className="text-neutral-500">{activeReel.runtime}</span>
                </span>
                <span className="uppercase tracking-wider text-neutral-500">
                  CHAPTER {activeChapterIndex + 1} OF {activeReel.chapters.length}
                </span>
              </div>

              {/* Physical Scrubber Bar with Chapter Ticks */}
              <div className="relative w-full h-8 bg-neutral-200 border border-neutral-300 flex items-center px-1 select-none">
                <div 
                  className="absolute inset-y-0 left-0 bg-deep-onyx/20 transition-all duration-300"
                  style={{ width: `${((activeChapterIndex + 1) / activeReel.chapters.length) * 100}%` }}
                />
                
                {/* Chapter Notch Divisions */}
                <div className="w-full flex items-center justify-between relative z-10">
                  {activeReel.chapters.map((chap, cIdx) => (
                    <button
                      key={cIdx}
                      onClick={() => {
                        setActiveChapterIndex(cIdx);
                        setIsPlaying(true);
                      }}
                      title={`${chap.timestamp} - ${chap.title}`}
                      className={`group relative flex flex-col items-center py-2 px-1 cursor-pointer transition`}
                    >
                      <div 
                        className={`w-1.5 h-4 transition-all ${
                          activeChapterIndex === cIdx 
                            ? 'bg-deep-onyx h-6 ring-2 ring-deep-onyx' 
                            : 'bg-neutral-400 group-hover:bg-deep-onyx'
                        }`} 
                      />
                      <span className="absolute -bottom-5 font-mono text-[9px] text-neutral-500 whitespace-nowrap hidden sm:block">
                        {chap.timestamp.slice(3)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Chapter Details */}
              <div className="pt-4 border-t border-neutral-200 space-y-2">
                <div className="flex items-baseline justify-between gap-4">
                  <h4 className="font-serif font-bold text-base text-deep-onyx">
                    {activeChapter.title}
                  </h4>
                  <span className="font-mono text-[10px] text-neutral-500 whitespace-nowrap uppercase">
                    [REF: {activeChapter.readingCitation}]
                  </span>
                </div>
                
                <p className="font-sans text-xs text-neutral-700 leading-relaxed">
                  {activeChapter.summary}
                </p>

                {activeChapter.formalEquation && (
                  <div className="p-3 bg-white border border-neutral-300 font-mono text-xs text-deep-onyx text-center overflow-x-auto">
                    <code>{activeChapter.formalEquation}</code>
                  </div>
                )}
              </div>

              {/* Physical Transport Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-neutral-200">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-4 py-2 bg-deep-onyx hover:bg-black text-white font-mono text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-2"
                  >
                    <span>{isPlaying ? 'PAUSE PLAYHEAD' : 'ENGAGE PLAYHEAD'}</span>
                    <span className="font-mono">{isPlaying ? '⏸' : '▶'}</span>
                  </button>

                  <button
                    onClick={() => setActiveChapterIndex(prev => Math.max(0, prev - 1))}
                    disabled={activeChapterIndex === 0}
                    className="px-3 py-2 bg-white hover:bg-neutral-100 border border-neutral-300 font-mono text-xs text-deep-onyx uppercase disabled:opacity-40 cursor-pointer"
                  >
                    |◀ PREV CLIP
                  </button>

                  <button
                    onClick={() => setActiveChapterIndex(prev => Math.min(activeReel.chapters.length - 1, prev + 1))}
                    disabled={activeChapterIndex === activeReel.chapters.length - 1}
                    className="px-3 py-2 bg-white hover:bg-neutral-100 border border-neutral-300 font-mono text-xs text-deep-onyx uppercase disabled:opacity-40 cursor-pointer"
                  >
                    NEXT CLIP ▶|
                  </button>
                </div>

                <span className="font-mono text-[10px] text-neutral-500 uppercase hidden md:inline">
                  PCM 24-BIT // 48KHZ STUDIO MASTER
                </span>
              </div>

            </div>

            {/* Lecture Synopsis */}
            <div className="space-y-2 border-l-2 border-deep-onyx pl-4">
              <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest block">
                LECTURE DISCOURSE SYNOPSIS
              </span>
              <p className="font-sans text-xs text-neutral-700 leading-relaxed">
                {activeReel.synopsis}
              </p>
            </div>

          </div>

          {/* Seminar Thesis Inscription */}
          <div className="pt-4 border-t border-neutral-200">
            <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-500 block mb-1">
              SEMINAR DISPUTATION PROMPT
            </span>
            <p className="font-serif italic text-xs text-deep-onyx leading-relaxed">
              "{activeReel.seminarPrompt}"
            </p>
          </div>

        </div>

        {/* Right Column (Span 5): Typeset Syllabus Layout, Primary Readings & Professor Credentials */}
        <div className="lg:col-span-5 p-6 sm:p-10 lg:p-12 bg-[#FAF9F5] flex flex-col justify-between space-y-8">
          
          <div className="space-y-8">
            
            {/* Professor Credentials Dossier */}
            <div className="border border-neutral-300 bg-white p-5 space-y-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block">
                [ FACULTY DOSSIER // CHAIR OF RECORD ]
              </span>

              <div className="flex items-start gap-4">
                <img 
                  src={activeReel.lecturer.avatarUrl} 
                  alt={activeReel.lecturer.name}
                  className="w-14 h-14 object-cover grayscale border border-neutral-300"
                  referrerPolicy="no-referrer"
                />
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-base text-deep-onyx leading-tight">
                    {activeReel.lecturer.name}
                  </h4>
                  <p className="font-sans text-xs text-neutral-700 font-medium">
                    {activeReel.lecturer.title}
                  </p>
                  <p className="font-mono text-[10px] text-neutral-500">
                    {activeReel.lecturer.institution}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-200 font-mono text-[10px] text-neutral-600 uppercase tracking-wider">
                HONOURS: {activeReel.lecturer.fellowship}
              </div>
            </div>

            {/* Typeset Chapter Breakdown with Clip Timestamps */}
            <div className="space-y-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block">
                INDEXED TIMESTAMPS & SYLLABUS CLIP NODES
              </span>

              <div className="border border-neutral-300 bg-white divide-y divide-neutral-200">
                {activeReel.chapters.map((chap, cIdx) => (
                  <div
                    key={cIdx}
                    onClick={() => setActiveChapterIndex(cIdx)}
                    className={`p-3.5 flex items-start justify-between gap-3 cursor-pointer transition ${
                      activeChapterIndex === cIdx ? 'bg-neutral-100/90 border-l-4 border-l-deep-onyx' : 'hover:bg-neutral-50'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="font-serif font-bold text-xs text-deep-onyx">
                        {chap.title}
                      </div>
                      <div className="font-mono text-[10px] text-neutral-500">
                        {chap.readingCitation}
                      </div>
                    </div>

                    <span className="font-mono text-[10px] font-bold text-deep-onyx whitespace-nowrap">
                      {chap.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Primary Text Readings */}
            <div className="space-y-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block">
                CANONICAL REQUIRED READINGS & CITATIONS
              </span>

              <div className="space-y-2">
                {activeReel.requiredReadings.map((reading, rIdx) => (
                  <div key={rIdx} className="p-3 bg-white border border-neutral-300 space-y-1">
                    <p className="font-serif font-bold text-xs text-deep-onyx">
                      {reading.title}
                    </p>
                    <p className="font-sans text-[11px] text-neutral-600">
                      {reading.author} • <span className="italic">{reading.journal}</span>
                    </p>
                    <p className="font-mono text-[10px] text-neutral-500">
                      Citations: {reading.pages}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Footer Accreditation Note */}
          <div className="pt-4 border-t border-neutral-300 font-mono text-[9px] text-neutral-500 uppercase tracking-widest flex items-center justify-between">
            <span>DHET REGISTERED MASTERCLASS REEL</span>
            <span>VERIFIED AUDIO / VIDEO ARCHIVE</span>
          </div>

        </div>

      </div>

    </section>
  );
};
