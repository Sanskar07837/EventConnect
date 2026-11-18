import "server-only";

import { connectionRequests, events, profiles, type Domain, type LookingFor } from "../fixtures/demo-data";
import { requestPair, validRequestNote } from "../privacy/requests";
import { isAvatarId } from "../profile/avatars";
import type { AttendanceSelection, DemoState } from "./repository";

const stateFields = [
  "activePersonaId", "attendanceOverrides", "discoverabilityOverrides",
  "contactSharingOverrides", "newRequests", "requestStatusOverrides",
] as const;
const stateFieldsWithAvatars = [...stateFields, "avatarOverrides"] as const;

const attendanceFields = ["user_id", "event_id", "status", "visibility", "looking_for"];
const removalFields = ["user_id", "event_id", "status"];
const selectionFields = ["status", "visibility", "looking_for"];
const requestFields = ["id", "from_user_id", "to_user_id", "event_id", "note", "status", "created_at"];
const adultIds = new Set<string>(profiles.filter((profile) => profile.is_18_plus).map((profile) => profile.id));
const nonJuniorEvents = new Map(events.filter((event) => !event.is_junior_event).map((event) => [event.id, event]));
const intentLabels = {
  "chess:opponent": "Chess opponent",
  "chess:practice_partner": "Practice partner",
  "hackathon:teammate:backend": "Backend teammate",
  "hackathon:teammate:frontend": "Frontend teammate",
  "hackathon:teammate:ml": "ML teammate",
  "hackathon:teammate:design": "Design teammate",
  "hackathon:teammate:any": "Teammate, any role",
} satisfies Record<LookingFor, string>;

export function lookingForOptions(domain: Domain) {
  return Object.entries(intentLabels).filter(([value]) => value.startsWith(`${domain}:`))
    .map(([value, label]) => ({ value, label }));
}

export function isDemoPersonaId(value: unknown): value is string {
  return typeof value === "string" && adultIds.has(value);
}

export function initialDemoState(): DemoState {
  return {
    activePersonaId: "p-karthik",
    attendanceOverrides: [],
    discoverabilityOverrides: {},
    contactSharingOverrides: {},
    newRequests: [],
    requestStatusOverrides: {},
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasFields(value: unknown, fields: readonly string[]): value is Record<string, unknown> {
  return isRecord(value) && Object.keys(value).length === fields.length
    && fields.every((field) => Object.hasOwn(value, field));
}

function isPreferenceMap(value: unknown) {
  return isRecord(value)
    && Object.entries(value).every(([id, enabled]) => isDemoPersonaId(id) && typeof enabled === "boolean");
}

export function isAttendanceSelection(value: unknown, domain: Domain): value is AttendanceSelection {
  if (!hasFields(value, selectionFields)
    || (value.status !== "interested" && value.status !== "going")
    || (value.visibility !== "public" && value.visibility !== "anonymous")
    || !Array.isArray(value.looking_for)) return false;

  const options = new Set(lookingForOptions(domain).map(({ value: option }) => option));
  return value.looking_for.length <= options.size
    && Array.from(value.looking_for).every((intent) => typeof intent === "string" && options.has(intent))
    && new Set(value.looking_for).size === value.looking_for.length;
}

function attendanceKey(userId: string, eventId: string) {
  return `${userId}:${eventId}`;
}

export function isDemoState(value: unknown): value is DemoState {
  if (!isRecord(value)) return false;
  const hasAvatars = Object.hasOwn(value, "avatarOverrides");
  if (!hasFields(value, hasAvatars ? stateFieldsWithAvatars : stateFields)
    || (hasAvatars && (!isRecord(value.avatarOverrides)
      || !Object.entries(value.avatarOverrides).every(([id, avatar]) => isDemoPersonaId(id) && isAvatarId(avatar))))
    || !isDemoPersonaId(value.activePersonaId)
    || !Array.isArray(value.attendanceOverrides) || !Array.isArray(value.newRequests)
    || !isPreferenceMap(value.discoverabilityOverrides) || !isPreferenceMap(value.contactSharingOverrides)
    || !isRecord(value.requestStatusOverrides)) return false;

  const overriddenAttendance = new Set<string>();
  for (const entry of value.attendanceOverrides) {
    if (!isRecord(entry) || !isDemoPersonaId(entry.user_id) || typeof entry.event_id !== "string") return false;
    const event = nonJuniorEvents.get(entry.event_id);
    if (!event) return false;
    const valid = entry.status === "left" ? hasFields(entry, removalFields)
      : hasFields(entry, attendanceFields) && isAttendanceSelection({
        status: entry.status, visibility: entry.visibility, looking_for: entry.looking_for,
      }, event.domain);
    if (!valid) return false;
    const key = attendanceKey(entry.user_id, entry.event_id);
    if (overriddenAttendance.has(key)) return false;
    overriddenAttendance.add(key);
  }

  const requestIds = new Set(connectionRequests.map(({ id }) => id));
  const pendingSenders = new Map(connectionRequests.filter(({ status }) => status === "pending")
    .map(({ id, from_user_id }) => [id, from_user_id]));
  const pairs = new Set(connectionRequests.map((request) =>
    requestPair(request.event_id, request.from_user_id, request.to_user_id)));

  // Membership is checked when a request is created. A later leave does not erase its history.
  for (const request of value.newRequests) {
    if (!hasFields(request, requestFields) || typeof request.id !== "string"
      || !/^demo-[a-f0-9-]{36}$/.test(request.id) || requestIds.has(request.id)
      || !isDemoPersonaId(request.from_user_id) || !isDemoPersonaId(request.to_user_id)
      || request.from_user_id === request.to_user_id || typeof request.event_id !== "string"
      || !nonJuniorEvents.has(request.event_id) || request.status !== "pending" || !validRequestNote(request.note)
      || typeof request.created_at !== "string" || !Number.isFinite(Date.parse(request.created_at))) return false;

    const pair = requestPair(request.event_id, request.from_user_id, request.to_user_id);
    if (pairs.has(pair)) return false;
    pairs.add(pair);
    requestIds.add(request.id);
    pendingSenders.set(request.id, request.from_user_id);
  }

  for (const [id, status] of Object.entries(value.requestStatusOverrides)) {
    if (!pendingSenders.has(id) || (status !== "accepted" && status !== "declined" && status !== "cancelled")) return false;
    pendingSenders.delete(id);
  }

  const pendingCounts = new Map<string, number>();
  for (const sender of pendingSenders.values()) {
    const count = (pendingCounts.get(sender) ?? 0) + 1;
    if (count > 5) return false;
    pendingCounts.set(sender, count);
  }
  return true;
}
