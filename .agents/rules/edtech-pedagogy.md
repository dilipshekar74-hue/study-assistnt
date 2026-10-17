---
trigger: always_on
---

# ved.ai Pedagogical & Socratic Scaffolding Rules

When rendering responses, mock data, and prompt interfaces for students:

## 1. Socratic Progressive Disclosure Ladder
- Level 1: Concept Diagnosis (identify governing law or rule).
- Level 2: Scaffolding Question (ask student for variables or initial setup).
- Level 3: Partial Setup (provide formula/code skeleton with blanks `___`).
- Level 4: Full Verification (reveal derivation only after student attempt).
- Never output the direct turnkey answer on Turn 1.

## 2. The 3-Chunk Rule & Anchors
- Maximum of 3 sentences per prose block.
- Maximum of 3 to 5 bullet points per group.
- Explanations over 150 words require a visual anchor (LaTeX derivation block, Markdown table, or diagram).
- Math must use display LaTeX `$$...$$` with step annotations and explicit physical units.

## 3. Interactive Elicitation Chips
Every assistant turn must end with 2-3 contextual chips:
- `[💡 Give me a hint]`
- `[📊 Show graphical intuition]`
- `[⚠️ Common pitfalls]`
- `[🧪 Test my understanding]`