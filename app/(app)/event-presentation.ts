import type { EventSummary } from "../../lib/data/repository";

export const eventTimeZone = "Asia/Kolkata";
export const eventCity = "Bengaluru";
export const eventCategory = {
  chess: "Chess",
  hackathon: "Hackathon",
} as const;

export const eventDateTime = new Intl.DateTimeFormat("en-IN", {
  timeZone: eventTimeZone,
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
});

const localDay = new Intl.DateTimeFormat("en-IN", {
  timeZone: eventTimeZone,
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

/** Capture one request-time value for all status labels on a server-rendered page. */
export function eventRenderTime() {
  return Date.now();
}

export function eventStatus(event: Pick<EventSummary, "start_at" | "end_at">, now: number) {
  if (now >= Date.parse(event.end_at)) return "Ended";
  const start = Date.parse(event.start_at);
  if (now >= start) return "Live now";
  return localDay.format(start) === localDay.format(now) ? "Today" : "Upcoming";
}

const chessClockEvents = new Set(["ev-chess-02", "ev-chess-03", "ev-chess-05"]);
const workshopEvents = new Set(["ev-hack-01", "ev-hack-03", "ev-hack-06", "ev-hack-08"]);

const illustrations = {
  chessBoard: { slot: "slot-01-chess-overhead", alt: "A chessboard and chess clock viewed from above" },
  chessClock: { slot: "slot-02-chess-clock-detail", alt: "A chess clock next to a scoresheet" },
  stickyNotes: { slot: "slot-04-sticky-note-wall", alt: "A wall of sticky notes and wireframe sketches" },
  workshop: { slot: "slot-10-workshop-room", alt: "Workshop attendees facing a whiteboard" },
};

export function eventImage({ id, domain }: Pick<EventSummary, "id" | "domain">) {
  const { slot, alt } = domain === "chess"
    ? chessClockEvents.has(id) ? illustrations.chessClock : illustrations.chessBoard
    : workshopEvents.has(id) ? illustrations.workshop : illustrations.stickyNotes;
  return {
    desktopSrc: `/landing/${slot}-1600.webp`,
    mobileSrc: `/landing/${slot}-800.webp`,
    alt,
  };
}
