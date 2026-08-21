import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, X, Send, 
  BookOpen, HelpCircle, RefreshCw,
  CheckCircle2, Maximize2, Minimize2, Copy, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../lib/authContext';

interface AIFloatingChatbotProps {
  initialOpen?: boolean;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  sources?: string[];
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    xpReward: number;
  };
}

export const AIFloatingChatbot: React.FC<AIFloatingChatbotProps> = ({ initialOpen = false }) => {
  const { currentUser, triggerToast } = useAuth();
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<string, number>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg_init',
      sender: 'ai',
      text: `Greetings ${currentUser?.name ? currentUser.name.split(' ')[0] : 'Scholar'}. I am your 444 AI Academic Copilot.

I can explain accredited syllabus theorems, synthesize practice examinations, calibrate SpeedGrader™ rubrics, or inspect POPIA telemetry compliance. Enter your research inquiry.`,
      timestamp: 'Just now',
      sources: ['Triple 4C Curriculum Matrix', 'Senate Academic Registry']
    }
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, isOpen]);

  // Global shortcut to toggle AI Tutor (Alt + /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key === '/') || (e.metaKey && e.shiftKey && e.key.toLowerCase() === 'j')) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSend = async (customPrompt?: string) => {
    const query = customPrompt || input.trim();
    if (!query) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setLoading(true);

    try {
      await new Promise(r => setTimeout(r, 600));

      let aiResponseText = '';
      let sources: string[] = ['Triple 4C Academic Repository'];
      let quizData: Message['quiz'] = undefined;

      const lower = query.toLowerCase();

      if (lower.includes('quiz') || lower.includes('practice') || lower.includes('test me')) {
        aiResponseText = `Syllabus diagnostic examination initialized for CSC-441 & AI-442:`;
        quizData = {
          question: 'In the Raft Distributed Consensus protocol, what condition triggers a Follower node to transition to the Candidate state and begin a Leader Election?',
          options: [
            'Receiving a client write request directly',
            'Election timeout expires without receiving AppendEntries heartbeats',
            'Node memory consumption exceeds 85%',
            'Statutory POPIA audit entry is committed'
          ],
          correctIndex: 1,
          explanation: 'In Raft, if a follower receives no heartbeat communication over a randomized election timeout period (150ms-300ms), it assumes no viable leader exists and transitions to candidate.',
          xpReward: 50
        };
        sources = ['CSC-441 Distributed Systems Syllabus', 'Raft Protocol Reference v2.1'];
      } else if (lower.includes('raft') || lower.includes('consensus') || lower.includes('distributed')) {
        aiResponseText = `**Distributed Consensus & Raft Architecture (CSC-441)**:

1. **Leader Election**: 
   - Followers transition to Candidates when randomized heartbeats (150-300ms) expire.
   - Candidates increment the current term and request peer votes. A majority confirms leader appointment.

2. **Log Replication**: 
   - Leaders write client entries to local logs and synchronize them via \`AppendEntries\` RPCs.
   - Entries committed on a majority of quorum nodes are executed on state machines.

3. **Safety Invariant**: 
   - A leader never overwrites or truncates committed log entries across terms.`;
        sources = ['CSC-441 Distributed Systems Syllabus', 'Raft Protocol Paper'];
      } else if (lower.includes('popia') || lower.includes('privacy') || lower.includes('ethics')) {
        aiResponseText = `**POPIA Act 4 of 2013 & Academic Telemetry**:

- **Accountability**: Researchers and academic staff are legally accountable for lawful handling of telemetry.
- **Processing Limitation**: Data collection must proceed strictly with verifiable digital consent.
- **Purpose Specification**: Academic records cannot be monetized or transferred to third-party ad networks.
- **Security Safeguards**: All student data in transit and at rest requires AES-256 cryptographic standards.`;
        sources = ['POPIA Act 4 of 2013 Guidelines', 'Senate AI Ethics Policy v4.2'];
      } else {
        aiResponseText = `Under the Triple 4 Curriculum (444 Matrix) at **NQF Level 8**:
- System components must be broken down into modular, mathematically verifiable abstractions.
- All empirical claims must be ground in SA-SAMS statutory standards with strict ethics citations.

Would you like to initiate a diagnostic quiz or review the SpeedGrader™ rubric?`;
        sources = ['Triple 4C Academic Repository'];
      }

      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources,
        quiz: quizData
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizAnswer = (messageId: string, optionIdx: number, quiz: NonNullable<Message['quiz']>) => {
    setSelectedQuizAnswers(prev => ({ ...prev, [messageId]: optionIdx }));

    if (optionIdx === quiz.correctIndex) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#006D44', '#C59B27', '#111315']
      });

      triggerToast({
        id: `toast_quiz_${Date.now()}`,
        title: 'Diagnostic Quiz Passed',
        message: `+${quiz.xpReward} XP credited to Scholar Standing.`,
        category: 'academic',
        timestamp: 'Just now',
        read: false,
        priority: 'high'
      });
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPills = [
    'Explain Raft Consensus Algorithm',
    'Generate Practice Quiz',
    'SpeedGrader Rubric Tips',
    'POPIA Student Privacy Rules',
    'What is the 4-4-4 Matrix?'
  ];

  return (
    <>
      {/* Structural Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        {!isOpen && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[var(--color-t4c-black)] text-[var(--color-t4c-gold)] text-xs font-mono tracking-wider uppercase rounded-full">
            <span className="w-1.5 h-1.5 bg-[var(--color-t4c-gold)] rounded-full" />
            <span>444 AI COPILOT</span>
            <span className="px-1 py-0.2 bg-white/20 text-[9px] text-white font-mono rounded">Alt + /</span>
          </div>
        )}

        <button
          id="btn-floating-ai-tutor"
          onClick={() => setIsOpen(prev => !prev)}
          className={`w-16 h-16 sm:w-20 sm:h-20 border-0 transition cursor-pointer flex items-center justify-center rounded-full shadow-lg overflow-hidden ${
            isOpen 
              ? 'bg-[var(--color-t4c-black)]' 
              : 'bg-[var(--color-t4c-black)] hover:bg-[var(--color-t4c-green)]'
          }`}
          title="Toggle 444 AI Copilot (Alt + /)"
          aria-label="Toggle AI Study Copilot"
        >
          {isOpen ? (
            <X className="w-7 h-7 text-[var(--color-t4c-gold)]" />
          ) : (
            <img 
              src="https://res.cloudinary.com/dka0498ns/image/upload/v1787326034/Triple_4_Curriculum_chabot_Icon_n2qrgg.png"
              alt="444 AI Chatbot"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          )}
        </button>
      </div>

      {/* Structural AI Chatbot Window */}
      {isOpen && (
        <div 
          id="ai-chatbot-window"
          className={`fixed z-50 flex flex-col overflow-hidden bg-white border border-neutral-300 rounded-none shadow-none ${
            isExpanded
              ? 'inset-4 sm:inset-10'
              : 'bottom-20 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[460px] h-[560px] max-h-[calc(100vh-6rem)]'
          }`}
        >
          {/* Header Bar */}
          <div className="p-3.5 bg-[#FAF9F5] text-deep-onyx flex items-center justify-between border-b border-neutral-300 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white border border-neutral-300 flex items-center justify-center flex-shrink-0 p-1">
                <img 
                  src="https://res.cloudinary.com/dka0498ns/image/upload/v1787326034/Triple_4_Curriculum_chabot_Icon_n2qrgg.png"
                  alt="444 AI Copilot"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-deep-onyx">444 AI Academic Copilot</h3>
                  <span className="px-1 py-0.2 text-[9px] font-mono bg-academic-green text-white">
                    GEMINI
                  </span>
                </div>
                <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                  Accredited Syllabus & Telemetry Engine
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(prev => !prev)}
                className="p-1 text-neutral-600 hover:text-deep-onyx cursor-pointer"
                title={isExpanded ? 'Minimize' : 'Maximize'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-neutral-600 hover:text-deep-onyx cursor-pointer"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Suggestion Pills */}
          <div className="px-3 py-1.5 bg-[#FAF9F5] border-b border-neutral-300 flex items-center gap-1.5 overflow-x-auto hide-scrollbar flex-shrink-0">
            {quickPills.map((pill, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(pill)}
                className="px-2 py-0.5 bg-white border border-neutral-300 hover:border-deep-onyx text-[10px] font-mono text-deep-onyx whitespace-nowrap transition flex-shrink-0 cursor-pointer rounded-none"
              >
                {pill}
              </button>
            ))}
          </div>

          {/* Chat Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-[#FAF9F5]">
            {messages.map(msg => (
              <div 
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 bg-white border border-neutral-300 flex items-center justify-center flex-shrink-0 mt-0.5 overflow-hidden rounded-none shadow-2xs">
                    <img 
                      src="https://res.cloudinary.com/dka0498ns/image/upload/v1787326034/Triple_4_Curriculum_chabot_Icon_n2qrgg.png"
                      alt="AI"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <div className={`max-w-[85%] p-3.5 space-y-2 leading-relaxed border rounded-none ${
                  msg.sender === 'user'
                    ? 'bg-deep-onyx text-white border-deep-onyx'
                    : 'bg-white text-deep-onyx border-neutral-300'
                }`}>
                  <div className="whitespace-pre-line text-xs font-sans">
                    {msg.text}
                  </div>

                  {/* Interactive Practice Quiz Block */}
                  {msg.quiz && (
                    <div className="mt-3 p-3 bg-[#FAF9F5] border border-neutral-300 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono uppercase tracking-widest text-academic-green font-bold flex items-center gap-1">
                          <HelpCircle className="w-3 h-3" />
                          Diagnostic Quiz
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 bg-deep-onyx text-achievement-gold">
                          +{msg.quiz.xpReward} XP
                        </span>
                      </div>

                      <p className="font-serif font-bold text-deep-onyx text-xs">
                        {msg.quiz.question}
                      </p>

                      <div className="space-y-1 pt-1">
                        {msg.quiz.options.map((opt, oIdx) => {
                          const isSelected = selectedQuizAnswers[msg.id] === oIdx;
                          const hasAnswered = selectedQuizAnswers[msg.id] !== undefined;
                          const isCorrect = oIdx === msg.quiz!.correctIndex;

                          let btnStyle = "border-neutral-300 bg-white text-deep-onyx hover:border-deep-onyx";
                          
                          if (hasAnswered) {
                            if (isCorrect) {
                              btnStyle = "border-academic-green bg-academic-green text-white font-bold";
                            } else if (isSelected && !isCorrect) {
                              btnStyle = "border-rose-600 bg-rose-50 text-rose-800 font-bold";
                            } else {
                              btnStyle = "border-neutral-200 opacity-50 bg-neutral-100 text-neutral-500";
                            }
                          }

                          return (
                            <button
                              key={oIdx}
                              disabled={hasAnswered}
                              onClick={() => handleQuizAnswer(msg.id, oIdx, msg.quiz!)}
                              className={`w-full text-left p-2 border text-xs font-mono transition flex items-center justify-between cursor-pointer rounded-none ${btnStyle}`}
                            >
                              <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                              {hasAnswered && isCorrect && <CheckCircle2 className="w-3 h-3 text-achievement-gold flex-shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      {selectedQuizAnswers[msg.id] !== undefined && (
                        <div className="pt-2 border-t border-neutral-200 text-[10px] font-mono text-neutral-700">
                          <strong>EXPLANATION:</strong> {msg.quiz.explanation}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sources / References */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="pt-2 border-t border-neutral-200 flex flex-wrap items-center gap-1 text-[9px] font-mono text-neutral-500">
                      <BookOpen className="w-3 h-3 text-academic-green" />
                      <span>CITED:</span>
                      {msg.sources.map(s => (
                        <span key={s} className="bg-neutral-100 px-1 py-0.2 border border-neutral-300 text-deep-onyx font-bold">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 font-mono text-[9px] text-neutral-400">
                    <button
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      className="hover:text-deep-onyx flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-2.5 h-2.5 text-academic-green" />
                          <span className="text-academic-green">COPIED</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-2.5 h-2.5" />
                          <span>COPY</span>
                        </>
                      )}
                    </button>

                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-6 h-6 bg-academic-green text-white flex items-center justify-center flex-shrink-0 mt-0.5 font-mono text-[9px] font-bold rounded-none">
                    {currentUser?.name.charAt(0) || 'S'}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 items-center text-neutral-600 font-mono text-xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-academic-green" />
                <span>Formulating academic guidance...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Input Form */}
          <div className="p-3 bg-white border-t border-neutral-300 flex-shrink-0">
            <form 
              onSubmit={e => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                id="ai-chatbot-input"
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Query syllabus, rubrics, proofs, or examinations..."
                className="flex-1 px-3 py-2 border border-neutral-300 bg-[#FAF9F5] focus:outline-none focus:border-deep-onyx font-sans text-xs text-deep-onyx rounded-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2 bg-academic-green hover:bg-academic-green/90 disabled:opacity-50 text-white transition cursor-pointer rounded-none border border-academic-green"
                title="Send"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
};
