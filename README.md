# EventConnect starter context (v4.1)

This folder is a **Codex starter pack**, not a runnable Next.js application yet.

## Read these files first
1. `SPEC.md` — authoritative product and implementation requirements.
2. `AGENTS.md` — persistent coding, design, privacy and workflow instructions.
3. `ASSETS.md` — landing image slots, variants and provenance notes.
4. `TEST_PLAN.md` — acceptance and privacy test cases.
5. `PRE_CODEX_AUDIT.md` — what was reviewed and corrected in v4.1.

## Included demo data
- `lib/fixtures/demo-data.ts` — public fictional event/profile/attendance/request fixtures.
- `lib/server/profile-private.ts` — private fictional contact handles; server-only.
- `public/landing/` — 12 landing image slots with 800px and 1600px WebP variants.
- `.env.example` — server-only demo and Supabase configuration template.
- `supabase/migrations/20261118000000_demo_session_state.sql` — demo-state table, grants and atomic write function.

## Local setup after Codex scaffolds the application
1. Open this folder in VS Code.
2. Read `SPEC.md` and `AGENTS.md` in Codex.
3. Ask Codex to plan the scaffold before making changes.
4. Once `package.json` exists, use npm only:
   - `npm.cmd install`
   - `npm.cmd run dev`
   - `npm.cmd run lint`
   - `npx.cmd tsc --noEmit`
   - `npm.cmd run build`
5. Copy `.env.example` to `.env.local`.
6. Generate `DEMO_SESSION_SECRET` locally:
   `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`
7. Never commit `.env.local`.

## Supabase setup for the judge demo

1. Use an authorized Supabase project with the Data API enabled and the `public` schema exposed to that API.
2. Apply the checked-in migration once, using the project's migration workflow or SQL Editor. It enables RLS, revokes browser access and grants the server role table reads, inserts and deletes plus execution of the atomic write function.
3. Set `DEMO_MODE=true`, `DEMO_SESSION_SECRET`, `SUPABASE_URL` (the project API URL), and `SUPABASE_SECRET_KEY` (the project's secret API key) in the server environment. The key bypasses RLS. Keep it out of browser bundles, logs and version control. The demo uses no Supabase Auth.
4. Before release, verify browser-role access is denied and run the concurrency checks in `TEST_PLAN.md`. Arrange periodic cleanup of rows where `expires_at <= now()` under a privileged database role. Session access expires after 12 hours regardless of cleanup timing.

The signed cookie contains only the opaque ID and timestamps. PostgreSQL stores its hash and mutable state for that browser. Each write checks the stored revision atomically. On a conflict the server reloads current state and reruns the relevant authorization and business rules.

## Judge walkthroughs

- Fresh journey: start as Karthik, join `ev-chess-01`, find Asha, and send a request with a fictional note. Switch to Asha and accept. Switch back to Karthik and verify that Asha's shared contact is displayed.
- Seeded acceptance: start with the existing Karthik → Meera pending request and accept as Meera. For the no-contact contrast, view the accepted Vikram → Rohan request as Vikram.

## Demo data warning
All seeded events, profiles, attendance, aggregate counts and contact handles are fictional. Demo state is per browser and temporary. It is not a production authentication or persistence system.

## Important
The private fixture stays server-only. Connections renders a single authorized handle as server-rendered text after the request and sharing checks. Keep handles out of browser-facing APIs, client component props, client stores, cookies and database state.
