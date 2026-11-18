import "server-only";

import { randomUUID } from "node:crypto";
import {
  attendance,
  connectionRequests,
  events,
  juniorEventCounts,
  neighbourhoods,
  profiles,
  type DemoAttendance,
  type DemoConnectionRequest,
  type DemoEvent,
} from "../fixtures/demo-data";
import { canRevealContact } from "../privacy/contact";
import { attendsEvent, canDiscoverAttendee } from "../privacy/discovery";
import { canTransitionRequest, isRequestTransition, requestLimitReason, requestPair, validRequestNote } from "../privacy/requests";
import { mutateDemoSession, readDemoSession } from "../server/demo-session";
import { profilePrivate } from "../server/profile-private";
import { isAttendanceSelection, isDemoPersonaId, lookingForOptions } from "./demo-state";
import type {
  Attendee, AttendanceOverride, ConnectionResult, ConnectionView, DemoState, EventRepository, EventSummary,
} from "./repository";

function effectiveAttendance(state: DemoState | null) {
  const records = new Map<string, Omit<DemoAttendance, "id">>();
  for (const entry of [...attendance, ...(state?.attendanceOverrides ?? [])]) {
    const key = `${entry.user_id}:${entry.event_id}`;
    if (entry.status === "left") records.delete(key);
    else records.set(key, entry);
  }
  return [...records.values()];
}

function summarizeEvent(event: DemoEvent, state: DemoState | null): EventSummary {
  if (event.is_junior_event) {
    const counts = juniorEventCounts.find(({ event_id }) => event_id === event.id);
    return { ...event, interestedCount: counts?.interested_count ?? 0, goingCount: counts?.going_count ?? 0 };
  }

  const attending = effectiveAttendance(state).filter(({ event_id }) => event_id === event.id);
  const goingCount = attending.filter(({ status }) => status === "going").length;
  return { ...event, interestedCount: attending.length - goingCount, goingCount };
}

function sharesContact(state: DemoState, ownerId: string) {
  return state.contactSharingOverrides[ownerId]
    ?? profilePrivate.find(({ profile_id }) => profile_id === ownerId)?.share_contact_on_accept
    ?? false;
}

function effectiveRequests(state: DemoState): DemoConnectionRequest[] {
  return [...connectionRequests, ...state.newRequests].map((request) => ({
    ...request,
    status: state.requestStatusOverrides[request.id] ?? request.status,
  }));
}

function connectionContact(state: DemoState, request: DemoConnectionRequest, event: DemoEvent) {
  const viewerId = state.activePersonaId;
  const ownerId = viewerId === request.from_user_id ? request.to_user_id : request.from_user_id;
  if (event.is_junior_event || !canRevealContact({
    viewerId, ownerId, eventId: event.id, request, ownerShares: sharesContact(state, ownerId),
  })) return null;
  return profilePrivate.find(({ profile_id }) => profile_id === ownerId)?.contact_handle.trim() || null;
}

function discoverTarget(state: DemoState, targetId: string, event: DemoEvent, records = effectiveAttendance(state)) {
  const viewer = profiles.find(({ id }) => id === state.activePersonaId);
  const target = profiles.find(({ id }) => id === targetId);
  const viewerAttendance = records.find(({ user_id, event_id }) => user_id === viewer?.id && event_id === event.id);
  const targetAttendance = records.find(({ user_id, event_id }) => user_id === targetId && event_id === event.id);
  if (!target || !targetAttendance || !canDiscoverAttendee({
    event, viewer, viewerAttendance, target, targetAttendance,
    targetDiscoverable: state.discoverabilityOverrides[targetId] ?? target.discoverable,
  })) return null;
  return target;
}

type RequestRejection = "ineligible-request" | "duplicate-request" | "pending-limit" | "invalid-transition";

