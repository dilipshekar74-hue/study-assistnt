---
trigger: always_on
---

# ved.ai Visual Effects & Canvas Performance Rules

## 1. Particle & Canvas Performance Invariants
- Rendering Engine: Lightweight Canvas 2D context using `requestAnimationFrame`. Avoid heavy Three.js dependencies unless 3D models are explicitly requested.
- Device Pixel Ratio: Always cap `dpr` at 2 (`Math.min(window.devicePixelRatio || 1, 2)`) to avoid GPU thermal throttling on high-resolution displays.
- Event Listeners: Mouse and resize events must use `{ passive: true }`.
- Layering: The canvas must include `pointer-events-none absolute inset-0 z-[1]` so interactive controls receive zero input latency.

## 2. Color Balance & Cognitive Ergonomics
- Palette must derive from `design-system.md`:
  - 60% Indigo (`rgb(99, 102, 241)`)
  - 20% Electric Cyan (`rgb(6, 182, 212)`)
  - 10% Solar Amber (`rgb(245, 158, 11)`)
  - 10% Starlight White (`rgb(255, 255, 255)`)
- Maximum alpha values must not exceed `0.75` for ambient particles and `1.0` for hover flares to avoid washing out text contrast.

## 3. Accessibility & Low Power
- Must respect `window.matchMedia('(prefers-reduced-motion: reduce)')`. When active, particle generation and loop executions must abort immediately.