import "server-only";

import type {
  DemoAttendance,
  DemoConnectionRequest,
  DemoEvent,
  DemoProfile,
  Neighbourhood,
  RequestStatus,
} from "../fixtures/demo-data";
import type { DemoActionResult } from "../server/demo-session";

export type AttendanceSelection = Pick<DemoAttendance, "status" | "visibility" | "looking_for">;
export type AttendanceOverride = Omit<DemoAttendance, "id"> | {
  user_id: string;
  event_id: string;
  status: "left";
};

export type DemoState = {
  activePersonaId: string;
  attendanceOverrides: AttendanceOverride[];
  discoverabilityOverrides: Record<string, boolean>;
  contactSharingOverrides: Record<string, boolean>;
  newRequests: DemoConnectionRequest[];
  requestStatusOverrides: Record<string, Exclude<RequestStatus, "pending">>;
};

export type EventSummary = DemoEvent & {
  interestedCount: number;
  goingCount: number;
};

export type PersonaOption = Pick<DemoProfile, "id" | "display_name" | "demo_label">;

export type Attendee = {
  id: string;
  label: string;
  status: DemoAttendance["status"];
  intents: string[];
  hasRequest: boolean;
};

export type EventParticipation = {
  event: EventSummary;
} & (
  | { access: "guest" | "junior" }
  | { access: "not-attending"; personaId: string }
  | { access: "attending"; personaId: string; attendance: AttendanceSelection; attendees: Attendee[] }
);

export type AttendanceResult = DemoActionResult | { ok: false; reason: "invalid-attendance" };

export type ConnectionResult = DemoActionResult | {
  ok: false;
  reason: "invalid-note" | "ineligible-request" | "duplicate-request" | "pending-limit" | "invalid-transition";
};

export type ConnectionView = {
  id: string;
  eventTitle: string;
  direction: "incoming" | "outgoing";
  status: RequestStatus;
  note: string;
  createdAt: string;
  counterpart: Pick<DemoProfile, "display_name" | "bio"> | null;
  contact: string | null;
};

export interface EventRepository {
  listEvents(): Promise<EventSummary[]>;
  getEvent(id: string): Promise<EventSummary | null>;
  listNeighbourhoods(): Pick<Neighbourhood, "slug" | "name">[];
  listPersonaOptions(): Promise<PersonaOption[]>;
  getOwnProfile(): Promise<(DemoProfile & { share_contact_on_accept: boolean }) | null>;
  getContactForRequest(requestId: string): Promise<string | null>;
  getEventParticipation(eventId: string): Promise<EventParticipation | null>;
  listAttendedEvents(): Promise<Pick<DemoEvent, "id" | "title">[] | null>;
  changeAttendance(eventId: unknown, expectedPersona: unknown, selection: unknown): Promise<AttendanceResult>;
  listConnections(): Promise<{ personaId: string; requests: ConnectionView[] } | null>;
  sendRequest(eventId: unknown, targetId: unknown, note: unknown, expectedPersona: unknown): Promise<ConnectionResult>;
  transitionRequest(requestId: unknown, transition: unknown, expectedPersona: unknown): Promise<ConnectionResult>;
  changeContactSharing(enabled: unknown, expectedPersona: unknown): Promise<ConnectionResult>;
}
