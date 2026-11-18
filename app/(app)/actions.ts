"use server";

import { revalidatePath } from "next/cache";
import { fixtureRepository } from "../../lib/data/fixture-repository";
import type { ConnectionResult } from "../../lib/data/repository";
import { isAvatarId } from "../../lib/profile/avatars";
import { resetDemoSession, startDemoSession, switchDemoPersona } from "../../lib/server/demo-session";

export async function startDemoAction() {
  return startDemoSession();
}

export async function switchPersonaAction(formData: FormData) {
  return switchDemoPersona(formData instanceof FormData ? formData.get("personaId") : null);
}

export async function resetDemoAction() {
  return resetDemoSession();
}

export async function changeAttendanceAction(_previous: string, formData: FormData): Promise<string> {
  if (!(formData instanceof FormData)) return "Invalid attendance submission.";
  const eventId = formData.get("eventId");
  const operation = formData.get("operation");
  if (typeof eventId !== "string" || (operation !== "save" && operation !== "leave")) {
    return "Invalid attendance submission.";
  }

  const result = await fixtureRepository.changeAttendance(
    eventId,
    formData.get("expectedPersona"),
    operation === "leave" ? null : {
      status: formData.get("status"),
      visibility: formData.get("visibility"),
      looking_for: formData.getAll("intent"),
    },
  );

  if (!result.ok) {
    if (result.reason === "guest") return "Start a demo to change attendance.";
    if (result.reason === "conflict") return "Your demo changed. Refresh the page and try again.";
    if (result.reason === "invalid-attendance") return "These choices are not available for this event.";
    return "Attendance could not be updated. Try again.";
  }

  revalidatePath("/explore");
  revalidatePath("/people");
  revalidatePath(`/events/${eventId}`);
  return "";
}

function finishConnectionAction(result: ConnectionResult): string {
  if (result.ok) {
    revalidatePath("/connections");
    revalidatePath("/profile");
    revalidatePath("/people");
    revalidatePath("/events/[id]", "page");
    return "";
  }

  switch (result.reason) {
    case "invalid-note":
      return "Enter a note of 1–280 characters without private contact details.";
    case "ineligible-request":
      return "This person is no longer eligible for a request at this event.";
    case "duplicate-request":
      return "A request already exists for this pair and event.";
    case "pending-limit":
      return "You can have up to five outgoing pending requests.";
    case "invalid-transition":
      return "This request action is no longer available.";
    case "guest":
      return "Start a demo to manage connection requests.";
    case "conflict":
      return "Your demo changed. Refresh the page and try again.";
    default:
      return "Couldn’t update the demo. Try again.";
  }
}

export async function sendConnectionAction(_previous: string, formData: FormData): Promise<string> {
  if (!(formData instanceof FormData)) return "Invalid request submission.";
  return finishConnectionAction(await fixtureRepository.sendRequest(
    formData.get("eventId"), formData.get("targetId"), formData.get("note"), formData.get("expectedPersona"),
  ));
}

export async function transitionConnectionAction(_previous: string, formData: FormData): Promise<string> {
  if (!(formData instanceof FormData)) return "Invalid request submission.";
  return finishConnectionAction(await fixtureRepository.transitionRequest(
    formData.get("requestId"), formData.get("transition"), formData.get("expectedPersona"),
  ));
}

export async function changeContactSharingAction(_previous: string, formData: FormData): Promise<string> {
  if (!(formData instanceof FormData)) return "Invalid sharing submission.";
  const enabled = formData.get("enabled");
  if (enabled !== "true" && enabled !== "false") return "Invalid sharing choice.";
  return finishConnectionAction(await fixtureRepository.changeContactSharing(
    enabled === "true", formData.get("expectedPersona"),
  ));
}

export async function changeAvatarAction(
  _previous: { ok: boolean; message: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; message: string }> {
  const choice = formData instanceof FormData ? formData.get("avatar") : null;
  if (choice !== "" && !isAvatarId(choice)) return { ok: false, message: "Choose an avatar from the list." };

  const result = await fixtureRepository.changeAvatar(choice || null, formData.get("expectedPersona"));
  if (!result.ok) {
    if (result.reason === "conflict") return { ok: false, message: "Your demo changed. Refresh the page and try again." };
    if (result.reason === "guest") return { ok: false, message: "Start a demo to save an avatar." };
    return { ok: false, message: "Couldn’t save your avatar. Try again." };
  }

  revalidatePath("/profile");
  revalidatePath("/people");
  revalidatePath("/events/[id]", "page");
  return { ok: true, message: "Avatar saved for this demo persona." };
}
