import "server-only";

import type { DemoConnectionRequest, RequestStatus } from "../fixtures/demo-data";
import { profilePrivate } from "../server/profile-private";

const knownHandles = profilePrivate
  .map(({ contact_handle }) => contact_handle.trim().toLowerCase())
  .filter(Boolean);

export type RequestTransition = Exclude<RequestStatus, "pending">;

export function requestPair(eventId: string, from: string, to: string) {
  return `${eventId}:${[from, to].sort().join(":")}`;
}

export function validRequestNote(value: unknown): value is string {
  if (typeof value !== "string" || value !== value.trim() || value.length < 1 || value.length > 280) return false;
  const lowercase = value.toLowerCase();
  return !knownHandles.some((handle) => lowercase.includes(handle));
}

export function requestLimitReason(requests: DemoConnectionRequest[], actor: string, target: string, eventId: string) {
  const pair = requestPair(eventId, actor, target);
  if (requests.some((request) => requestPair(request.event_id, request.from_user_id, request.to_user_id) === pair)) {
    return "duplicate-request";
  }
  if (requests.filter((request) => request.status === "pending" && request.from_user_id === actor).length >= 5) {
    return "pending-limit";
  }
  return null;
}

export function isRequestTransition(value: unknown): value is RequestTransition {
  return value === "accepted" || value === "declined" || value === "cancelled";
}

export function canTransitionRequest(request: DemoConnectionRequest, actor: string, transition: RequestTransition) {
  return request.status === "pending"
    && (transition === "cancelled" ? request.from_user_id === actor : request.to_user_id === actor);
}
