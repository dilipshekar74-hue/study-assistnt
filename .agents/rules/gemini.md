---
trigger: always_on
---

# ved.ai — Master Workspace Context & Architectural Invariants

## 1. Repository & Core Identity
- **Repository:** `dilipshekar74-hue/study-assistnt`
- **Application Name:** ved.ai (Astra Engine)
- **Architecture:** Dual-pane multimodal AI learning workbench (40% Left Socratic Stream & HUD / 60% Right Interactive Artifact Canvas) powered by a Multi-Tier Custom LLM Router (Grade 1 to Master's) and a dedicated Admin GATE DA Command Center.

## 2. Locked Tech Stack
- **Frontend:** React 18/19 (Vite / Next.js App Router), Tailwind CSS (`@tailwindcss/typography`), `framer-motion`, `lucide-react`.
- **Rendering Engines:** `katex`, `react-markdown`, `remark-math`, `rehype-katex`, `prismjs`/`@shikijs/core`, `mermaid`.
- **State & LLM SDK:** Zustand for global state (`useArtifactManager`, `useAcademicTier`, `useAdminGateStore`) + `@google/genai` (Gemini API structured JSON outputs & streaming).

## 3. Design System Invariants
- **Base Canvas:** `bg-zinc-950` (`#09090b`) with radial top glow `from-indigo-950/20 via-zinc-950/80 to-zinc-950`.
- **Glass Surfaces:** `bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] shadow-2xl rounded-2xl`.
- **Semantic Agent Accents:**
  - Primary / Voice Orb Pulse: Indigo (`#6366f1` / `text-indigo-400` / `bg-indigo-600`)
  - Vision / Math Annotations: Electric Cyan (`#06b6d4` / `text-cyan-400`)
  - Reasoning / Tool Execution Trace: Amber (`#f59e0b` / `text-amber-400`)
  - Validated Step / Sandbox Exit 0: Emerald (`#10b981` / `text-emerald-400`)
  - Admin GATE DA Mode Accent: Rose/Crimson (`#f43f5e` / `text-rose-400`) & Amber Gold (`#f59e0b`)

## 4. Core Directory Structure
- `src/components/hud/`: `AstraVoicePill.jsx`, `MultimodalControls.jsx`, `VisionBoundingBox.jsx`, `TierSelectorPill.jsx`
- `src/components/chat/`: `ChatStream.jsx`, `ReasoningTrace.jsx`, `ActionChips.jsx`
- `src/components/workbench/`: `ArtifactCanvas.jsx`, `MathDerivation.jsx`, `CodeRunner.jsx`, `StudyNotes.jsx`, `GateDaWorkbench.jsx`
- `src/llm/`: `vedCustomLlm.js`, `promptTemplates.js`, `gateDaEngine.js`, `responseSchema.js`
- `src/store/`: `useVedStore.js`

## 5. Coding & Verification Rules
- Never break the dual-pane layout or floating bottom Astra HUD in `src/App.jsx`.
- Every LLM call must return or stream a structured payload containing `reasoningTrace`, `socraticChat`, `actionChips`, and `artifactUpdate`.
- Never expose raw API keys in client bundles; route through environment variables or server actions.