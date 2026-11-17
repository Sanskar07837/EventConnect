/**
 * EventConnect demo fixtures (v4 SPEC).
 *
 * EVERYTHING IN THIS FILE IS FICTIONAL SAMPLE DATA.
 * - Events are not real, not verified, and have no official source or registration URLs.
 * - Profiles are invented personas. Private contact handles live separately in
 *   lib/server/profile-private.ts and use the reserved .invalid domain.
 * - Venues are generic descriptions within real Bengaluru neighbourhoods; no real venue,
 *   organiser, club or company is implied to host anything.
 * The UI must show a visible "Sample" / "Demo" label wherever this data appears.
 * Do not add real events or people here. Verified real events belong in a separate file
 * (e.g. lib/fixtures/verified-events.ts) after manual checking.
 */

export type Domain = "chess" | "hackathon";
export type VerificationStatus = "sample" | "source_linked" | "verified";
export type AttendanceStatus = "interested" | "going";
export type Visibility = "public" | "anonymous";
export type RequestStatus = "pending" | "accepted" | "declined" | "cancelled";

export type LookingFor =
  | "chess:opponent"
  | "chess:practice_partner"
  | "hackathon:teammate:backend"
  | "hackathon:teammate:frontend"
  | "hackathon:teammate:ml"
  | "hackathon:teammate:design"
  | "hackathon:teammate:any";

export interface Neighbourhood {
  slug: string;
  name: string;
  /** Representative centre point for approximate straight-line distance only. */
  lat: number;
  lng: number;
}

export interface DemoEvent {
  id: string;
  title: string;
  domain: Domain;
  description: string;
  venue_name: string;
  neighbourhood: string; // Neighbourhood.slug
  start_at: string; // ISO 8601, IST
  end_at: string;
  registration_url: string | null;
  source_url: string | null;
  verification_status: VerificationStatus;
  is_demo: true;
  is_junior_event: boolean;
  /** Free-text, display only. */
  level_note: string;
}

export interface DemoProfile {
  id: string;
  display_name: string;
  bio: string;
  neighbourhood: string;
  interests: string[];
  skills: string[];
  domain_details: {
    chess?: { rating_band: string; formats: string[] };
    hackathon?: { roles: string[]; tracks: string[] };
  };
  is_18_plus: true;
  discoverable: boolean;
  demo_label: "Fictional demo persona";
}


export interface DemoAttendance {
  id: string;
  user_id: string;
  event_id: string;
  status: AttendanceStatus;
  visibility: Visibility;
  looking_for: LookingFor[];
}

/**
 * Synthetic aggregate counts for junior events.
 * These are fictional counters, not derived from or linked to identifiable profiles.
 */
export interface DemoJuniorEventCounts {
  event_id: string;
  interested_count: number;
  going_count: number;
  is_demo: true;
}

export interface DemoConnectionRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  event_id: string;
  note: string;
  status: RequestStatus;
  created_at: string;
}

export const DEMO_LABEL = "Sample data: fictional, not a real event or person";

/* ------------------------------------------------------------------ */
/* Neighbourhoods (representative coordinates, approximate only)       */
/* ------------------------------------------------------------------ */
export const neighbourhoods: Neighbourhood[] = [
  { slug: "indiranagar", name: "Indiranagar", lat: 12.9784, lng: 77.6408 },
  { slug: "koramangala", name: "Koramangala", lat: 12.9352, lng: 77.6245 },
  { slug: "hsr-layout", name: "HSR Layout", lat: 12.9116, lng: 77.6474 },
  { slug: "jayanagar", name: "Jayanagar", lat: 12.925, lng: 77.5938 },
  { slug: "jp-nagar", name: "JP Nagar", lat: 12.9063, lng: 77.5857 },
  { slug: "malleshwaram", name: "Malleshwaram", lat: 13.0035, lng: 77.5647 },
  { slug: "hebbal", name: "Hebbal", lat: 13.0358, lng: 77.597 },
  { slug: "whitefield", name: "Whitefield", lat: 12.9698, lng: 77.75 },
  { slug: "bellandur", name: "Bellandur", lat: 12.9304, lng: 77.6784 },
  { slug: "electronic-city", name: "Electronic City", lat: 12.8452, lng: 77.6602 },
];

