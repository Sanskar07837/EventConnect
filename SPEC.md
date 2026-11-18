# EventConnect — Product & Build Specification (v4.1)

> This is the authoritative product and implementation specification for the 12-hour hackathon prototype. Read it together with `AGENTS.md`, `ASSETS.md` and `TEST_PLAN.md`. If a conflict is found, stop and ask rather than silently choosing.

## 1. Product

EventConnect is a Bengaluru-first, event-centred discovery and networking platform. The first two domains are over-the-board (OTB) chess and hackathons.

**Promise:** Discover events worth attending. Find people to do them with.

The product combines two experiences:
1. A distinctive public welcome page that introduces the brand.
2. A functional application where users discover events and connect with people around those events.

The core product proof is the event-to-connection journey, not the collage animation.

## 2. Experience architecture

### 2A. Landing page (`/`)

The landing page is a welcome/brand entry point, not a dashboard. It is inspired by the mechanism of a supplied editorial-collage reference only. Do not reuse that site's name, logo, photography, wording, exact composition, or signature motifs.

**Composition**
- Fixed, centred serif wordmark: `EventConnect`.
- Tagline: **“Discover events. Meet people. Do more together.”**
- One top-right CTA: **“Explore Bengaluru”**, linking to `/explore`.
- Remove the top-left menu and its undefined About/Privacy destinations for this sprint. Do not create dead links or extra pages.
- No dashboard filters, event cards or people lists on the landing page.

**Five-scene sequence**

Scene definitions live in `components/landing/scenes.ts`. Each scene has an id, duration, tile list, image slot, meaningful alt text, object position and transition type.

| Scene | Transition | Theme | Desktop slots | Mobile slots |
|---|---|---|---|---|
| 1 | Tiles scale into full-bleed | Bengaluru atmosphere | 06, 07, 08, 09, 05 | 06, 08 |
| 2 | Circular clip-path reveal | OTB chess | 01, 02, 11 | 01, 02 |
| 3 | Stacked tiles fan in | Hackathon teamwork | 04, 10, 11 | 04, 10 |
| 4 | Full-bleed single image | Building and workshops | 10 (alternate crop) | 10 |
| 5 | Closing grid | Community | 09, 11, 12, 05 | 12, 05 |

Slot 03 remains in the asset archive but is **excluded from the default scene sequence** until its brand-lookalike cans are replaced and the asset register is updated. Do not render it merely because the file exists. Slot 11 is intentionally reused across different scenes, but never twice within one scene.

**Image delivery**
- Assets are under `public/landing/`; exact names and status are in `ASSETS.md`.
- Use the 800px WebP on mobile and 1600px WebP on desktop with responsive art direction (`getImageProps`, `<picture>`, or an equivalent built-in Next.js approach).
- Preserve aspect ratio. Use `object-fit: cover` and per-tile `object-position`; do not stretch.
- Scene 1 slot 06 is the only candidate for initial preload. On Next.js 16+, use the current `preload` API rather than deprecated `priority`; confirm the installed Next.js version before choosing the prop. Do not preload multiple scene images.
- Lazy-load non-initial scene images; avoid loading all 24 variants eagerly.
- Use meaningful alt text. Decorative images may use empty alt text only when the scene is fully described by nearby accessible text and the image adds no unique information.
- Slot 03 is flagged; use slots 04, 10 and 11 for the default desktop scene 3.
- The source images are AI-generated illustrations, not documentary evidence of actual events or places. Keep the provenance marks and disclosure described in `ASSETS.md`.

**Motion and controls**
- Auto-advance approximately every 4.5 seconds.
- Visible pause/play, previous and next controls.
- Pause on hover, keyboard focus and when the document is hidden.
- `prefers-reduced-motion`: show a static first scene and retain manual controls without automatic transitions.
- No autoplay audio and no music toggle.
- Use CSS transitions and `clip-path`; do not add an animation library for this sprint.
- Keep controls keyboard accessible with visible focus states and descriptive labels.

**Responsive behaviour**
- Desktop: 3–5 tiles where the scene definition supplies them.
- Mobile: 2–3 deliberately recomposed tiles, readable wordmark and CTA. Do not simply shrink the desktop collage.
- Test at narrow phone width and a typical desktop viewport.

**Timebox:** 90 minutes maximum. If late, ship three polished scenes, not five unfinished ones.

### 2B. Functional application

Use a light-first, restrained shell. Desktop uses a compact top navigation; mobile uses a compact header and accessible bottom navigation.

