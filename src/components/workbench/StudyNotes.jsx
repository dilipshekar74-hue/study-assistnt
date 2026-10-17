/**
 * StudyNotes.jsx
 * Structured Markdown study guide with interactive flip flashcards for active recall,
 * key takeaway callouts, and quick-copy triggers.
 * Adheres strictly to .agents/rules/ui-pedagogy-sync.md
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Copy, Check, RotateCw, Sparkles, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import KatexMath, { FormattedMathText } from '../KatexMath';

const DEFAULT_FLASHCARDS = [
  {
    id: 1,
    question: 'What is the Karush-Kuhn-Tucker (KKT) Complementary Slackness condition for SVM?',
    answer: '$$\\alpha_i \\left[ y_i(w^T x_i + b) - 1 \\right] = 0$$ Only active support vectors on the margin planes have $\\alpha_i > 0$. For all other points strictly inside the safe margin, $\\alpha_i = 0$.',
    category: 'Optimization Duality'
  },
  {
    id: 2,
    question: 'When is strong duality guaranteed between primal and dual convex problems?',
    answer: 'Under **Slater’s Condition**: if the objective is convex, inequality constraints $g_i(x) \\le 0$ are convex, equality constraints are affine, and there exists a strictly feasible point $x_0$ such that $g_i(x_0) < 0$.',
    category: 'Convex Analysis'
  },
  {
    id: 3,
    question: 'How does the Gram matrix connect to the Dual SVM representation?',
    answer: '$$K_{ij} = \\langle x_i, x_j \\rangle = x_i^T x_j$$ The dual problem depends purely on inner products between input vectors, allowing non-linear transformations via Mercer Kernel functions $K(x, z) = \\langle \\phi(x), \\phi(z) \\rangle$.',
    category: 'Kernel Methods'
  }
];

export default function StudyNotes({ artifact }) {
  const [viewMode, setViewMode] = useState('notes'); // 'notes' | 'flashcards'
  const [copied, setCopied] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const notesContent = artifact?.content || `# Study Guide\n\nNo notes provided.`;
  const cards = artifact?.metadata?.flashcards || DEFAULT_FLASHCARDS;
  const currentCard = cards[cardIndex] || cards[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(notesContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNextCard = () => {
    setIsFlipped(false);
    setCardIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCardIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Top Header Mode Switcher */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div className="flex items-center rounded-lg bg-zinc-900 border border-white/[0.08] p-1 text-xs">
          <button
            onClick={() => setViewMode('notes')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              viewMode === 'notes' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Study Guide Matrix
          </button>
          <button
            onClick={() => setViewMode('flashcards')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              viewMode === 'flashcards' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="h-3 w-3" />
            <span>Active Recall Flashcards ({cards.length})</span>
          </button>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/[0.08] bg-zinc-900 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Copy Markdown Guide"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-indigo-400" />}
          <span>{copied ? 'Copied' : 'Copy Notes'}</span>
        </button>
      </div>

      {/* Main Content Area */}
      {viewMode === 'notes' ? (
        <div className="flex-1 overflow-y-auto rounded-2xl border border-white/[0.08] bg-zinc-950/80 p-6 shadow-xl space-y-4 text-xs leading-relaxed text-zinc-300">
          <div className="border-b border-white/[0.06] pb-3 flex items-center justify-between">
            <span className="font-mono uppercase text-indigo-400 tracking-wider text-[11px]">
              {artifact?.title || 'Academic Concept Notes'}
            </span>
            <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-mono text-indigo-400 border border-indigo-500/20">
              Markdown Synthesis
            </span>
          </div>

          <div className="prose prose-invert max-w-none text-zinc-300 space-y-3 font-sans text-xs">
            {notesContent.split('\n\n').map((block, idx) => {
              if (block.startsWith('# ')) {
                return <h1 key={idx} className="text-lg font-bold text-white border-b border-white/[0.08] pb-1">{block.slice(2)}</h1>;
              }
              if (block.startsWith('## ')) {
                return <h2 key={idx} className="text-sm font-semibold text-indigo-300 pt-2">{block.slice(3)}</h2>;
              }
              if (block.startsWith('### ')) {
                return <h3 key={idx} className="text-xs font-semibold text-zinc-200">{block.slice(4)}</h3>;
              }
              if (block.includes('$$')) {
                const parts = block.split('$$');
                return (
                  <div key={idx} className="my-2 rounded-xl bg-zinc-900/60 p-3 text-center border border-white/[0.04]">
                    <KatexMath math={parts[1]} block={true} className="text-sm sm:text-base text-indigo-200" />
                  </div>
                );
              }
              return (
                <p key={idx} className="leading-relaxed">
                  <FormattedMathText text={block} />
                </p>
              );
            })}
          </div>

          {artifact?.metadata?.pedagogicalNote && (
            <div className="mt-4 rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-4 text-xs text-indigo-200">
              <strong className="text-indigo-300">Key Takeaway: </strong>
              <FormattedMathText text={artifact.metadata.pedagogicalNote} />
            </div>
          )}
        </div>
      ) : (
        /* Flashcards Flip Mode */
        <div className="flex-1 flex flex-col justify-center items-center p-6 space-y-6">
          <div className="w-full max-w-md">
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-2 font-mono">
              <span>Card {cardIndex + 1} of {cards.length}</span>
              <span className="text-indigo-400">{currentCard.category}</span>
            </div>

            {/* Flip Card Container */}
            <motion.div
              onClick={() => setIsFlipped(!isFlipped)}
              className="relative min-h-[260px] w-full rounded-3xl border border-white/[0.12] bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 p-8 shadow-2xl backdrop-blur-2xl cursor-pointer select-none flex flex-col justify-between hover:border-indigo-500/40 transition-colors"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-mono text-indigo-300 border border-indigo-500/20">
                  {isFlipped ? 'Answer & Derivation' : 'Question / Prompt'}
                </span>
                <RotateCw className="h-3.5 w-3.5 text-zinc-500" />
              </div>

              <div className="my-auto py-4 text-center">
                {isFlipped ? (
                  <div className="text-xs sm:text-sm text-zinc-200 leading-relaxed space-y-2">
                    <FormattedMathText text={currentCard.answer} />
                  </div>
                ) : (
                  <h3 className="text-sm sm:text-base font-medium text-white leading-relaxed">
                    {currentCard.question}
                  </h3>
                )}
              </div>

              <div className="text-center text-[11px] text-zinc-500">
                <span>{isFlipped ? 'Click card to flip back to question' : 'Click card to reveal answer & formula'}</span>
              </div>
            </motion.div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevCard}
              className="p-2 rounded-xl border border-white/[0.08] bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Previous Flashcard"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span>{isFlipped ? 'Show Question' : 'Reveal Answer'}</span>
            </button>
            <button
              onClick={handleNextCard}
              className="p-2 rounded-xl border border-white/[0.08] bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Next Flashcard"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