/* ------------------------------------------------------------------ */
/* Events: 8 chess + 8 hackathon, Dec 2026 - Jan 2027                  */
/* ------------------------------------------------------------------ */
const base = {
  registration_url: null,
  source_url: null,
  verification_status: "sample" as const,
  is_demo: true as const,
};

export const events: DemoEvent[] = [
  /* ---------------- Chess ---------------- */
  {
    ...base,
    id: "ev-chess-01",
    title: "Sample Sunday Rapid Open",
    domain: "chess",
    description:
      "Sample listing: a one-day OTB rapid tournament for adult players. Used to demonstrate opted-in participants and chess looking-for intents.",
    venue_name: "Sample community hall",
    neighbourhood: "indiranagar",
    start_at: "2026-12-06T09:30:00+05:30",
    end_at: "2026-12-06T17:30:00+05:30",
    is_junior_event: false,
    level_note: "Open section (sample)",
  },
  {
    ...base,
    id: "ev-chess-02",
    title: "Sample Under-1600 Classical Weekender",
    domain: "chess",
    description:
      "Sample listing: two-day classical event for players rated under 1600, with a rating-band section.",
    venue_name: "Sample sports club hall",
    neighbourhood: "koramangala",
    start_at: "2026-12-12T09:00:00+05:30",
    end_at: "2026-12-13T18:00:00+05:30",
    is_junior_event: false,
    level_note: "Under 1600 (sample)",
  },
  {
    ...base,
    id: "ev-chess-03",
    title: "Sample Blitz Night",
    domain: "chess",
    description:
      "Sample listing: an evening blitz arena for casual and competitive players. Good for the 'practice partner' intent.",
    venue_name: "Sample cafe back room",
    neighbourhood: "jayanagar",
    start_at: "2026-12-18T18:30:00+05:30",
    end_at: "2026-12-18T22:00:00+05:30",
    is_junior_event: false,
    level_note: "All levels (sample)",
  },
  {
    ...base,
    id: "ev-chess-04",
    title: "Sample Junior Rapid (Under 12)",
    domain: "chess",
    description:
      "Sample junior listing. Shows event details and aggregate counts only: no named participants and no messaging, because this event is for minors.",
    venue_name: "Sample school auditorium",
    neighbourhood: "malleshwaram",
    start_at: "2026-12-20T09:00:00+05:30",
    end_at: "2026-12-20T16:00:00+05:30",
    is_junior_event: true,
    level_note: "Under 12 (sample)",
  },
  {
    ...base,
    id: "ev-chess-05",
    title: "Sample New Year Classical Open",
    domain: "chess",
    description:
      "Sample listing: a five-round classical open over the first weekend of the year.",
    venue_name: "Sample convention hall",
    neighbourhood: "hsr-layout",
    start_at: "2027-01-02T09:00:00+05:30",
    end_at: "2027-01-03T18:30:00+05:30",
    is_junior_event: false,
    level_note: "Open, rating-band prizes (sample)",
  },
  {
    ...base,
    id: "ev-chess-06",
    title: "Sample Whitefield Weekend Rapid",
    domain: "chess",
    description:
      "Sample listing: a one-day rapid event on the east side of the city.",
    venue_name: "Sample apartment clubhouse",
    neighbourhood: "whitefield",
    start_at: "2027-01-10T09:30:00+05:30",
    end_at: "2027-01-10T17:00:00+05:30",
    is_junior_event: false,
    level_note: "Open (sample)",
  },
  {
    ...base,
    id: "ev-chess-07",
    title: "Sample Corporate Chess League Round",
    domain: "chess",
    description:
      "Sample listing: an evening league round for working professionals, adults only.",
    venue_name: "Sample tech-park auditorium",
    neighbourhood: "bellandur",
    start_at: "2027-01-16T17:30:00+05:30",
    end_at: "2027-01-16T21:30:00+05:30",
    is_junior_event: false,
    level_note: "Adults, all levels (sample)",
  },
  {
    ...base,
    id: "ev-chess-08",
    title: "Sample Republic Day Rapid",
    domain: "chess",
    description:
      "Sample listing: a holiday rapid tournament with open and under-1800 sections.",
    venue_name: "Sample community centre",
    neighbourhood: "jp-nagar",
    start_at: "2027-01-26T09:30:00+05:30",
    end_at: "2027-01-26T17:30:00+05:30",
    is_junior_event: false,
    level_note: "Open and under 1800 (sample)",
  },

  /* ---------------- Hackathons ---------------- */
  {
    ...base,
    id: "ev-hack-01",
    title: "Sample 24-Hour Open Build",
    domain: "hackathon",
    description:
      "Sample listing: a 24-hour open-theme hackathon for adult builders. Used to demonstrate teammate-finding by role.",
    venue_name: "Sample coworking space",
    neighbourhood: "koramangala",
    start_at: "2026-12-05T10:00:00+05:30",
    end_at: "2026-12-06T10:00:00+05:30",
    is_junior_event: false,
    level_note: "Open to all adults (sample)",
  },
  {
    ...base,
    id: "ev-hack-02",
    title: "Sample Civic Tech Sprint",
    domain: "hackathon",
    description:
      "Sample listing: a weekend sprint on city-services problems. Tracks: mobility, waste, public information.",
    venue_name: "Sample innovation hub",
    neighbourhood: "indiranagar",
    start_at: "2026-12-12T09:30:00+05:30",
    end_at: "2026-12-13T18:00:00+05:30",
    is_junior_event: false,
    level_note: "Teams of 2 to 4 (sample)",
  },
  {
    ...base,
    id: "ev-hack-03",
    title: "Sample AI Tools Buildathon",
    domain: "hackathon",
    description:
      "Sample listing: build a small product using AI APIs in a single day. Looking for ML and frontend pairings.",
    venue_name: "Sample startup office",
    neighbourhood: "hsr-layout",
    start_at: "2026-12-19T10:00:00+05:30",
    end_at: "2026-12-19T21:00:00+05:30",
    is_junior_event: false,
    level_note: "Solo or teams (sample)",
  },
  {
    ...base,
    id: "ev-hack-04",
    title: "Sample School Innovation Sprint",
    domain: "hackathon",
    description:
      "Sample junior listing for school students. Shows event details and aggregate counts only: no named participants and no messaging.",
    venue_name: "Sample school campus",
    neighbourhood: "hebbal",
    start_at: "2026-12-27T09:30:00+05:30",
    end_at: "2026-12-27T16:30:00+05:30",
    is_junior_event: true,
    level_note: "School students (sample)",
  },
  {
    ...base,
    id: "ev-hack-05",
    title: "Sample Climate Data Hack",
    domain: "hackathon",
    description:
      "Sample listing: a weekend data hackathon using open climate and air-quality datasets.",
    venue_name: "Sample university seminar hall",
    neighbourhood: "jayanagar",
    start_at: "2027-01-09T09:30:00+05:30",
    end_at: "2027-01-10T17:30:00+05:30",
    is_junior_event: false,
    level_note: "Adults, data and design roles welcome (sample)",
  },
  {
    ...base,
    id: "ev-hack-06",
    title: "Sample Fintech Weekend Build",
    domain: "hackathon",
    description:
      "Sample listing: a two-day build on payments-and-money problems for adult developers.",
    venue_name: "Sample co-working floor",
    neighbourhood: "bellandur",
    start_at: "2027-01-16T10:00:00+05:30",
    end_at: "2027-01-17T18:00:00+05:30",
    is_junior_event: false,
    level_note: "Teams of up to 4 (sample)",
  },
  {
    ...base,
    id: "ev-hack-07",
    title: "Sample Open Source Contribution Day",
    domain: "hackathon",
    description:
      "Sample listing: a one-day contribute-together event. Good for newcomers looking for a first team.",
    venue_name: "Sample community space",
    neighbourhood: "whitefield",
    start_at: "2027-01-23T10:00:00+05:30",
    end_at: "2027-01-23T18:00:00+05:30",
    is_junior_event: false,
    level_note: "Beginner friendly (sample)",
  },
  {
    ...base,
    id: "ev-hack-08",
    title: "Sample Hardware and IoT Jam",
    domain: "hackathon",
    description:
      "Sample listing: a weekend hardware jam with sensors and microcontrollers.",
    venue_name: "Sample maker space",
    neighbourhood: "electronic-city",
    start_at: "2027-01-30T09:30:00+05:30",
    end_at: "2027-01-31T17:30:00+05:30",
    is_junior_event: false,
    level_note: "Adults, all skill levels (sample)",
  },
];

