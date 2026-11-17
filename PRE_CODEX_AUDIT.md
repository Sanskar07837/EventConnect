# EventConnect v4.1 — Pre-Codex Audit Report

**Audit baseline:** `EventConnect_starter_v4.zip`  
**Revision:** v4.1  
**Date:** 18 November 2026

## Verdict

**Conditional GO — use this v4.1 package as the Codex source of truth.** The original v4 package had a coherent product direction and complete image variants, but several privacy, demo-flow and fixture relationships needed to be made explicit.

## Changes made

1. Unified the event-scoped discovery predicate across SPEC and AGENTS:
   - viewer is an active 18+ demo persona;
   - viewer attends the same event;
   - event is not junior;
   - target is not the viewer;
   - target is 18+ and profile-discoverable;
   - target has public attendance at that event.
2. Defined guest mode separately from the explicit “Try demo as Karthik” flow.
3. Added `DEMO_MODE` and mandatory `DEMO_SESSION_SECRET`.
4. Specified a 12-hour HMAC-SHA-256 signed, HttpOnly demo cookie. It stores only compact IDs/status/preference overrides, never contact handles. Invalid/expired/tampered cookies resolve to guest.
5. Moved private contact handles to `lib/server/profile-private.ts` with a `server-only` guard.
6. Corrected request `cr-03`: Imran → Asha for `ev-chess-03`; both have attendance.
7. Corrected the demo walkthrough: Karthik is excluded from his own People results; Meera and Divya are visible; Nisha is hidden because her profile is not discoverable.
8. Changed Nisha's `ev-hack-01` attendance to `visibility=public` while retaining `discoverable=false`, creating a specific negative privacy test.
9. Removed person-linked attendance rows from junior events and replaced them with synthetic aggregate-only counts.
10. Defined request creation validation, note length, five-outgoing-pending limit, pair/event duplicate prevention and authorised state transitions.
11. Defined contact reveal as accepted request AND owner preference enabled AND a valid contact handle; revoking sharing hides contact immediately.
12. Standardised package management on npm; no mixed lockfiles.
13. Defined null source/registration link behaviour.
14. Removed undefined About/Privacy landing menu destinations.
15. Removed flagged slot 03 from default scene 3; default scene uses slots 04, 10 and 11.
16. Updated the image-loading guidance: Next.js 16+ uses `preload`; `priority` is deprecated.
17. Corrected asset source dimensions: supplied generated masters are 2048 × 1529; current WebP derivatives are 1600 × 1195 and 800 × 597. Do not upscale.
18. Added a detailed `TEST_PLAN.md`.

## Fixture integrity results

Automated static checks performed on the revised fixture:

- 16 events: 8 chess and 8 hackathon.
- 8 fictional 18+ profiles.
- 10 Bengaluru neighbourhoods.
- 13 person-linked attendance records for non-junior events.
- 2 junior-event aggregate-only count records.
- 3 connection requests: one pending, one accepted, one declined.
- All event IDs and profile IDs resolve.
- Both participants in each connection request attend the referenced non-junior event.
- No duplicate attendance profile/event pair.
- No self-directed request.
- All `looking_for` values match their event domain.
- All seeded contact addresses use `.invalid`.
- All events are sample events with null source/registration URLs.

## Asset integrity results

- 12 image slots.
- 24 WebP files (12 × 800px and 12 × 1600px).
- All images decode successfully.
- 800px variants: 800 × 597.
- 1600px variants: 1600 × 1195.
- Total WebP size is approximately 3.0 MB (about 2.9 MiB).
- Slot 03 remains in the archive but is excluded from default scene rendering pending replacement.
- Gemini account/tier usage terms remain pending manual verification; the audit does not assert licence clearance.

## Separate duplicate attachment

The separately supplied `Pasted text(2).txt` is a stale duplicate of the demo fixture. Its final demo-flow comment incorrectly lists Karthik as a visible participant to himself, omits Divya and omits the guest-only rule. The corrected `lib/fixtures/demo-data.ts` inside this v4.1 package is authoritative. Do not copy the stale text attachment into the repository.

## Package boundaries

This starter package contains project instructions, fixtures, environment example and image assets. It does not contain a runnable Next.js scaffold, `package.json`, migrations, application components or an actual test runner. Codex must scaffold the application before the build commands can run.

## Remaining manual tasks before public release

- Confirm the exact Gemini image-generation product/account-tier terms for public demo use.
- Consider regenerating slot 03 before any later use.
- Check final mobile crops for slots 06, 08 and 10.
- Do not introduce real attendee data or contact details into this demo fixture.


## Framework reference checked during this revision

- Next.js Image component API: https://nextjs.org/docs/app/api-reference/components/image
  - The documentation states that `priority` is deprecated from Next.js 16 in favour of `preload`.
- Next.js cookies API: https://nextjs.org/docs/app/api-reference/functions/cookies
  - Cookies can be read in Server Components and written in Server Functions/Route Handlers.
- Next.js authentication guide: https://nextjs.org/docs/app/guides/authentication
  - Demonstrates server-only session handling and secure cookie attributes.

These references inform the implementation guidance; Codex must still confirm the installed Next.js version and use the matching API.