Primary modules:
1. **Explore** (`/explore`): event feed, featured strip, domain filter (All / Chess / Hackathons), date filter and neighbourhood selector.
2. **Event detail** (`/events/[id]`): event information, participation, participant preview and looking-for intents.
3. **People** (`/people`): event-scoped discovery only; shows eligible people who share an event with the active demo persona. No global people directory and no cold DMs.
4. **Connections** (`/connections`): incoming, outgoing and accepted requests.
5. **Profile** (`/profile`): active demo persona profile, interests, skills and privacy/contact-sharing settings.

`/events` redirects to `/explore`. `/create-event` is optional P1, is not in primary navigation and is built only after all P0 requirements pass.

**Guest versus demo entry**
- The landing-page CTA opens `/explore` in **guest mode** by default.
- Guest mode can browse event details and aggregate counts only. It cannot see named participants, People results, connection requests, profiles of demo personas or private contact details.
- Show a clear **“Try demo as Karthik”** action in the app shell. Selecting it starts a demo session with Karthik as the active persona.
- The demo is never silently activated. Guest and demo are separate states.
- In demo mode, a visible persona switcher allows switching among the eight fictional personas.
- If a guest opens People, Connections or Profile, show a gate explaining that named demo interactions require a demo persona, with a **“Try demo as Karthik”** action.
- Include a **“Reset demo”** action that clears the demo cookie and restores fixture defaults.
- No About or Privacy routes are required for this sprint. Put a concise sample-data/privacy note in the application footer instead.

## 3. Main user journey

Landing → Explore as guest → choose Try demo as Karthik → join `ev-chess-01` → choose attendance visibility and looking-for intent → discover Asha → send a new request with a note → switch to Asha and accept → switch back to Karthik and see Asha's contact because her sharing is enabled.

Keep the seeded Karthik → Meera pending request as a separate acceptance example. Keep the seeded Vikram → Rohan accepted request as the example where Rohan's disabled sharing hides his contact from Vikram.

## 4. Locked scope

- Geography: Bengaluru only.
- Domains: OTB chess and hackathons only.
- Platform: responsive web application.
- Social discovery: 18+ only.
- Demo/guest access: no sign-up required.
- All seeded events and profiles are fictional; label them visibly.
- No public-roster imports, scraping or fabricated official URLs.
- Codex-led implementation with human review of access and privacy logic.

## 5. P0 acceptance criteria

1. `/` displays the EventConnect editorial collage, wordmark, tagline and working CTA to `/explore`.
2. The landing page does not copy the reference brand, wording, photos, composition or signature styling.
3. Scene controls work; reduced-motion disables auto-advance; no audio plays automatically.
4. Guest entry opens `/explore` without activating a persona.
5. Guest sees event details and aggregate counts only; named People/Connections/Profile are gated.
6. “Try demo as Karthik” starts a signed demo session; persona switching and reset work.
7. Explore shows seeded Bengaluru chess and hackathon events; domain, date and neighbourhood filters work.
8. Event details show title, domain, date/time, generic venue/locality, description and truthful sample label.
9. Registration/source buttons appear only when the corresponding URL exists. If absent, show “Sample event — no external registration link”; never invent a URL.
10. Any distance is labelled “approx. straight-line distance”, never travel time.
11. Profile shows display name, bio, interests, skills and editable privacy/contact-sharing preferences.
12. Participation is user-declared intent, not proof of external registration or attendance.
13. Named participants appear only under the discovery predicate in section 7. Anonymous or otherwise hidden participants contribute to aggregate counts only.
14. Current persona is never shown as their own People recommendation.
15. Junior events show aggregate sample counts only; never named participants, People results or connection controls.
16. Looking-for intents are domain-specific: chess opponent/practice partner; hackathon teammate plus role.
17. Requests validate event membership, discoverability, age, note length, duplicates and rate limit as specified in section 8.
18. Accept/decline/cancel permissions and transitions are enforced server-side.
19. Contact appears only after acceptance and only when the contact owner has enabled sharing.
20. Main journey works on desktop and mobile; production build succeeds.

## 6. Data model

