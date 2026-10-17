import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  GraduationCap,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { useAstraStore } from '../../store/useAstraStore';
import { useAuth } from '../../hooks/useAuth';

export default function AuthModal({ onDemoLogin }) {
  const { authModalOpen, authModalTab, setAuthModal, setUser } = useAstraStore();
  const { signIn, signUp } = useAuth();

  const [activeTab, setActiveTab] = useState(authModalTab || 'login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [academicLevel, setAcademicLevel] = useState('Undergraduate');
  const [major, setMajor] = useState('Physics / Applied Mathematics');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sync tab with store state when opened
  useEffect(() => {
    if (authModalTab) {
      setActiveTab(authModalTab);
    }
    setErrorMsg('');
    setSuccessMsg('');
  }, [authModalTab, authModalOpen]);

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (activeTab === 'login') {
        const { data, error } = await signIn(email, password);
        if (error) {
          throw error;
        }
        setSuccessMsg('Welcome back! Launching Workbench...');
        setTimeout(() => {
          if (data?.user) {
            setUser(data.user);
          }
          setAuthModal(false);
        }, 500);
      } else {
        const { data, error } = await signUp(
          email,
          password,
          fullName || email.split('@')[0],
          { academicLevel, major }
        );
        if (error) {
          throw error;
        }

        if (!data?.session && data?.user) {
          setSuccessMsg(
            'Registration successful! Please check your email to verify your account or proceed to sign in.'
          );
        } else {
          setSuccessMsg('Account initialized! Launching Workbench...');
          setTimeout(() => {
            if (data?.user) {
              setUser(data.user);
            }
            setAuthModal(false);
          }, 500);
        }
      }
    } catch (err) {
      // Display human-readable Supabase error strings per .agents/rules/supabase-backend.md
      setErrorMsg(err.message || 'Authentication request failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    setLoading(true);
    setErrorMsg('');

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

    setTimeout(() => {
      if (onDemoLogin) {
        onDemoLogin(demoUser);
      }
      setUser(demoUser);
      setAuthModal(false);
      setLoading(false);
    }, 400);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setAuthModal(false)}
          className="absolute inset-0 bg-black/75 backdrop-blur-xl"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/[0.12] bg-zinc-950/95 p-7 shadow-[0_0_60px_rgba(79,70,229,0.25)] text-zinc-100"
        >
          {/* Close Button */}
          <button
            onClick={() => setAuthModal(false)}
            className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header Brand */}
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

          {/* Toggleable Tabs */}
          <div className="grid grid-cols-2 rounded-xl bg-zinc-900/80 p-1 border border-white/[0.06] mb-5">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMsg('');
              }}
              className={`py-2 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'login'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMsg('');
              }}
              className={`py-2 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'register'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Banner with Real Supabase Error Message */}
          {errorMsg && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-950/20 p-3 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'register' && (
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
                    className="w-full rounded-xl border border-white/10 bg-zinc-900/60 pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 transition-all"
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
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/60 pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Password {activeTab === 'register' && <span className="text-zinc-500">(min. 6 chars)</span>}
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 h-4 w-4 text-zinc-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/60 pl-10 pr-10 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 transition-all"
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

            {/* Additional Fields for Registration */}
            {activeTab === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 pt-1"
              >
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Academic Level
                  </label>
                  <div className="relative flex items-center">
                    <GraduationCap className="absolute left-3.5 h-4 w-4 text-zinc-400 pointer-events-none" />
                    <select
                      value={academicLevel}
                      onChange={(e) => setAcademicLevel(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-zinc-900/90 pl-10 pr-4 py-2.5 text-xs text-zinc-100 outline-none focus:border-indigo-500/60 transition-all appearance-none cursor-pointer"
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
              </motion.div>
            )}

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-xs font-medium text-white shadow-lg shadow-indigo-600/30 hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Connecting to Supabase...</span>
                </>
              ) : (
                <>
                  <span>{activeTab === 'login' ? 'Sign In via Supabase' : 'Create Scholar Account'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.08]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider">
              <span className="bg-zinc-950 px-2 text-zinc-500">or evaluate instantly</span>
            </div>
          </div>

          {/* Instant Sandbox Guest Access */}
          <button
            type="button"
            onClick={handleDemoAccess}
            disabled={loading}
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
    </AnimatePresence>
  );
}
