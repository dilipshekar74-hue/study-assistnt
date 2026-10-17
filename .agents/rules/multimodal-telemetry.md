---
trigger: always_on
---

# ved.ai Astra Multimodal & Agentic Telemetry Rules

## 1. HUD Presence State Machine
The floating HUD must support 4 dynamic states:
- `idle`: Subtle pulsing sphere with 4s breathing cycle (`shadow-[0_0_24px_rgba(99,102,241,0.2)]`).
- `listening`: 6-band dynamic audio frequency bars scaling between 15% and 90% height.
- `thinking`: Dual orbital spinning indicators with amber/indigo glow and process micro-badge.
- `speaking`: Rhythmic cyan glow expansion synchronized with audio stream.

## 2. Reasoning Trace Standards
- Tool executions (web searches, Python sandbox, math solver) must render inside `<ReasoningTrace />`.
- Collapsed state displays summary badge: `Reasoning Trace • 1.4s`.
- Expanded state renders chronological steps with tool status badges (`running`, `success`, `failed`).

## 3. Vision HUD Bounding Overlays
- Bounding box class: `border-2 border-cyan-400 bg-cyan-500/10 rounded-lg`.
- Labels must display recognized entity tags: `[Textbook Problem 4.2]`, `[Circuit Diagram]`, `[Syntax Error]`.