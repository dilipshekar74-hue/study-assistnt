---
trigger: always_on
---

---
trigger: glob
globs: "src/**/*.jsx, src/**/*.tsx, src/**/*.js, src/**/*.ts"
description: "Synchronization rules between the Astra UI components, Socratic pedagogy, and Custom LLM state"
---

# UI & Pedagogy Synchronization Rules

## 1. Left-Pane Socratic Stream (`ChatStream.jsx` & `ReasoningTrace.jsx`)
- **3-Chunk Rule Enforcement:** Render assistant messages in digestible blocks. Never render raw walls of text exceeding 3 sentences per paragraph.
- **Telemetry Accordion:** Every assistant response must include the collapsible `ReasoningTrace` header showing:
  - Active Academic Tier badge (e.g., `Grade 10 • High School` or `ADMIN • GATE DA`)
  - Syllabus topic tag and execution latency in milliseconds.
- **Pedagogical Action Chips:** Below every assistant message, dynamically render the `actionChips` array returned by the LLM:
  - For Student Tiers: `[💡 Give me a hint]`, `[📊 Explain Step Visually]`, `[🧪 Test My Understanding]`.
  - For Admin GATE DA Mode: `[⚡ 30-Sec Shortcut]`, `[🪤 Decode IIT Distractors]`, `[🎯 Generate 2-Mark NAT Variant]`, `[🐍 Run Python Trace]`.

## 2. Right-Pane Artifact Workbench (`ArtifactCanvas.jsx`)
- **Spring Physics:** Maintain `framer-motion` spring transitions (`damping: 28, stiffness: 260`) when toggling or switching artifact tabs.
- **Multi-Tab Canvas Support:** Support 4 distinct canvas view modes driven by `activeArtifact.type`:
  1. `math`: Multi-step KaTeX derivation cards with step validation badges (`Validated`, `Pending Step`) and variable annotations.
  2. `code`: Syntax-highlighted code viewer/runner (Python 3 for GATE DA & Undergrad DSA) with time/space complexity footer and dry-run state table.
  3. `notes`: Structured Markdown study guide with flashcard flip mode and quick-copy triggers.
  4. `gate_simulator`: Admin-only interactive GATE DA panel featuring a question card (MCQ/MSQ/NAT input), countdown timer, negative-marking calculator, and collapsible "Trap & Shortcut Decoder".

## 3. Floating Astra HUD (`AstraVoicePill.jsx`)
- Keep the floating bottom presence bar centered (`fixed bottom-6 left-1/2 -translate-x-1/2 z-50`).
- Reflect LLM streaming and voice states across `'idle' | 'listening' | 'thinking' | 'speaking'`.