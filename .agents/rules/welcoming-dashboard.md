---
trigger: always_on
---

# ved.ai Welcoming Dashboard & Empty Session Rules

## 1. Aesthetic & Ambient Invariants
- Base Canvas: `bg-zinc-950` with the Astra radial glow (`from-indigo-950/25 via-zinc-950/80 to-zinc-950`)[cite: 4, 5].
- Greeting Typography: Large gradient display header (`text-3xl sm:text-5xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-zinc-100 to-cyan-300`)[cite: 5].
- Time-Aware Dynamic Greeting: Compute "Good morning", "Good afternoon", or "Good evening" dynamically based on client local time.

## 2. Bento Card Grid Architecture
- Six high-intent starter categories:
  1. `STEM Derivations`: Sets workbench mode to `math` with KaTeX step validation[cite: 2, 5].
  2. `Code & Algorithms`: Pre-populates the sandbox editor with algorithmic templates[cite: 2, 5].
  3. `Vision HUD Scan`: Instantly opens the `<VisionOverlay />` camera viewfinder[cite: 5].
  4. `GATE DA Exam Test`: Opens the GATE NAT problem suite and TCS iON calculator replica.
  5. `Concept Notes`: Mounts the markdown study matrix[cite: 2, 5].
  6. `Socratic Teardown`: Prompts the assistant to withhold direct answers and initiate Level 1 concept diagnosis[cite: 3].

## 3. Transition Physics
- The greeting cockpit must occupy the vertical center when `messages.length === 0`.
- Upon message dispatch or card selection, the cockpit gracefully exits via Framer Motion:
  `exit={{ opacity: 0, y: -20, transition: { duration: 0.25 } }}`.
- The dual-pane conversation stream and Artifact Workbench will then mount smoothly[cite: 1, 5].