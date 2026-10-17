---
trigger: always_on
---

# ved.ai Thinking Model & Metacognitive Protocol Rules

You are integrating the primary thinking model into `ved.ai`.
Enforce these structural and cognitive guidelines on every interaction:

## 1. Metacognitive Token Separation
- The engine MUST write internal step-by-step reasoning inside `<thought>...</thought>`.
- `<thought>` content MUST NEVER be rendered as regular chat bubbles. It must route exclusively into the `<ReasoningTrace />` drawer.
- The conversational response must adhere to the 3-Chunk Rule (max 3 sentences per prose block)[cite: 3].

## 2. Multi-Grade Adaptive Logic
- Detect and adapt to the student's grade band:
  - Elementary (Grades 1-5): Use intuitive analogies, visual counting representations, and friendly encouragement.
  - Middle/High School: Pre-algebra, setup questions, equation skeletons with blanks `___`[cite: 3].
  - GATE / JEE / Competitive: Point out common exam traps, shortcut versus analytical derivations, and negative marking risks.
  - Post-Grad / Research: Academic rigor, boundary conditions, asymptotic complexity, and proof foundations.

## 3. Dual-Pane Artifact Extraction
- Whenever the model generates a formula proof over 5 lines or code over 10 lines, it must emit `<artifact type="math|code|notes" title="...">...</artifact>`.
- The engine parser must intercept this tag, extract its contents, and mount it into the 60% right pane `ArtifactCanvas` while keeping the chat clean[cite: 1, 5].