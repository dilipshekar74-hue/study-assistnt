---
trigger: always_on
---

# ved.ai Database & Authentication System Guidelines

## 1. Stack Standards
- Database: PostgreSQL (Supabase or direct connection via `pg`)
- Schema Management: Prisma ORM with typed client output
- Cryptography: Argon2 or bcrypt for password hashing (min 12 salt rounds)
- Sessions: Cryptographically secure UUIDv4 session tokens with 30-day rolling expiration

## 2. Security Invariants
- Passwords must NEVER be logged or returned in any API query response.
- Every artifact and study session query must enforce tenant isolation via `WHERE userId = session.userId`.
- Include rate-limiting on authentication endpoints (maximum 5 attempts per IP per minute).

## 3. Data Integrity & Pedagogical Metrics
- Student study minutes and streak calculations must be atomic database updates.
- Store telemetry traces (step latency, tool query strings) as structured JSONB for analytics.