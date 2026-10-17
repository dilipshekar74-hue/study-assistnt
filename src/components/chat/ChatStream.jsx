import React, { useEffect, useRef } from 'react';
import { Sparkles, User, Lightbulb, BarChart3, AlertTriangle, FlaskConical } from 'lucide-react';
import ReasoningTrace from './ReasoningTrace';
import ActionChips from './ActionChips';
import KatexMath, { FormattedMathText } from '../KatexMath';

export default function ChatStream({
  messages = [],
  onSelectChip,
  isStreaming = false,
  scrollRef,
  className = ''
}) {
  const internalRef = useRef(null);
  const containerRef = scrollRef || internalRef;
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  return (
    <div
      ref={containerRef}
      className={`flex-1 overflow-y-auto px-6 py-6 space-y-6 ${className}`}
    >
      {messages.map((msg) => {
        const isVed = msg.sender === 'ved' || msg.role === 'assistant';
        return (
          <div key={msg.id} className="space-y-3">
            {/* Sender Header & Timestamp */}
            <div className="flex items-center gap-2">
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-md ${
                  isVed
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    : 'bg-zinc-800 text-zinc-300'
                }`}
              >
                {isVed ? (
                  <Sparkles className="h-3 w-3" />
                ) : (
                  <User className="h-3 w-3" />
                )}
              </div>
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${
                  isVed ? 'text-indigo-400' : 'text-zinc-400'
                }`}
              >
                {isVed ? 'ved.ai' : 'You'}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {msg.timestamp}
              </span>
            </div>

            {/* Socratic Assistant Flow */}
            {isVed ? (
              <div className="space-y-3">
                {/* 1. Reasoning Trace Accordion Drawer */}
                {msg.hasReasoning && (
                  <ReasoningTrace
                    latency={msg.reasoningLatency || '1.4s'}
                    indexedDocs={msg.indexedDocs || '2 textbook chapters'}
                    steps={msg.steps}
                    thoughtTrace={msg.thoughtTrace || msg.telemetry?.thoughtTrace}
                  />
                )}

              {/* 2. Socratic Prose Blocks adhering to the 3-Chunk Rule */}
              <div className="p-4 rounded-2xl border border-white/[0.08] bg-zinc-900/40 backdrop-blur-xl shadow-lg space-y-3">
                <div className="text-sm leading-relaxed text-zinc-200 space-y-2.5">
                  {msg.textParagraphs &&
                    msg.textParagraphs.map((para, idx) => (
                      <p key={idx} className="font-normal text-zinc-200">
                        <FormattedMathText text={para} />
                      </p>
                    ))}
                </div>

                {/* Visual Anchor: KaTeX Formula or Skeleton */}
                {msg.inlineFormula && (
                  <div className="mt-3 rounded-xl border border-white/[0.08] bg-zinc-950/70 p-3.5 text-center shadow-inner">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-400/80 block mb-1">
                      Governing Formulation
                    </span>
                    <KatexMath
                      math={msg.inlineFormula}
                      block={true}
                      className="text-indigo-200 font-mono text-sm sm:text-base"
                    />
                  </div>
                )}

                {/* 3. Interactive Elicitation Chips ending every assistant turn */}
                <div className="pt-2 mt-2 border-t border-white/[0.06]">
                  <ActionChips
                    chips={msg.elicitationChips}
                    onSelectChip={(chipQuery) => onSelectChip && onSelectChip(chipQuery)}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* User Message Bubble */
            <div className="p-4 rounded-2xl border border-indigo-500/20 bg-indigo-950/20 text-indigo-100 ml-6 shadow-md">
              <div className="text-sm leading-relaxed space-y-2">
                {msg.textParagraphs &&
                  msg.textParagraphs.map((para, idx) => (
                    <p key={idx}>
                      <FormattedMathText text={para} />
                    </p>
                  ))}
              </div>
            </div>
          )}
        </div>
      );
    })}

      {/* Live Streaming Reasoning Trace & Cognitive Indicator */}
      {isStreaming && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="h-3 w-3 animate-pulse text-indigo-400" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              ved.ai
            </span>
            <span className="text-[10px] text-amber-400 font-mono animate-pulse">
              Reasoning & Verifying...
            </span>
          </div>

          <ReasoningTrace
            isLive={true}
            indexedDocs="Live Socratic Reasoning Pipeline"
          />
        </div>
      )}

      {/* Auto-scroll target */}
      <div ref={bottomRef} />
    </div>
  );
}
