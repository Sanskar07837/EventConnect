# EventConnect — v4.1 Pre-Codex Test Plan

These are acceptance tests for the first implementation. Tests must run through server-side repository/privacy functions, not only UI visibility.

## A. Guest and demo session

| ID | Scenario | Expected result |
|---|---|---|
| G-01 | Visit `/` and select Explore Bengaluru | Opens `/explore` as guest; no persona cookie is created. |
| G-02 | Guest opens an event | Event details and aggregate counts are visible; no participant names or contact data. |
| G-03 | Guest opens People, Connections or Profile | Shows a clear gate and “Try demo as Karthik”; no private data. |
| G-04 | Select Try demo as Karthik | Server sets a valid signed cookie and Karthik becomes active persona. |
| G-05 | Switch to Meera | Active persona changes after server validation. |
| G-06 | Refresh/navigate after changing request state | State persists in PostgreSQL for this browser; the cookie payload contains only opaque ID and timestamps. A second browser starts as guest. |
| G-07 | Tamper with or expire cookie | Resolve to guest and clear invalid cookie. |
| G-08 | DEMO_MODE=false | Persona switching and demo mutations are disabled. |
| G-09 | DEMO_MODE=true but secret missing | Fail closed; do not start a demo session. |
| G-10 | Reset demo | State row deleted, cookie cleared and fixture defaults restored. The old cookie cannot resume the session. |
| G-11 | Missing Supabase config, unavailable store, absent row or expired row | Demo access and mutations fail closed. An expired row remains unusable before cleanup. |
| G-12 | Call table and mutation RPC as `anon` or `authenticated` | Access denied. RLS is enabled and browser roles have no table or function grants. |
| G-13 | Inspect cookie and stored row after switching and editing preferences | Cookie contains only ID and timestamps. Row stores the hash and validated state; original expiry is unchanged. Neither contains private fixture handles. |

## B. Event fixture and routes

| ID | Scenario | Expected result |
|---|---|---|
| E-01 | Load Explore | 16 sample events load: 8 chess and 8 hackathon. |
| E-02 | Filter by domain/date/neighbourhood | Results match filters; no dead controls. |
| E-03 | Event has null source/registration URL | No external CTA/link; show “Sample event — no external registration link”. |
| E-04 | Event has `is_demo=true` | Visible Sample/Demo label. |
| E-05 | Distance displayed | Label explicitly says approximate straight-line distance, not travel time. |
| E-06 | Junior event opened | Details and sample aggregate counts only. |

## C. People discovery predicate

A named target is visible only when all are true: active 18+ viewer, viewer attends the same event, event is not junior, target differs from viewer, target is 18+, target profile is discoverable, and target has public attendance at that event.

| ID | Scenario | Expected result |
|---|---|---|
| P-01 | Karthik views `ev-hack-01` | Meera and Divya appear; Karthik is excluded as self; Nisha is hidden because profile discoverability is false. |
| P-02 | Nisha has public attendance but `discoverable=false` | Nisha's identity/profile is hidden; only aggregate count includes the attendance. |
| P-03 | Nisha has anonymous attendance at `ev-chess-01` | Nisha's identity/profile is hidden; aggregate count includes the attendance. |
| P-04 | Viewer has no attendance for event | No named participants returned for that event. |
| P-05 | Guest viewer | No named participants returned anywhere. |
| P-06 | Junior event | No named participants returned, regardless of fixture or visibility values. |
| P-07 | Active persona views People | The active persona is never included in their own recommendations. |
| P-08 | Target profile is not discoverable | Target hidden even if event visibility is public. |
| P-09 | Target event visibility is anonymous | Target hidden even if profile discoverability is true. |
| P-10 | Select Nisha or browse as another persona | Selector includes Nisha and she sees her own profile. Other personas receive no participant or People result for her while discoverability is false. |

## D. Requests and state transitions

