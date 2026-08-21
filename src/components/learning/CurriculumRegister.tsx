import React, { useState } from 'react';

interface CurriculumModule {
  id: string;
  code: string;
  prerequisites: string;
  credits: number;
  level: string;
  title: string;
  subtitle: string;
  analyticalFrameworks: {
    heading: string;
    body: string;
  }[];
  primaryTexts: string[];
  examinationFormat: string;
}

const curriculumModules: CurriculumModule[] = [
  {
    id: 'mod_441',
    code: 'CSC-441.01',
    prerequisites: 'PREREQ: MTH-302 (DISCRETE MATHS), CSC-310 (KERNEL ARCHITECTURES)',
    credits: 30,
    level: 'NQF LEVEL 8',
    title: 'Distributed Consensus & Formal Invariants in Asynchronous Networks',
    subtitle: 'State Machine Replication, Raft Quorum Protocols, and Byzantine Fault Tolerance',
    analyticalFrameworks: [
      {
        heading: 'I. Mathematical Foundations of Distributed Invariants',
        body: 'The module establishes strict safety invariants across asynchronous networks with message loss and network partitions. Students derive the FLP Impossibility Theorem (Fischer, Lynch, Paterson) and formulate inductive proofs for log-matching invariants under randomized election timeouts.'
      },
      {
        heading: 'II. Quorum Mechanics & Linearizability Models',
        body: 'Formal analysis of read/write quorums (Q_r + Q_w > N) and strict serializability guarantees under write-ahead logging (WAL). The course details state transition matrices for leader transitions, term monotonicity, and log truncation constraints in distributed key-value storage engines.'
      },
      {
        heading: 'III. Byzantine Tolerance & Verifiable Cryptographic State',
        body: 'Examination of adversarial network topologies using threshold signatures and Tendermint/PBFT consensus lattices. Students implement verifiable Merkle Patricia tries to audit state changes against tampering without centralized trusted authorities.'
      }
    ],
    primaryTexts: [
      'Lamport, L. (1998). The Part-Time Parliament. ACM Transactions on Computer Systems.',
      'Ongaro, D. & Ousterhout, J. (2014). In Search of an Understandable Consensus Algorithm. USENIX ATC.',
      'Cachin, C., Guerraoui, R., & Rodrigues, L. (2011). Introduction to Reliable and Secure Distributed Programming. Springer.'
    ],
    examinationFormat: '3-Hour Senate Written Examination (60%) + Formally Verified Kernel Implementation (40%)'
  },
  {
    id: 'mod_442',
    code: 'AI-442.02',
    prerequisites: 'PREREQ: MTH-315 (MULTIVARIABLE CALCULUS), CSC-330 (STATISTICAL LEARNING)',
    credits: 30,
    level: 'NQF LEVEL 8',
    title: 'Algorithmic Fairness, Latent Geometry & High-Dimensional Representations',
    subtitle: 'Manifold Hypothesis, Disparate Impact Optimization, and POPIA Statutory Telemetry',
    analyticalFrameworks: [
      {
        heading: 'I. High-Dimensional Probability & Representation Manifolds',
        body: 'Rigorous derivation of non-asymptotic random matrix theory and the Johnson-Lindenstrauss Lemma. Exploration of semantic manifolds in transformer embeddings, attention entropy decay, and spectral graph representations of dense academic corpora.'
      },
      {
        heading: 'II. Formalizing Demographic Parity & Equalized Odds',
        body: 'Mathematical formulation of demographic parity, equalized odds, and predictive rate parity under non-stationary label distributions. Analysis of optimization trade-offs between predictive accuracy and statutory fairness bounds in African socio-economic datasets.'
      },
      {
        heading: 'III. Cryptographic Privacy Preservation (POPIA Act 4)',
        body: 'Implementation of Differential Privacy mechanisms (Laplace and Gaussian mechanisms) with epsilon-delta budget accounting. Audit procedures ensuring zero leakage of protected demographic traits in student telemetry and academic grading records.'
      }
    ],
    primaryTexts: [
      'Dwork, C. & Roth, A. (2014). The Algorithmic Foundations of Differential Privacy. NOW Publishers.',
      'Hardt, M., Price, E., & Srebro, N. (2016). Equality of Opportunity in Supervised Learning. NeurIPS.',
      'Republic of South Africa. (2013). Protection of Personal Information Act No. 4 of 2013. Government Gazette.'
    ],
    examinationFormat: 'Empirical Research Dissertation (50%) + Formal Fairness Audit Defense (50%)'
  },
  {
    id: 'mod_443',
    code: 'SYS-443.03',
    prerequisites: 'PREREQ: CSC-310 (OPERATING SYSTEMS), CSC-325 (NETWORKING PROTOCOLS)',
    credits: 30,
    level: 'NQF LEVEL 8',
    title: 'Compiler Construction, Type Theory & Safe Concurrent Runtimes',
    subtitle: 'Linear Types, Abstract Interpretation, and Zero-Cost Memory Safety',
    analyticalFrameworks: [
      {
        heading: 'I. Operational Semantics & Linear Type Systems',
        body: 'Constructive logic foundations through the Curry-Howard correspondence. Students formulate small-step and big-step operational semantics for affine and linear type systems that guarantee compile-time memory safety without runtime garbage collection pauses.'
      },
      {
        heading: 'II. Static Analysis via Abstract Interpretation',
        body: 'Formal static program verification utilizing Galois connections and complete lattices. Computation of fixpoints over interval and polyhedral domains to automatically prove freedom from data races and buffer overflows in mission-critical software.'
      },
      {
        heading: 'III. Intermediate Representations & Target Optimization',
        body: 'Design of Static Single Assignment (SSA) intermediate representations, dominator tree calculation, register allocation via graph coloring (Chaitin-Briggs algorithm), and SIMD auto-vectorization passes.'
      }
    ],
    primaryTexts: [
      'Pierce, B. C. (2002). Types and Programming Languages. MIT Press.',
      'Cousot, P. & Cousot, R. (1977). Abstract Interpretation: A Unified Lattice Model. ACM POPL.',
      'Muchnick, S. S. (1997). Advanced Compiler Design and Implementation. Morgan Kaufmann.'
    ],
    examinationFormat: 'Full-Stack Native Compiler Synthesis (60%) + Oral Senate Viva Voce (40%)'
  },
  {
    id: 'mod_444',
    code: 'GOV-444.04',
    prerequisites: 'PREREQ: LAW-201 (CONSTITUTIONAL LAW), INF-310 (ENTERPRISE ARCHITECTURE)',
    credits: 30,
    level: 'NQF LEVEL 8',
    title: 'Statutory Higher Education Governance & Pan-African Institutional Policy',
    subtitle: 'CHE Accreditation Standards, SA-SAMS Reporting Protocols, and Senate Curricular Design',
    analyticalFrameworks: [
      {
        heading: 'I. Statutory Quality Councils & NQF Level 8 Descriptors',
        body: 'Comprehensive analysis of the Higher Education Act 101 of 1997 and Council on Higher Education (CHE) criteria for programme accreditation. Deconstruction of Bloom-Revised taxonomic alignments and credit accumulation transfer systems.'
      },
      {
        heading: 'II. Automated Regulatory Telemetry & SA-SAMS Auditing',
        body: 'Design of non-repudiable biometric attendance ledgers, continuous assessment weighting algorithms, and statutory DHET HEMIS data ingestion pipelines. Governance frameworks preventing grade inflation and fraudulent certificate issuance.'
      },
      {
        heading: 'III. Decolonial Epistemologies & Contextual Curricula',
        body: 'Epistemological evaluation of African knowledge systems, language accessibility in STEM disciplines, and community-partnered applied research frameworks tailored to national development objectives.'
      }
    ],
    primaryTexts: [
      'Council on Higher Education. (2021). Higher Education Qualifications Sub-Framework (HEQSF). Pretoria.',
      'Department of Higher Education and Training. (2023). Policy on Minimum Requirements for Programmes. DHET.',
      'Mamdani, M. (2018). Scholars in the Marketplace: The Dilemmas of Neo-Liberal Reform. CODESRIA.'
    ],
    examinationFormat: 'Institutional Policy Draft & Compliance Audit (70%) + Senate Board Simulation (30%)'
  }
];

