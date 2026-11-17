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
- `.env.example` — demo-mode configuration template.

## Local setup after Codex scaffolds the application
1. Open this folder in VS Code.
2. Read `SPEC.md` and `AGENTS.md` in Codex.
3. Ask Codex to plan the scaffold before making changes.
4. Once `package.json` exists, use npm only:
   - `npm install`
   - `npm run dev`
   - `npm run lint`
   - `npx tsc --noEmit`
   - `npm run build`
5. Copy `.env.example` to `.env.local`.
6. Generate `DEMO_SESSION_SECRET` locally:
   `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`
7. Never commit `.env.local`.

## Demo data warning
All seeded events, profiles, attendance, aggregate counts and contact handles are fictional. Demo state is per browser and temporary. It is not a production authentication or persistence system.

## Important
The private contact fixture must never be imported into client components or serialized to the browser. Follow the privacy predicate and request/contact rules in `SPEC.md` and `AGENTS.md`.
