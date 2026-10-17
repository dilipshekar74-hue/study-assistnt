import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Calculator,
  Scan,
  Activity,
  ArrowRight,
  Shield,
  Lightbulb,
  CheckCircle2,
  Lock,
  Layers,
  Eye,
  Database,
  Terminal,
  Cpu,
  Zap,
  BookOpen,
  ChevronRight,
  X,
  Mail,
  EyeOff,
  User,
  GraduationCap,
  AlertCircle,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import KatexMath, { FormattedMathText } from '../KatexMath';
import { useAuth } from '../../hooks/useAuth';
import { useAstraStore } from '../../store/useAstraStore';
import AstraGlitterCanvas from '../effects/AstraGlitterCanvas';

export default function AstraLandingPage({ onLaunchAuth }) {
  const { session, signIn, signUp } = useAuth();
  const { setUser } = useAstraStore();

  const [activeTab, setActiveTab] = useState('math'); // 'math' | 'vision' | 'telemetry'
  const [selectedLadderLevel, setSelectedLadderLevel] = useState(1);
  const [hintLevel, setHintLevel] = useState(0);

  // Supabase Auth State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signIn'); // 'signIn' | 'signUp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [academicLevel, setAcademicLevel] = useState('Undergraduate');
  const [major, setMajor] = useState('Physics / Applied Mathematics');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  const openAuth = (mode = 'signUp') => {
    setAuthMode(mode);
    setAuthError('');
    setAuthSuccess('');
    setAuthModalOpen(true);
    if (onLaunchAuth) onLaunchAuth(mode === 'signIn' ? 'login' : 'register');
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setIsSubmitting(true);

    try {
      if (authMode === 'signIn') {
        const { data, error } = await signIn(email, password);
        if (error) throw error;
        setAuthSuccess('Welcome back! Launching Workbench...');
        setTimeout(() => {
          if (data?.user) setUser(data.user);
          setAuthModalOpen(false);
        }, 500);
      } else {
        const { data, error } = await signUp(
          email,
          password,
          fullName || email.split('@')[0],
          { academicLevel, major }
        );
        if (error) throw error;

        if (!data?.session && data?.user) {
          setAuthSuccess(
            'Registration successful! Please check your email to verify your account or proceed to sign in.'
          );
        } else {
          setAuthSuccess('Account initialized! Launching Workbench...');
          setTimeout(() => {
            if (data?.user) setUser(data.user);
            setAuthModalOpen(false);
          }, 500);
        }
      }
    } catch (err) {
      // Real Supabase error banner display per .agents/rules/supabase-backend.md
      setAuthError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoAccess = () => {
    const demoUser = {
      id: 'demo-student-001',
      email: 'scholar.demo@ved.ai',
      role: 'STUDENT',
      studentProfile: {
        academicLevel: 'Undergraduate',
        major: 'Theoretical Physics',
        socraticFriction: 0.7,
        totalStudyMinutes: 420,
        streakDays: 8,
      },
    };
    setUser(demoUser);
    setAuthModalOpen(false);
  };

  const ladderSteps = [
    {
      level: 1,
      title: 'Concept Diagnosis',
      badge: 'Level 1: Rule Identification',
      description: 'Identifies governing physical law (Work-Kinetic Energy Theorem) without revealing formulas or numbers.',
      samplePrompt: 'What fundamental theorem connects the net work done on a particle with its kinetic state?',
      tags: ['Socratic Diagnosis', 'No Turnkey Solution']
    },
    {
      level: 2,
      title: 'Scaffolding Query',
      badge: 'Level 2: Variable Setup',
      description: 'Prompts student for coordinate boundaries and variable dependency (position x vs velocity v).',
      samplePrompt: 'Notice that F(x) = 4x varies with position. How do we integrate across limits x_i = 0 to x_f = 2?',
      tags: ['Boundary Conditions', 'Guided Elicitation']
    },
    {
      level: 3,
      title: 'Partial Setup',
      badge: 'Level 3: Skeleton with Blanks',
      description: 'Mounts KaTeX integral formulation on the Artifact Canvas with interactive placeholders for student input.',
      samplePrompt: 'W_{net} = \\int_{0}^{2} [___] \\, dx. Fill in your net force expression to compute the integral.',
      tags: ['Canvas Anchoring', 'Interactive Blanks']
    },
    {
      level: 4,
      title: 'Formal Verification',
      badge: 'Level 4: Rigorous Derivation',
      description: 'Verifies the student solution and confirms physical units (Joules) with diagnostic pedagogical feedback.',
      samplePrompt: 'Correct! \\Delta K = [2x^2]_0^2 = 8 \\text{ J}. Kinetic energy increased by exactly 8 Joules.',
      tags: ['Dimensional Analysis', 'Atomic Streak +1']
    }
  ];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#09090b] text-zinc-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Ambient Radial Spotlight Gradients per landing-page-spec.md */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,_var(--tw-gradient-stops))] from-indigo-950/35 via-zinc-950/80 to-[#09090b]" />
      <div className="pointer-events-none fixed -top-40 left-1/2 -translate-x-1/2 h-[550px] w-[900px] rounded-full bg-indigo-600/10 blur-[130px]" />
      <div className="pointer-events-none fixed top-1/3 -right-60 h-[450px] w-[600px] rounded-full bg-violet-600/10 blur-[140px]" />

      {/* Interactive Astra Glitter & Stardust Field */}
      <AstraGlitterCanvas particleCount={70} interactionRadius={180} />

      {/* Subtle Technical Grid */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:48px_48px]" />

      {/* Top Brand Navigation Bar */}
      <nav className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-zinc-950/70 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          
          {/* Logo & Version Badge */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-md shadow-indigo-500/30">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold tracking-tight text-white">ved.ai</span>
              <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-indigo-400">
                Astra v2.4
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-medium text-zinc-400">
            <a href="#sandbox" className="hover:text-zinc-100 transition-colors">
              Interactive Sandbox
            </a>
            <a href="#features" className="hover:text-zinc-100 transition-colors">
              System Architecture
            </a>
            <a href="#pedagogy" className="hover:text-zinc-100 transition-colors">
              Socratic Pedagogy
            </a>
            <a href="#security" className="hover:text-zinc-100 transition-colors">
              Tenant Isolation
            </a>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => openAuth('signIn')}
              className="px-3.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuth('signUp')}
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-medium text-white shadow-lg shadow-indigo-500/25 hover:brightness-110 active:scale-95 transition-all"
            >
              <span>Launch Workbench</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-12 lg:px-8 text-center">
        
        {/* Ambient Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/40 px-3.5 py-1.5 text-xs font-medium text-indigo-300 backdrop-blur-md mb-8 shadow-inner"
        >
          <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
          <span>Astra Multimodal Study Companion • No Turnkey Answers</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl max-w-4xl mx-auto leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-400"
        >
          Autonomous Socratic Intelligence for STEM.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed"
        >
          A dual-pane pedagogical environment engineered with verified progressive disclosure, KaTeX mathematical canvas anchoring, spatial textbook vision, and strict PostgreSQL tenant isolation.
        </motion.p>

        {/* Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <button
            onClick={() => openAuth('signUp')}
            className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 transition-all"
          >
            <span>Launch Interactive Workbench</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <a
            href="#sandbox"
            className="flex items-center gap-2 rounded-2xl border border-white/[0.12] bg-white/[0.04] px-6 py-3.5 text-sm font-medium text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-all backdrop-blur-md"
          >
            <span>Explore Live Sandbox</span>
            <ChevronRight className="h-4 w-4 text-zinc-500" />
          </a>
        </motion.div>

        {/* Live Interactive Sandbox Preview Container */}
        <div id="sandbox" className="mt-16 scroll-mt-24">
          <div className="relative mx-auto max-w-5xl rounded-3xl border border-white/[0.12] bg-zinc-950/80 p-2 sm:p-4 shadow-[0_0_80px_rgba(99,102,241,0.2)] backdrop-blur-2xl">
            
            {/* Top Sandbox Window Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-[11px] text-zinc-500">
                  ved.ai/workbench • dual-pane preview
                </span>
              </div>

              {/* Selectable Demonstrator Tabs per landing-page-spec.md */}
              <div className="flex items-center gap-1 rounded-xl bg-zinc-900/90 p-1 border border-white/[0.08]">
                <button
                  onClick={() => setActiveTab('math')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    activeTab === 'math'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Calculator className="h-3.5 w-3.5" />
                  <span>Math Canvas</span>
                </button>
                <button
                  onClick={() => setActiveTab('vision')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    activeTab === 'vision'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Scan className="h-3.5 w-3.5" />
                  <span>Spatial Vision</span>
                </button>
                <button
                  onClick={() => setActiveTab('telemetry')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    activeTab === 'telemetry'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Activity className="h-3.5 w-3.5" />
                  <span>Telemetry</span>
                </button>
              </div>
            </div>

            {/* Live Dual-Pane Simulation Body */}
            <div className="relative min-h-[460px] sm:min-h-[500px] overflow-hidden rounded-2xl bg-zinc-950/60 p-4 sm:p-6 text-left">
              
              {/* TAB 1: MATH WORKBENCH PREVIEW */}
              {activeTab === 'math' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                  {/* Left Column: Socratic Prompt Stream (40%) */}
                  <div className="lg:col-span-5 flex flex-col justify-between space-y-4 rounded-2xl border border-white/[0.08] bg-zinc-900/40 p-4 backdrop-blur-xl">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase text-indigo-400 font-semibold tracking-wider">
                          Socratic Turn 1
                        </span>
                        <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-mono text-amber-300">
                          Reasoning Trace • 1.4s
                        </span>
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed">
                        Before evaluating numbers, consider the Work-Kinetic Energy relation. Net work corresponds directly to the total change in kinetic energy:
                      </p>

                      <div className="p-3 rounded-xl bg-zinc-950/80 border border-white/[0.06] text-center">
                        <KatexMath
                          math="W_{\text{net}} = \Delta K = K_f - K_i"
                          block={true}
                          className="text-indigo-200 text-xs sm:text-sm font-normal"
                        />
                      </div>

                      <p className="text-xs text-zinc-300">
                        <FormattedMathText text="I have mounted the active formulation on your canvas. What is your expression for $F(x)$?" />
                      </p>

                      {/* Interactive Hint Reaction */}
                      {hintLevel > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="p-3 rounded-xl border border-indigo-500/20 bg-indigo-950/30 text-xs text-indigo-200"
                        >
                          <strong className="text-indigo-400">Socratic Hint: </strong>
                          Recall that work along a 1D path is the line integral of force over displacement: $\int F(x) \, dx$.
                        </motion.div>
                      )}
                    </div>

                    {/* Interactive Action Chips */}
                    <div className="pt-2 border-t border-white/[0.06] flex flex-wrap gap-2">
                      <button
                        onClick={() => setHintLevel((prev) => (prev > 0 ? 0 : 1))}
                        className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-medium text-indigo-300 hover:bg-indigo-500/20 transition-colors"
                      >
                        {hintLevel > 0 ? '✓ Hint Revealed' : '💡 Give me a hint'}
                      </button>
                      <button
                        onClick={() => setActiveTab('vision')}
                        className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
                      >
                        📊 View spatial diagram
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Artifact Canvas (60%) */}
                  <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-zinc-950/90 p-5 shadow-2xl">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                        <div className="flex items-center gap-2">
                          <Calculator className="h-4 w-4 text-indigo-400" />
                          <span className="text-xs font-medium text-zinc-200">
                            Work-Energy Derivation Canvas
                          </span>
                        </div>
                        <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                          Active Canvas Engine
                        </span>
                      </div>

                      {/* Mathematical Render Container */}
                      <div className="rounded-xl border border-white/[0.06] bg-zinc-900/60 p-6 text-center shadow-inner flex items-center justify-center min-h-[140px]">
                        <KatexMath
                          math="\Delta K = W_{\text{net}} = \int_{x_i}^{x_f} F_{\text{net}} \, dx"
                          block={true}
                          className="text-xl sm:text-2xl text-zinc-100 font-normal"
                        />
                      </div>

                      {/* Pedagogical Callout */}
                      <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 text-xs text-zinc-400 leading-relaxed">
                        <strong className="text-zinc-200">Pedagogical Note: </strong>
                        <FormattedMathText text="Evaluate whether $F_{\text{net}}$ depends on position $x$ or velocity $v$ before proceeding." />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-500">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        KaTeX Mathematical Render: 24ms
                      </span>
                      <span>Tenant Isolated</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SPATIAL MULTIMODAL VISION PREVIEW */}
              {activeTab === 'vision' && (
                <div className="relative h-full min-h-[440px] rounded-2xl border border-cyan-500/20 bg-zinc-950 p-6 overflow-hidden flex flex-col justify-between">
                  {/* Viewfinder Grid Overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(#22d3ee_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
                  
                  {/* Scanning Laser Line Animation */}
                  <motion.div
                    animate={{ y: [0, 360, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 pointer-events-none"
                  />

                  {/* Header HUD */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
                      <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
                        Spatial VLM Engine: 1080p @ 30FPS
                      </span>
                    </div>
                    <span className="rounded bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
                      Live OCR Extraction
                    </span>
                  </div>

                  {/* Simulated Textbook Page with Bounding Overlays */}
                  <div className="relative z-10 my-4 p-6 rounded-2xl border border-white/[0.08] bg-zinc-900/80 max-w-2xl mx-auto shadow-2xl space-y-4">
                    
                    {/* Bounding Box 1 */}
                    <div className="relative rounded-xl border-2 border-cyan-400 bg-cyan-500/10 p-3">
                      <span className="absolute -top-3 left-3 rounded bg-cyan-400 px-2 py-0.5 text-[10px] font-mono font-bold text-zinc-950 uppercase shadow">
                        [Textbook Problem 4.2] 99.4%
                      </span>
                      <p className="text-xs font-mono text-zinc-200 mt-1">
                        A particle of mass m = 2.0 kg moves along the x-axis under the influence of net force F(x) = 4x N.
                      </p>
                    </div>

                    {/* Bounding Box 2 */}
                    <div className="relative rounded-xl border-2 border-indigo-400 bg-indigo-500/10 p-3">
                      <span className="absolute -top-3 left-3 rounded bg-indigo-500 px-2 py-0.5 text-[10px] font-mono font-bold text-white uppercase shadow">
                        [Kinematic Integral Target] 98.8%
                      </span>
                      <p className="text-xs font-mono text-indigo-200 mt-1">
                        Determine change in kinetic energy from x = 0 to x = 2 m.
                      </p>
                    </div>
                  </div>

                  {/* Footer Vision Telemetry */}
                  <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                    <span>Bounding Box Detection: YOLOv8-Doc • Latency 42ms</span>
                    <button
                      onClick={() => setActiveTab('math')}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <span>Mount to Math Canvas</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: AGENT TELEMETRY & REASONING TRACE */}
              {activeTab === 'telemetry' && (
                <div className="h-full min-h-[440px] rounded-2xl border border-white/[0.08] bg-zinc-950 p-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-amber-400" />
                        <span className="text-xs font-medium text-zinc-200">
                          Agentic Reasoning Trace & Tool Execution Timeline
                        </span>
                      </div>
                      <span className="rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-mono text-amber-300">
                        Duration: 1.4s
                      </span>
                    </div>

                    {/* Chronological Step List per multimodal-telemetry.md */}
                    <div className="space-y-3 font-mono text-xs">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-white/[0.04]">
                        <div className="flex items-center gap-2 text-zinc-300">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          <span>Step 1: Parsed Work-Energy theorem request</span>
                        </div>
                        <span className="text-[10px] text-zinc-500">12ms • Success</span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-white/[0.04]">
                        <div className="flex items-center gap-2 text-zinc-300">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          <span>Step 2: Indexed 2 textbook chapters (Halliday & Resnick, Ch. 7)</span>
                        </div>
                        <span className="text-[10px] text-zinc-500">380ms • Success</span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/30">
                        <div className="flex items-center gap-2 text-indigo-200">
                          <Lightbulb className="h-4 w-4 text-indigo-400 shrink-0" />
                          <span>Step 3: Socratic Guardrail: Suppressed turnkey answer; mounted KaTeX canvas</span>
                        </div>
                        <span className="text-[10px] text-indigo-400">84ms • Active</span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-white/[0.04]">
                        <div className="flex items-center gap-2 text-zinc-300">
                          <Shield className="h-4 w-4 text-emerald-400 shrink-0" />
                          <span>Step 4: Strict Tenant Isolation: WHERE userId = session.userId</span>
                        </div>
                        <span className="text-[10px] text-zinc-500">18ms • Verified</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-500">
                    <span>JSONB Telemetry Traces Stored For Learning Analytics</span>
                    <span>Rate Limit: 5/min • Max Security</span>
                  </div>
                </div>
              )}

              {/* Ambient Floating Astra Voice Pill Demonstrator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <div className="flex items-center gap-2 rounded-full border border-indigo-500/30 bg-zinc-950/90 px-3.5 py-1.5 backdrop-blur-xl shadow-lg shadow-indigo-500/20">
                  <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
                  <span className="text-[11px] font-mono text-zinc-300">
                    Astra Ambient Presence Active
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid Section */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-semibold">
            Architectural Standard
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Engineered for Deep Socratic Learning
          </p>
          <p className="mt-3 text-sm text-zinc-400">
            A harmonious integration of client-side mathematical typesetting, vision intelligence, and cryptographic backend invariants.
          </p>
        </div>

        {/* 5-Item Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Dual-Pane Artifact Workbench (Col Span 2) */}
          <div className="lg:col-span-2 rounded-3xl border border-white/[0.08] bg-zinc-950/60 p-8 backdrop-blur-2xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-5">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold text-white">Dual-Pane Artifact Workbench</h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed max-w-xl">
                40/60 split layout separating the Socratic dialog from active mathematical derivations. Formulas compile with local KaTeX typography, leaving chat bubbles uncluttered.
              </p>
            </div>
            <div className="mt-6 rounded-2xl border border-white/[0.06] bg-zinc-900/60 p-4 font-mono text-xs text-indigo-300">
              <code>&lt;ArtifactCanvas /&gt; → KaTeX Block Engine with Automatic Delimiter Stripping</code>
            </div>
          </div>

          {/* Card 2: Spatial Multimodal Vision */}
          <div className="rounded-3xl border border-white/[0.08] bg-zinc-950/60 p-8 backdrop-blur-2xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-5">
                <Eye className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold text-white">Spatial Multimodal Vision</h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                Inspect textbook problem sets, circuit diagrams, and handwritten work in real time using client video streams and bounding overlays.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-mono text-cyan-400">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              <span>Camera & Screen Viewfinder Ready</span>
            </div>
          </div>

          {/* Card 3: Socratic Guardrails & Ladder */}
          <div className="rounded-3xl border border-white/[0.08] bg-zinc-950/60 p-8 backdrop-blur-2xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-5">
                <Lightbulb className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold text-white">Pedagogical Guardrails</h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                Adheres to the 3-Chunk Rule and 4-tier progressive disclosure ladder. Never dumps turnkey answers on Turn 1.
              </p>
            </div>
            <div className="mt-6 text-xs font-mono text-zinc-500">
              <span>Rule: Concept Diagnosis → Scaffolding → Verification</span>
            </div>
          </div>

          {/* Card 4: PostgreSQL & Tenant Isolation */}
          <div className="rounded-3xl border border-white/[0.08] bg-zinc-950/60 p-8 backdrop-blur-2xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-5">
                <Database className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold text-white">PostgreSQL & Tenant Isolation</h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                Prisma ORM schema strictly isolating student artifacts and study metrics via <code className="text-emerald-300">WHERE userId = session.userId</code>.
              </p>
            </div>
            <div className="mt-6 text-xs font-mono text-emerald-400">
              <span>Atomic updates on streak & study minutes</span>
            </div>
          </div>

          {/* Card 5: Cryptographic Security & Rate Limits */}
          <div className="rounded-3xl border border-white/[0.08] bg-zinc-950/60 p-8 backdrop-blur-2xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-5">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold text-white">Cryptographic Sessions</h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                Bcrypt 12-round hashing, 30-day rolling UUIDv4 session tokens, and strict IP rate-limiting (max 5 attempts/min).
              </p>
            </div>
            <div className="mt-6 text-xs font-mono text-zinc-500">
              <span>Zero password leakage in API payloads</span>
            </div>
          </div>

        </div>
      </section>

      {/* Socratic Ladder Interactive Demonstrator */}
      <section id="pedagogy" className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-8 border-t border-white/[0.06]">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-semibold">
            Pedagogical Engine
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            The Socratic Progressive Disclosure Ladder
          </h2>
          <p className="mt-3 text-sm text-zinc-400">
            Compare how conventional chatbots cheat students out of learning versus how ved.ai scaffolds problem-solving step by step.
          </p>
        </div>

        {/* 4-Step Interactive Ladder */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          {ladderSteps.map((step) => (
            <button
              key={step.level}
              onClick={() => setSelectedLadderLevel(step.level)}
              className={`text-left p-5 rounded-2xl border transition-all ${
                selectedLadderLevel === step.level
                  ? 'border-indigo-500 bg-indigo-950/30 shadow-lg shadow-indigo-500/10'
                  : 'border-white/[0.08] bg-zinc-950/60 hover:bg-zinc-900/50'
              }`}
            >
              <span className="text-[11px] font-mono text-indigo-400 uppercase font-semibold">
                {step.badge}
              </span>
              <h4 className="mt-1 text-sm font-semibold text-white">{step.title}</h4>
              <p className="mt-2 text-xs text-zinc-400 line-clamp-2">{step.description}</p>
            </button>
          ))}
        </div>

        {/* Selected Ladder Deep Dive Display */}
        {(() => {
          const current = ladderSteps.find((s) => s.level === selectedLadderLevel);
          return (
            <div className="rounded-3xl border border-white/[0.08] bg-zinc-950/90 p-8 shadow-2xl backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-4 mb-6">
                <div>
                  <span className="text-xs font-mono text-indigo-400 font-semibold uppercase">
                    Active Scaffolding Demonstration
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    {current.badge}: {current.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {current.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-white/[0.06] border border-white/[0.08] px-2.5 py-1 text-[10px] font-mono text-zinc-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-indigo-500/20 bg-indigo-950/20 text-indigo-100">
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 block mb-2 font-semibold">
                  Assistant Turn Output:
                </span>
                <p className="text-sm font-sans leading-relaxed">
                  <FormattedMathText text={current.samplePrompt} />
                </p>
              </div>
            </div>
          );
        })()}
      </section>

      {/* Launch CTA Section */}
      <section id="security" className="relative z-10 mx-auto max-w-7xl px-6 py-24 lg:px-8 text-center">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/40 to-zinc-950/90 p-10 sm:p-16 backdrop-blur-2xl shadow-[0_0_90px_rgba(99,102,241,0.25)]">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Ready to experience Socratic mastery?
          </h2>
          <p className="mt-4 text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Join thousands of university scholars leveraging ved.ai's Astra engine for rigorous physics, mathematics, and engineering intuition.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => openAuth('signUp')}
              className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 transition-all"
            >
              <span>Get Started Now</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => openAuth('signIn')}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-medium text-zinc-300 hover:text-white transition-all"
            >
              Sign In to Existing Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.08] bg-zinc-950/80 py-10 px-6 lg:px-8 text-center text-xs text-zinc-500">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span className="font-semibold text-zinc-300">ved.ai</span>
            <span>— The Astra Multimodal Socratic Framework</span>
          </div>
          <div>
            Powered by Supabase Auth, KaTeX, Framer Motion, and PostgreSQL RLS.
          </div>
        </div>
      </footer>

      {/* Integrated Supabase Auth Modal */}
      <AnimatePresence>
        {authModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAuthModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/[0.12] bg-zinc-950/95 p-7 shadow-[0_0_60px_rgba(79,70,229,0.25)] text-zinc-100 z-10"
            >
              <button
                onClick={() => setAuthModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-md shadow-indigo-500/25">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-semibold tracking-tight text-white flex items-center gap-2">
                    ved.ai
                    <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-mono text-indigo-400">
                      Supabase Auth
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-400">Autonomous Socratic Multimodal Workspace</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="grid grid-cols-2 rounded-xl bg-zinc-900/80 p-1 border border-white/[0.06] mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signIn');
                    setAuthError('');
                    setAuthSuccess('');
                  }}
                  className={`py-2 text-xs font-medium rounded-lg transition-all ${
                    authMode === 'signIn'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signUp');
                    setAuthError('');
                    setAuthSuccess('');
                  }}
                  className={`py-2 text-xs font-medium rounded-lg transition-all ${
                    authMode === 'signUp'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Real Supabase Error Banner */}
              {authError && (
                <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-950/20 p-3 text-xs text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Success Banner */}
              {authSuccess && (
                <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-xs text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{authSuccess}</span>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === 'signUp' && (
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative flex items-center">
                      <User className="absolute left-3.5 h-4 w-4 text-zinc-400 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ada Lovelace"
                        className="w-full rounded-xl border border-white/10 bg-zinc-900/60 pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500/60 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Academic or Institutional Email
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 h-4 w-4 text-zinc-400 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@university.edu"
                      className="w-full rounded-xl border border-white/10 bg-zinc-900/60 pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500/60 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Password {authMode === 'signUp' && <span className="text-zinc-500">(min. 6 chars)</span>}
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 h-4 w-4 text-zinc-400 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-xl border border-white/10 bg-zinc-900/60 pl-10 pr-10 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500/60 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-zinc-400 hover:text-zinc-200"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {authMode === 'signUp' && (
                  <div className="space-y-4 pt-1">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                        Academic Level
                      </label>
                      <div className="relative flex items-center">
                        <GraduationCap className="absolute left-3.5 h-4 w-4 text-zinc-400 pointer-events-none" />
                        <select
                          value={academicLevel}
                          onChange={(e) => setAcademicLevel(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-zinc-900/90 pl-10 pr-4 py-2.5 text-xs text-zinc-100 outline-none focus:border-indigo-500/60 transition-all cursor-pointer"
                        >
                          <option value="Undergraduate">Undergraduate Student</option>
                          <option value="Graduate">Graduate / PhD Candidate</option>
                          <option value="High School">AP / Advanced High School</option>
                          <option value="Independent">Self-Directed Researcher</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                        Field of Study / Major
                      </label>
                      <input
                        type="text"
                        value={major}
                        onChange={(e) => setMajor(e.target.value)}
                        placeholder="e.g. Physics, Mechanical Engineering"
                        className="w-full rounded-xl border border-white/10 bg-zinc-900/60 px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500/60 transition-all"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-xs font-medium text-white shadow-lg shadow-indigo-600/30 hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Connecting to Supabase...</span>
                    </>
                  ) : (
                    <>
                      <span>{authMode === 'signIn' ? 'Sign In via Supabase' : 'Create Scholar Account'}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </form>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/[0.08]" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider">
                  <span className="bg-zinc-950 px-2 text-zinc-500">or evaluate instantly</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDemoAccess}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white transition-all"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Launch Instant Scholar Sandbox (1-Click Demo)</span>
              </button>

              <footer className="mt-5 text-center text-[10px] text-zinc-500 leading-tight">
                Protected by Supabase Auth RLS • Strict Tenant Isolation • KaTeX Engine
              </footer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
