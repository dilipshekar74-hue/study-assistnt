/**
 * GateDaWorkbench.jsx
 * Admin-Exclusive IIT GATE Data Science & AI (GATE DA) Interactive Simulator.
 * Features:
 * - 1-mark & 2-mark MCQ, MSQ (checkboxes), and NAT (virtual numeric keypad) problems
 * - Live question countdown timer & negative marking telemetry (-0.33 / -0.66 / 0.00)
 * - Collapsible IIT Trap & Shortcut Decoder Drawer (⚡ <60s Shortcut, 🪤 Distractor Traps, 📐 Full Derivation)
 * 
 * Adheres strictly to .agents/rules/admin-gate-da.md and .agents/rules/ui-pedagogy-sync.md
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Timer,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Calculator,
  Delete
} from 'lucide-react';
import { useVedStore } from '../../store/useVedStore.js';
import { GATE_DA_CURATED_PROBLEMS } from '../../llm/gateDaEngine.js';
import KatexMath, { FormattedMathText } from '../KatexMath';

export default function GateDaWorkbench({ artifact }) {
  const {
    activeGateProblemId,
    recordGateAnswer,
    gateAnswers
  } = useVedStore();

  // Find active problem from curated set or artifact metadata
  const currentProblem =
    GATE_DA_CURATED_PROBLEMS.find((p) => p.id === activeGateProblemId) ||
    GATE_DA_CURATED_PROBLEMS[0];

  const problemId = currentProblem.id;
  const questionType = currentProblem.type; // 'MCQ' | 'MSQ' | 'NAT'
  const marks = currentProblem.marks; // 1 or 2
  const negativeMarkVal = questionType === 'MCQ' ? (marks === 1 ? -0.33 : -0.66) : 0;

  // Question State
  const [selectedMcq, setSelectedMcq] = useState('');
  const [selectedMsq, setSelectedMsq] = useState([]);
  const [natInput, setNatInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [evalResult, setEvalResult] = useState(null); // { isCorrect: bool, scoreDelta: number }

  // IIT Trap & Shortcut Drawer
  const [isTrapDrawerOpen, setIsTrapDrawerOpen] = useState(false);
  const [activeDecoderTab, setActiveDecoderTab] = useState('shortcut'); // 'shortcut' | 'traps' | 'derivation'

  // Exam Countdown Timer (3:00 for 2-mark, 1:30 for 1-mark)
  const initialSeconds = marks === 2 ? 180 : 90;
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Sync state if active problem changes
  useEffect(() => {
    setSelectedMcq('');
    setSelectedMsq([]);
    setNatInput('');
    setSubmitted(false);
    setEvalResult(null);
    setTimeLeft(marks === 2 ? 180 : 90);
    setIsTimerRunning(true);
    setIsTrapDrawerOpen(false);

    // Check if previously answered
    const existing = gateAnswers.find((a) => a.questionId === problemId);
    if (existing) {
      setSubmitted(true);
      if (questionType === 'MCQ') setSelectedMcq(existing.userResponse);
      if (questionType === 'MSQ') setSelectedMsq(existing.userResponse || []);
      if (questionType === 'NAT') setNatInput(String(existing.userResponse));
    }
  }, [problemId, marks, questionType]);

  // Timer Tick
  useEffect(() => {
    if (!isTimerRunning || timeLeft <= 0 || submitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft, submitted]);

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Toggle MSQ option
  const toggleMsqOption = (optId) => {
    if (submitted) return;
    setSelectedMsq((prev) =>
      prev.includes(optId) ? prev.filter((id) => id !== optId) : [...prev, optId]
    );
  };

  // Virtual Keypad input for NAT
  const handleKeypadPress = (val) => {
    if (submitted) return;
    if (val === 'CLEAR') {
      setNatInput('');
    } else if (val === 'BACK') {
      setNatInput((prev) => prev.slice(0, -1));
    } else {
      if (val === '.' && natInput.includes('.')) return;
      if (val === '-' && natInput.length > 0) return;
      setNatInput((prev) => prev + val);
    }
  };

  // Submit Answer & Evaluate Telemetry
  const handleSubmitAnswer = () => {
    let userResponse = null;
    let isCorrect = false;

    if (questionType === 'MCQ') {
      if (!selectedMcq) return;
      userResponse = selectedMcq;
      isCorrect = selectedMcq === currentProblem.correctAnswer;
    } else if (questionType === 'MSQ') {
      if (selectedMsq.length === 0) return;
      userResponse = selectedMsq;
      const userSet = new Set(selectedMsq);
      const correctSet = new Set(currentProblem.correctAnswer || []);
      isCorrect = userSet.size === correctSet.size && [...userSet].every((x) => correctSet.has(x));
    } else if (questionType === 'NAT') {
      if (!natInput.trim()) return;
      userResponse = natInput.trim();
      const numVal = parseFloat(natInput);
      if (currentProblem.acceptableRange) {
        isCorrect =
          numVal >= currentProblem.acceptableRange[0] &&
          numVal <= currentProblem.acceptableRange[1];
      } else {
        isCorrect = Math.abs(numVal - currentProblem.correctAnswer) < 0.05;
      }
    }

    const scoreDelta = isCorrect ? marks : negativeMarkVal;
    setEvalResult({ isCorrect, scoreDelta });
    setSubmitted(true);
    setIsTimerRunning(false);

    recordGateAnswer({
      questionId: problemId,
      userResponse
    });
  };

  const handleResetQuestion = () => {
    setSelectedMcq('');
    setSelectedMsq([]);
    setNatInput('');
    setSubmitted(false);
    setEvalResult(null);
    setTimeLeft(initialSeconds);
    setIsTimerRunning(true);
    setIsTrapDrawerOpen(false);
  };

  return (
    <div className="flex flex-col h-full space-y-4 overflow-y-auto pr-1">
      {/* Top Question Header Bar */}
      <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs font-bold">
            DA
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-zinc-100">{currentProblem.title}</h3>
              <span className="rounded bg-rose-500/10 px-1.5 py-0.2 text-[10px] font-mono text-rose-400 border border-rose-500/20">
                {currentProblem.pillar}
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">
              GATE DA 2026 Question Setter Simulation
            </span>
          </div>
        </div>

        {/* Live Exam Countdown & Marking telemetry */}
        <div className="flex items-center gap-3">
          {/* Question Countdown Timer */}
          <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-900/80 px-2.5 py-1 text-xs font-mono">
            <Timer className={`h-3.5 w-3.5 ${timeLeft < 30 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
            <span className={timeLeft < 30 ? 'text-rose-300 font-bold' : 'text-zinc-300'}>
              {formatTimer(timeLeft)}
            </span>
          </div>

          {/* Marks & Penalty Indicator */}
          <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-900/80 px-2.5 py-1 text-xs font-mono">
            <span className="text-emerald-400 font-semibold">+{marks}</span>
            <span className="text-zinc-600">/</span>
            <span className="text-rose-400 font-semibold">
              {negativeMarkVal === 0 ? '0.00' : negativeMarkVal}
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Question Card */}
      <div className="rounded-2xl border border-white/[0.1] bg-zinc-950/90 p-6 shadow-2xl space-y-5">
        {/* Question Header & Format Badge */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-xs">
          <span className="font-mono text-zinc-400 uppercase tracking-wider text-[11px]">
            Problem ID: <span className="text-zinc-200">{problemId}</span>
          </span>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
              questionType === 'MCQ' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
              questionType === 'MSQ' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' :
              'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {questionType} • {marks} Mark{marks > 1 ? 's' : ''}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              {questionType === 'MCQ' ? '(-1/3 Negative Marking)' : '(0 Negative Marking)'}
            </span>
          </div>
        </div>

        {/* Question Statement */}
        <div className="text-sm leading-relaxed text-zinc-100 font-sans space-y-3">
          <FormattedMathText text={currentProblem.questionText} />
        </div>

        {/* Dynamic Input Zone: MCQ / MSQ / NAT Virtual Keypad */}
        <div className="pt-2">
          {/* MCQ Options Radio List */}
          {questionType === 'MCQ' && currentProblem.options && (
            <div className="space-y-2.5">
              {currentProblem.options.map((opt) => {
                const isSelected = selectedMcq === opt.id;
                const isCorrectOpt = currentProblem.correctAnswer === opt.id;
                const showCorrect = submitted && isCorrectOpt;
                const showWrong = submitted && isSelected && !isCorrectOpt;

                return (
                  <button
                    key={opt.id}
                    onClick={() => !submitted && setSelectedMcq(opt.id)}
                    disabled={submitted}
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-left text-xs transition-all cursor-pointer ${
                      showCorrect
                        ? 'border border-emerald-500/60 bg-emerald-950/40 text-emerald-200'
                        : showWrong
                        ? 'border border-rose-500/60 bg-rose-950/40 text-rose-200'
                        : isSelected
                        ? 'border border-indigo-500/50 bg-indigo-950/40 text-white shadow-sm'
                        : 'border border-white/[0.06] bg-zinc-900/50 text-zinc-300 hover:border-white/[0.15] hover:bg-zinc-900'
                    }`}
                  >
                    <span className={`flex h-6 w-6 items-center justify-center rounded-lg font-mono text-xs font-semibold shrink-0 ${
                      showCorrect
                        ? 'bg-emerald-500 text-black'
                        : showWrong
                        ? 'bg-rose-500 text-white'
                        : isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white/[0.08] text-zinc-400'
                    }`}>
                      {opt.id}
                    </span>
                    <span className="flex-1 font-mono">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* MSQ Checkbox List */}
          {questionType === 'MSQ' && currentProblem.options && (
            <div className="space-y-2.5">
              <span className="text-[11px] font-mono text-teal-400 block mb-1">
                Select 1 or more options (Zero negative marking):
              </span>
              {currentProblem.options.map((opt) => {
                const isChecked = selectedMsq.includes(opt.id);
                const isCorrect = currentProblem.correctAnswer.includes(opt.id);
                const showGreen = submitted && isCorrect;
                const showRed = submitted && isChecked && !isCorrect;

                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleMsqOption(opt.id)}
                    disabled={submitted}
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-left text-xs transition-all cursor-pointer ${
                      showGreen
                        ? 'border border-emerald-500/60 bg-emerald-950/40 text-emerald-200'
                        : showRed
                        ? 'border border-rose-500/60 bg-rose-950/40 text-rose-200'
                        : isChecked
                        ? 'border border-teal-500/50 bg-teal-950/40 text-white shadow-sm'
                        : 'border border-white/[0.06] bg-zinc-900/50 text-zinc-300 hover:border-white/[0.15] hover:bg-zinc-900'
                    }`}
                  >
                    <div className={`flex h-5 w-5 items-center justify-center rounded border font-mono text-xs shrink-0 ${
                      isChecked
                        ? 'bg-teal-600 border-teal-500 text-white'
                        : 'border-zinc-600 bg-zinc-800'
                    }`}>
                      {isChecked ? '✓' : ''}
                    </div>
                    <span className="font-mono">{opt.id}. {opt.text}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* NAT Virtual Numeric Keypad Replica */}
          {questionType === 'NAT' && (
            <div className="space-y-4 max-w-sm mx-auto">
              {/* Virtual Keypad Input Display */}
              <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-zinc-900/80 px-4 py-3 shadow-inner">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Input Value:</span>
                <span className="font-mono text-xl font-bold text-amber-300">
                  {natInput || '0.00'}
                </span>
              </div>

              {/* Virtual Keypad Grid (TCS iON style) */}
              {!submitted && (
                <div className="grid grid-cols-4 gap-2 font-mono text-xs">
                  {['7', '8', '9', 'BACK', '4', '5', '6', 'CLEAR', '1', '2', '3', '-', '0', '.'].map((key) => (
                    <button
                      key={key}
                      onClick={() => handleKeypadPress(key)}
                      className={`py-2.5 rounded-lg font-semibold transition-all cursor-pointer ${
                        key === 'CLEAR'
                          ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 col-span-1 border border-rose-500/30'
                          : key === 'BACK'
                          ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 col-span-1 border border-white/[0.08]'
                          : key === '0'
                          ? 'bg-zinc-800/80 text-zinc-100 hover:bg-zinc-700 border border-white/[0.08] col-span-2'
                          : 'bg-zinc-800/80 text-zinc-100 hover:bg-zinc-700 border border-white/[0.08]'
                      }`}
                    >
                      {key === 'BACK' ? <Delete className="h-3.5 w-3.5 mx-auto" /> : key}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Controls & Submission Result */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
          {submitted ? (
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-xs ${
                evalResult?.isCorrect
                  ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
              }`}>
                {evalResult?.isCorrect ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <XCircle className="h-4 w-4 text-rose-400" />
                )}
                <span>
                  {evalResult?.isCorrect ? `Correct! (+${evalResult.scoreDelta} Marks)` : `Incorrect (${evalResult?.scoreDelta} Marks)`}
                </span>
              </div>

              <button
                onClick={handleResetQuestion}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Retry</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 ml-auto">
              <button
                onClick={handleSubmitAnswer}
                disabled={
                  (questionType === 'MCQ' && !selectedMcq) ||
                  (questionType === 'MSQ' && selectedMsq.length === 0) ||
                  (questionType === 'NAT' && !natInput.trim())
                }
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-600/25 hover:from-rose-500 hover:to-amber-500 transition-all cursor-pointer disabled:opacity-40"
              >
                <Zap className="h-3.5 w-3.5 fill-white" />
                <span>Submit Answer</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* IIT Trap & Shortcut Decoder Drawer */}
      <div className="rounded-2xl border border-rose-500/25 bg-zinc-950/80 shadow-xl overflow-hidden">
        {/* Collapsible Header */}
        <button
          onClick={() => setIsTrapDrawerOpen(!isTrapDrawerOpen)}
          className="flex w-full items-center justify-between px-5 py-3 text-xs text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-rose-400" />
            <span className="font-semibold tracking-wide">
              IIT Trap & Shortcut Decoder Drawer
            </span>
            <span className="rounded bg-rose-500/20 px-1.5 py-0.2 text-[9px] font-mono text-rose-300 border border-rose-500/30">
              Exam Heuristic
            </span>
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isTrapDrawerOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Expanded Drawer Tabs & Body */}
        {isTrapDrawerOpen && (
          <div className="border-t border-rose-500/20 bg-black/40 p-5 space-y-4 text-xs font-sans">
            {/* Decoder Sub-Tabs */}
            <div className="flex items-center gap-2 border-b border-white/[0.08] pb-2">
              <button
                onClick={() => setActiveDecoderTab('shortcut')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeDecoderTab === 'shortcut'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                ⚡ &lt;60s Speed Shortcut
              </button>
              <button
                onClick={() => setActiveDecoderTab('traps')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeDecoderTab === 'traps'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                🪤 Distractor Trap Breakdown
              </button>
              <button
                onClick={() => setActiveDecoderTab('derivation')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeDecoderTab === 'derivation'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                📐 Full Formal Derivation
              </button>
            </div>

            {/* Sub-Tab 1: <60s Shortcut */}
            {activeDecoderTab === 'shortcut' && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-4 text-amber-200 leading-relaxed space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                  <Zap className="h-3.5 w-3.5" />
                  <span>IIT Speed-Solving Trick (&lt;60s Verification):</span>
                </div>
                <div className="text-xs text-zinc-300 font-sans space-y-2">
                  <FormattedMathText text={currentProblem.shortcut} />
                </div>
              </div>
            )}

            {/* Sub-Tab 2: Distractor Traps */}
            {activeDecoderTab === 'traps' && (
              <div className="space-y-3">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                  Why Each Incorrect Option was Engineered by IIT Setters:
                </span>
                {Object.entries(currentProblem.distractorTraps || {}).map(([opt, trapText]) => (
                  <div key={opt} className="rounded-xl border border-rose-500/20 bg-rose-950/20 p-3 text-xs space-y-1">
                    <span className="font-mono font-bold text-rose-400">Distractor Option {opt}:</span>
                    <p className="text-zinc-300 leading-relaxed font-sans">{trapText}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Sub-Tab 3: Full Derivation */}
            {activeDecoderTab === 'derivation' && (
              <div className="rounded-xl border border-white/[0.06] bg-zinc-950/80 p-4 space-y-3 font-mono text-xs text-zinc-300">
                <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider block">
                  First-Principles Analytical Solution:
                </span>
                <KatexMath math={currentProblem.fullDerivation} block={true} className="text-indigo-200 py-2" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
