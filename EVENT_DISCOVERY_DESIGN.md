# EventConnect event discovery and details

Design recommendations for Explore and Event Details. The current prototype remains Bengaluru-first, with eight chess and eight hackathon fixtures labelled **Sample event**. This proposal describes a future presentation model and editorial process. Implementation and external data ingestion require separate approval.

## Reference patterns

- **AICF.** The tournament calendar lists event codes, start and end dates, places and brochures where available. The site also exposes an online-entry route. For chess, show the official tournament code and its issuing body, the verified format, the date range and the venue. Distinguish an event-specific entry link from a brochure and from the federation’s general entry portal. [AICF All Events](https://aicf.in/all-events/)
- **Devpost.** Hackathons and projects have distinct browsing areas, and teammate discovery is tied to a hackathon. Give hackathons a category filter and surface verified tracks, team-size rules and submission deadlines when available. Keep projects as optional context on the relevant event, and use EventConnect’s existing opt-in People flow for teammate discovery. [Devpost Hackathons](https://devpost.com/hackathons) · [Project gallery](https://help.devpost.com/article/80-what-is-the-project-gallery) · [Forming a team](https://help.devpost.com/article/75-participants-page-forming-a-team)
- **Sporthood.** Its indexed events calendar groups listings by month and identifies activities and audience variants. Provide format and age-group distinctions for verified listings where those distinctions affect eligibility. The current page returned only a shell in the direct text view, so this observation is limited to its indexed content. [Sporthood Upcoming Events](https://www.sporthood.in/upcoming-events)
- **LBB.** The library guide pairs local editorial descriptions with neighbourhoods, map links, opening hours and membership information. Use that pattern for permanent libraries, cafés and other venues if a Places section is approved. A library’s recurring opening hours and membership fee belong to the place record. A scheduled session at that library belongs in Events. [LBB Bengaluru library guide](https://lbb.in/bangalore/libraries-bangalore/)
- **Luma.** The city page pairs event photography with the host, venue or locality, and published signals such as price, waitlist and sold-out status. Put those decision-making details near the title and registration action when verified. Keep organiser registration availability separate from EventConnect participation counts. [Luma Bengaluru](https://luma.com/bengaluru)

## Information architecture

| Entity | What it represents | Relationship to an event |
| --- | --- | --- |
| Event | A scheduled occurrence or a defined multi-day programme with a start and end | The record Explore lists and People scopes participation to |
| Place | A permanent location, such as a library, café, tournament hall or coworking space | A venue an event can reference. Opening hours, standing facilities and membership belong here. |
| Community | An ongoing club, organiser collective or interest group | May organise events. Membership and participation in a specific event remain separate. |

Explore and Event Details can show a venue name and host without requiring Places or Communities routes. Add separate directories only when there is verified content and a dedicated user need.

## Recommended event information model

Keep the current event IDs, fixture records and demo-state model. Treat the fields below as a display contract for a later task.

| Area | Recommended information and presentation |
| --- | --- |
| Classification | Use the existing Chess and Hackathon domains as categories. Add an optional verified subcategory or format, for example Rapid, Blitz or Classical for chess. Add hackathon formats or tracks only when supplied. Keep eligibility separate from category. |
| Identity and host | Title, plain-language description and verified organiser or host name. Use **Host not listed** when absent. Keep a chess tournament code optional, scoped to its issuing body and separate from the internal event ID. Preserve distinct codes where an official notice identifies multiple sections. |
| Schedule | Start, end, time zone and source precision. Bengaluru uses `Asia/Kolkata`. For known times, derive **Today**, **Upcoming**, **Live now** and **Ended** with start inclusive and end exclusive. For date-only sources, show the published dates without inventing times or asserting that the event is live. Show verified postponement or cancellation instead of a derived live badge. |
| Venue and locality | Published venue name, locality and verified city, with an optional public address or official map link. A state, district or unclear venue is insufficient to label an event Bengaluru. Keep the city fixed for the current dataset and omit unsupported distances. |
| Price | Distinguish confirmed free, confirmed paid and unknown. Record currency, amount or published range, and whether the fee applies per person or team. Qualify any published fees or exclusions. Use **Price not listed** for unknown prices. |
| Registration | Keep organiser availability distinct from event time and participation. Display open, waitlist, sold out or closed only when supported by a current official source. Use **Check with organiser** when a link exists but availability is unconfirmed. The demo keeps **Sample event — no external registration link**. |
| Official links and provenance | Preserve the official source URL, event-specific registration URL and optional brochure or rules URL separately. Keep source attribution, last verification date and review state. An official information page may exist without an entry link. |
| Event image | Store the asset reference, alt text, attribution and usage rights. Use a locally approved illustration or a neutral fallback when an official image is unavailable. Keep the demo’s illustration disclosure and visible provenance marks. |
| Eligibility | Keep a short verified eligibility summary and, when relevant, age group, rating limit, student or team requirements, and a rules link. Keep published eligibility distinct from the server’s social-discovery classification. |
| Participation | Show EventConnect **Interested** and **Going** as self-declared intent. Use a separate official-registration action. Keep event-scoped looking-for options, such as a chess practice partner or a hackathon teammate, within the existing eligibility rules. |

## Explore and Event Details

- **Explore.** Keep Bengaluru prominent, with the existing title, venue and category search and date and neighbourhood filters. Populate options from the supported dataset and keep selected filters visible even when no listings match. A card should prioritise the date, title, category or format, locality and any verified price or registration status. Keep the Sample badge and source context visible. Use **View event** for the internal detail route.
- **Event Details.** Pair a rights-cleared image or labelled illustration with the title, host, schedule and location. Group logistics, eligibility and price under event information, with separate links for official registration, source and brochure. On desktop, a compact logistics panel can sit beside the description. On mobile, bring date, venue and eligibility ahead of long descriptions and place the registration action next to its status. Give participation its own section below those facts.
- **Visual system.** Use the existing cream canvas `#F5F0E6`, light card surfaces `#FBF9F4`, ink `#292B27`, forest-green actions `#20372E`, borders `#E5DDCF` and muted brass accents. Preserve the editorial headings and accessible control contrast. Use original layouts and approved imagery.

## Verification before any future publication

1. Draft a listing from a primary organiser, federation, venue or official registration source. Preserve the exact event-specific source URL. Treat editorial guides and aggregators as leads until their claims are corroborated.
2. Confirm the title, host, schedule, location and eligibility. Verify price and registration status against an official event page when available. Leave optional facts unknown when evidence is missing. Hold publication when authoritative sources disagree on essential facts or when a Bengaluru location cannot be confirmed.
3. Verify that registration and brochure links resolve to the intended event, and check rights before using a photograph. Review duplicates using the issuer and code where available, or the organiser, schedule and venue together.
4. Record verification and review dates. Recheck time-sensitive availability and event changes before showing a status as current. Update or withdraw changed listings with their source retained. Keep real and fictional listings clearly distinguished.

## Privacy acceptance criteria

- Guests can browse event facts and aggregate participation only. Account-free demo activation remains explicit.
- Named People discovery stays event-scoped and server-authorised. Anonymous attendance contributes only to counts. Junior events remain aggregate-only, with no named participants or social actions.
- Existing request eligibility, participant-only history and contact consent still apply. A contact handle appears only after acceptance and while its owner permits sharing.
- Public calendars, participant totals, team pages and rosters never establish EventConnect attendance, permission to create profiles, or consent to contact someone. Official registration, EventConnect participation, and external community membership remain separate.