/* ------------------------------------------------------------------ */
/* Profiles: 8 fictional personas (all 18+)                            */
/* ------------------------------------------------------------------ */
const personaBase = {
  is_18_plus: true as const,
  demo_label: "Fictional demo persona" as const,
};

export const profiles: DemoProfile[] = [
  {
    ...personaBase,
    id: "p-asha",
    display_name: "Asha (demo)",
    bio: "Weekend rapid player who likes finding a post-round analysis partner.",
    neighbourhood: "indiranagar",
    interests: ["chess", "puzzles", "filter coffee"],
    skills: [],
    domain_details: { chess: { rating_band: "1400-1600", formats: ["rapid", "blitz"] } },
    discoverable: true,
  },
  {
    ...personaBase,
    id: "p-rohan",
    display_name: "Rohan (demo)",
    bio: "Classical player preparing for a first rating-prize finish.",
    neighbourhood: "koramangala",
    interests: ["chess", "opening theory"],
    skills: [],
    domain_details: { chess: { rating_band: "1600-1800", formats: ["classical", "rapid"] } },
    discoverable: true,
  },
  {
    ...personaBase,
    id: "p-meera",
    display_name: "Meera (demo)",
    bio: "Backend developer who ships small tools on weekends.",
    neighbourhood: "hsr-layout",
    interests: ["hackathons", "open source"],
    skills: ["python", "postgres", "apis"],
    domain_details: { hackathon: { roles: ["backend"], tracks: ["civic tech", "AI tools"] } },
    discoverable: true,
  },
  {
    ...personaBase,
    id: "p-karthik",
    display_name: "Karthik (demo)",
    bio: "Frontend and design-minded developer looking for a backend teammate.",
    neighbourhood: "koramangala",
    interests: ["hackathons", "product design"],
    skills: ["typescript", "react", "figma"],
    domain_details: { hackathon: { roles: ["frontend", "design"], tracks: ["AI tools", "fintech"] } },
    discoverable: true,
  },
  {
    ...personaBase,
    id: "p-divya",
    display_name: "Divya (demo)",
    bio: "ML engineer who prefers short, focused builds.",
    neighbourhood: "bellandur",
    interests: ["machine learning", "data", "hackathons"],
    skills: ["python", "pytorch", "data viz"],
    domain_details: { hackathon: { roles: ["ml"], tracks: ["AI tools", "climate data"] } },
    discoverable: true,
  },
  {
    ...personaBase,
    id: "p-imran",
    display_name: "Imran (demo)",
    bio: "Plays blitz after work and travels to a tournament or two a year.",
    neighbourhood: "jayanagar",
    interests: ["chess", "blitz"],
    skills: [],
    domain_details: { chess: { rating_band: "1200-1400", formats: ["blitz"] } },
    discoverable: true,
  },
  {
    ...personaBase,
    id: "p-nisha",
    display_name: "Nisha (demo)",
    bio: "Prefers to attend quietly; keeps her profile private.",
    neighbourhood: "jp-nagar",
    interests: ["chess", "hackathons"],
    skills: ["design"],
    domain_details: {
      chess: { rating_band: "1000-1200", formats: ["rapid"] },
      hackathon: { roles: ["design"], tracks: ["civic tech"] },
    },
    discoverable: false,
  },
  {
    ...personaBase,
    id: "p-vikram",
    display_name: "Vikram (demo)",
    bio: "Full-stack developer who plays chess casually and enjoys both scenes.",
    neighbourhood: "whitefield",
    interests: ["chess", "hackathons", "open source"],
    skills: ["node", "react", "sql"],
    domain_details: {
      chess: { rating_band: "1400-1600", formats: ["rapid"] },
      hackathon: { roles: ["backend", "frontend"], tracks: ["open source"] },
    },
    discoverable: true,
  },
];


