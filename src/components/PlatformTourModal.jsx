import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  GraduationCap,
  Layers,
  Zap,
  Award,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  ArrowRight,
  BookOpen,
  MessageSquare,
  Calculator,
  Terminal,
  Eye,
  FileCheck
} from 'lucide-react';

export const PLATFORM_TOUR_STEPS = [
  {
    step: 1,
    title: 'Dual-Pane Learning Core (40% / 60%)',
    badge: 'Astra Architecture',
    icon: Sparkles,
    gradient: 'from-indigo-500 to-violet-600',
    borderGlow: 'border-indigo-500/40 shadow-indigo-500/20',
    description:
      'Unlike generic chatbots that dump unreadable walls of text, ved.ai splits your workspace into a 40/60 dual-pane cockpit. The left 40% delivers step-by-step Socratic dialogue that never gives away final answers on Turn 1, while the right 60% renders high-fidelity mathematical derivations, runnable code, and study guides.',
    highlights: [
      'Left 40% Socratic stream adheres strictly to the 3-Chunk Rule (max 3 sentences per block)',
      'Right 60% canvas mounts KaTeX formula cards, Python sandboxes, and study flashcards',
      'Zero cognitive overload: Complex proofs automatically route to the right workbench'
    ],
    previewPill: '40% Socratic Chat • 60% KaTeX Workbench'
  },
  {
    step: 2,
    title: 'Multi-Tier Custom LLM Engine (Ved-Core)',
    badge: 'Grade 1 to Master’s & GATE DA',
    icon: GraduationCap,
    gradient: 'from-cyan-500 to-blue-600',
    borderGlow: 'border-cyan-500/40 shadow-cyan-500/20',
    description:
      'Ved-Core dynamically calibrates vocabulary, mathematical depth, and scaffolding across 6 academic tiers. An elementary student receives playful pizza slice analogies, a high schooler gets rigorous NCERT/AP calculus with units, and university students receive asymptotic proofs and line-by-line bug diffs.',
    highlights: [
      'Grades 1–5 (Primary): Playful 2-option discovery questions and visual counting blocks',
      'Grades 6–12: NCERT/CBSE/AP academic rigor with LaTeX equation skeletons and units',
      'University CS/STEM & IIT GATE DA: Time/space complexity proofs and IIT question setters\' trap detection'
    ],
    previewPill: 'Adaptive Scaffolding • 6 Tier Profiles'
  },
  {
    step: 3,
    title: 'Dual Modes: Regular Socratic LLM vs. Chapters',
    badge: 'Flexible Study Flow',
    icon: Layers,
    gradient: 'from-amber-500 to-orange-600',
    borderGlow: 'border-amber-500/40 shadow-amber-500/20',
    description:
      'You are never locked into one learning style. You can launch ved.ai as an open-ended Regular Socratic LLM to ask questions on any academic topic or debug custom code, or switch instantly to structured Chapter Slide Decks with embedded YouTube video lectures and textbook citations.',
    highlights: [
      '🤖 Regular Socratic LLM: Open research, code debugging, and instant derivations',
      '📚 Chapter Slides & YouTube: Curated syllabus, video lectures & timestamp bookmarks',
      'Seamless 1-click toggle in the top navigation bar at any moment'
    ],
    previewPill: '1-Click Mode Switcher • Open LLM or Curated Syllabus'
  },
  {
    step: 4,
    title: 'Multimodal Astra HUD & Self-Healing KaTeX',
    badge: 'Real-Time Presence',
    icon: Zap,
    gradient: 'from-emerald-500 to-teal-600',
    borderGlow: 'border-emerald-500/40 shadow-emerald-500/20',
    description:
      'Experience ambient intelligence with our floating Astra HUD pill that reflects idle, listening, thinking, and speaking states. Our KaTeX engine includes self-healing LaTeX sanitization so multiline matrices and fill-in-the-blank steps never break syntax.',
    highlights: [
      '4-State Ambient HUD: Subtle idle pulsing, audio frequency bars, thinking orbits, and speech glow',
      'Spatial Vision HUD: Camera & screen OCR bounding-box recognition for textbook problems',
      'Self-healing LaTeX sanitizer: Prevents KaTeX parse errors on blanks and equation placeholders'
    ],
    previewPill: 'Ambient HUD • Self-Healing KaTeX • Vision Viewfinder'
  },
  {
    step: 5,
    title: 'Assignment Lab & IIT GATE DA Simulator',
    badge: 'Mastery & Exam Ready',
    icon: Award,
    gradient: 'from-rose-500 to-pink-600',
    borderGlow: 'border-rose-500/40 shadow-rose-500/20',
    description:
      'Turn theoretical knowledge into verified mastery. Submit assignments for automated keyword and rubric scoring, or engage the IIT GATE DA exam simulator with TCS iON calculator replica, distractor trap analysis, and 30-second verification shortcuts.',
    highlights: [
      'Automated Rubric Scoring: Instant evaluation, feedback, and database sync',
      'GATE DA Exam Simulator: MCQ/MSQ/NAT format with IIT trap detection and <30s shortcuts',
      'Database Telemetry: Real-time event logging synced with Supabase Postgres'
    ],
    previewPill: 'Auto-Graded Labs • GATE DA Simulator • IIT Trap Decoders'
  }
];

