/**
 * ArtifactCanvas.jsx
 * Multi-Mode Right-Pane Artifact Workbench dynamically rendering 4 specialized engines:
 * 1. MathDerivation ('math'): KaTeX derivation cards with validation states
 * 2. CodeRunner ('code'): Python 3 sandbox with dry-run state tables & complexity badges
 * 3. StudyNotes ('notes'): Markdown study matrix with active recall flip flashcards
 * 4. GateDaWorkbench ('gate_simulator'): Admin GATE DA exam simulator with virtual keypad & trap decoder
 * 
 * Adheres strictly to .agents/rules/ui-pedagogy-sync.md and .agents/rules/gemini.md
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  Code2,
  BookOpen,
  Zap,
  Copy,
  Check,
  X,
  Cloud,
  Loader2,
  Layers
} from 'lucide-react';
import { useAstraStore } from '../../store/useAstraStore';
import { useSessionStore } from '../../store/useSessionStore';
import { useVedStore } from '../../store/useVedStore';
import MathDerivation from './MathDerivation';
import CodeRunner from './CodeRunner';
import StudyNotes from './StudyNotes';
import GateDaWorkbench from './GateDaWorkbench';
import { saveArtifact, subscribeToArtifacts } from '../../services/artifactService';

export default function ArtifactCanvas({ artifact: propArtifact, onClose, onUpdateContent }) {
  const { activeArtifact: vedArtifact, updateActiveArtifact: vedUpdate, closeArtifact: vedClose } = useVedStore();
  const { activeArtifact: astraArtifact, closeArtifact: astraClose, updateArtifactContent: astraUpdate } = useAstraStore();
  const { sessions, activeSessionId, updateActiveArtifact: sessionUpdate } = useSessionStore();

  const currentSessionArtifact = activeSessionId && sessions[activeSessionId] ? sessions[activeSessionId].artifact : null;
  const activeArtifact = propArtifact || currentSessionArtifact || vedArtifact || astraArtifact || {
    isOpen: true,
    type: 'math',
    title: 'Derivation Canvas',
    content: '',
    metadata: {}
  };

  const closeArtifact = onClose || (() => {
    vedClose();
    sessionUpdate({ isOpen: false });
    astraClose();
  });

  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [synced, setSynced] = useState(false);

  // Real-time Supabase subscription
  useEffect(() => {
    if (!activeArtifact?.id) return;
    const unsubscribe = subscribeToArtifacts((payload) => {
      if (payload.new && payload.new.id === activeArtifact.id) {
        if (payload.new.content && payload.new.content !== activeArtifact.content) {
          if (onUpdateContent) onUpdateContent(payload.new.content);
          vedUpdate({ content: payload.new.content });
        }
      }
    });

    return () => unsubscribe();
  }, [activeArtifact?.id, activeArtifact?.content, onUpdateContent, vedUpdate]);

  const handleCopy = () => {
    if (activeArtifact?.content) {
      navigator.clipboard.writeText(activeArtifact.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveToCloud = async () => {
    setSaving(true);
    const { error } = await saveArtifact(activeArtifact);
    setSaving(false);
    if (!error) {
      setSynced(true);
      setTimeout(() => setSynced(false), 3000);
    }
  };

  const getWorkbenchIcon = (type) => {
    switch (type) {
      case 'math':
        return <Calculator className="h-4 w-4 text-indigo-400" />;
      case 'code':
        return <Code2 className="h-4 w-4 text-cyan-400" />;
      case 'notes':
        return <BookOpen className="h-4 w-4 text-violet-400" />;
      case 'gate_simulator':
        return <Zap className="h-4 w-4 text-rose-400" />;
      default:
        return <Calculator className="h-4 w-4 text-indigo-400" />;
    }
  };

  return (
    <section className="flex flex-1 flex-col h-full border-l border-white/[0.08] bg-zinc-900/30 backdrop-blur-2xl overflow-hidden">
      {/* Workbench Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.08] px-6 bg-zinc-950/40">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] border border-white/[0.08] shrink-0">
            {getWorkbenchIcon(activeArtifact.type)}
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-zinc-100 truncate">
              {activeArtifact.title || 'Interactive Artifact Workbench'}
            </h2>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono">
              <span className="capitalize">{activeArtifact.type || 'math'} Canvas Engine</span>
              {activeArtifact.stepBadge && (
                <>
                  <span>•</span>
                  <span className="text-indigo-400 truncate">{activeArtifact.stepBadge}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSaveToCloud}
            disabled={saving}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            title="Sync with Supabase Cloud"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
            ) : (
              <Cloud className={`h-3.5 w-3.5 ${synced ? 'text-emerald-400' : 'text-indigo-400'}`} />
            )}
            <span className="hidden sm:inline">{saving ? 'Syncing...' : synced ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] rounded-lg transition-colors cursor-pointer"
            title="Copy Content"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </button>

          <button
            onClick={closeArtifact}
            className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] rounded-lg transition-colors cursor-pointer"
            title="Close Workbench"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Dynamic Content Canvas with Framer Motion Spring Transitions */}
      <div className="flex-1 p-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeArtifact.type || 'math'}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="h-full"
          >
            {activeArtifact.type === 'code' ? (
              <CodeRunner artifact={activeArtifact} />
            ) : activeArtifact.type === 'notes' ? (
              <StudyNotes artifact={activeArtifact} />
            ) : activeArtifact.type === 'gate_simulator' ? (
              <GateDaWorkbench artifact={activeArtifact} />
            ) : (
              <MathDerivation artifact={activeArtifact} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Workbench Diagnostic & Telemetry Footer */}
      <footer className="flex h-12 shrink-0 items-center justify-between border-t border-white/[0.08] px-6 text-xs text-zinc-500 font-mono bg-zinc-950/40">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Workbench Engine: <strong className="text-zinc-400 font-normal capitalize">{activeArtifact.type}</strong></span>
        </span>
        <span className="text-zinc-500">Latency: 38ms</span>
      </footer>
    </section>
  );
}
