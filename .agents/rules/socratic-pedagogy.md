---
trigger: always_on
---

# ved.ai Pedagogical & Socratic Scaffolding Rules

When implementing UI surfaces, mock data, and prompt renderers for students:

## 1. Response Structuring
- Never display full, unrequested problem solutions on Turn 1.
- Limit continuous conversational text to a maximum of 3 sentences per paragraph.
- Any derivation exceeding 10 lines must be dispatched to the `Artifact Workbench` rather than printed inline in the chat bubble.

## 2. Reasoning Trace Presentation
- Chain-of-thought tokens, tool calls, and document index searches must live inside a collapsible `<ReasoningTrace />` drawer.
- Display latency badges (e.g., "Thought for 1.2s", "Indexed 2 chapters").

## 3. Interactive Elicitation Chips
Every assistant turn must end with 2-3 contextual chips:
- `[💡 Give me a hint]` -> Progressive hint level increment.
- `[📊 Show graphical intuition]` -> Opens visual derivation or diagram.
- `[⚠️ Common pitfalls]` -> Highlights standard exam errors.