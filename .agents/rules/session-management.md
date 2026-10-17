---
trigger: always_on
---

# ved.ai Student Session Management Standards

## 1. Storage & Persistence Invariants
- State Engine: Zustand with `persist` middleware storing to `localStorage` under key `ved-ai-student-sessions`.
- Schema Isolation: Every session contains its own `id`, `title`, `messages[]`, and `artifact{}` payload[cite: 1, 2].
- Topic Switching: Switching `activeSessionId` must swap the active chat feed and the active Artifact Workbench instantaneously without network roundtrips[cite: 1, 5].

## 2. Gemini-Style Visual Ergonomics
- Layout Drawer: Width `280px` desktop; full-width overlay on viewport widths `<768px`.
- Dynamic Renaming: Double-click or kebab-menu click triggers inline input editing with instant save on Enter/Blur.
- Chronological Sorting:
  - "Today" (updated < 24 hours ago)
  - "Previous 7 Days" (updated < 7 days ago)
  - "Older" (updated > 7 days ago)

## 3. Distributed Sync Invariants
- Optimistic Writes: All actions (`addMessageToActiveSession`, `updateActiveArtifact`) must mutate local Zustand state before awaiting Supabase HTTP promises.
- Write Debouncing: Any change to `content` in KaTeX or Markdown canvases must use a 1000ms debounce interval to adhere to Supabase rate limits.
- Cascading Identity: Artifact records must reuse their parent session's UUID as their primary key (`id`) to enforce a 1:1 mapping with zero foreign-key lookup overhead.