/* ------------------------------------------------------------------ */
/* Attendance: public, anonymous and non-discoverable privacy cases    */
/* ------------------------------------------------------------------ */
export const attendance: DemoAttendance[] = [
  // ev-chess-01: Asha and Rohan public; Nisha anonymous
  { id: "a-01", user_id: "p-asha", event_id: "ev-chess-01", status: "going", visibility: "public", looking_for: ["chess:opponent"] },
  { id: "a-02", user_id: "p-rohan", event_id: "ev-chess-01", status: "going", visibility: "public", looking_for: ["chess:practice_partner"] },
  { id: "a-03", user_id: "p-nisha", event_id: "ev-chess-01", status: "interested", visibility: "anonymous", looking_for: [] },
  { id: "a-04", user_id: "p-vikram", event_id: "ev-chess-01", status: "interested", visibility: "public", looking_for: ["chess:opponent"] },

  // ev-chess-03: blitz night
  { id: "a-05", user_id: "p-imran", event_id: "ev-chess-03", status: "going", visibility: "public", looking_for: ["chess:practice_partner"] },
  { id: "a-06", user_id: "p-asha", event_id: "ev-chess-03", status: "interested", visibility: "public", looking_for: ["chess:practice_partner"] },

  // ev-hack-01: hackathon with role needs; Nisha has public event visibility but profile discoverability is OFF.
  { id: "a-08", user_id: "p-meera", event_id: "ev-hack-01", status: "going", visibility: "public", looking_for: ["hackathon:teammate:frontend"] },
  { id: "a-09", user_id: "p-karthik", event_id: "ev-hack-01", status: "going", visibility: "public", looking_for: ["hackathon:teammate:backend"] },
  { id: "a-10", user_id: "p-divya", event_id: "ev-hack-01", status: "interested", visibility: "public", looking_for: ["hackathon:teammate:any"] },
  { id: "a-11", user_id: "p-nisha", event_id: "ev-hack-01", status: "interested", visibility: "public", looking_for: [] },

  // ev-hack-03: AI tools buildathon
  { id: "a-12", user_id: "p-divya", event_id: "ev-hack-03", status: "going", visibility: "public", looking_for: ["hackathon:teammate:frontend"] },
  { id: "a-13", user_id: "p-karthik", event_id: "ev-hack-03", status: "going", visibility: "public", looking_for: ["hackathon:teammate:ml"] },
  { id: "a-14", user_id: "p-vikram", event_id: "ev-hack-03", status: "interested", visibility: "public", looking_for: ["hackathon:teammate:design"] },

];