async function mutateConnection(
  expectedPersona: unknown,
  update: (state: DemoState, actor: string) => DemoState | RequestRejection,
): Promise<ConnectionResult> {
  let rejected: RequestRejection | undefined;
  const result = await mutateDemoSession((state) => {
    const actor = state.activePersonaId;
    if (actor !== expectedPersona || !isDemoPersonaId(actor)) return null;
    const next = update(state, actor);
    if (typeof next !== "string") return next;
    rejected = next;
    return null;
  });
  return rejected ? { ok: false, reason: rejected } : result;
}

export const fixtureRepository: EventRepository = {
  async listEvents() {
    const state = await readDemoSession();
    return events.map((event) => summarizeEvent(event, state));
  },

  async getEvent(id) {
    const event = events.find((entry) => entry.id === id);
    return event ? summarizeEvent(event, await readDemoSession()) : null;
  },

  listNeighbourhoods() {
    return neighbourhoods.map(({ slug, name }) => ({ slug, name }));
  },

  async listPersonaOptions() {
    if (!await readDemoSession()) return [];
    return profiles.filter(({ is_18_plus }) => is_18_plus)
      .map(({ id, display_name, demo_label }) => ({ id, display_name, demo_label }));
  },

  async getOwnProfile() {
    const state = await readDemoSession();
    if (!state) return null;
    const profile = profiles.find(({ id, is_18_plus }) => is_18_plus && id === state.activePersonaId);
    if (!profile) return null;
    return {
      ...profile,
      discoverable: state.discoverabilityOverrides[profile.id] ?? profile.discoverable,
      share_contact_on_accept: sharesContact(state, profile.id),
    };
  },

  async getEventParticipation(eventId) {
    const event = events.find(({ id }) => id === eventId);
    if (!event) return null;
    if (event.is_junior_event) return { access: "junior", event: summarizeEvent(event, null) };

    const state = await readDemoSession();
    const summary = summarizeEvent(event, state);
    if (!state) return { access: "guest", event: summary };
    const viewer = profiles.find(({ id, is_18_plus }) => id === state.activePersonaId && is_18_plus);
    if (!viewer) return { access: "guest", event: summary };

    const atEvent = effectiveAttendance(state).filter(({ event_id }) => event_id === event.id);
    const ownAttendance = atEvent.find(({ user_id }) => user_id === viewer.id);
    if (!ownAttendance || !attendsEvent(ownAttendance, viewer.id, event.id)) {
      return { access: "not-attending", event: summary, personaId: viewer.id };
    }

    const intents = lookingForOptions(event.domain);
    const requestedPairs = new Set(effectiveRequests(state).map((request) =>
      requestPair(request.event_id, request.from_user_id, request.to_user_id)));
    const attendees: Attendee[] = [];
    for (const record of atEvent) {
      const target = discoverTarget(state, record.user_id, event, atEvent);
      if (!target) continue;
      attendees.push({
        id: target.id,
        label: target.display_name,
        status: record.status,
        intents: intents.filter(({ value }) => record.looking_for.some((intent) => intent === value))
          .map(({ label }) => label),
        hasRequest: requestedPairs.has(requestPair(event.id, viewer.id, target.id)),
      });
    }

    return {
      access: "attending", event: summary, personaId: viewer.id, attendees,
      attendance: {
        status: ownAttendance.status, visibility: ownAttendance.visibility, looking_for: ownAttendance.looking_for,
      },
    };
  },

  async listAttendedEvents() {
    const state = await readDemoSession();
    if (!state) return null;
    const eventIds = new Set(effectiveAttendance(state).filter(({ user_id }) => user_id === state.activePersonaId)
      .map(({ event_id }) => event_id));
    return events.filter(({ id, is_junior_event }) => !is_junior_event && eventIds.has(id))
      .map(({ id, title }) => ({ id, title }));
  },

  async changeAttendance(eventId, expectedPersona, selection) {
    const event = events.find(({ id }) => id === eventId);
    if (!event || event.is_junior_event || !isDemoPersonaId(expectedPersona)
      || (selection !== null && !isAttendanceSelection(selection, event.domain))) {
      return { ok: false, reason: "invalid-attendance" };
    }

    return mutateDemoSession((state) => {
      const actor = state.activePersonaId;
      if (actor !== expectedPersona || !isDemoPersonaId(actor)) return null;

      const override: AttendanceOverride = selection === null
        ? { user_id: actor, event_id: event.id, status: "left" }
        : { user_id: actor, event_id: event.id, ...selection };
      return {
        ...state,
        attendanceOverrides: [
          ...state.attendanceOverrides.filter(({ user_id, event_id }) => user_id !== actor || event_id !== event.id),
          override,
        ],
      };
    });
  },

  async getContactForRequest(requestId) {
    const state = await readDemoSession();
    if (!state) return null;

    const request = effectiveRequests(state).find(({ id }) => id === requestId);
    if (!request) return null;
    const event = events.find(({ id }) => id === request.event_id);
    return event ? connectionContact(state, request, event) : null;
  },

  async listConnections() {
    const state = await readDemoSession();
    if (!state) return null;
    const personaId = state.activePersonaId;
    const records = effectiveAttendance(state);
    const requests: ConnectionView[] = [];
    for (const request of effectiveRequests(state)) {
      if (request.from_user_id !== personaId && request.to_user_id !== personaId) continue;
      const event = events.find(({ id }) => id === request.event_id);
      if (!event || event.is_junior_event) continue;

      const outgoing = request.from_user_id === personaId;
      const target = discoverTarget(state, outgoing ? request.to_user_id : request.from_user_id, event, records);
      requests.push({
        id: request.id,
        eventTitle: event.title,
        direction: outgoing ? "outgoing" : "incoming",
        status: request.status,
        note: request.note,
        createdAt: request.created_at,
        counterpart: target ? { display_name: target.display_name, bio: target.bio } : null,
        contact: connectionContact(state, request, event),
      });
    }
    requests.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    return { personaId, requests };
  },

  async sendRequest(eventId, targetId, note, expectedPersona) {
    const trimmed = typeof note === "string" ? note.trim() : null;
    if (!validRequestNote(trimmed)) return { ok: false, reason: "invalid-note" };
    const event = events.find(({ id }) => id === eventId);
    if (!event || event.is_junior_event || !isDemoPersonaId(targetId)) {
      return { ok: false, reason: "ineligible-request" };
    }

    return mutateConnection(expectedPersona, (state, actor) => {
      if (!discoverTarget(state, targetId, event)) return "ineligible-request";
      const blocked = requestLimitReason(effectiveRequests(state), actor, targetId, event.id);
      if (blocked) return blocked;
      return {
        ...state,
        newRequests: [...state.newRequests, {
          id: `demo-${randomUUID()}`, from_user_id: actor, to_user_id: targetId,
          event_id: event.id, note: trimmed, status: "pending", created_at: new Date().toISOString(),
        }],
      };
    });
  },

  async transitionRequest(requestId, transition, expectedPersona) {
    if (typeof requestId !== "string" || !isRequestTransition(transition)) {
      return { ok: false, reason: "invalid-transition" };
    }

    return mutateConnection(expectedPersona, (state, actor) => {
      const request = effectiveRequests(state).find(({ id }) => id === requestId);
      const event = request && events.find(({ id }) => id === request.event_id);
      if (!request || !event || event.is_junior_event || !canTransitionRequest(request, actor, transition)) {
        return "invalid-transition";
      }
      return { ...state, requestStatusOverrides: { ...state.requestStatusOverrides, [request.id]: transition } };
    });
  },

  async changeContactSharing(enabled, expectedPersona) {
    if (typeof enabled !== "boolean") return { ok: false, reason: "invalid-transition" };
    return mutateConnection(expectedPersona, (state, actor) => ({
      ...state, contactSharingOverrides: { ...state.contactSharingOverrides, [actor]: enabled },
    }));
  },
};