export const CurriculumRegister: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>('mod_441');

  const toggleModule = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <section id="curriculum-register" className="w-full bg-[#FAF9F5] border-t border-b border-neutral-300">
      
      {/* Textbook Index Header Banner */}
      <div className="px-6 sm:px-10 lg:px-14 py-8 border-b border-neutral-300 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 block mb-1">
            [ STATUTORY INDEX // SECTION IV ]
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-deep-onyx tracking-tight">
            Curriculum Register & Analytical Frameworks
          </h2>
        </div>

        <div className="font-mono text-xs text-neutral-600 uppercase tracking-widest text-left md:text-right">
          <span>CHE ACCREDITED • NQF LEVEL 8 REGISTER</span>
          <span className="block text-[10px] text-neutral-400 mt-0.5">ACADEMIC YEAR 2026 / 2027</span>
        </div>
      </div>

      {/* High-End Print Textbook Index List */}
      <div className="divide-y divide-neutral-300">
        {curriculumModules.map((module) => {
          const isExpanded = expandedId === module.id;

          return (
            <div 
              key={module.id} 
              className={`transition-colors duration-150 ${isExpanded ? 'bg-white' : 'bg-transparent hover:bg-neutral-100/60'}`}
            >
              {/* Main Index Row */}
              <div 
                onClick={() => toggleModule(module.id)}
                className="px-6 sm:px-10 lg:px-14 py-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline cursor-pointer select-none"
              >
                {/* Left Column: Module Code & Technical Prerequisites (Span 3) */}
                <div className="md:col-span-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-deep-onyx tracking-wider">
                      {module.code}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-500">
                      [{module.credits} CR]
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-neutral-500 leading-tight uppercase">
                    {module.prerequisites}
                  </p>
                </div>

                {/* Center Column: Course Title in Large Authoritative Serif (Span 7) */}
                <div className="md:col-span-7 pr-4">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-serif font-bold text-deep-onyx leading-snug tracking-tight">
                    {module.title}
                  </h3>
                  <p className="font-sans text-xs text-neutral-600 mt-1">
                    {module.subtitle}
                  </p>
                </div>

                {/* Right Column: Minimalist Text Toggle (Span 2) */}
                <div className="md:col-span-2 flex items-center justify-start md:justify-end">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleModule(module.id);
                    }}
                    className="font-mono text-xs uppercase tracking-widest text-deep-onyx hover:underline border-b border-transparent hover:border-deep-onyx pb-0.5 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{isExpanded ? 'COLLAPSE' : 'EXPAND'}</span>
                    <span className="font-mono">{isExpanded ? '↑' : '↓'}</span>
                  </button>
                </div>
              </div>

              {/* Expandable Cleanly Typeset Multi-Paragraph Analytical Text Block */}
              {isExpanded && (
                <div className="px-6 sm:px-10 lg:px-14 pb-12 pt-2 border-t border-neutral-200 bg-[#FAF9F5]/40 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
                    
                    {/* Left Column: Theoretical Pillars & Analytical Discourse (Span 8) */}
                    <div className="lg:col-span-8 space-y-6">
                      <div className="border-l-2 border-deep-onyx pl-6 space-y-6">
                        {module.analyticalFrameworks.map((framework, fIdx) => (
                          <div key={fIdx} className="space-y-1.5">
                            <h4 className="font-serif font-bold text-base text-deep-onyx">
                              {framework.heading}
                            </h4>
                            <p className="font-sans text-xs sm:text-sm text-neutral-700 leading-relaxed max-w-2xl">
                              {framework.body}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Column: Required Primary Texts & Assessment Protocols (Span 4) */}
                    <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-neutral-300 pt-6 lg:pt-0 lg:pl-8 space-y-6 font-mono">
                      
                      {/* Primary Text Citations */}
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase tracking-widest text-neutral-500 block">
                          CANONICAL TEXTS & CITATIONS
                        </span>
                        <div className="space-y-2 text-[11px] text-neutral-800 font-sans divide-y divide-neutral-200">
                          {module.primaryTexts.map((text, tIdx) => (
                            <p key={tIdx} className="pt-2 leading-relaxed italic">
                              {text}
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* Examination & Senate Evaluation */}
                      <div className="space-y-1.5 pt-4 border-t border-neutral-300">
                        <span className="text-[10px] uppercase tracking-widest text-neutral-500 block font-mono">
                          STATUTORY EXAMINATION SCHEME
                        </span>
                        <p className="font-sans text-xs text-deep-onyx leading-relaxed">
                          {module.examinationFormat}
                        </p>
                      </div>

                      {/* Monospace Ledger Registration Code */}
                      <div className="pt-2 text-[9px] text-neutral-400 uppercase tracking-widest">
                        REGISTER ENTRY: SA-HEQC-{module.code.replace('.', '-')}-2026
                      </div>

                    </div>

                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Index Footer Footnote */}
      <div className="px-6 sm:px-10 lg:px-14 py-4 bg-white border-t border-neutral-300 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[10px] font-mono text-neutral-500 uppercase tracking-widest gap-2">
        <span>TRIPLE 4 CURRICULUM • ALL SYLLABUS ENTRIES CHE RATIFIED</span>
        <span>SECTION REF: NQF8-INDEX-P01</span>
      </div>

    </section>
  );
};
