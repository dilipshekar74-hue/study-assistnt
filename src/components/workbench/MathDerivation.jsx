/**
 * MathDerivation.jsx
 * Multi-step KaTeX derivation cards with step validation badges, pedagogical variable notes,
 * and collapsible Socratic hints.
 * Adheres strictly to .agents/rules/ui-pedagogy-sync.md and .agents/rules/edtech-pedagogy.md
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, HelpCircle, Lightbulb, Calculator, AlertTriangle, ArrowRight } from 'lucide-react';
import KatexMath, { FormattedMathText } from '../KatexMath';

const DEFAULT_DERIVATION_STEPS = [
  {
    stepNumber: 1,
    title: 'Work-Kinetic Energy Theorem Definition',
    formula: 'W_{\\text{net}} = \\Delta K = K_f - K_i',
    status: 'validated',
    explanation: 'The total work done by all forces equals the change in translational kinetic energy of the object.',
    pedagogicalHint: 'Consider whether any non-conservative forces (such as friction or thermal dissipation) are present in the problem description.'
  },
  {
    stepNumber: 2,
    title: 'Differential Work Integral Setup',
    formula: 'W_{\\text{net}} = \\int_{x_i}^{x_f} F_{\\text{net}}(x) \\, dx = \\int_{x_i}^{x_f} m \\frac{dv}{dt} \\, dx',
    status: 'validated',
    explanation: 'Expressing the net force via Newton’s second law allows linking position displacement dx directly with velocity differential dv.',
    pedagogicalHint: 'Use the chain rule identity: (dv/dt) dx = v dv.'
  },
  {
    stepNumber: 3,
    title: 'Velocity Space Transformation',
    formula: 'W_{\\text{net}} = m \\int_{v_i}^{v_f} v \\, dv',
    status: 'needs_action',
    explanation: 'Notice how changing integration variables shifts the limits from spatial coordinates (x_i, x_f) to velocity vectors (v_i, v_f).',
    pedagogicalHint: 'Evaluate the polynomial integral of v^1 with respect to v.'
  },
  {
    stepNumber: 4,
    title: 'Final Integrated Kinetic Energy Form',
    formula: 'W_{\\text{net}} = \\frac{1}{2} m v_f^2 - \\frac{1}{2} m v_i^2 = \\Delta K',
    status: 'locked',
    explanation: 'The fundamental scalar equation relating mass, speed, and force work (with units in Joules J = kg·m²/s²).',
    pedagogicalHint: 'Solve Step 3 before unlocking this step verification.'
  }
];

export default function MathDerivation({ artifact }) {
  const [activeStepIndex, setActiveStepIndex] = useState(2);
  const [revealedHints, setRevealedHints] = useState({});

  const steps = artifact?.metadata?.steps || DEFAULT_DERIVATION_STEPS;
  const singleFormula = artifact?.content;

  const toggleHint = (index) => {
    setRevealedHints((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleValidateStep = (index) => {
    if (activeStepIndex === index) {
      setActiveStepIndex(index + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Primary Display Anchor if dynamic content provided */}
      {singleFormula && !artifact?.metadata?.steps && (
        <div className="rounded-2xl border border-indigo-500/30 bg-zinc-950/80 p-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-mono uppercase tracking-wider text-indigo-400">
                {artifact.title || 'Mathematical Derivation Canvas'}
              </span>
            </div>
            <span className="rounded bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
              {artifact.metadata?.status || 'Validated Step'}
            </span>
          </div>

          <div className="py-6 px-4 text-center rounded-xl bg-zinc-900/50 border border-white/[0.04] overflow-x-auto">
            <KatexMath
              math={singleFormula}
              block={true}
              className="text-xl sm:text-2xl md:text-3xl text-zinc-100"
            />
          </div>

          {artifact.metadata?.pedagogicalNote && (
            <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-xs text-zinc-400 leading-relaxed">
              <strong className="text-indigo-300">Pedagogical Variable Note: </strong>
              <FormattedMathText text={artifact.metadata.pedagogicalNote} />
            </div>
          )}
        </div>
      )}

      {/* Progressive Step Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
            Derivation Progression ({steps.length} Steps)
          </span>
          <span className="text-xs text-indigo-400 font-mono">
            Step {Math.min(activeStepIndex + 1, steps.length)} of {steps.length}
          </span>
        </div>

        {steps.map((step, index) => {
          const isLocked = index > activeStepIndex;
          const isCurrent = index === activeStepIndex;
          const isValidated = index < activeStepIndex;

          return (
            <motion.div
              key={step.stepNumber || index}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: isLocked ? 0.45 : 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.06 }}
              className={`rounded-2xl border transition-all ${
                isCurrent
                  ? 'border-indigo-500/40 bg-zinc-900/80 shadow-[0_0_30px_rgba(99,102,241,0.12)]'
                  : isValidated
                  ? 'border-emerald-500/20 bg-zinc-900/50'
                  : 'border-white/[0.05] bg-zinc-950/40'
              } p-5`}
            >
              {/* Step Card Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full font-mono text-xs font-semibold ${
                    isValidated
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : isCurrent
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/40'
                      : 'bg-white/[0.06] text-zinc-400'
                  }`}>
                    {step.stepNumber || index + 1}
                  </span>
                  <h3 className="text-sm font-medium text-zinc-200">{step.title}</h3>
                </div>

                <div>
                  {isValidated && (
                    <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3" />
                      Validated
                    </span>
                  )}
                  {isCurrent && (
                    <span className="flex items-center gap-1 rounded bg-indigo-500/10 px-2 py-0.5 text-[11px] font-medium text-indigo-400 border border-indigo-500/20 animate-pulse">
                      Active Step
                    </span>
                  )}
                  {isLocked && (
                    <span className="rounded bg-white/[0.04] px-2 py-0.5 text-[11px] font-mono text-zinc-500">
                      Pending Step
                    </span>
                  )}
                </div>
              </div>

              {/* Display LaTeX Formula Container */}
              <div className="my-3 rounded-xl border border-white/[0.04] bg-zinc-950/70 py-3.5 px-5 text-center font-mono text-base text-zinc-100 overflow-x-auto">
                <KatexMath math={step.formula} block={true} className="text-indigo-200 text-lg" />
              </div>

              {/* Step Explanation */}
              {!isLocked && step.explanation && (
                <p className="text-xs leading-relaxed text-zinc-400 mb-3">
                  {step.explanation}
                </p>
              )}

              {/* Interactive Scaffolding Discovery Controls */}
              {!isLocked && (
                <div className="pt-2 border-t border-white/[0.04] flex flex-wrap items-center justify-between gap-3">
                  {step.pedagogicalHint && (
                    <button
                      onClick={() => toggleHint(index)}
                      className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                    >
                      <Lightbulb className="h-3.5 w-3.5" />
                      <span>{revealedHints[index] ? 'Hide Socratic Hint' : 'Reveal Socratic Hint'}</span>
                    </button>
                  )}

                  {isCurrent && (
                    <button
                      onClick={() => handleValidateStep(index)}
                      className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all cursor-pointer ml-auto"
                    >
                      <span>Verify & Continue</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}

              {/* Collapsible Scaffolding Hint */}
              <AnimatePresence>
                {revealedHints[index] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 overflow-hidden rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-3 text-xs text-indigo-200"
                  >
                    <div className="flex items-start gap-2">
                      <HelpCircle className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold text-indigo-300">Scaffolding Prompt: </strong>
                        {step.pedagogicalHint}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
