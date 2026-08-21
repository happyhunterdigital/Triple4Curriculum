import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Sparkles, Send, Bot, User, BookOpen, 
  HelpCircle, RefreshCw, Award, ArrowRight, Zap 
} from 'lucide-react';
import { useAuth } from '../../lib/authContext';

interface AITutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  sources?: string[];
}

export const AITutorDrawer: React.FC<AITutorDrawerProps> = ({ isOpen, onClose, initialTopic }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg_welcome',
      sender: 'ai',
      text: `Hello ${currentUser?.name ? currentUser.name.split(' ')[0] : 'there'}! I am your 444 Academic Copilot. Ask me anything about your syllabus, assignments, rubric criteria, or request a customized practice quiz!`,
      timestamp: 'Just now',
      sources: ['Triple 4C Curriculum Matrix', 'SA-SAMS Handbook']
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialTopic) {
      handleSend(`Explain key concepts and examination focus points for: ${initialTopic}`);
    }
  }, [initialTopic]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

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
      // Simulate Gemini or hit server AI endpoint
      await new Promise(r => setTimeout(r, 600));

      let aiResponseText = '';
      let sources: string[] = ['Triple 4C Academic Repository'];

      const lower = query.toLowerCase();
      if (lower.includes('raft') || lower.includes('consensus') || lower.includes('distributed')) {
        aiResponseText = `**Distributed Consensus & Raft in Triple 4C (CSC-441)**:
1. **Leader Election**: Heartbeat timeouts trigger term increments and candidate voting.
2. **Log Replication**: The leader accepts entries from clients, appends them locally, and broadcasts AppendEntries RPCs.
3. **Safety Guarantee**: State machine safety ensures that if a server applies an entry at index *i*, no other server can apply a differing entry at *i*.

*Tip for Assignment 1*: Ensure your heartbeat jitter is between 150ms-300ms to avoid split votes in multi-node clusters!`;
        sources = ['CSC-441 Syllabus', 'Raft Protocol Paper'];
      } else if (lower.includes('ethics') || lower.includes('popia')) {
        aiResponseText = `**POPIA & AI Ethics Framework (AI-442)**:
Under South African POPIA Section 444 and institutional guidelines:
- **Fairness & Non-Bias**: Algorithmic models must be audited against regional socio-economic skew.
- **Lawful Telemetry**: Student progress metrics cannot be commercialized and are restricted to academic counseling.
- **Right to Explanation**: High-stakes grading predictions require human faculty signoff via SpeedGrader™.`;
        sources = ['POPIA Data Privacy Charter 2026', 'Senate AI Ethics Policy v4.2'];
      } else if (lower.includes('matrix') || lower.includes('444') || lower.includes('curriculum')) {
        aiResponseText = `**The 4-4-4 Architectural Matrix**:
- **4 Character Pillars**: Integrity, Digital Citizenship, Social Accountability, Resilience.
- **4 Core Competencies**: Systems Modeling, Distributed Reasoning, Statistical Inference, Applied Ethics.
- **4 Industry Modules**: Every term combines core theory, simulation labs, SpeedGrader peer review, and a capstone.`;
        sources = ['The 4-4-4 Modular Paradigm v5.0'];
      } else {
        aiResponseText = `In the Triple 4 Curriculum framework for this topic, remember to ground your reasoning in the 4 pillars (Character, Competency, Critical Thinking, Creativity). 

Would you like me to generate a 3-question adaptive quiz to test your mastery right now?`;
        sources = ['Triple 4C Knowledge Base'];
      }

      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      console.error('AI Error', e);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Explain Raft Consensus Algorithm',
    'What is the 4-4-4 Modular Matrix?',
    'POPIA Student Privacy Rules',
    'Tips to score 100% on SpeedGrader Rubrics'
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200 border-l border-neutral-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-deep-onyx text-white flex items-center justify-between border-b border-achievement-gold/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white border border-neutral-300 flex items-center justify-center overflow-hidden shadow-xs">
              <img 
                src="https://res.cloudinary.com/dka0498ns/image/upload/v1787326034/Triple_4_Curriculum_chabot_Icon_n2qrgg.png"
                alt="444 Chatbot Icon"
                className="w-full h-full object-cover scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">
                  444 Academic Copilot
                </h2>
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-achievement-gold text-deep-onyx">
                  Gemini 2.5
                </span>
              </div>
              <p className="text-xs text-white/70">
                Contextual AI Tutor for syllabus, rubrics, & code
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          
          {messages.map(msg => (
            <div 
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-7 h-7 bg-white border border-neutral-300 flex items-center justify-center flex-shrink-0 mt-0.5 overflow-hidden shadow-xs">
                  <img 
                    src="https://res.cloudinary.com/dka0498ns/image/upload/v1787326034/Triple_4_Curriculum_chabot_Icon_n2qrgg.png"
                    alt="AI Avatar"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              <div className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-academic-green text-white rounded-tr-none font-medium'
                  : 'bg-neutral-100 text-neutral-800 rounded-tl-none border border-neutral-200'
              }`}>
                <div className="whitespace-pre-line">
                  {msg.text}
                </div>

                {msg.sources && msg.sources.length > 0 && (
                  <div className="pt-2 border-t border-neutral-200/60 flex flex-wrap items-center gap-1.5 text-[10px] text-neutral-500 font-medium">
                    <BookOpen className="w-3 h-3 text-academic-green" />
                    <span>Sources:</span>
                    {msg.sources.map(s => (
                      <span key={s} className="bg-white px-1.5 py-0.5 rounded border border-neutral-200 text-neutral-700">
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                <div className={`text-[9px] text-right font-mono ${msg.sender === 'user' ? 'text-white/70' : 'text-neutral-400'}`}>
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-deep-onyx text-achievement-gold flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs font-bold text-[10px]">
                  {currentUser?.name.charAt(0) || 'U'}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-neutral-400 text-xs italic">
              <div className="w-7 h-7 bg-white border border-neutral-300 flex items-center justify-center flex-shrink-0 p-0.5">
                <img 
                  src="https://res.cloudinary.com/dka0498ns/image/upload/v1787326034/Triple_4_Curriculum_chabot_Icon_n2qrgg.png"
                  alt="AI Loading"
                  className="w-full h-full object-contain animate-pulse"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span>Synthesizing academic reasoning...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-200 flex items-center gap-2 overflow-x-auto hide-scrollbar">
          {quickPrompts.map(p => (
            <button
              key={p}
              onClick={() => handleSend(p)}
              className="px-2.5 py-1 rounded-full bg-white border border-neutral-300 hover:border-academic-green text-[11px] font-bold text-neutral-700 whitespace-nowrap transition shadow-2xs hover:text-academic-green"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-neutral-200">
          <form 
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about courses, rubrics, exam topics..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-academic-green text-xs font-medium"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-academic-green hover:bg-academic-green/90 disabled:opacity-50 text-white transition shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
