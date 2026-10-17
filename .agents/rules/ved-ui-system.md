---
trigger: always_on
---

# ved.ai UI Design System & Component Guidelines

You are building the UI for ved.ai within `dilipshekar74-hue/study-assistnt`.
Follow these strict structural, aesthetic, and technical rules.

## 1. Technical Stack
- React 18 / 19 with Next.js App Router or Vite
- Tailwind CSS with @tailwindcss/typography
- Framer Motion for layout transitions and spring physics
- Lucide React for iconography
- KaTeX for LaTeX formula rendering

## 2. Color Tokens & Surface Hierarchy
- Base Background: `bg-zinc-950` (#09090b) with radial gradient `from-indigo-950/20 via-zinc-950/80 to-zinc-950`
- Surface Glass: `bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08]`
- Elevated Glass: `bg-zinc-800/75 backdrop-blur-2xl border border-white/[0.18]`
- Primary Brand Accent: `text-indigo-400`, `bg-indigo-600`, `shadow-indigo-500/25`
- Agent Telemetry (Search / Thinking): `text-amber-400`, `border-amber-500/20`, `bg-amber-500/10`
- Validated State / Tool Success: `text-emerald-400`, `border-emerald-500/20`, `bg-emerald-500/10`
- Vision Viewfinder / Bounding Box: `text-cyan-400`, `border-cyan-400`, `bg-cyan-500/10`

## 3. Layout Specifications
- Desktop (lg+): 40% Left Pane (`w-full lg:w-5/12`) for chat and telemetry; 60% Right Pane (`flex-1`) for Artifact Workbench.
- Mobile / Tablet (<1024px): Left pane expands to full width; workbench collapses to a slide-over modal.
- Astra HUD: Floating pill anchored at `fixed bottom-6 left-1/2 -translate-x-1/2 z-50`.