/* ------------------------------------------------------------------ */
/* Junior-event counts: aggregate-only sample values; no profile IDs   */
/* ------------------------------------------------------------------ */
export const juniorEventCounts: DemoJuniorEventCounts[] = [
  { event_id: "ev-chess-04", interested_count: 12, going_count: 4, is_demo: true },
  { event_id: "ev-hack-04", interested_count: 18, going_count: 6, is_demo: true },
];

/* ------------------------------------------------------------------ */
/* Connection requests: one pending, one accepted, one declined        */
/* ------------------------------------------------------------------ */
export const connectionRequests: DemoConnectionRequest[] = [
  {
    id: "cr-01",
    from_user_id: "p-karthik",
    to_user_id: "p-meera",
    event_id: "ev-hack-01",
    note: "Hi Meera, I'm doing frontend and design and you list backend. Want to team up for the 24-hour build?",
    status: "pending",
    created_at: "2026-11-17T19:30:00+05:30",
  },
  {
    id: "cr-02",
    from_user_id: "p-vikram",
    to_user_id: "p-rohan",
    event_id: "ev-chess-01",
    note: "Looking for a friendly game before round one. Rapid, around 1500?",
    status: "accepted",
    created_at: "2026-11-17T20:15:00+05:30",
  },
  {
    id: "cr-03",
    from_user_id: "p-imran",
    to_user_id: "p-asha",
    event_id: "ev-chess-03",
    note: "Blitz practice before the night starts?",
    status: "declined",
    created_at: "2026-11-16T18:40:00+05:30",
  },
];

/* ------------------------------------------------------------------ */
/* Suggested demo flow (authoritative v4.1)                            */
/* ------------------------------------------------------------------ */
// 1. Open /explore as guest: event details and sample aggregate counts only.
// 2. Select "Try demo as Karthik" to start an explicit demo session.
// 3. Open ev-hack-01. Karthik is excluded from his own People results.
//    Meera and Divya are visible: both attend, are 18+, discoverable and public.
//    Nisha has public attendance but discoverability is OFF, so her identity is hidden
//    and she contributes only to aggregate counts.
// 4. cr-01 (Karthik -> Meera) starts pending. Switch to Meera and accept it.
//    Meera's share_contact_on_accept is true, so Karthik can view her contact after switching back.
// 5. cr-02 (Vikram -> Rohan) is accepted, but Rohan's contact-sharing preference is false;
//    Vikram sees "Connected" without contact details.
// 6. cr-03 (Imran -> Asha) is declined; both have attendance at ev-chess-03.
// 7. Open junior events: show synthetic aggregate sample counts only; no named attendees,
//    People recommendations, or connection requests.
// 8. Reset demo or let the signed demo cookie expire to restore the initial fixture state.
