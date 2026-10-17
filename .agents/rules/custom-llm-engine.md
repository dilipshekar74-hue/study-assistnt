---
trigger: always_on
---

---
trigger: always_on
description: "Architecture and system prompt routing rules for the ved.ai Custom LLM Engine across Grade 1 to Master's levels"
---

# Custom LLM Engine (`Ved-Core`) Rules

## 1. Multi-Tier Pedagogical Routing
All student queries must pass through `buildVedSystemPrompt(tierId, subject, activeArtifact)` before invoking the LLM. Never use a single generic system prompt.

### Tier Definitions & Pedagogical Constraints
1. **`tier_primary` (Grades 1–5):**
   - Vocabulary: Everyday concrete words, gamified analogies, zero abstract jargon.
   - Formatting: Max 2 sentences per paragraph. Use visual counting blocks or story steps on the right canvas.
   - Socratic Rule: Ask playful 2-option discovery questions.

2. **`tier_middle` (Grades 6–8):**
   - Vocabulary: Introductory STEM terminology with immediate real-world examples.
   - Formatting: Max 3 sentences per block. Use fill-in-the-blank scaffolding (`___`) for basic equations.
   - Canvas Output: Interactive Markdown notes, basic flowcharts, and concept flashcards.

3. **`tier_high` (Grades 9–12):**
   - Vocabulary: Formal NCERT/CBSE/AP/IB academic terminology.
   - Formatting: Strict adherence to the 3-Chunk Rule (max 3 sentences per prose block, 3–5 bullets per list). Isolate multiline equations in `$$...$$` display LaTeX and carry physical units (`m/s²`, `Ω`, `J`) through every step.
   - Socratic Rule: Never reveal the final numerical or algebraic answer on Turn 1. Provide Level 1 (Concept Diagnosis) and Level 2 (Scaffolding Question).

4. **`tier_undergrad` (University B.E. / B.Tech / B.Sc):**
   - Vocabulary: Rigorous engineering, computer science, and mathematical terminology.
   - Formatting: Emphasize time/space complexity ($\mathcal{O}(n \log n)$), boundary conditions, and invariant proofs. Place code exceeding 15 lines inside the right-pane `CodeRunner` artifact.
   - Socratic Rule: Guide via edge-case interrogation, dry-run trace tables, and line-by-line bug diffs.

5. **`tier_masters` (Master's / Postgraduate / Research):**
   - Vocabulary: Graduate-level theoretical depth, optimization duality, matrix calculus, and algorithmic lower bounds.
   - Formatting: Full theorem-proof structures, LaTeX matrix decompositions, and ablation comparisons.
   - Socratic Rule: Challenge assumptions, ask for convergence criteria, or prompt for alternative mathematical formulations.

## 2. Mandatory Structured Output Schema
Every LLM response must conform to this JSON contract so the UI updates optimistically without parsing errors:

```json
{
  "reasoningTrace": {
    "durationMs": 420,
    "indexedSources": ["Chapter 4: Work-Energy Theorem"],
    "pedagogicalStrategy": "Level 2 Scaffolding: Omitting final integral evaluation",
    "steps": [
      "Identified tier: tier_high",
      "Formulated definite integral setup on right-hand KaTeX canvas"
    ]
  },
  "socraticMessage": "Markdown + inline $LaTeX$ string adhering to the 3-Chunk Rule.",
  "actionChips": [
    { "label": "💡 Give me a hint", "prompt": "Give me the next progressive hint for this step." },
    { "label": "📊 Show graphical intuition", "prompt": "Render a visual breakdown on the canvas." },
    { "label": "🧪 Test my understanding", "prompt": "Generate an isomorphic practice problem." }
  ],
  "artifact": {
    "shouldOpen": true,
    "type": "math | code | notes | gate_simulator",
    "title": "Artifact Title",
    "stepBadge": "Step 1: Formulation",
    "validationStatus": "Validated | Needs Input | Trap Alert",
    "content": "Primary LaTeX / Code / Markdown payload",
    "pedagogicalNote": "Contextual tip or invariant note at the bottom of the canvas"
  }
}