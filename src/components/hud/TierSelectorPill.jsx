/**
 * TierSelectorPill.jsx
 * Interactive Academic Level Selector Pill allowing instant switching across K-12 to Master's tiers.
 * Adheres to .agents/rules/custom-llm-engine.md and .agents/rules/ui-pedagogy-sync.md
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, ChevronDown, Check, Sparkles, BookOpen, Layers } from 'lucide-react';
import { useVedStore } from '../../store/useVedStore.js';
import { ACADEMIC_TIERS } from '../../llm/tierPresets.js';

export default function TierSelectorPill({ onTierChange }) {
  const { activeTier, setTier, loadTierPreset } = useVedStore();
  const [isOpen, setIsOpen] = useState(false);

  const studentTiers = ACADEMIC_TIERS.filter((t) => !t.isAdminOnly);
  const currentTier = ACADEMIC_TIERS.find((t) => t.id === activeTier) || ACADEMIC_TIERS[2];

  const handleSelectTier = (tierId) => {
    setTier(tierId);
    const preset = loadTierPreset(tierId);
    if (onTierChange) {
      onTierChange(tierId, preset);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-zinc-900/70 px-3 py-1.5 text-xs text-zinc-200 hover:border-indigo-500/40 hover:bg-zinc-800/80 hover:text-white transition-all cursor-pointer backdrop-blur-md shadow-sm"
        title="Change Academic Level"
      >
        <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
          <GraduationCap className="h-3 w-3" />
        </div>
        <span className="font-medium truncate max-w-[130px] sm:max-w-[160px]">
          {currentTier.shortName}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-indigo-400' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop dismiss */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Menu */}
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute left-0 top-full mt-2 z-50 w-72 rounded-2xl border border-white/[0.12] bg-zinc-900/95 p-2 shadow-2xl backdrop-blur-2xl"
            >
              <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-zinc-400 border-b border-white/[0.06] flex items-center justify-between">
                <span>Select Academic Tier</span>
                <span className="text-indigo-400">Ved-Core Router</span>
              </div>

              <div className="py-1 space-y-1">
                {studentTiers.map((tier) => {
                  const isSelected = tier.id === activeTier;
                  return (
                    <button
                      key={tier.id}
                      onClick={() => handleSelectTier(tier.id)}
                      className={`flex w-full items-start gap-2.5 rounded-xl px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/30'
                          : 'text-zinc-300 hover:bg-white/[0.06] hover:text-white'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isSelected ? (
                          <Check className="h-3.5 w-3.5 text-indigo-400" />
                        ) : (
                          <div className="h-3.5 w-3.5 rounded-full border border-zinc-600" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-zinc-100 flex items-center justify-between">
                          <span>{tier.name}</span>
                        </div>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-400 line-clamp-2">
                          {tier.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-1 pt-2 border-t border-white/[0.06] px-2 text-[10px] text-zinc-500">
                <span>Selecting a tier updates Socratic vocabulary and loads demonstration state.</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