| ID | Scenario | Expected result |
|---|---|---|
| R-01 | Eligible sender requests eligible target for shared non-junior event | Request created with trimmed note. |
| R-02 | Empty/whitespace note | Rejected. |
| R-03 | Note longer than 280 characters | Rejected. |
| R-04 | Sender requests self | Rejected. |
| R-05 | Sender or recipient not attending event | Rejected. |
| R-06 | Recipient is not discoverable or not public for event | Rejected. |
| R-07 | Request for junior event | Rejected. |
| R-08 | Sixth outgoing pending request | Rejected; limit is five pending outgoing per sender. |
| R-09 | Duplicate pair/event request | Rejected, regardless of previous status in the demo fixture. |
| R-10 | Sender tries to accept own request | Rejected. |
| R-11 | Non-recipient tries to accept/decline | Rejected. |
| R-12 | Recipient accepts/declines pending request | State changes and persists in PostgreSQL across refresh and persona switches. |
| R-13 | Sender cancels pending request | State changes to cancelled. |
| R-14 | Attempt to change terminal status | Rejected. |
| R-15 | Request `cr-03` | Sender Imran and recipient Asha both attend `ev-chess-03`. |
| R-16 | Concurrent same unordered pair/event creation from the same revision | Exactly one request commits. The losing write reloads and rejects the duplicate. |
| R-17 | Concurrent eligible creations with four outgoing pending requests | At most one new request commits. The other reloads and rejects the sixth pending request. |
| R-18 | Concurrent request creation and attendance or preference mutation | A stale revision cannot overwrite newer state. Revalidate all request conditions before retrying. |

## E. Contact reveal

| ID | Scenario | Expected result |
|---|---|---|
| C-01 | Request is pending | No contact handle returned. |
| C-02 | Request accepted; owner sharing enabled | Owner's contact may be returned to the other party. |
| C-03 | Request accepted; owner sharing disabled | No contact handle returned. |
| C-04 | Owner switches sharing off after acceptance | Contact becomes hidden immediately. |
| C-05 | Owner switches sharing on | Contact visible only for accepted request and valid handle. |
| C-06 | Guest asks for contact | Rejected / no data. |
| C-07 | Client requests private fixture directly | No client route or bundle exposes it. |
| C-08 | Inspect an authorized Connections response and public surfaces | Only the permitted handle is rendered as text. No contact fixture or handles appear in public JSON, client component props, client stores, cookie or database. |

## F. Fixture integrity

- Every event id is unique; all event times are valid and end after start.
- Every attendance user_id and event_id references an existing profile/event.
- There is at most one attendance record per profile/event.
- Every connection request references existing profiles and event.
- Both participants in every request have attendance at the referenced non-junior event.
- No request is self-directed.
- `looking_for` values match the event domain.
- Junior aggregate counts reference junior events only and contain no profile IDs.
- Private contact records reference existing profiles and stay server-only.
- Demo contact handles end in `.invalid`.
- All seeded events are sample/demo and have no fabricated source/registration URLs.

## G. Asset and accessibility checks

- All 24 WebP files exist and decode.
- All 12 800px variants are 800 × 597; all 12 1600px variants are 1600 × 1195.
- Slot 03 is not in the default rendered scenes.
- Slot 06 is the only initial preload candidate where appropriate; Next.js 16+ uses `preload`, not deprecated `priority`.
- No 404 image paths; no layout shifts caused by missing dimensions.
- Mobile collage is recomposed; crops do not cut off essential subjects.
- Pause/play and previous/next controls are keyboard accessible.
- Auto-advance pauses on hover, focus and hidden document.
- `prefers-reduced-motion` produces static first scene/manual-only navigation.
- No autoplay audio.
- Verify contrast, focus visibility and screen-reader labels.

## H. Build checks

- `npm.cmd install` completes and `package-lock.json` is committed.
- `npm.cmd run dev` starts successfully.
- Lint and TypeScript checks pass.
- `npm.cmd run build` succeeds.
- On desktop and mobile, Karthik joins `ev-chess-01`, discovers Asha, sends a fresh request, switches to Asha to accept, then switches back and sees her contact. Also verify the seeded Karthik → Meera acceptance and the Vikram → Rohan accepted request with no Rohan contact.