### Public demo fixtures (`lib/fixtures/demo-data.ts`)
- `profiles`: id, display_name, bio, neighbourhood, interests, skills, domain_details, is_18_plus, discoverable, demo_label.
- `events`: id, title, domain (`chess` | `hackathon`), description, venue_name, neighbourhood, start_at, end_at, registration_url, source_url, verification_status (`sample` | `source_linked` | `verified`), is_demo, is_junior_event, level_note.
- `attendance`: id, user_id, event_id, status (`interested` | `going`), visibility (`public` | `anonymous`), looking_for.
- `connection_requests`: id, from_user_id, to_user_id, event_id, note (max 280 chars), status (`pending` | `accepted` | `declined` | `cancelled`), created_at.
- `juniorEventCounts`: event_id, interested_count, going_count, is_demo. These are synthetic aggregate-only values with no profile IDs.

### Private server-only fixture (`lib/server/profile-private.ts`)
- `profile_private`: profile_id, contact_handle, share_contact_on_accept.
- Must include a `server-only` guard and must only be imported by server-side code.
- Keep private contact handles exclusively in this fixture. After the §8 check, render the single authorized handle as server-rendered text in Connections. Keep handles out of the cookie, database, client component props, client-side stores and public JSON. Never return the fixture array to the browser.
- New profiles default `share_contact_on_accept = false`. Seeded personas may have explicit values to demonstrate both outcomes.

### Data access
Use a repository interface in `lib/data/*`. Fixtures supply baseline data. Supabase PostgreSQL stores temporary per-browser demo overrides in `demo_session_state`. Use a server-only client and apply authorization before accessing state. This demo provides no production account persistence.

## 7. Privacy and discovery rules (single source of truth)

Implement the predicate in `lib/privacy/*` and call it from server-side repository/actions. Do not duplicate slightly different rules across UI components.

A named target profile may appear in an event-scoped People result only if **all** conditions hold:
1. The viewer is in an active demo session and their profile is 18+.
2. The viewer has an `interested` or `going` attendance record for that same event.
3. The event exists and `is_junior_event = false`.
4. The target is not the viewer (never recommend oneself).
5. The target profile has `is_18_plus = true` and `discoverable = true`.
6. The target has an `interested` or `going` attendance record for that same event with `visibility = public`.

If the target's attendance is anonymous OR the profile has `discoverable = false`, do not reveal identity or profile details. They may contribute to aggregate counts only. The viewer does not need to enable their own discoverability to view other eligible participants; they only need to be an active 18+ persona with attendance at the event.

**Guest:** no active persona; show events and aggregate counts only.

**Junior event:** details and aggregate sample counts only. No named attendance, People results, request CTA or contact reveal.

## 8. Connection request and contact rules

### Request creation
A request is allowed only when:
- `DEMO_MODE=true` and the actor has an active, valid 18+ demo persona.
- Sender and recipient are different profiles.
- Event exists and is not junior.
- Sender has `interested` or `going` attendance for the event.
- Recipient has `interested` or `going` attendance for the event, `visibility = public`, `discoverable = true` and `is_18_plus = true`.
- The event-scoped discovery predicate passes for the recipient.
- Note is trimmed, non-empty and at most 280 characters.
- Sender has fewer than five outgoing requests currently in `pending` state.
- No prior request exists for the same unordered profile pair and event in any status. This simple one-request rule prevents repeated requests in the demo.
- Validate against the merged fixtures and the current stored state, including seeded and new requests. Commit creation through the atomic revision-checked operation in §9. On conflict, reload and rerun every check before retrying.

### State transitions
- `pending` → `accepted` or `declined` only by the recipient.
- `pending` → `cancelled` only by the sender.
- `accepted`, `declined` and `cancelled` are terminal in the prototype.
- Reject self-requests, unauthorised status changes and invalid transitions on the server.

### Contact reveal
Reveal a contact handle to a viewer only when all are true:
1. There is a request between the viewer and contact owner for the relevant event.
2. Request status is `accepted`.
3. The contact owner has `share_contact_on_accept = true` at the time of viewing.
4. A non-empty contact handle exists.

Acceptance alone never reveals contact. The owner can turn sharing off at any time; doing so hides the contact immediately, including for previously accepted requests. The owner alone can change their preference. The default for new profiles is off. Contact handles remain server-only and are returned only by a guarded server-side contact-access function after the predicate passes.

## 9. Demo session and persistence

