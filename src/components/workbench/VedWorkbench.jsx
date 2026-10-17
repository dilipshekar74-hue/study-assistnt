import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  BookOpen,
  Send,
  LogOut,
  PlusCircle,
  GraduationCap,
  ExternalLink,
  ShieldCheck,
  Loader2
} from 'lucide-react';

import { useAstraStore } from '../../store/useAstraStore';
import AstraVoicePill from '../hud/AstraVoicePill';
import VisionOverlay from '../hud/VisionOverlay';
import ChatStream from '../chat/ChatStream';
import ArtifactCanvas from './ArtifactCanvas';
import WelcomingDashboard from '../dashboard/WelcomingDashboard';
import { generateSocraticResponse } from '../../services/socraticEngine';

export default function VedWorkbench({ session, profile, onSignOut, onReturnToLanding }) {
  const {
    messages,
    setMessages,
    addMessage,
    clearMessages,
    activeArtifact,
    openArtifact,
    user,
    logout,
    setHudState
  } = useAstraStore();

  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const currentEmail = profile?.email || session?.user?.email || user?.email || 'Scholar';
  const currentMajor = profile?.major || user?.studentProfile?.major || 'Theoretical Physics';
  const scholarName = profile?.fullName || profile?.full_name || user?.user_metadata?.full_name || currentEmail.split('@')[0];

  // Dispatches prompt, sets artifact type, and transitions immediately to dual-pane workbench
  const handleStartSession = (promptText, artifactConfig) => {
    const textToSend = (typeof promptText === 'string' ? promptText : inputText).trim();
    if (!textToSend || isStreaming) return;

    setInputText('');

    if (artifactConfig) {
      openArtifact(artifactConfig);
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      textParagraphs: [textToSend]
    };

    addMessage(userMessage);
    setIsStreaming(true);
    setHudState('thinking');

    // Socratic Progressive reasoning & indexing simulation
    setTimeout(() => {
      const response = generateSocraticResponse(textToSend, [userMessage]);

      if (response.artifactUpdate && !artifactConfig) {
        openArtifact(response.artifactUpdate);
      }

      addMessage(response);
      setIsStreaming(false);
      setHudState('speaking');

      setTimeout(() => {
        setHudState('idle');
      }, 1600);
    }, 850);
  };

  const handleSend = (textInput) => {
    handleStartSession(textInput);
  };

  const handleSignOut = async () => {
    if (onSignOut) {
      await onSignOut();
    } else {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch {}
    }
    localStorage.removeItem('ved_token');
    logout();
  };

  return (
    <div className="relative flex flex-col h-screen w-screen overflow-hidden bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Ambient Radial Gradient Background per ved-ui-system.md */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-950/20 via-zinc-950/80 to-zinc-950" />

      {/* Persistent Workbench Navigation Header */}
      <header className="relative z-20 flex h-16 shrink-0 items-center justify-between border-b border-white/[0.08] px-6 backdrop-blur-md bg-zinc-950/60">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/25">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-tight text-zinc-100">ved.ai</span>
              <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider text-indigo-400">
                Astra Engine
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
              <GraduationCap className="h-3 w-3 text-indigo-400 shrink-0" />
              <span className="truncate max-w-[160px] text-zinc-300 font-medium">{currentMajor}</span>
              <span className="text-zinc-600">•</span>
              <span className="truncate max-w-[120px] text-zinc-400">{scholarName}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* New Session button to return to welcoming dashboard */}
          {messages.length > 0 && (
            <button
              onClick={() => clearMessages()}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
              title="Return to Welcoming Dashboard"
            >
              <PlusCircle className="h-3.5 w-3.5 text-indigo-400" />
              <span>New Session</span>
            </button>
          )}

          {!activeArtifact.isOpen && messages.length > 0 && (
            <button
              onClick={() => openArtifact({ type: 'math', title: 'Work-Energy Derivation' })}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
              <span>Open Canvas</span>
            </button>
          )}

          {onReturnToLanding && (
            <button
              onClick={onReturnToLanding}
              className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] rounded-lg transition-colors cursor-pointer"
              title="View Launch Page"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] p-2 text-xs text-zinc-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* Main Workspace Frame with Framer Motion AnimatePresence Transitions */}
      <main className="relative z-10 flex-1 flex overflow-hidden w-full">
        <AnimatePresence mode="wait">
          {messages.length === 0 ? (
            /* Welcoming Cockpit Dashboard (rendered when messages.length === 0) */
            <motion.div
              key="welcoming-dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, transition: { duration: 0.25 } }}
              className="w-full h-full overflow-y-auto"
            >
              <WelcomingDashboard
                onSelectPrompt={handleStartSession}
                userProfile={profile || { fullName: scholarName, major: currentMajor }}
              />
            </motion.div>
          ) : (
            /* Dual-Pane Split Workspace (40% Socratic Chat / 60% Artifact Workbench) */
            <motion.div
              key="dual-pane-workspace"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex h-full w-full"
            >
              {/* Left Pane: Socratic Stream & Telemetry (40% width on lg screens) */}
              <section
                className={`flex flex-col h-full transition-all duration-300 ${
                  activeArtifact.isOpen ? 'w-full lg:w-5/12' : 'w-full max-w-4xl mx-auto'
                }`}
              >
                {/* Socratic Conversation Stream */}
                <ChatStream
                  messages={messages}
                  onSelectChip={(chipQuery) => handleSend(chipQuery)}
                  isStreaming={isStreaming}
                />

                {/* Input Dock */}
                <div className="p-4 border-t border-white/[0.08] bg-zinc-950/80 backdrop-blur-lg">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={inputText}
                      disabled={isStreaming}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder={isStreaming ? 'ved.ai is reasoning...' : 'Ask ved.ai or explore progressive hints below...'}
                      className="w-full rounded-2xl border border-white/10 bg-zinc-900/60 px-4 py-3 pr-12 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all disabled:opacity-60"
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={!inputText.trim() || isStreaming}
                      className="absolute right-2.5 p-2 text-zinc-400 hover:text-indigo-400 disabled:opacity-40 disabled:hover:text-zinc-400 transition-colors cursor-pointer"
                    >
                      {isStreaming ? (
                        <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </section>

              {/* Right Pane: Artifact Workbench Canvas (60% width on lg screens) */}
              <AnimatePresence>
                {activeArtifact.isOpen && (
                  <motion.div
                    initial={{ opacity: 0, x: 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 60 }}
                    transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                    className="hidden lg:flex flex-1 h-full"
                  >
                    <ArtifactCanvas />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Spatial Multimodal Viewfinder and Floating Astra Presence HUD */}
      <VisionOverlay />
      <AstraVoicePill />
    </div>
  );
}
