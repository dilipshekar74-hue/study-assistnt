import React from 'react';
import { motion } from 'framer-motion';
import { Video, Monitor, MicOff, Sparkles, Loader2 } from 'lucide-react';
import { useAstraStore } from '../../store/useAstraStore';

export default function AstraVoicePill() {
  const { hudState, setHudState, activeModality, setModality } = useAstraStore();

  const toggleHudState = () => {
    if (hudState === 'idle') setHudState('listening');
    else if (hudState === 'listening') setHudState('thinking');
    else if (hudState === 'thinking') setHudState('speaking');
    else setHudState('idle');
  };

  return (
    <motion.aside
      layout
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-full border border-indigo-500/30 bg-zinc-950/85 px-4 py-2.5 backdrop-blur-2xl shadow-[0_0_35px_rgba(99,102,241,0.25)]"
      aria-label="Astra Multimodal HUD"
    >
      {/* Multimodal Viewfinder Triggers */}
      <div className="flex items-center gap-1 border-r border-white/10 pr-2">
        <button
          onClick={() => setModality(activeModality === 'vision' ? 'voice' : 'vision')}
          className={`p-2 transition-colors rounded-full hover:bg-white/[0.04] ${
            activeModality === 'vision' ? 'text-cyan-400 bg-cyan-500/10' : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="Toggle Camera Vision"
        >
          <Video className="h-4 w-4" />
        </button>
        <button
          onClick={() => setModality(activeModality === 'screen' ? 'voice' : 'screen')}
          className={`p-2 transition-colors rounded-full hover:bg-white/[0.04] ${
            activeModality === 'screen' ? 'text-cyan-400 bg-cyan-500/10' : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="Toggle Screen Inspection"
        >
          <Monitor className="h-4 w-4" />
        </button>
      </div>

      {/* Dynamic Waveform / Agent State Visualizer */}
      <div
        onClick={toggleHudState}
        className="flex items-center gap-2 px-2 cursor-pointer select-none"
        role="button"
        tabIndex={0}
      >
        {hudState === 'idle' && (
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-ping" />
            <span className="text-xs font-medium text-zinc-300">Astra Idle</span>
          </div>
        )}

        {hudState === 'listening' && (
          <div className="flex items-center gap-1">
            {[40, 75, 90, 50, 85, 30].map((height, i) => (
              <motion.span
                key={i}
                animate={{ height: [`${height}%`, '20%', `${height}%`] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                className="w-1 bg-indigo-400 rounded-full h-5"
              />
            ))}
            <span className="ml-2 text-xs font-medium text-indigo-300">Listening...</span>
          </div>
        )}

        {hudState === 'thinking' && (
          <div className="flex items-center gap-2 text-amber-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span className="text-xs font-medium">Synthesizing...</span>
          </div>
        )}

        {hudState === 'speaking' && (
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] animate-pulse" />
            <span className="text-xs font-medium text-cyan-300">Speaking...</span>
          </div>
        )}
      </div>

      {/* Mute / Reset Action */}
      <button
        onClick={() => setHudState('idle')}
        className="rounded-full bg-white/[0.06] p-2 text-zinc-400 hover:bg-red-500/20 hover:text-red-400 transition-all ml-1"
        title="Mute Audio Engine"
      >
        <MicOff className="h-4 w-4" />
      </button>
    </motion.aside>
  );
}
