# AGENTS.md

## Project
EventConnect: Bengaluru-first event discovery and event-centred networking. Initial domains: OTB chess and hackathons. Read `SPEC.md`, `ASSETS.md` and `TEST_PLAN.md` before implementation. If files conflict, stop and ask; do not silently choose.

## Package manager and commands
- Use **npm only** for this repository.
- Create and commit `package-lock.json`.
- Do not create pnpm/yarn lockfiles or mix package managers.
- Confirm scripts in `package.json` after scaffolding.
- Install: `npm install`
- Dev: `npm run dev`
- Lint: `npm run lint`
- Type check: `npx tsc --noEmit` (or `npm run typecheck` only if that script exists).
- Build: `npm run build`
- Run the checks at each milestone. Report any command that does not exist rather than inventing it.

## Working protocol
- For tasks marked `PLAN FIRST`, reply with a concise plan and exact files to be touched; wait for approval.
- Touch only files named in the task. If another file is required, explain why before editing.
- Implement one vertical slice at a time. Do not rewrite unrelated modules.
- Do not add dependencies without explaining why. Default answer is no.
- Finish every task with files changed, commands run/results and known gaps.
- Never invent real events, organisers, URLs or people. All fixtures are fictional and visibly labelled Sample/Demo.
- Do not claim fixture/cookie state is production account persistence.

## Structure
```text
app/(landing)/page.tsx
app/(app)/explore/
app/(app)/events/[id]/
app/(app)/people/
app/(app)/connections/
app/(app)/profile/
components/landing/              # scenes.ts, Scene, Wordmark, Controls
components/ui/                   # shared UI, SampleBadge, PersonaSwitcher
lib/data/                        # repository interface + fixture repository
lib/fixtures/demo-data.ts        # public-only fixture data
lib/server/profile-private.ts   # private contacts; server-only
lib/server/demo-session.ts      # signed demo cookie
lib/privacy/                     # discovery, request and contact predicates
public/landing/                  # 12 slots, 800/1600 WebP
SPEC.md
AGENTS.md
ASSETS.md
TEST_PLAN.md
```
All data access goes through `lib/data/*`. UI components never query Supabase directly. Privacy and request decisions live in `lib/privacy/*` and are called by server components/actions/route handlers. Private contact data is never imported into client components.

## Design direction
- Landing (`/`): editorial photo-collage scenes, fixed centred serif wordmark, tagline and one CTA to `/explore`. Follow SPEC section 2A.
- Remove the top-left menu and do not add unimplemented About/Privacy links or routes.
- Use only the supplied `public/landing/` assets and the scene plan in SPEC/ASSETS. Do not fetch or invent images.
- Slot 03 is flagged and must not be rendered in the default scene sequence until replaced and the asset register is updated. Use slots 04, 10 and 11 for default scene 3.
- Preserve image aspect ratio; use responsive art direction and deliberate `object-position`.
- For Next.js 16+, use `Image` `preload` rather than deprecated `priority`. Preload only the single initial hero/LCP image if appropriate; lazy-load the rest. Confirm the installed Next.js version.
- Respect `prefers-reduced-motion`, pause on hover/focus/hidden tab, provide keyboard-operable controls, no autoplay audio.
- Mobile landing must be recomposed, not a shrunken desktop.
- Application modules are light-first, restrained, accessible and task-focused. The collage stays on the landing page.
- Avoid heavy gradients, glassmorphism and generic dashboard clutter. Provide accessible contrast, keyboard navigation and visible focus states.

## Demo mode and signed cookie
- `DEMO_MODE=true` enables the public fictional judge demo; `DEMO_MODE=false` disables persona switching and demo mutations.
- When demo mode is true, `DEMO_SESSION_SECRET` is mandatory and must be a strong random secret of at least 32 bytes. Fail closed if it is absent.
- Generate locally using `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`.
- Cookie name: `eventconnect_demo`; HMAC-SHA-256 signature verified on the server using constant-time comparison.
- Cookie options: HttpOnly, SameSite=Lax, Path=/, Secure in production, Max-Age=43200 (12 hours).
- Cookie payload contains only active persona id, issued/expiry times and compact non-sensitive state overrides. Never put contact handles, email addresses, private profile fields or secrets in it. HMAC signing is integrity, not encryption.
- Validate all persona IDs, request IDs, status enums and preference overrides against known fixture data.
- Demo state is per browser and lasts at most 12 hours; it survives refresh/navigation but is not shared across browsers or production persistence.
- A missing, expired, malformed or invalidly signed cookie resolves to guest. Provide Reset demo.
- Default demo persona is Karthik only after the user explicitly chooses “Try demo as Karthik”. Landing CTA enters as guest.

## Privacy and security (non-negotiable)
- Enforce every rule on the server. UI hiding is not enforcement.
- Named event participants may be returned only if:
  1. Viewer has an active valid 18+ demo persona.
  2. Viewer has interested/going attendance for that event.
  3. Event is not junior.
  4. Target is not viewer.
  5. Target profile is 18+ and `discoverable = true`.
  6. Target has interested/going attendance for that event and `visibility = public`.
- Anonymous attendance OR `discoverable = false` means no identity/profile details; aggregate count only.
- Guest sees event details and aggregate counts only. Junior events show details and synthetic aggregate counts only; no named attendance, People results, request CTA or contact reveal.
- Viewer does not need to make their own profile discoverable to view other eligible people.
- People is event-scoped to events the active viewer attends. No global directory and no cold DMs.
- Never expose Supabase service-role or secret keys in browser code/client bundles.
- If Supabase is used, enable RLS on every exposed table and define explicit per-operation policies.
- Public external rosters are not consent to create profiles or permit messaging. Never import rosters.
- No exact home address, home coordinates or live location.

## Requests and contact reveal
- Sender and recipient must be different 18+ profiles participating (interested/going) in the same non-junior event.
- Recipient must be discoverable and have public attendance for that event. Sender must have an active demo persona.
- Note must be trimmed, non-empty and <= 280 characters.
- Maximum five outgoing pending requests per sender.
- Prevent a second request for the same unordered profile pair/event in the demo, regardless of prior status.
- Only recipient can accept/decline a pending request. Only sender can cancel. Terminal states cannot be changed.
- Contact is visible only after an accepted request AND the contact owner’s `share_contact_on_accept=true` AND a valid handle exists.
- Owner alone changes the preference; new profiles default false; turning it off hides contact immediately.
- Private contact fixture is in `lib/server/profile-private.ts` with a `server-only` guard. Never serialize it to the client.

## Out of scope
Real-time chat, scraping, roster import, payments, push notifications, native app, routing engine, ML recommendations, organiser analytics, production moderation console, global people directory and full production authentication. `/create-event` and poster extraction are optional only after every P0 criterion passes.
