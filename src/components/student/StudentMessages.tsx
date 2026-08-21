import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Users, Shield, Hash, Paperclip, Sparkles } from 'lucide-react';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';
import { ChatMessage } from '../../types';

export const StudentMessages: React.FC = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [activeChannel, setActiveChannel] = useState<string>('cs201-cohort');

  const channels = [
    { id: 'cs201-cohort', name: 'CSC-441: Distributed Systems Cohort', members: 42 },
    { id: 'ai302-cohort', name: 'CSC-442: Neural Networks & LLMs', members: 38 },
    { id: 'core441-cohort', name: 'COR-441: 444 Data Ethics & POPIA', members: 89 },
    { id: 'general-chat', name: 'Triple 4C Campus Student Lounge', members: 310 },
  ];

  useEffect(() => {
    async function load() {
      try {
        const list = await api.getMessages();
        setMessages(list);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      const newMsg = await api.sendMessage({
        senderId: currentUser?.id || 'stu_01',
        senderName: currentUser?.name || 'Sarah Khumalo',
        senderRole: currentUser?.role || 'student',
        channelId: activeChannel,
        message: inputText.trim()
      });

      setMessages(prev => [...prev, newMsg]);
      setInputText('');
    } catch (e) {
      console.error('Error sending message:', e);
    }
  };

  const currentChannelMessages = messages.filter(
    m => m.channelId === activeChannel || (!m.channelId && activeChannel === 'cs201-cohort')
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-emerald-950/10 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-yellow-100 text-yellow-900 border border-yellow-300">
              Encrypted Academic Messaging
            </span>
            <span className="text-xs font-semibold text-neutral-500">
              POPIA-Compliant Direct & Cohort Communications
            </span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 mt-1">
            Messages & Academic Cohort Channels
          </h1>
          <p className="text-xs text-neutral-500">
            Collaborate with peers, ask lecturers clarifying questions, and participate in discussion threads
          </p>
        </div>
      </div>

      {/* Main Messaging Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white rounded-3xl border border-emerald-950/10 shadow-xs overflow-hidden min-h-[560px]">
        
        {/* Left Col: Channel List */}
        <div className="border-r border-neutral-100 p-4 space-y-3 bg-[#fbfcf8]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-2">
            Academic Discussion Channels
          </h3>

          <div className="space-y-1.5">
            {channels.map(ch => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                className={`w-full text-left p-3 rounded-xl text-xs transition flex items-center justify-between ${
                  activeChannel === ch.id 
                    ? 'bg-emerald-800 text-yellow-300 font-bold shadow-xs' 
                    : 'text-neutral-700 hover:bg-emerald-50'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Hash className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{ch.name}</span>
                </div>
                <span className="text-[10px] opacity-80 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {ch.members}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right 2 Cols: Message Feed and Input */}
        <div className="lg:col-span-2 flex flex-col justify-between p-5 space-y-4">
          
          {/* Feed */}
          <div className="space-y-4 overflow-y-auto max-h-[420px] pr-2">
            {currentChannelMessages.map(msg => {
              const isMe = msg.senderId === currentUser?.id;
              const isLecturer = msg.senderRole === 'lecturer';
              return (
                <div 
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1 text-[11px] text-neutral-500">
                    <span className={`font-bold ${isLecturer ? 'text-emerald-800' : 'text-neutral-800'}`}>
                      {msg.senderName}
                    </span>
                    {isLecturer && (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900 font-bold text-[9px]">
                        FACULTY
                      </span>
                    )}
                    <span>• {msg.timestamp}</span>
                  </div>

                  <div className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                    isMe 
                      ? 'bg-emerald-800 text-white rounded-br-none shadow-xs' 
                      : 'bg-neutral-100 text-neutral-900 rounded-bl-none'
                  }`}>
                    {msg.message}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSendMessage} className="pt-3 border-t border-neutral-100 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Post to #${channels.find(c => c.id === activeChannel)?.name.split(':')[0]}...`}
              className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-neutral-300 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden bg-[#fbfcf8]"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-yellow-300 transition shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};
