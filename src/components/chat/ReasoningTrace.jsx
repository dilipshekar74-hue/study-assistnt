import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, CheckCircle2, Info, Loader2, Sparkles } from 'lucide-react';
import { useAstraStore } from '../../store/useAstraStore';

/**
 * ReasoningTrace
 * Collapsible cognitive reasoning drawer displaying live thinking tokens,
 * active elapsed timer, and progressive step checkmarks.
 * Adheres strictly to .agents/rules/multimodal-telemetry.md & .agents/rules/thinking-model-spec.md
 */
export default function ReasoningTrace({
  latency,
  indexedDocs,
  steps: propSteps,
  thoughtTrace,
  isLive = false
}) {
  const { telemetryTrace } = useAstraStore();
  const [isOpen, setIsOpen] = useState(isLive);
  const [showRawThoughts, setShowRawThoughts] = useState(isLive);
  const [elapsedSec, setElapsedSec] = useState(0);

  const isActivelyReasoning = isLive || telemetryTrace?.isReasoning;

  // Active elapsed timer during live reasoning
  useEffect(() => {
    if (!isActivelyReasoning) return;
    const startTime = telemetryTrace?.startTime || Date.now();
    const timer = setInterval(() => {
      setElapsedSec((Date.now() - startTime) / 1000);
    }, 80);

    return () => clearInterval(timer);
  }, [isActivelyReasoning, telemetryTrace?.startTime]);

  // Keep open when streaming starts
  useEffect(() => {
    if (isLive) {
      setIsOpen(true);
      setShowRawThoughts(true);
    }
  }, [isLive]);

  const durationText = isActivelyReasoning
    ? `${elapsedSec.toFixed(1)}s`
    : latency
      ? latency
      : telemetryTrace?.durationMs
        ? `${(telemetryTrace.durationMs / 1000).toFixed(1)}s`
        : '1.2s';

  const docsText = indexedDocs || 'Astra Cognitive Engine';
  const steps = (propSteps && propSteps.length > 0) ? propSteps : (telemetryTrace?.steps || []);
  const activeThoughtTrace = thoughtTrace || telemetryTrace?.thoughtTrace;

  return (
    <div className={`rounded-xl border transition-all overflow-hidden ${
      isActivelyReasoning
        ? 'border-amber-500/30 bg-zinc-900/60 shadow-lg shadow-amber-500/5 backdrop-blur-xl'
        : 'border-white/[0.08] bg-zinc-900/40 backdrop-blur-md'
    }`}>
      {/* Header bar with active timer */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-3.5 py-2.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          {isActivelyReasoning ? (
            <Loader2 className="h-3.5 w-3.5 text-amber-400 animate-spin shrink-0" />
          ) : (
            <Search className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          )}
          <span className="font-mono text-zinc-300">
            Reasoning Trace •{' '}
            <span className={isActivelyReasoning ? 'text-amber-300 font-semibold' : 'text-zinc-400'}>
              {durationText}
            </span>{' '}
            <span className="text-zinc-500 hidden sm:inline">({docsText})</span>
          </span>
          {isActivelyReasoning && (
            <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.2 text-[9px] font-mono text-amber-400 animate-pulse">
              LIVE
            </span>
          )}
        </div>
        <ChevronRight className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {/* Expanded Reasoning Body */}
      {isOpen && (
        <div className="border-t border-white/[0.06] bg-black/40 px-3.5 py-3 text-xs font-mono space-y-2.5">
          {/* Progressive Checkmark Steps */}
          <div className="space-y-2">
            {steps.map((step) => {
              const isRunning = step.status === 'running';
              const isSuccess = step.status === 'success';

              return (
                <div key={step.id || step.text} className="flex items-start gap-2">
                  {isSuccess ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : isRunning ? (
                    <Loader2 className="h-3.5 w-3.5 text-amber-400 animate-spin shrink-0 mt-0.5" />
                  ) : (
                    <Info className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  )}
                  <span className={
                    isRunning
                      ? 'text-amber-200 font-medium'
                      : isSuccess
                        ? 'text-zinc-300'
                        : 'text-zinc-500'
                  }>
                    {step.text || step.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Live / Persisted Metacognitive Token Stream */}
          {activeThoughtTrace && (
            <div className="mt-3 pt-2.5 border-t border-white/[0.06]">
              {!isLive && (
                <button
                  onClick={() => setShowRawThoughts(!showRawThoughts)}
                  className="text-[10px] font-sans font-medium text-amber-400/90 hover:text-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer mb-1.5"
                >
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  <span>{showRawThoughts ? 'Hide Internal Reasoning' : 'View Metacognitive Trace (<thought>)'}</span>
                  <ChevronRight className={`h-3 w-3 transition-transform ${showRawThoughts ? 'rotate-90' : ''}`} />
                </button>
              )}

              {showRawThoughts && (
                <div className="space-y-1">
                  {isLive && (
                    <div className="flex items-center gap-1.5 text-[10px] font-sans font-medium text-amber-400/90 mb-1">
                      <Sparkles className="h-3 w-3 text-amber-400 animate-pulse" />
                      <span>Live Cognitive Stream (&lt;thought&gt;)</span>
                    </div>
                  )}
                  <pre className="whitespace-pre-wrap text-[11px] text-zinc-300 font-mono bg-zinc-950/80 p-3 rounded-lg border border-amber-500/20 leading-relaxed overflow-x-auto max-h-60 overflow-y-auto">
                    {activeThoughtTrace}
                    {isActivelyReasoning && (
                      <span className="inline-block w-1.5 h-3.5 bg-amber-400 animate-pulse ml-1 align-middle" />
                    )}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
