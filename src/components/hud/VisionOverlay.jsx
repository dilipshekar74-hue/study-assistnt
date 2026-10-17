import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Scan, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAstraStore } from '../../store/useAstraStore';
import { useAstraVision } from '../../hooks/useAstraVision';

/**
 * Spatial vision viewfinder with animated targeting reticles
 * and dynamic bounding box detection for textbook formulas and diagrams.
 */
export default function VisionOverlay() {
  const { activeModality, setModality, hudState } = useAstraStore();
  const {
    videoRef,
    isStreaming,
    capturedFrame,
    startVisionStream,
    stopVisionStream,
    captureFrame
  } = useAstraVision();

  useEffect(() => {
    if (activeModality === 'vision' || activeModality === 'screen') {
      startVisionStream(activeModality);
    } else {
      stopVisionStream();
    }
    return () => stopVisionStream();
  }, [activeModality, startVisionStream, stopVisionStream]);

  if (activeModality === 'voice') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', damping: 25, stiffness: 280 }}
        className="fixed inset-4 z-40 flex flex-col overflow-hidden rounded-3xl border border-cyan-500/30 bg-zinc-950/90 backdrop-blur-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] lg:inset-8"
      >
        {/* Viewfinder Top Control Bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.08] px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Scan className="h-4 w-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-tight text-zinc-100">
                  Astra Spatial Viewfinder
                </span>
                <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-mono uppercase text-cyan-400 border border-cyan-500/20">
                  {activeModality === 'vision' ? 'Camera Feed' : 'Desktop Share'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Point at a textbook problem, handwritten equation, or circuit</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setModality('voice')}
              className="rounded-full bg-white/[0.05] p-2 text-zinc-400 hover:bg-white/[0.1] hover:text-zinc-200 transition-colors"
              title="Close Viewfinder"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Viewport Canvas Surface */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          {/* Live Video / Captured Image Surface */}
          {capturedFrame ? (
            <img
              src={capturedFrame}
              alt="Captured STEM Problem"
              className="h-full w-full object-contain filter contrast-105"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-contain"
            />
          )}

          {/* Grid Scanning Overlay Lines */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#06b6d40a_1px,transparent_1px),linear-gradient(to_bottom,#06b6d40a_1px,transparent_1px)] bg-[size:32px_32px]" />

          {/* Simulated Dynamic Bounding Box Overlay */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="pointer-events-none absolute w-72 h-44 border-2 border-cyan-400 bg-cyan-500/10 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.25)] flex flex-col justify-between p-2.5"
          >
            {/* Top Tag */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded bg-cyan-950/80 px-2 py-0.5 font-mono text-[10px] font-medium text-cyan-300 border border-cyan-400/40">
                <Sparkles className="h-2.5 w-2.5" />
                [Textbook Problem 4.2]
              </span>
              <span className="font-mono text-[10px] text-cyan-400/80">98.4% Confidence</span>
            </div>

            {/* Corner Bracket Accents */}
            <div className="flex justify-between items-end">
              <span className="font-mono text-[9px] text-cyan-200/70">Target: Work-Energy Derivation</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
            </div>
          </motion.div>
        </div>

        {/* Viewfinder Bottom Action Dock */}
        <footer className="flex h-20 shrink-0 items-center justify-between border-t border-white/[0.08] bg-zinc-950/80 px-6 backdrop-blur-md">
          <div className="text-xs text-zinc-400">
            {capturedFrame ? (
              <span className="text-emerald-400">Frame frozen and sent to agent reasoning engine</span>
            ) : (
              <span>Position problem inside the target frame and capture</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {capturedFrame ? (
              <button
                onClick={() => startVisionStream(activeModality)}
                className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                Retake
              </button>
            ) : (
              <button
                onClick={captureFrame}
                className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-semibold text-zinc-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/25 transition-all"
              >
                <Camera className="h-4 w-4" />
                Capture Problem
              </button>
            )}
          </div>
        </footer>
      </motion.div>
    </AnimatePresence>
  );
}
