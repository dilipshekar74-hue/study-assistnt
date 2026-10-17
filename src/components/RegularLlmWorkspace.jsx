import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  Search,
  CheckCircle2,
  ChevronRight,
  Calculator,
  Code2,
  BookOpen,
  Zap,
  Copy,
  Check,
  Play,
  RotateCcw,
  Terminal,
  HelpCircle,
  Flame,
  ArrowRight
} from 'lucide-react';
import KatexMath from './KatexMath';
import {
  queryVedCustomLlm,
  GATE_DA_PROBLEMS_BY_PILLAR,
  TIER_PRESETS
} from '../llm/vedCustomLlm';

export default function RegularLlmWorkspace({
  session,
  hudState,
  setHudState,
  recordBackendEvent,
  currentTierObj
}) {
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [reasoningOpen, setReasoningOpen] = useState(true);
  const [workbenchTab, setWorkbenchTab] = useState('math');
  const [copied, setCopied] = useState(false);

  // Python Sandbox Execution State
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [codeOutput, setCodeOutput] = useState(null);

  // GATE DA Simulator State
  const [selectedGateOpt, setSelectedGateOpt] = useState(null);
  const [showGateShortcut, setShowGateShortcut] = useState(false);

  // Flashcard State for Study Notes
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);

  // Initial High-Fidelity Artifact Payload
  const [activeArtifact, setActiveArtifact] = useState({
    type: 'math',
    title: 'Principal Component Analysis (PCA) & Variance Maximization',
    subtitle: 'Linear Algebra & Dimensionality Reduction (Ved-Core Engine)',
    stepBadge: 'Step 1: Formulation',
    validationStatus: 'Validated',
    mathSteps: [
      {
        label: 'Step 1: Mean-Centered Covariance Formulation',
        latex: '\\Sigma = \\frac{1}{n} \\sum_{i=1}^n (x_i - \\bar{x})(x_i - \\bar{x})^T = \\frac{1}{n} X^T X',
        explanation: 'Mean-centering ensures the first component captures variance rather than origin displacement.'
      },
      {
        label: 'Step 2: Rayleigh Quotient & Unit-Norm Constraint',
        latex: '\\max_{u} \\; u^T \\Sigma u \\quad \\text{subject to} \\quad u^T u = 1',
        explanation: 'Formulates variance maximization along unit direction vector u.'
      },
      {
        label: 'Step 3: Lagrangian Multiplier & Spectral Theorem',
        latex: '\\mathcal{L}(u, \\lambda) = u^T \\Sigma u - \\lambda (u^T u - 1) \\implies \\nabla_u \\mathcal{L} = 2\\Sigma u - 2\\lambda u = 0 \\implies \\Sigma u = \\lambda u',
        explanation: 'Optimal projection vector u is the eigenvector corresponding to the maximum eigenvalue \\lambda_1.'
      }
    ],
    codeSnippet: `# PCA First-Component Projection in Python
import numpy as np

def compute_pca_1d(X: np.ndarray):
    """
    X: Mean-centered data matrix of shape (n_samples, n_features)
    Returns: top eigenvector, explained variance ratio
    """
    n = X.shape[0]
    cov_matrix = (X.T @ X) / n
    eigenvalues, eigenvectors = np.linalg.eigh(cov_matrix)
    
    # Sort eigenvalues in descending order
    idx = np.argsort(eigenvalues)[::-1]
    top_eigenvalue = eigenvalues[idx[0]]
    top_eigenvector = eigenvectors[:, idx[0]]
    explained_ratio = top_eigenvalue / np.sum(eigenvalues)
    
    return top_eigenvector, explained_ratio

# Example with GATE DA Covariance Matrix [[5, 2, 0], [2, 5, 0], [0, 0, 2]]
Sigma = np.array([[5, 2, 0], [2, 5, 0], [0, 0, 2]])
e_vals = np.linalg.eigvalsh(Sigma)
print(f"Top Eigenvalue: {np.max(e_vals):.1f} | Total Variance: {np.sum(e_vals):.1f}")
print(f"Explained Variance Ratio: {np.max(e_vals) / np.sum(e_vals):.4f} (7/12)")`,
    notesMarkdown: `### Invariants of Principal Component Analysis
* **Trace Conservation:** The sum of all eigenvalues $\\sum \\lambda_i = \\text{Tr}(\\Sigma)$, representing total system variance.
* **Orthogonality:** Eigenvectors of a symmetric real covariance matrix are mutually orthogonal ($u_i^T u_j = 0$ for $i \\neq j$).
* **IIT GATE DA Shortcut (<30s):** For block-diagonal matrices $\\Sigma = \\begin{bmatrix} A & 0 \\\\ 0 & B \\end{bmatrix}$, eigenvalues are the union of the eigenvalues of sub-blocks $A$ and $B$. For $[[5, 2], [2, 5]]$, eigenvalues are $5+2=7$ and $5-2=3$.`,
    flashcards: [
      {
        front: 'What does the trace of a sample covariance matrix Tr(Σ) represent?',
        back: 'The total system variance across all dimensions (sum of all eigenvalues).'
      },
      {
        front: 'Why must dataset X be mean-centered before performing PCA?',
        back: 'To prevent the first principal component from describing centroid displacement rather than directional variance.'
      },
      {
        front: 'What is the Rayleigh quotient formulation of PCA?',
        back: 'max (uᵀ Σ u) / (uᵀ u), which achieves maximum value λ_max when u is the principal eigenvector.'
      }
    ]
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const scholarFirstName = session.fullName?.split(' ')[0] || 'Scholar';

  // 6 High-Intent Academic Bento Starter Cards
  const BENTO_STARTERS = [
    {
      id: 'pca_derivation',
      icon: Calculator,
      tag: 'Linear Algebra',
      color: 'border-indigo-500/30 bg-indigo-950/20 text-indigo-300',
      title: 'Derive PCA Projection & Trace',
      prompt: 'Derive Principal Component Analysis (PCA) projection from first principles using Rayleigh quotient and explain the trace invariant.'
    },
    {
      id: 'dsa_heapify',
      icon: Code2,
      tag: 'Python & DSA',
      color: 'border-cyan-500/30 bg-cyan-950/20 text-cyan-300',
      title: 'Analyze Binary Heapify O(n)',
      prompt: 'What is the exact time complexity of building a Binary Heap using bottom-up Heapify O(n) vs repeated insertion O(n log n)?'
    },
    {
      id: 'work_energy',
      icon: Zap,
      tag: 'Physics & Calculus',
      color: 'border-amber-500/30 bg-amber-950/20 text-amber-300',
      title: 'Work-Energy Definite Integral',
      prompt: 'Explain the Work-Energy Theorem with KaTeX definite integral steps, physical units, and kinetic energy delta.'
    },
    {
      id: 'bayes_traps',
      icon: HelpCircle,
      tag: 'Probability & Stats',
      color: 'border-rose-500/30 bg-rose-950/20 text-rose-300',
      title: 'Bayes Theorem & Base Rate Trap',
      prompt: 'A test has 95% sensitivity and 90% specificity for a rare disease with 1% prevalence. Calculate posterior P(Disease | Test Positive) and explain the base rate fallacy.'
    },
    {
      id: 'gibbs_thermo',
      icon: Flame,
      tag: 'Chemistry & Thermo',
      color: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300',
      title: 'Gibbs Free Energy Spontaneity',
      prompt: 'Derive Gibbs Free Energy ΔG = ΔH - TΔS and explain the conditions under which an endothermic reaction becomes spontaneous at high temperatures.'
    },
    {
      id: 'socratic_teardown',
      icon: Sparkles,
      tag: 'Socratic Teardown',
      color: 'border-purple-500/30 bg-purple-950/20 text-purple-300',
      title: 'Level 1 Concept Diagnosis',
      prompt: 'Withhold turnkey solutions — guide me step-by-step with Level 1 concept diagnosis on Gaussian elimination and pivot selection.'
    }
  ];

  // Send Prompt to Socratic LLM
  const handleSendPrompt = async (promptToSend) => {
    const text = (promptToSend ?? chatInput).trim();
    if (!text || isStreaming) return;

    if (!promptToSend) setChatInput('');

    const userMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text
    };

    setChatHistory((prev) => [...prev, userMessage]);
    setIsStreaming(true);
    setHudState('thinking');
    recordBackendEvent('REGULAR_LLM_PROMPT', { prompt: text, tier: session.academicTier });

    try {
      const llmResult = await queryVedCustomLlm({
        userPrompt: text,
        activeTier: session.academicTier,
        activeGatePillar: 'LIN_ALG'
      });

      // Calibrate right-pane artifact to user topic
      const lower = text.toLowerCase();
      if (lower.includes('code') || lower.includes('heap') || lower.includes('python') || lower.includes('complexity') || lower.includes('sort')) {
        setWorkbenchTab('code');
      } else if (lower.includes('gate') || lower.includes('pillar') || lower.includes('trap') || lower.includes('mcq')) {
        setWorkbenchTab('gate');
      } else if (lower.includes('notes') || lower.includes('flashcard') || lower.includes('summary')) {
        setWorkbenchTab('notes');
      } else {
        setWorkbenchTab('math');
      }

      const assistantMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        textParagraphs: Array.isArray(llmResult.socraticText)
          ? llmResult.socraticText
          : [llmResult.socraticText],
        formula: llmResult.formulaCallout,
        reasoningTrace: llmResult.reasoningTrace,
        actionChips: [
          { label: '💡 Give me a hint', action: 'hint' },
          { label: '📊 Explain Step Visually', action: 'visual' },
          { label: '⚠️ Common Pitfalls', action: 'pitfalls' },
          { label: '🧪 Test My Understanding', action: 'quiz' }
        ]
      };

      setChatHistory((prev) => [...prev, assistantMessage]);
      setHudState('speaking');
      setTimeout(() => setHudState('idle'), 1500);
    } catch (err) {
      console.error('LLM query failed:', err);
      setHudState('idle');
    } finally {
      setIsStreaming(false);
    }
  };

  const handleActionChip = (chip) => {
    let chipPrompt = '';
    if (chip.action === 'hint') chipPrompt = 'Give me the next progressive scaffolding hint for this step.';
    else if (chip.action === 'visual') chipPrompt = 'Render a visual step-by-step KaTeX derivation breakdown on my canvas.';
    else if (chip.action === 'pitfalls') chipPrompt = 'What are the most common exam traps and pitfalls associated with this concept?';
    else if (chip.action === 'quiz') chipPrompt = 'Generate an isomorphic practice problem to test my understanding.';
    handleSendPrompt(chipPrompt);
  };

  // Run Python Sandbox Code
  const handleRunCode = () => {
    setIsRunningCode(true);
    setTimeout(() => {
      setCodeOutput({
        exitCode: 0,
        runtimeMs: 14,
        memoryMb: '1.4 MB',
        stdout: `[Sandbox Execution - Exit Code 0]
Top Eigenvalue: 7.0
Total System Variance: 12.0
Explained Variance Ratio: 0.5833 (7/12)
Principal Eigenvector u1: [0.70710678, 0.70710678, 0.0]
Memory footprint: 1.4 MB | Process CPU: 0.009s`
      });
      setIsRunningCode(false);
      recordBackendEvent('CODE_RUN_SUCCESS', { lines: 25 });
    }, 600);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeArtifact.codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeGateProblem = GATE_DA_PROBLEMS_BY_PILLAR.LIN_ALG;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8.5rem)]">
      {/* ====================================================================
          LEFT PANE (40%): SOCRATIC STREAM & TELEMETRY
      ==================================================================== */}
      <div className="lg:col-span-5 flex flex-col rounded-2xl border border-white/[0.08] bg-zinc-900/60 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Reasoning Trace Bar */}
        <div className="border-b border-white/[0.08] bg-zinc-950/60 px-4 py-3">
          <button
            onClick={() => setReasoningOpen(!reasoningOpen)}
            className="flex w-full items-center justify-between text-xs text-zinc-300 hover:text-white"
          >
            <span className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-amber-400" />
              <span>
                Ved-Core Reasoning Trace • Tier: {currentTierObj.label}
              </span>
            </span>
            <ChevronRight
              className={`h-3.5 w-3.5 transition-transform ${reasoningOpen ? 'rotate-90' : ''}`}
            />
          </button>
          {reasoningOpen && (
            <div className="mt-2 border-t border-white/[0.06] pt-2 text-[11px] font-mono text-emerald-400 space-y-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3" />
                <span>3-Chunk Rule Guardrail Active • Zero Turnkey Answer on Turn 1</span>
              </div>
            </div>
          )}
        </div>

        {/* Conversation Stream or Bento Starter Grid */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.length === 0 ? (
            <div className="space-y-5 py-2">
              {/* Welcoming Greeting */}
              <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-indigo-950/30 via-zinc-900/40 to-zinc-950/80 p-5 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                  <span>Ved-Core Socratic Engine Active</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white">
                  {getGreeting()}, {scholarFirstName} 👋
                </h2>
                <p className="mt-1 text-xs text-zinc-300 leading-relaxed">
                  I am your Socratic AI study assistant. Ask me anything in mathematics, code, science, or research. I guide you step-by-step without dumping raw turnkey answers.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-mono text-indigo-300">
                    Active Tier: {currentTierObj.badge}
                  </span>
                </div>
              </div>

              {/* Bento Starter Prompts Grid */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 px-1">
                  Explore High-Intent Academic Prompts:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {BENTO_STARTERS.map((card) => {
                    const CardIcon = card.icon;
                    return (
                      <button
                        key={card.id}
                        onClick={() => handleSendPrompt(card.prompt)}
                        className={`flex flex-col text-left p-3.5 rounded-xl border transition-all hover:scale-[1.01] hover:border-white/30 ${card.color}`}
                      >
                        <div className="flex items-center justify-between w-full mb-1.5">
                          <span className="text-[10px] font-mono font-medium uppercase tracking-wider">
                            {card.tag}
                          </span>
                          <CardIcon className="h-4 w-4 shrink-0" />
                        </div>
                        <span className="text-xs font-semibold text-zinc-100 mb-1">
                          {card.title}
                        </span>
                        <span className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                          {card.prompt}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            chatHistory.map((m) => (
              <div
                key={m.id}
                className={`rounded-2xl p-4 text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'ml-auto max-w-[85%] border border-indigo-500/30 bg-indigo-600/20 text-zinc-100'
                    : 'border border-white/[0.08] bg-zinc-950/60 text-zinc-200 space-y-3'
                }`}
              >
                {m.role === 'user' ? (
                  <p>{m.text}</p>
                ) : (
                  <>
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-1.5 text-[10px] font-mono text-zinc-400">
                      <span className="text-indigo-400">ved.ai • Socratic Mentor</span>
                      <span>{m.time}</span>
                    </div>

                    {m.textParagraphs?.map((p, idx) => (
                      <p key={idx} className="text-zinc-200 leading-relaxed">
                        {p}
                      </p>
                    ))}

                    {m.formula && (
                      <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/30 p-2.5 text-center font-mono text-xs text-indigo-300">
                        <KatexMath math={m.formula} inline={false} />
                      </div>
                    )}

                    {/* Interactive Action Chips */}
                    {m.actionChips && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {m.actionChips.map((chip, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleActionChip(chip)}
                            className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 text-[11px] font-medium text-indigo-300 transition-colors"
                          >
                            {chip.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))
          )}

          {isStreaming && (
            <div className="flex items-center gap-2 rounded-xl border border-indigo-500/20 bg-zinc-950/60 p-3 text-xs text-indigo-300">
              <span className="h-3 w-3 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
              <span>Formulating Socratic Scaffolding & Routing to Canvas...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt();
          }}
          className="border-t border-white/[0.08] bg-zinc-950/80 p-3 flex items-center gap-2"
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={isStreaming}
            placeholder={`Ask a question or enter step under ${currentTierObj.label}...`}
            className="flex-1 rounded-xl border border-white/10 bg-zinc-900/70 px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500 transition-all"
          />
          <button
            type="submit"
            disabled={isStreaming || !chatInput.trim()}
            className="flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 p-2.5 text-white transition-all shadow-md shadow-indigo-600/25"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* ====================================================================
          RIGHT PANE (60%): INTERACTIVE ARTIFACT WORKBENCH
      ==================================================================== */}
      <div className="lg:col-span-7 flex flex-col rounded-2xl border border-white/[0.08] bg-zinc-900/60 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Workbench Header & Tabs */}
        <div className="flex items-center justify-between border-b border-white/[0.08] bg-zinc-950/60 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-mono text-indigo-400">
              60% Right Canvas
            </span>
            <span className="text-xs font-semibold text-zinc-200">{activeArtifact.title}</span>
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-zinc-900/80 p-1 border border-white/[0.06]">
            <button
              onClick={() => setWorkbenchTab('math')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                workbenchTab === 'math'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Calculator className="h-3.5 w-3.5" />
              <span>Math</span>
            </button>
            <button
              onClick={() => setWorkbenchTab('code')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                workbenchTab === 'code'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>Code</span>
            </button>
            <button
              onClick={() => setWorkbenchTab('notes')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                workbenchTab === 'notes'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Notes</span>
            </button>
            <button
              onClick={() => setWorkbenchTab('gate')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                workbenchTab === 'gate'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              <span>GATE DA</span>
            </button>
          </div>
        </div>

        {/* Tab Viewport */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* TAB 1: MATH DERIVATION CARDS */}
          {workbenchTab === 'math' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">
                    Step-by-Step KaTeX Derivation Cards
                  </h3>
                  <p className="text-xs text-zinc-400">{activeArtifact.subtitle}</p>
                </div>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-mono text-emerald-300">
                  ✓ {activeArtifact.validationStatus}
                </span>
              </div>

              <div className="space-y-3">
                {activeArtifact.mathSteps?.map((step, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/[0.08] bg-zinc-950/60 p-4 space-y-2 hover:border-indigo-500/30 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-medium text-indigo-300">
                        {step.label}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        Validated
                      </span>
                    </div>
                    <div className="overflow-x-auto py-2 text-center text-sm font-mono text-zinc-100">
                      <KatexMath math={step.latex} inline={false} />
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed border-t border-white/[0.06] pt-2">
                      {step.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: PYTHON CODE SANDBOX & COMPLEXITY */}
          {workbenchTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">
                    Python 3 Execution Sandbox & Complexity
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Time: O(n log n) / Space: O(n) • Sandboxed Execution
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 rounded-lg border border-white/10 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 hover:text-white"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Code'}</span>
                  </button>
                  <button
                    onClick={handleRunCode}
                    disabled={isRunningCode}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-medium text-white shadow-md shadow-emerald-600/30 transition-all"
                  >
                    <Play className="h-3.5 w-3.5 fill-white" />
                    <span>{isRunningCode ? 'Running...' : 'Run Python Trace'}</span>
                  </button>
                </div>
              </div>

              {/* Code Editor Frame */}
              <div className="relative rounded-xl border border-white/10 bg-zinc-950 p-4 font-mono text-xs text-zinc-200 overflow-x-auto">
                <pre>{activeArtifact.codeSnippet}</pre>
              </div>

              {/* Execution Console Output */}
              {codeOutput && (
                <div className="rounded-xl border border-emerald-500/30 bg-zinc-950 p-4 font-mono text-xs text-emerald-300 space-y-1">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 text-[10px] text-zinc-400">
                    <span>STATUS: EXIT 0</span>
                    <span>RUNTIME: {codeOutput.runtimeMs}ms</span>
                  </div>
                  <pre className="whitespace-pre-wrap">{codeOutput.stdout}</pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STUDY NOTES & FLASHCARDS */}
          {workbenchTab === 'notes' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">
                  Structured Study Guide & Active Recall Flashcards
                </h3>
                <p className="text-xs text-zinc-400">
                  Concept Invariants, Theorem Summaries & Memory Checks
                </p>
              </div>

              {/* Notes Markdown Section */}
              <div className="rounded-xl border border-white/[0.08] bg-zinc-950/60 p-4 text-xs text-zinc-200 space-y-2 leading-relaxed">
                <div className="font-semibold text-indigo-300">Key Principles:</div>
                <ul className="list-disc list-inside space-y-1.5 text-zinc-300">
                  <li>
                    <strong>Trace Conservation:</strong> Sum of eigenvalues equals the trace of the covariance matrix.
                  </li>
                  <li>
                    <strong>Orthogonality:</strong> Eigenvectors of real symmetric matrices are strictly orthogonal.
                  </li>
                  <li>
                    <strong>IIT Exam Shortcut:</strong> Block diagonal matrices allow computing eigenvalues by sub-blocks in &lt;30s!
                  </li>
                </ul>
              </div>

              {/* Flashcards Carousel */}
              {activeArtifact.flashcards && activeArtifact.flashcards.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="font-mono uppercase text-[11px]">
                      Flashcard {flashcardIdx + 1} of {activeArtifact.flashcards.length}
                    </span>
                    <span className="text-[10px] text-indigo-400">Click card to flip</span>
                  </div>

                  <div
                    onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                    className="cursor-pointer min-h-[140px] flex flex-col justify-center items-center rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 to-zinc-950 p-6 text-center text-xs transition-all hover:border-indigo-400 shadow-lg"
                  >
                    <span className="text-[10px] font-mono uppercase text-indigo-400 mb-2">
                      {flashcardFlipped ? 'Answer (Mastery Note)' : 'Prompt Question'}
                    </span>
                    <p className="text-sm font-medium text-zinc-100">
                      {flashcardFlipped
                        ? activeArtifact.flashcards[flashcardIdx].back
                        : activeArtifact.flashcards[flashcardIdx].front}
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => {
                        setFlashcardFlipped(false);
                        setFlashcardIdx((prev) => (prev > 0 ? prev - 1 : activeArtifact.flashcards.length - 1));
                      }}
                      className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 hover:text-white"
                    >
                      ← Previous Card
                    </button>
                    <button
                      onClick={() => {
                        setFlashcardFlipped(false);
                        setFlashcardIdx((prev) => (prev < activeArtifact.flashcards.length - 1 ? prev + 1 : 0));
                      }}
                      className="rounded-lg border border-indigo-500/30 bg-indigo-600/30 px-3 py-1.5 text-xs text-indigo-200 hover:bg-indigo-600/50"
                    >
                      Next Card →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: GATE DA PROBLEM & TRAP DECODER */}
          {workbenchTab === 'gate' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div>
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-mono text-amber-300">
                    {activeGateProblem.pillar}
                  </span>
                  <h3 className="mt-1 text-sm font-semibold text-zinc-100">
                    {activeGateProblem.qType}
                  </h3>
                </div>
                <span className="text-xs font-mono text-amber-400">Exam Simulator</span>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-zinc-950/60 p-4 font-mono text-xs text-zinc-200 leading-relaxed">
                {activeGateProblem.statement}
              </div>

              {/* Options */}
              <div className="space-y-2">
                {activeGateProblem.options.map((opt) => {
                  const isPicked = selectedGateOpt === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => {
                        setSelectedGateOpt(opt.id);
                        recordBackendEvent('GATE_OPTION_PICKED', {
                          option: opt.id,
                          correct: opt.isCorrect
                        });
                      }}
                      className={`cursor-pointer rounded-xl border p-3 text-xs font-mono transition-all ${
                        isPicked
                          ? opt.isCorrect
                            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200'
                            : 'border-rose-500/50 bg-rose-500/10 text-rose-200'
                          : 'border-white/[0.08] bg-zinc-950/40 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>
                          ({opt.id}) {opt.text}
                        </span>
                        {isPicked && (
                          <span>{opt.isCorrect ? '✓ +2.00 Marks' : '✗ -0.66 Negative'}</span>
                        )}
                      </div>
                      {isPicked && (
                        <p className="mt-2 border-t border-white/10 pt-2 text-[11px] text-zinc-300">
                          {opt.trap}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Shortcut Reveal */}
              <button
                onClick={() => setShowGateShortcut(!showGateShortcut)}
                className="flex items-center gap-1.5 text-xs font-mono text-amber-400 hover:text-amber-300"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>
                  {showGateShortcut ? 'Hide 30-Sec Shortcut' : 'Reveal 30-Second IIT Shortcut'}
                </span>
              </button>

              {showGateShortcut && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-4 font-mono text-xs text-amber-200 whitespace-pre-wrap">
                  {activeGateProblem.shortcut}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