- `DEMO_MODE=true` enables the public judge demo. `DEMO_MODE=false` disables persona switching and demo mutations.
- `DEMO_SESSION_SECRET`, `SUPABASE_URL` and `SUPABASE_SECRET_KEY` are mandatory whenever `DEMO_MODE=true`. Require a secret generated from at least 32 random bytes. Fail closed for invalid configuration or unavailable session storage.
- Generate a secret locally with: `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`.
- Use an HMAC-SHA-256 signed cookie, verified server-side with constant-time signature comparison.
- Cookie name: `eventconnect_demo`.
- Cookie attributes: `HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` in production, `Max-Age=43200` (12 hours).
- The payload contains only a cryptographically random opaque session ID and issue/expiry timestamps. Signing provides integrity. Generate a fresh ID on explicit activation and keep the original 12-hour deadline across mutations and persona switches.
- Store only the SHA-256 hash of the opaque ID as the key in `demo_session_state`, with JSONB state, revision, creation/update timestamps and expiry. The JSONB holds the active persona ID, attendance overrides, discoverability and contact-sharing overrides, new requests with notes, and request status overrides. Validate state and input against fixture IDs, supported enums and known stored requests.
- Enable RLS and revoke table and mutation-function access from `PUBLIC`, `anon` and `authenticated`. Grant only the required operations to the server's `service_role`. Use server-only configuration. Keep private fixture handles out of the store and cookie. Keep request notes visible only to the parties, label demo inputs as fictional, and instruct users to omit personal contact information from notes.
- For each mutation, validate the signed session and load its unexpired row. Apply business rules to the fixture-plus-state snapshot, then write through a single atomic PostgreSQL operation conditioned on the same session hash, unexpired row and exact revision. A stale revision commits nothing. Reload and rerun validations before retrying. This binds duplicate and pending-limit checks to the state on which creation commits.
- Missing, expired, tampered or malformed cookies and missing/expired state resolve to guest. Clear invalid cookies on an outgoing response. “Reset demo” deletes the session row and clears the cookie. Expired rows are inaccessible to the app and eligible for database cleanup.

## 10. Seed data and event presentation

- 16 sample events: 8 chess and 8 hackathon, dated Dec 2026–Jan 2027.
- 8 fictional 18+ personas, each visibly labelled as a fictional demo persona.
- Events use `is_demo = true`, `verification_status = sample`, and null source/registration URLs.
- Junior events use `juniorEventCounts` only. No person-linked attendance records for junior events.
- Nisha has public attendance on one event but `discoverable = false`. While false, suppress her from participant and People results for other personas. She may appear in the demo persona selector and her own active profile.
- Every event with a null source or registration URL shows a clear absence state; do not fabricate links.
- No scraping, public roster import or external data ingestion.
- Poster extraction is optional, last, and creates an editable draft only.

## 11. Technical direction

- Next.js App Router + TypeScript.
- Tailwind CSS; use shadcn/ui selectively.
- npm as the single package manager for this repository; commit `package-lock.json`. Do not mix npm/pnpm/yarn lockfiles.
- Vercel deployment.
- Fixture-backed repository with Supabase PostgreSQL for demo sessions only. No Supabase Auth or real registration.
- One modular application; no microservices.
- Neighbourhood dropdown; Haversine straight-line distance optional.
- Keep dependencies limited. Use current APIs for the installed Next.js version; in Next.js 16+ `Image` uses `preload`, while `priority` is deprecated.

## 12. Out of scope

Real-time chat, scraping, external roster import, payments, push notifications, native app, routing engine, ML recommendations, organiser analytics, moderation console, global people directory and a full production authentication system. `/create-event` and poster extraction are optional only after all P0 requirements pass.

## 13. Build order and timebox (12 hours)

| Hours | Work |
|---|---|
| 0:00–1:00 | Inspect repo, create project, npm setup, design tokens, first local run |
| 1:00–2:30 | Landing page and five-scene framework (hard stop at 90 min; ship 3 scenes if late) |
| 2:30–3:30 | Fixture repository, server-only private contacts, signed demo session and Supabase state store |
| 3:30–5:30 | Explore feed, filters, event detail and no-link states |
| 5:30–6:30 | Persona switcher and Profile |
| 6:30–8:30 | Attendance, visibility and event-scoped People |
| 8:30–10:00 | Connection requests, state transitions and guarded contact reveal |
| 10:00–12:00 | Feature freeze, privacy tests, responsive/a11y pass, README, deploy and demo |

Cut order if late: poster extraction (not scheduled in P0), fifth/fourth landing scenes, Haversine distance. Never cut the event-to-connection journey, guest privacy or contact-reveal rule.

## 14. Definition of done

A judge can enter through the landing page, browse events as a guest, explicitly start the Karthik demo, open an event, participate, see only eligible opted-in people, send a valid request, switch persona, accept/decline and view contact only when the owner has enabled sharing. Junior events remain aggregate-only. The experience works on desktop and mobile, the production build passes, and README/demo materials are ready.
