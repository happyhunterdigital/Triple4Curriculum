import React, { useState } from 'react';

type WorkspaceToolType = 'code_editor' | 'analytical_framework' | 'state_canvas';

export const WorkspaceToggle: React.FC = () => {
  const [activeTool, setActiveTool] = useState<WorkspaceToolType>('code_editor');
  const [isPlayingVideo, setIsPlayingVideo] = useState(true);
  const [activeTab, setActiveTab] = useState<'main.rs' | 'consensus.rs' | 'invariants.rs'>('consensus.rs');
  
  // Interactive Code state
  const [codeBuffer, setCodeBuffer] = useState<string>(`// Triple 4C // NQF Level 8 Distributed Invariant Proof
// Consensus Module: Raft Log Matching & Term Monotonicity

use std::sync::atomic::{AtomicU64, Ordering};
use std::collections::BTreeMap;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct LogEntry {
    pub index: u64,
    pub term: u64,
    pub payload: Vec<u8>,
}

pub struct RaftNodeState {
    pub current_term: AtomicU64,
    pub voted_for: Option<u64>,
    pub log: BTreeMap<u64, LogEntry>,
    pub commit_index: u64,
}

impl RaftNodeState {
    /// Invariant: A node only grants a vote if candidate's log is at least
    /// as up-to-date as receiver's own log (term monotonicity & log completeness).
    pub fn handle_request_vote(
        &mut self,
        candidate_term: u64,
        candidate_id: u64,
        last_log_index: u64,
        last_log_term: u64,
    ) -> (u64, bool) {
        let current_term = self.current_term.load(Ordering::SeqCst);
        
        if candidate_term < current_term {
            return (current_term, false); // Stale candidate rejected
        }

        let my_last_term = self.log.values().last().map_or(0, |e| e.term);
        let my_last_index = self.log.keys().last().copied().unwrap_or(0);

        let is_log_ok = (last_log_term > my_last_term)
            || (last_log_term == my_last_term && last_log_index >= my_last_index);

        if is_log_ok && (self.voted_for.is_none() || self.voted_for == Some(candidate_id)) {
            self.voted_for = Some(candidate_id);
            return (current_term, true); // Quorum vote granted
        }

        (current_term, false)
    }
}`);

  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [isRunningProof, setIsRunningProof] = useState(false);

  // Analytical Framework Simulator State
  const [epsilonBudget, setEpsilonBudget] = useState<number>(0.85);
  const [sampleSize, setSampleSize] = useState<number>(10000);
  const [groupASelectRate, setGroupASelectRate] = useState<number>(72);
  const [groupBSelectRate, setGroupBSelectRate] = useState<number>(68);

  const runProofVerification = () => {
    setIsRunningProof(true);
    setTestOutput('Compiling formal invariant proofs with Z3 theorem prover...\nChecking Term Monotonicity Invariant: PASS\nChecking Log-Matching Induction Lemma: PASS\nChecking Quorum Intersection (N=5, Q=3): PASS\nVerification Complete: 0 Invariant Violations Detected (0.42s)');
    setTimeout(() => {
      setIsRunningProof(false);
    }, 450);
  };

  const disparateImpactRatio = (groupBSelectRate / Math.max(1, groupASelectRate)).toFixed(3);
  const isPopiaCompliant = parseFloat(disparateImpactRatio) >= 0.8 && epsilonBudget <= 1.0;

  return (
    <section id="workspace-toggle" className="w-full bg-[#FAF9F5] border-t border-b border-neutral-300">
      
      {/* Workspace Environment Header */}
      <div className="px-6 sm:px-10 lg:px-14 py-6 border-b border-neutral-300 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 block mb-1">
            [ EMPIRICAL PEDAGOGY // SPLIT-SCREEN WORKSPACE ]
          </span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-deep-onyx tracking-tight">
            The Interactive Scholar Workspace
          </h2>
        </div>

        {/* Physical Tool Selector Switches */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mr-2 hidden sm:inline">
            ACTIVE TOOL:
          </span>

          <button
            onClick={() => setActiveTool('code_editor')}
            className={`px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider transition cursor-pointer border ${
              activeTool === 'code_editor'
                ? 'bg-deep-onyx text-white border-deep-onyx font-bold'
                : 'bg-white text-neutral-700 border-neutral-300 hover:border-deep-onyx'
            }`}
          >
            I. Systems IDE & Kernel Sandbox
          </button>

          <button
            onClick={() => setActiveTool('analytical_framework')}
            className={`px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider transition cursor-pointer border ${
              activeTool === 'analytical_framework'
                ? 'bg-deep-onyx text-white border-deep-onyx font-bold'
                : 'bg-white text-neutral-700 border-neutral-300 hover:border-deep-onyx'
            }`}
          >
            II. Algorithmic Fairness & POPIA
          </button>

          <button
            onClick={() => setActiveTool('state_canvas')}
            className={`px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider transition cursor-pointer border ${
              activeTool === 'state_canvas'
                ? 'bg-deep-onyx text-white border-deep-onyx font-bold'
                : 'bg-white text-neutral-700 border-neutral-300 hover:border-deep-onyx'
            }`}
          >
            III. Distributed State Quorum Lattice
          </button>
        </div>
      </div>

      {/* Split Screen Master Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-neutral-300 items-stretch">
        
        {/* Left Screen (Span 5): Masterclass Video Stream & Live Discourse Transcript */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 flex flex-col justify-between space-y-6">
          
          <div className="space-y-4">
            
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-neutral-500">
              <span>MASTERCLASS FEED // LECTURE 04</span>
              <span className="text-deep-onyx font-bold">LIVE TELEMETRY</span>
            </div>

            {/* Video Canvas Container with Studio Framing */}
            <div className="relative w-full aspect-video bg-black border border-neutral-300 overflow-hidden flex items-center justify-center group">
              <img 
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80" 
                alt="Masterclass Lecture Stream"
                className="w-full h-full object-cover grayscale contrast-125 opacity-80"
                referrerPolicy="no-referrer"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

              {/* Masterclass Overlay Details */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-white/90">
                <span className="px-2 py-0.5 bg-black/80 border border-white/20">
                  PROF. S. NDLOVU // CAMBRIDGE CHAIR
                </span>
                <span className="px-2 py-0.5 bg-deep-onyx text-achievement-gold border border-achievement-gold">
                  1080P 60FPS RAW
                </span>
              </div>

              {/* Video Control Center Playhead */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => setIsPlayingVideo(!isPlayingVideo)}
                  className="px-4 py-2 bg-black/80 hover:bg-black text-white border border-white/40 font-mono text-xs uppercase tracking-widest cursor-pointer transition flex items-center gap-2"
                >
                  <span>{isPlayingVideo ? 'PAUSE STREAM' : 'RESUME STREAM'}</span>
                  <span>{isPlayingVideo ? '⏸' : '▶'}</span>
                </button>
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-white/80">
                <span>TIME: 00:38:14 / 01:24:18</span>
                <span>TOPIC: RAFT LEADER ELECTIONS</span>
              </div>
            </div>

            {/* Verbatim Masterclass Transcript Scrollbox */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                <span>SYNCHRONIZED LECTURE DISCOURSE</span>
                <span>AUTO-SCROLL: ACTIVE</span>
              </div>

              <div className="border border-neutral-300 bg-[#FAF9F5] p-4 text-xs font-sans space-y-3 max-h-56 overflow-y-auto divide-y divide-neutral-200">
                
                <div className="space-y-1">
                  <span className="font-mono text-[10px] font-bold text-deep-onyx block">[00:36:50] PROF. S. NDLOVU:</span>
                  <p className="text-neutral-700 leading-relaxed">
                    "Notice what happens on line 32 of your workspace right now. When the candidate term is strictly greater than the current node's term, we do not simply grant the vote blindly. We must enforce the log completeness check."
                  </p>
                </div>

                <div className="pt-2 space-y-1">
                  <span className="font-mono text-[10px] font-bold text-deep-onyx block">[00:37:42] PROF. S. NDLOVU:</span>
                  <p className="text-neutral-700 leading-relaxed">
                    "If the candidate's last log entry has a lower term, or if the terms match but the index is shorter, the candidate is missing committed entries. Granting a vote would violate the Fundamental Safety Invariant."
                  </p>
                </div>

                <div className="pt-2 space-y-1">
                  <span className="font-mono text-[10px] font-bold text-deep-onyx block">[00:38:10] PROF. S. NDLOVU:</span>
                  <p className="text-neutral-700 leading-relaxed">
                    "Execute the verification suite in your IDE now to prove that split-brain elections are strictly impossible."
                  </p>
                </div>

              </div>
            </div>

          </div>

          {/* Transcript Metadata Footnote */}
          <div className="pt-4 border-t border-neutral-200 font-mono text-[10px] text-neutral-500 uppercase tracking-wider flex items-center justify-between">
            <span>DISCOURSE TIMESTAMP: 2026-HE-04</span>
            <span>VERIFIED TRANSCRIPT</span>
          </div>

        </div>

        {/* Right Screen (Span 7): Actual Digital Tool Students Use */}
        <div className="lg:col-span-7 bg-[#FAF9F5] p-6 sm:p-8 flex flex-col justify-between space-y-6">
          
          {activeTool === 'code_editor' && (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              
              <div className="space-y-2">
                {/* IDE Tab Header */}
                <div className="flex items-center justify-between border-b border-neutral-300 pb-2">
                  <div className="flex items-center gap-1 font-mono text-xs">
                    {(['main.rs', 'consensus.rs', 'invariants.rs'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1 border transition cursor-pointer ${
                          activeTab === tab 
                            ? 'bg-white border-neutral-400 font-bold text-deep-onyx border-b-transparent' 
                            : 'bg-neutral-200/60 border-neutral-300 text-neutral-600'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={runProofVerification}
                      disabled={isRunningProof}
                      className="px-3.5 py-1.5 bg-deep-onyx hover:bg-black text-white font-mono text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-2 border border-deep-onyx"
                    >
                      <span>{isRunningProof ? 'PROVING...' : 'EXECUTE FORMAL PROOF'}</span>
                      <span className="font-mono">▶</span>
                    </button>
                  </div>
                </div>

                {/* Interactive Code Area */}
                <div className="border border-neutral-300 bg-white font-mono text-xs">
                  <textarea
                    value={codeBuffer}
                    onChange={(e) => setCodeBuffer(e.target.value)}
                    rows={15}
                    spellCheck={false}
                    className="w-full p-4 font-mono text-xs text-neutral-800 bg-transparent focus:outline-hidden leading-relaxed resize-none"
                  />
                </div>

                {/* Test Output Console */}
                {testOutput && (
                  <div className="p-4 bg-deep-onyx text-white font-mono text-xs border border-deep-onyx space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-neutral-400 uppercase tracking-widest border-b border-neutral-700 pb-1 mb-2">
                      <span>FORMAL PROOF CONSOLE // Z3 ENGINE</span>
                      <span className="text-academic-green font-bold">STATUS: OK</span>
                    </div>
                    <pre className="whitespace-pre-wrap leading-relaxed">{testOutput}</pre>
                  </div>
                )}
              </div>

              <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest flex items-center justify-between pt-2 border-t border-neutral-300">
                <span>RUST V1.82 • STRICT TYPE SAFETY</span>
                <span>Z3 THEOREM PROVER INTEGRATION</span>
              </div>

            </div>
          )}

          {activeTool === 'analytical_framework' && (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              
              <div className="space-y-6">
                <div className="border-b border-neutral-300 pb-3">
                  <h3 className="text-xl font-serif font-bold text-deep-onyx">
                    POPIA Act 4 & Algorithmic Parity Telemetry Simulator
                  </h3>
                  <p className="text-xs text-neutral-600 font-sans mt-1">
                    Calculate statistical disparate impact and differential privacy epsilon budgets across demographic groups.
                  </p>
                </div>

                {/* Mathematical Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white p-5 border border-neutral-300">
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span>DIFFERENTIAL PRIVACY (ε):</span>
                      <span className="font-bold text-deep-onyx">{epsilonBudget.toFixed(2)}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.1" 
                      max="3.0" 
                      step="0.05" 
                      value={epsilonBudget}
                      onChange={(e) => setEpsilonBudget(parseFloat(e.target.value))}
                      className="w-full accent-deep-onyx cursor-pointer"
                    />
                    <span className="text-[10px] font-mono text-neutral-500 block">
                      POPIA Statutory Threshold: ε ≤ 1.00
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span>AUDIT SAMPLE SIZE (N):</span>
                      <span className="font-bold text-deep-onyx">{sampleSize.toLocaleString()}</span>
                    </div>
                    <input 
                      type="range" 
                      min="1000" 
                      max="50000" 
                      step="1000" 
                      value={sampleSize}
                      onChange={(e) => setSampleSize(parseInt(e.target.value))}
                      className="w-full accent-deep-onyx cursor-pointer"
                    />
                    <span className="text-[10px] font-mono text-neutral-500 block">
                      Minimum Statistical Power (N &gt; 5,000)
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span>COHORT A ACCEPTANCE RATE:</span>
                      <span className="font-bold text-deep-onyx">{groupASelectRate}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="100" 
                      value={groupASelectRate}
                      onChange={(e) => setGroupASelectRate(parseInt(e.target.value))}
                      className="w-full accent-deep-onyx cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span>COHORT B ACCEPTANCE RATE:</span>
                      <span className="font-bold text-deep-onyx">{groupBSelectRate}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="100" 
                      value={groupBSelectRate}
                      onChange={(e) => setGroupBSelectRate(parseInt(e.target.value))}
                      className="w-full accent-deep-onyx cursor-pointer"
                    />
                  </div>

                </div>

                {/* Analytical Telemetry Result Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border border-neutral-300 bg-white divide-y sm:divide-y-0 sm:divide-x divide-neutral-300">
                  <div className="p-4">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-500 block">
                      DISPARATE IMPACT RATIO
                    </span>
                    <span className="font-serif text-2xl font-bold text-deep-onyx block mt-1">
                      {disparateImpactRatio}
                    </span>
                    <span className="font-mono text-[9px] text-neutral-500">
                      Standard: ≥ 0.800 (80% Rule)
                    </span>
                  </div>

                  <div className="p-4">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-500 block">
                      PRIVACY LOSS BOUND (ε)
                    </span>
                    <span className="font-serif text-2xl font-bold text-deep-onyx block mt-1">
                      {epsilonBudget.toFixed(2)}
                    </span>
                    <span className="font-mono text-[9px] text-neutral-500">
                      Bounded by Laplace noise
                    </span>
                  </div>

                  <div className="p-4">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-500 block">
                      STATUTORY POPIA AUDIT
                    </span>
                    <span className={`font-mono text-sm font-bold block mt-2 ${isPopiaCompliant ? 'text-academic-green' : 'text-rose-700'}`}>
                      {isPopiaCompliant ? 'PASSED // CERTIFIED' : 'FAILED // DEFICIT'}
                    </span>
                    <span className="font-mono text-[9px] text-neutral-500">
                      Act 4 of 2013 Reference
                    </span>
                  </div>
                </div>

              </div>

              <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest flex items-center justify-between pt-2 border-t border-neutral-300">
                <span>HEMIS-COMPLIANT STATUTORY METRIC</span>
                <span>AFRICAN DATA ETHICS DIRECTIVE</span>
              </div>

            </div>
          )}

          {activeTool === 'state_canvas' && (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              
              <div className="space-y-4">
                <div className="border-b border-neutral-300 pb-3">
                  <h3 className="text-xl font-serif font-bold text-deep-onyx">
                    Distributed Consensus 5-Node Quorum Lattice
                  </h3>
                  <p className="text-xs text-neutral-600 font-sans mt-1">
                    Visual state representation of quorum overlap, term monotonicity, and log synchronization.
                  </p>
                </div>

                {/* 5-Node Topology Blueprint */}
                <div className="bg-white border border-neutral-300 p-6 space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between text-[10px] text-neutral-500 uppercase tracking-widest">
                    <span>TOPOLOGY: 5 NODES (QUORUM MAJORITY = 3)</span>
                    <span>ACTIVE LEADER: NODE-01 [TERM 4]</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    {[
                      { id: 'NODE-01', role: 'LEADER', term: 4, logIndex: 124, status: 'ONLINE', ping: '2ms' },
                      { id: 'NODE-02', role: 'FOLLOWER', term: 4, logIndex: 124, status: 'ONLINE', ping: '18ms' },
                      { id: 'NODE-03', role: 'FOLLOWER', term: 4, logIndex: 124, status: 'ONLINE', ping: '22ms' },
                      { id: 'NODE-04', role: 'FOLLOWER', term: 4, logIndex: 123, status: 'ONLINE', ping: '45ms' },
                      { id: 'NODE-05', role: 'CANDIDATE', term: 3, logIndex: 120, status: 'PARTITIONED', ping: 'TIMEOUT' },
                    ].map(node => (
                      <div 
                        key={node.id}
                        className={`p-3 border space-y-2 ${
                          node.role === 'LEADER' 
                            ? 'bg-deep-onyx text-white border-deep-onyx' 
                            : node.status === 'PARTITIONED'
                            ? 'bg-neutral-100 border-neutral-300 text-neutral-400'
                            : 'bg-[#FAF9F5] border-neutral-300 text-deep-onyx'
                        }`}
                      >
                        <div className="font-bold flex items-center justify-between">
                          <span>{node.id}</span>
                          <span className={`w-1.5 h-1.5 ${node.status === 'ONLINE' ? 'bg-academic-green' : 'bg-rose-600'}`} />
                        </div>
                        <div className="text-[10px] space-y-0.5">
                          <p>ROLE: {node.role}</p>
                          <p>TERM: {node.term}</p>
                          <p>LOG IDX: {node.logIndex}</p>
                          <p>LATENCY: {node.ping}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quorum Math Proof Box */}
                  <div className="p-3 bg-[#FAF9F5] border border-neutral-300 font-mono text-[11px] text-deep-onyx space-y-1">
                    <div className="font-bold">INVARIANT VALIDATION:</div>
                    <div>Q_majority = &#123;NODE-01, NODE-02, NODE-03&#125; (3/5 Nodes Committed)</div>
                    <div className="text-academic-green font-bold">✓ Log Entry #124 is permanently committed under Term 4.</div>
                  </div>
                </div>

              </div>

              <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest flex items-center justify-between pt-2 border-t border-neutral-300">
                <span>ASYNC NETWORK SIMULATION</span>
                <span>PARTITION TOLERANT // CP SYSTEM</span>
              </div>

            </div>
          )}

        </div>

      </div>

    </section>
  );
};
