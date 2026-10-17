import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Binary,
  Terminal,
  Camera,
  Award,
  BookOpen,
  ArrowRight,
  Paperclip,
  Mic,
  Sliders,
  ShieldAlert,
  Zap,
  GraduationCap
} from 'lucide-react';
import { useAstraStore } from '../../store/useAstraStore';

/**
 * WelcomingDashboard
 * Gemini-style empty-state welcoming dashboard for new sessions in ved.ai.
 * Adheres strictly to .agents/rules/welcoming-dashboard.md & .agents/rules/ved-ui-system.md
 */
export default function WelcomingDashboard({ onSelectPrompt, userProfile }) {
  const [inputText, setInputText] = useState('');
  const {
    user,
    socraticFriction,
    setSocraticFriction,
    openArtifact,
    setModality,
    setHudState
  } = useAstraStore();

  // Dynamic Time-of-Day Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const scholarName =
    userProfile?.fullName ||
    userProfile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Scholar';

  // 6-Card Interactive Bento Grid Configuration per welcoming-dashboard.md
  const BENTO_CARDS = [
    {
      id: 'svd',
      title: 'Deconstruct SVD & Gram Matrix',
      subject: 'Linear Algebra',
      badge: 'STEM Derivation',
      icon: Binary,
      color: 'indigo',
      gradeContext: 'Undergraduate / GATE DA',
      academicLevel: 'Undergraduate',
      major: 'Linear Algebra & Data Science',
      description: 'Deconstruct A = U Σ Vᵀ and trace spectral properties of the Gramian AᵀA.',
      prompt: 'Deconstruct the Singular Value Decomposition (SVD) of a matrix A and derive its connection to the Gram matrix AᵀA.',
      artifact: {
        id: 'art-svd',
        isOpen: true,
        type: 'math',
        title: 'SVD & Gram Matrix Derivation',
        content: 'A = U \\Sigma V^T \\implies A^T A = (V \\Sigma^T U^T)(U \\Sigma V^T) = V \\Sigma^2 V^T',
        language: 'latex',
        metadata: {
          step: 'Spectral Decomposition',
          status: 'In Progress',
          pedagogicalNote: 'Notice that the eigenvectors of AᵀA correspond directly to the right singular vectors V.'
        }
      }
    },
    {
      id: 'graph',
      title: 'Debug Graph Traversal',
      subject: 'Python Sandbox',
      badge: 'Code & Algorithms',
      icon: Terminal,
      color: 'emerald',
      gradeContext: 'Undergraduate Computer Science',
      academicLevel: 'Undergraduate',
      major: 'Algorithms & Data Structures',
      description: 'Trace cycle detection and shortest path routing on directed graphs.',
      prompt: 'Debug this Python graph traversal algorithm for detecting cycles in a directed graph using DFS and recursion stack.',
      artifact: {
        id: 'art-graph',
        isOpen: true,
        type: 'code',
        title: 'Directed Graph Cycle Detection',
        content: `def has_cycle(graph):\n    visited = set()\n    rec_stack = set()\n\n    def dfs(node):\n        visited.add(node)\n        rec_stack.add(node)\n        for neighbor in graph.get(node, []):\n            if neighbor not in visited:\n                if dfs(neighbor):\n                    return True\n            elif neighbor in rec_stack:\n                return True\n        rec_stack.remove(node)\n        return False\n\n    for node in graph:\n        if node not in visited:\n            if dfs(node):\n                return True\n    return False`,
        language: 'python',
        metadata: {
          step: 'Recursion Stack Analysis',
          status: 'Active Sandbox',
          pedagogicalNote: 'Consider what happens when disconnected components are present.'
        }
      }
    },
    {
      id: 'vision',
      title: 'Point Camera at Problem',
      subject: 'Spatial Multimodal',
      badge: 'Vision HUD Scan',
      icon: Camera,
      color: 'cyan',
      gradeContext: 'Spatial Multimodal Vision',
      academicLevel: 'Undergraduate',
      major: 'Physics & Applied Mathematics',
      description: 'Activate spatial viewfinder to recognize handwritten math, circuits, or diagrams.',
      prompt: 'Activate Astra Vision HUD to scan and extract a textbook problem from camera stream.',
      isVisionTrigger: true,
      artifact: {
        id: 'art-vision',
        isOpen: true,
        type: 'math',
        title: 'Astra Optical Math Viewfinder',
        content: '\\text{Viewfinder Active: Align formula within cyan reticle to vectorize LaTeX}',
        language: 'latex',
        metadata: {
          step: 'Optical Formula Extraction',
          status: 'Scanning',
          pedagogicalNote: 'Hold textbook page flat under adequate ambient lighting for optical token recognition.'
        }
      }
    },
    {
      id: 'gate',
      title: 'GATE DA 2-Mark NAT Challenge',
      subject: 'Exam Mode',
      badge: 'GATE DA NAT',
      icon: Award,
      color: 'amber',
      gradeContext: 'GATE DA / Competitive Exam',
      academicLevel: 'GATE DA / Competitive Exam',
      major: 'Data Science & Artificial Intelligence',
      description: 'Tackle a high-weightage numerical question with strict decimal tolerances.',
      prompt: 'Generate a GATE Data Science & AI (DA) 2-Mark NAT challenge on eigenvalues and condition numbers with numerical bounds.',
      artifact: {
        id: 'art-gate',
        isOpen: true,
        type: 'math',
        title: 'GATE DA NAT: Condition Number & Eigenvalues',
        content: '\\kappa(A) = \\frac{\\sigma_{\\max}(A)}{\\sigma_{\\min}(A)} \\quad \\text{for } A = \\begin{pmatrix} 6 & 2 \\\\ 2 & 3 \\end{pmatrix}',
        language: 'latex',
        metadata: {
          step: 'Timed NAT Challenge: 3.0 Minutes',
          status: 'Numerical Answer Type',
          pedagogicalNote: 'Compute eigenvalues of A via det(A - λI) = 0 to find spectral condition ratio.'
        }
      }
    },
    {
      id: 'bayes',
      title: 'Bayes Theorem Revision Sheet',
      subject: 'Study Notes',
      badge: 'Concept Notes',
      icon: BookOpen,
      color: 'violet',
      gradeContext: 'Undergraduate / Senior High STEM',
      academicLevel: 'Undergraduate',
      major: 'Probability & Statistics',
      description: 'Structure a revision summary connecting priors, likelihood, evidence, and posteriors.',
      prompt: 'Create a Socratic revision study matrix for Bayes Theorem with conditional derivations and typical exam traps.',
      artifact: {
        id: 'art-bayes',
        isOpen: true,
        type: 'notes',
        title: 'Bayes Theorem Revision Matrix',
        content: `# Bayes Theorem Revision Matrix\n\n$$P(A|B) = \\frac{P(B|A)P(A)}{P(B)}$$\n\n### Core Components:\n- **Prior $P(A)$**: Initial degree of belief before observing data.\n- **Likelihood $P(B|A)$**: Probability of observing evidence given hypothesis.\n- **Marginal Evidence $P(B)$**: Normalizing constant $\\sum P(B|A_i)P(A_i)$.\n- **Posterior $P(A|B)$**: Updated belief after accounting for evidence.\n\n> **Key Pitfall**: Neglecting base rates (Base Rate Fallacy).`,
        language: 'markdown',
        metadata: {
          step: 'Concept Summary Sheet',
          status: 'Synthesized Notes',
          pedagogicalNote: 'Notice how the evidence in denominator normalizes the posterior to a true probability distribution.'
        }
      }
    },
    {
      id: 'teardown',
      title: 'Socratic Concept Teardown',
      subject: 'Physics / Calculus',
      badge: 'Zero Turnkey',
      icon: Sparkles,
      color: 'rose',
      gradeContext: 'JEE Advanced / Senior High Physics',
      academicLevel: 'JEE / Senior High',
      major: 'Physics & Vector Calculus',
      description: 'Withhold direct answers and initiate Level 1 diagnosis on governing physical laws.',
      prompt: 'Initiate a strict Level 1 Socratic teardown on conservative force fields and line integral path independence.',
      artifact: {
        id: 'art-teardown',
        isOpen: true,
        type: 'math',
        title: 'Conservative Vector Field Teardown',
        content: '\\oint_C \\vec{F} \\cdot d\\vec{r} = 0 \\iff \\vec{\\nabla} \\times \\vec{F} = \\vec{0} \\iff \\vec{F} = -\\vec{\\nabla} U',
        language: 'latex',
        metadata: {
          step: 'Level 1: Concept Diagnosis',
          status: 'Zero Turnkey Mode',
          pedagogicalNote: 'State whether path independence holds on multiply-connected domains with singularities.'
        }
      }
    }
  ];

  const handleCardClick = (card) => {
    if (card.isVisionTrigger) {
      setModality('vision');
    }
    if (card.artifact) {
      openArtifact(card.artifact);
    }
    if (onSelectPrompt) {
      onSelectPrompt(card.prompt, card.artifact, {
        gradeContext: card.gradeContext,
        academicLevel: card.academicLevel,
        subject: card.subject,
        major: card.major,
        title: card.title
      });
    }
  };

  const handleInputSubmit = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    const query = inputText.trim();
    setInputText('');
    if (onSelectPrompt) {
      onSelectPrompt(query);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, transition: { duration: 0.25 } }}
      className="relative flex min-h-[calc(100vh-4rem)] w-full flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8 select-none"
    >
      <div className="w-full max-w-4xl space-y-8">
        
        {/* Top Greeting Header */}
        <div className="space-y-3 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
            className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/40 px-3.5 py-1 text-xs font-medium text-indigo-300 backdrop-blur-md shadow-inner"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
            <span>Astra Socratic Engine • Active Session Ready</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-zinc-100 to-cyan-300 leading-tight"
          >
            {getGreeting()}, {scholarName}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-sm sm:text-base text-zinc-400 font-normal"
          >
            Where shall we direct your focus today?
          </motion.p>
        </div>

        {/* Socratic Friction Selector Pills */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center gap-2"
        >
          <div className="flex items-center gap-1.5 rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-1 backdrop-blur-xl shadow-lg">
            <span className="flex items-center gap-1 px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-zinc-500">
              <Sliders className="h-3 w-3 text-indigo-400" />
              Socratic Friction:
            </span>

            {[
              { id: 'gentle', label: 'Gentle', desc: 'Guided visual hints', icon: Zap },
              { id: 'standard', label: 'Standard', desc: 'Progressive disclosure ladder', icon: GraduationCap },
              { id: 'rigorous', label: 'Rigorous', desc: 'Zero direct turnkey derivations', icon: ShieldAlert }
            ].map(({ id, label, icon: Icon }) => {
              const active = socraticFriction === id;
              return (
                <button
                  key={id}
                  onClick={() => setSocraticFriction(id)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className={`h-3 w-3 ${active ? 'text-white' : 'text-zinc-500'}`} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* 6-Card Interactive Bento Grid */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {BENTO_CARDS.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.id}
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCardClick(card)}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-zinc-900/50 p-4 text-left backdrop-blur-xl shadow-lg hover:border-indigo-500/40 hover:bg-zinc-800/60 hover:shadow-indigo-500/10 transition-all cursor-pointer"
              >
                {/* Glow bloom on hover */}
                <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="rounded-full border border-white/[0.08] bg-white/[0.02] px-2 py-0.5 text-[10px] font-mono text-zinc-400 group-hover:border-indigo-500/30 group-hover:text-indigo-300 transition-colors">
                      {card.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">
                      {card.title}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-400 leading-relaxed line-clamp-2">
                      {card.description}
                    </p>
                  </div>
                </div>

                <div className="mt-3.5 flex items-center justify-between border-t border-white/[0.06] pt-2.5 text-[11px] font-medium text-zinc-500 group-hover:text-indigo-300 transition-colors">
                  <span>{card.subject}</span>
                  <ArrowRight className="h-3 w-3 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Centered Astra Input Dock */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <form
            onSubmit={handleInputSubmit}
            className="group relative flex items-center rounded-2xl border border-white/10 bg-zinc-900/80 p-2 backdrop-blur-2xl shadow-2xl focus-within:border-indigo-500/60 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all"
          >
            {/* Left Action Buttons */}
            <div className="flex items-center gap-1 pl-1 text-zinc-400">
              <button
                type="button"
                className="rounded-xl p-2 hover:bg-white/[0.06] hover:text-zinc-200 transition-colors cursor-pointer"
                title="Attach Document or Problem PDF"
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setModality('vision')}
                className="rounded-xl p-2 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors cursor-pointer"
                title="Activate Spatial Camera Viewfinder"
              >
                <Camera className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setHudState('listening')}
                className="rounded-xl p-2 hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors cursor-pointer"
                title="Activate Astra Voice HUD"
              >
                <Mic className="h-4 w-4" />
              </button>
            </div>

            {/* Main Input Text */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask ved.ai anything, paste LaTeX, or explore the bento cards above..."
              className="w-full bg-transparent px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30 hover:brightness-110 active:scale-95 disabled:opacity-30 disabled:hover:brightness-100 transition-all cursor-pointer"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Privacy & Tenant Badge */}
          <div className="mt-2.5 flex items-center justify-center gap-4 text-[11px] font-mono text-zinc-500">
            <span>KaTeX Derivation Engine</span>
            <span>•</span>
            <span>RLS Isolated Tenant</span>
            <span>•</span>
            <span>Socratic Progressive Ladder</span>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
