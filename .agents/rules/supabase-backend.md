---
trigger: always_on
---

# ved.ai Supabase Integration & RLS Guidelines

You are connecting `dilipshekar74-hue/study-assistnt` to Supabase.
Adhere strictly to the following invariants:

## 1. Authentication Invariants
- Use `@supabase/supabase-js` v2 for all authentication actions.
- Do not store raw passwords or handle JWT decryption manually; rely on `supabase.auth`.
- Ensure email confirmations do not block UI testing if Supabase project has "Confirm email" disabled for local development.

## 2. Row Level Security & Queries
- Query tables directly using the initialized client: `supabase.from('artifacts').select('*')`.
- All writes (`insert`, `update`, `delete`) must attach the current authenticated user's ID via `session.user.id`.
- Catch and display human-readable Supabase error strings (e.g., `error.message`) inside the auth modal.

## 3. Real-Time Artifact Sync
- Active artifact updates on the right pane can subscribe to Supabase Realtime channels using:
  `supabase.channel('public:artifacts').on('postgres_changes', ...)`
- Debounce artifact content saves by 1000ms to avoid overwhelming database write limits.