export default function PlatformTourModal({
  isOpen,
  onClose,
  onStartRegularLlm,
  onStartCurriculum
}) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const current = PLATFORM_TOUR_STEPS[currentStep];
  const StepIcon = current.icon;
  const isFirst = currentStep === 0;
  const isLast = currentStep === PLATFORM_TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (!isLast) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-xl"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-white/[0.12] bg-zinc-950/95 p-6 sm:p-8 shadow-[0_0_80px_rgba(99,102,241,0.25)] text-zinc-100"
        >
          {/* Top Bar with Step Counter & Close */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-md shadow-indigo-500/25">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold tracking-tight text-white">ved.ai Platform Tour</h3>
                  <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-mono text-indigo-400">
                    Step {currentStep + 1} of {PLATFORM_TOUR_STEPS.length}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">Interactive Walkthrough of Astra Engine & Socratic Workbench</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-full p-2 text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              title="Close Tour"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Active Step Content with Animated Switch */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current.step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Feature Header Card */}
              <div className="flex items-start gap-4 rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-5 backdrop-blur-xl">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr ${current.gradient} shadow-lg`}
                >
                  <StepIcon className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-1">
                  <span className="inline-block rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-zinc-300">
                    {current.badge}
                  </span>
                  <h2 className="text-lg font-semibold tracking-tight text-white">{current.title}</h2>
                  <p className="text-xs text-zinc-300 leading-relaxed">{current.description}</p>
                </div>
              </div>

              {/* Highlights List */}
              <div className="space-y-2.5">
                <h4 className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                  Key Capabilities & Invariants
                </h4>
                <div className="space-y-2">
                  {current.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-xl border border-white/[0.05] bg-zinc-900/40 p-3 text-xs text-zinc-200"
                    >
                      <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                        <Check className="h-2.5 w-2.5" />
                      </div>
                      <span className="leading-snug">{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Preview Micro-Badge */}
              <div className="flex items-center justify-between rounded-xl border border-indigo-500/20 bg-indigo-950/20 px-4 py-2 text-xs">
                <span className="text-zinc-400">Feature Status:</span>
                <span className="font-mono text-indigo-300 font-medium">✓ {current.previewPill}</span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Stepper Dots & Navigation Controls */}
          <div className="mt-8 pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Step Dots */}
            <div className="flex items-center gap-1.5">
              {PLATFORM_TOUR_STEPS.map((step, idx) => (
                <button
                  key={step.step}
                  onClick={() => setCurrentStep(idx)}
                  className={`h-2 rounded-full transition-all ${
                    currentStep === idx
                      ? 'w-7 bg-indigo-500 shadow-sm shadow-indigo-500/50'
                      : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                  }`}
                  title={`Go to step ${step.step}: ${step.title}`}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {!isFirst && (
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-1 rounded-xl border border-white/10 bg-zinc-900/70 hover:bg-zinc-800 px-3.5 py-2 text-xs font-medium text-zinc-300 transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
              )}

              {!isLast ? (
                <>
                  <button
                    onClick={onClose}
                    className="rounded-xl border border-white/[0.08] bg-transparent hover:bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-all"
                  >
                    Skip Tour
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-4 py-2 text-xs font-medium text-white shadow-lg shadow-indigo-500/25 transition-all"
                  >
                    <span>Next Feature</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      onClose();
                      if (onStartRegularLlm) onStartRegularLlm();
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-4 py-2.5 text-xs font-medium text-white shadow-lg shadow-indigo-500/30 transition-all"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Start as Regular Socratic LLM</span>
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      if (onStartCurriculum) onStartCurriculum();
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800 px-4 py-2.5 text-xs font-medium text-zinc-200 hover:text-white transition-all"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Start Chapter Curriculum</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
