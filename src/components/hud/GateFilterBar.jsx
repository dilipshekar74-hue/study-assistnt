/**
 * GateFilterBar.jsx
 * Secondary filter and live exam telemetry sub-bar for Admin GATE DA Command Center.
 * Displays 7 official syllabus pillars, question format filters (MCQ/MSQ/NAT), and net score telemetry.
 * Adheres strictly to .agents/rules/admin-gate-da.md
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Zap, Filter, Award, RotateCcw, CheckCircle2 } from 'lucide-react';
import { useVedStore } from '../../store/useVedStore.js';
import { GATE_DA_PILLARS, GATE_DA_CURATED_PROBLEMS } from '../../llm/gateDaEngine.js';

export default function GateFilterBar({ onSelectProblem }) {
  const {
    activeGatePillar,
    setGatePillar,
    activeQuestionFormat,
    setQuestionFormat,
    activeGateProblemId,
    selectGateProblem,
    gateStats,
    resetGateStats
  } = useVedStore();

  const pillars = [
    { id: 'ALL', shortName: 'All 7 Pillars' },
    ...Object.values(GATE_DA_PILLARS)
  ];

  const formats = ['ALL', 'MCQ', 'MSQ', 'NAT'];

  // Filter problems matching current pillar & format
  const filteredProblems = GATE_DA_CURATED_PROBLEMS.filter((p) => {
    const matchPillar = activeGatePillar === 'ALL' || p.pillar === activeGatePillar;
    const matchFormat = activeQuestionFormat === 'ALL' || p.type === activeQuestionFormat;
    return matchPillar && matchFormat;
  });

  const handleSelectProblem = (problemId) => {
    selectGateProblem(problemId);
    if (onSelectProblem) onSelectProblem(problemId);
  };

  return (
    <div className="border-b border-rose-500/20 bg-zinc-950/90 backdrop-blur-xl px-6 py-2.5 space-y-2">
      {/* Top Row: Pillar Pills & Question Formats */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Pillar Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none max-w-full lg:max-w-3xl">
          <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400/80 mr-1 flex items-center gap-1 shrink-0">
            <Zap className="h-3 w-3 text-rose-400" />
            Pillars:
          </span>
          {pillars.map((pillar) => {
            const isSelected = activeGatePillar === pillar.id;
            return (
              <button
                key={pillar.id}
                onClick={() => setGatePillar(pillar.id)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-rose-500/20 text-rose-200 border border-rose-500/40 shadow-sm shadow-rose-500/20'
                    : 'bg-white/[0.04] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.08] border border-white/[0.06]'
                }`}
              >
                {pillar.shortName}
              </button>
            );
          })}
        </div>

        {/* Live Exam Telemetry Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/30 px-3 py-1 font-mono text-xs">
            <span className="text-zinc-400 text-[10px]">NET SCORE:</span>
            <span className={`font-semibold ${
              gateStats.netScore > 0 ? 'text-emerald-400' : gateStats.netScore < 0 ? 'text-rose-400' : 'text-zinc-200'
            }`}>
              {gateStats.netScore > 0 ? `+${gateStats.netScore}` : gateStats.netScore}
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400 text-[10px]">ACC:</span>
            <span className="text-amber-300 font-semibold">{gateStats.accuracy}%</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400 text-[10px]">ATT:</span>
            <span className="text-zinc-200">{gateStats.attempted}</span>
          </div>

          {gateStats.attempted > 0 && (
            <button
              onClick={resetGateStats}
              className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
              title="Reset GATE DA Telemetry Stats"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Row: Curated Questions Quick Selector & Format Filter */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/[0.04]">
        {/* Quick Problem Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider shrink-0 mr-1">
            Questions ({filteredProblems.length}):
          </span>
          {filteredProblems.map((p, idx) => {
            const isActive = activeGateProblemId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectProblem(p.id)}
                className={`flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-mono transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-white/[0.04]'
                }`}
              >
                <span className="text-[10px] opacity-70">Q{idx + 1}</span>
                <span className="truncate max-w-[120px]">{p.title.split('&')[0]}</span>
                <span className={`text-[9px] px-1 rounded ${
                  p.type === 'MCQ' ? 'bg-indigo-500/20 text-indigo-300' :
                  p.type === 'MSQ' ? 'bg-teal-500/20 text-teal-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {p.type}
                </span>
              </button>
            );
          })}
        </div>

        {/* Format Filter */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] font-mono text-zinc-500 uppercase mr-1">Format:</span>
          {formats.map((fmt) => (
            <button
              key={fmt}
              onClick={() => setQuestionFormat(fmt)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                activeQuestionFormat === fmt
                  ? 'bg-rose-500/30 text-rose-200 border border-rose-500/40'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
