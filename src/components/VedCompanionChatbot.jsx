import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  X,
  MessageSquare,
  Flame,
  Award,
  Clock,
  CheckCircle2,
  ChevronDown,
  Target,
  Zap,
  HelpCircle,
  TrendingUp,
  BrainCircuit,
  Bot
} from 'lucide-react';
import {
  getOrCreateStudentProgress,
  generateVedPersonalizedInstruction,
  queryVedCompanion,
  saveStudentProgress
} from '../services/vedSubLlmEngine';

export default function VedCompanionChatbot({ session }) {
  const [isOpen, setIsOpen] = useState(false);
  const [progress, setProgress] = useState(() => getOrCreateStudentProgress(session));
  const [instruction, setInstruction] = useState(() => generateVedPersonalizedInstruction(progress));
  const [completedMilestones, setCompletedMilestones] = useState({});
  const [messages, setMessages] = useState(() => [
    {
      id: 'init-ved-1',
      sender: 'ved',
      time: 'Just now',
      text: `Hello ${session?.fullName?.split(' ')[0] || 'Scholar'}! I am VED, your personalized AI performance mentor. I've been tracking your progress from Day 1. Your overall mastery is currently at ${progress.overallMasteryScore}%. What would you like to review today?`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatScrollRef = useRef(null);

  // Sync progress on session changes
  useEffect(() => {
    if (session) {
      const p = getOrCreateStudentProgress(session);
      setProgress(p);
      setInstruction(generateVedPersonalizedInstruction(p));
    }
  }, [session]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query || isThinking) return;

    if (!textToSend) setInputText('');

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: query
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const result = await queryVedCompanion({
        userPrompt: query,
        progress,
        chatHistory: messages
      });

      const vedMsg = {
        id: `v-${Date.now()}`,
        sender: 'ved',
        time: result.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: result.reply
      };

      setMessages((prev) => [...prev, vedMsg]);
    } catch (err) {
      console.error('VED companion query error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `v-err-${Date.now()}`,
          sender: 'ved',
          time: 'Now',
          text: `I ran into a telemetry timeout, but your Day ${progress.dayCount} progress is fully recorded. Keep focusing on your core invariants!`
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const toggleMilestone = (idx) => {
    setCompletedMilestones((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const QUICK_PROMPTS = [
    { label: '📈 Day 1 Review', prompt: 'Review my performance history from Day 1 to now.' },
    { label: '🎯 Next Study Focus', prompt: 'What specific concept should I study next to boost my mastery?' },
    { label: '🪤 My Weak Spots', prompt: 'What are the main mistakes and traps I need to watch out for?' },
    { label: '⚡ 60s Drill', prompt: 'Give me a fast 60-second diagnostic drill based on my performance.' }
  ];

  return (
    <>
      {/* Floating VED Companion Pill Button (Bottom Right) */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-6 z-40 flex items-center gap-2.5 rounded-full border border-cyan-500/40 bg-zinc-950/90 px-4 py-2 text-xs font-medium text-cyan-200 backdrop-blur-2xl shadow-[0_0_25px_rgba(6,182,212,0.25)] hover:border-cyan-400 transition-all"
        title="Open VED Personal AI Performance Companion"
      >
        <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-sm shadow-cyan-500/50">
          <Bot className="h-3.5 w-3.5 text-white" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
        </div>
        <span className="font-semibold tracking-wide text-white">VED</span>
        <span className="rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 font-mono text-[10px] text-cyan-300">
          Day {progress.dayCount} • {progress.overallMasteryScore}% Mastery
        </span>
      </motion.button>

      {/* Slide-Up VED Companion Chatbot Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="fixed bottom-20 right-6 z-50 flex h-[620px] w-[92vw] sm:w-[430px] flex-col overflow-hidden rounded-3xl border border-white/[0.14] bg-zinc-950/95 shadow-[0_0_60px_rgba(6,182,212,0.25)] backdrop-blur-3xl text-zinc-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] bg-zinc-900/60 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-md shadow-cyan-500/30">
                  <Bot className="h-5 w-5 text-white animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-semibold tracking-tight text-white">VED Companion</h3>
                    <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
                      Sub-LLM
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Day {progress.dayCount} • Adaptive Performance Mentor
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                title="Minimize VED"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Performance Telemetry Ribbon */}
            <div className="grid grid-cols-4 gap-1.5 border-b border-white/[0.06] bg-zinc-950/80 p-2.5 text-center">
              <div className="rounded-xl border border-white/[0.05] bg-zinc-900/50 p-1.5">
                <span className="block text-[10px] font-mono uppercase text-zinc-500">Journey</span>
                <span className="text-xs font-semibold text-cyan-300">Day {progress.dayCount}</span>
              </div>
              <div className="rounded-xl border border-white/[0.05] bg-zinc-900/50 p-1.5">
                <span className="block text-[10px] font-mono uppercase text-zinc-500">Mastery</span>
                <span className="text-xs font-semibold text-emerald-300">{progress.overallMasteryScore}%</span>
              </div>
              <div className="rounded-xl border border-white/[0.05] bg-zinc-900/50 p-1.5">
                <span className="block text-[10px] font-mono uppercase text-zinc-500">Streak</span>
                <span className="text-xs font-semibold text-amber-300 flex items-center justify-center gap-0.5">
                  <Flame className="h-3 w-3 fill-amber-400" /> {progress.streakDays}d
                </span>
              </div>
              <div className="rounded-xl border border-white/[0.05] bg-zinc-900/50 p-1.5">
                <span className="block text-[10px] font-mono uppercase text-zinc-500">Study Time</span>
                <span className="text-xs font-semibold text-indigo-300">{progress.totalStudyMinutes}m</span>
              </div>
            </div>

            {/* Scrollable Conversation & Daily Prescriptions */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {/* Daily Coaching Diagnosis Card */}
              <div className="rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-cyan-950/20 via-zinc-900/40 to-zinc-950/60 p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-xs">
                  <BrainCircuit className="h-3.5 w-3.5" />
                  <span>VED Daily Performance Prescription</span>
                </div>
                <p className="text-zinc-200 text-xs leading-relaxed">
                  {instruction.diagnosis}
                </p>

                {/* Interactive Action Milestones */}
                <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                  <span className="block text-[10px] font-mono uppercase text-zinc-400">
                    Today's Target Milestones:
                  </span>
                  {instruction.milestones?.map((m, idx) => (
                    <div
                      key={idx}
                      onClick={() => toggleMilestone(idx)}
                      className={`flex items-start gap-2 p-2 rounded-xl border cursor-pointer transition-all ${
                        completedMilestones[idx]
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                          : 'border-white/[0.06] bg-zinc-900/50 text-zinc-300 hover:border-white/20'
                      }`}
                    >
                      <CheckCircle2
                        className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${
                          completedMilestones[idx] ? 'text-emerald-400' : 'text-zinc-500'
                        }`}
                      />
                      <span className={`text-[11px] leading-snug ${completedMilestones[idx] ? 'line-through text-zinc-400' : ''}`}>
                        {m}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Messages Stream */}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-2xl p-3 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'ml-auto max-w-[85%] border border-indigo-500/30 bg-indigo-600/20 text-white'
                      : 'border border-cyan-500/20 bg-zinc-900/70 text-zinc-200 space-y-1'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span className={m.sender === 'user' ? 'text-indigo-300' : 'text-cyan-400 font-medium'}>
                      {m.sender === 'user' ? 'You' : 'VED Companion'}
                    </span>
                    <span>{m.time}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
              ))}

              {isThinking && (
                <div className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-zinc-900/50 p-2.5 text-xs text-cyan-300">
                  <span className="h-3 w-3 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                  <span>VED is computing your Day {progress.dayCount} metrics...</span>
                </div>
              )}
            </div>

            {/* Quick Action Pills */}
            <div className="px-3 pt-2 pb-1 border-t border-white/[0.06] bg-zinc-950/70 flex gap-1.5 overflow-x-auto">
              {QUICK_PROMPTS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q.prompt)}
                  className="shrink-0 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 px-2.5 py-1 text-[10px] font-medium text-cyan-300 transition-colors"
                >
                  {q.label}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="border-t border-white/[0.08] bg-zinc-950 p-3 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask VED: How can I improve my score?..."
                className="flex-1 rounded-xl border border-white/10 bg-zinc-900 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-cyan-500 transition-all"
              />
              <button
                type="submit"
                disabled={isThinking || !inputText.trim()}
                className="flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-40 p-2 text-white transition-all shadow-md shadow-cyan-600/20"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
