/**
 * TopNavBar.jsx
 * Top Brand Navigation Bar with Academic Level Selector Pill, Admin GATE DA Command Toggle,
 * and live exam telemetry integration.
 * Adheres strictly to .agents/rules/custom-llm-engine.md, .agents/rules/admin-gate-da.md, and .agents/rules/gemini.md
 */

import React from 'react';
import {
  Sparkles,
  Zap,
  Menu,
  PlusCircle,
  BookOpen,
  ExternalLink,
  LogOut,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';
import { useVedStore } from '../../store/useVedStore.js';
import { useSessionStore } from '../../store/useSessionStore.js';
import TierSelectorPill from './TierSelectorPill.jsx';
import GateFilterBar from './GateFilterBar.jsx';
import SyncStatusBadge from '../common/SyncStatusBadge.jsx';

export default function TopNavBar({
  isSidebarOpen,
  toggleSidebar,
  currentSession,
  onNewSession,
  onOpenCanvas,
  onViewLanding,
  onSignOut,
  onTierChange,
  onSelectGateProblem
}) {
  const {
    activeTier,
    isAdminMode,
    toggleAdminMode,
    activeArtifact
  } = useVedStore();

  return (
    <div className="relative z-20 flex flex-col shrink-0 border-b border-white/[0.08] backdrop-blur-xl bg-zinc-950/70">
      {/* Primary Top Bar */}
      <header className="flex h-16 items-center justify-between px-6 gap-3">
        {/* Left Section: Brand, Sidebar Toggle & Tier Selector */}
        <div className="flex items-center gap-3 min-w-0">
          {!isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Open sessions sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>
          )}

          {/* Brand Logo & Version */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-md shadow-indigo-500/25">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold tracking-tight text-white">ved.ai</span>
                <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-1.5 py-0.2 text-[9px] font-mono uppercase text-indigo-400">
                  Astra v2.4
                </span>
              </div>
            </div>
          </div>

          {/* Academic Level Selector Pill */}
          <div className="shrink-0">
            <TierSelectorPill onTierChange={onTierChange} />
          </div>

          {/* IIT GATE DA Command Toggle */}
          <button
            onClick={() => toggleAdminMode()}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-sm ${
              isAdminMode
                ? 'border border-rose-500/50 bg-rose-500/20 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.25)] animate-pulse'
                : 'border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:border-rose-500/50 hover:bg-rose-500/15'
            }`}
            title="Toggle IIT GATE DA Exam Simulator"
          >
            <Zap className={`h-3.5 w-3.5 ${isAdminMode ? 'text-rose-400 fill-rose-400' : 'text-rose-400'}`} />
            <span className="hidden md:inline">IIT GATE DA</span>
            {isAdminMode && (
              <span className="rounded bg-rose-500/30 px-1 text-[9px] font-mono text-rose-200 uppercase">
                Active
              </span>
            )}
          </button>
        </div>

        {/* Right Section: Workspace actions & User Controls */}
        <div className="flex items-center gap-2 shrink-0 text-xs text-zinc-400">
          <SyncStatusBadge />

          {onNewSession && (
            <button
              onClick={onNewSession}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="New Study Session"
            >
              <PlusCircle className="h-3.5 w-3.5 text-indigo-400" />
              <span className="hidden lg:inline">New Session</span>
            </button>
          )}

          {!activeArtifact?.isOpen && onOpenCanvas && (
            <button
              onClick={onOpenCanvas}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Open Derivation Canvas"
            >
              <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
              <span className="hidden lg:inline">Open Canvas</span>
            </button>
          )}

          {onViewLanding && (
            <button
              onClick={onViewLanding}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] rounded-lg transition-colors cursor-pointer"
              title="View Launch Page"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
          )}

          {onSignOut && (
            <button
              onClick={onSignOut}
              className="p-1.5 text-zinc-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      {/* Admin GATE DA Secondary Filter & Live Telemetry Bar */}
      {isAdminMode && (
        <GateFilterBar onSelectProblem={onSelectGateProblem} />
      )}
    </div>
  );
}
