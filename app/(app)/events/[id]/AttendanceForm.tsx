"use client";

import { useActionState } from "react";
import { changeAttendanceAction } from "../../actions";
import type { AttendanceSelection } from "../../../../lib/data/repository";

const selectStyle = "app-input w-full";

export default function AttendanceForm({ eventId, personaId, attendance, intents }: {
  eventId: string;
  personaId: string;
  attendance: AttendanceSelection | null;
  intents: { value: string; label: string }[];
}) {
  const [error, submit, pending] = useActionState(changeAttendanceAction, "");
  const identity = (
    <>
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="expectedPersona" value={personaId} />
    </>
  );

  return (
    <>
      <form action={submit} className="mt-4 grid max-w-lg gap-4">
        {identity}
        <input type="hidden" name="operation" value="save" />
        <fieldset disabled={pending} className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm font-medium">
              Participation
              <select name="status" defaultValue={attendance?.status ?? "interested"} className={selectStyle}>
                <option value="interested">Interested</option>
                <option value="going">Going</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Attendance visibility
              <select name="visibility" defaultValue={attendance?.visibility ?? "anonymous"} className={selectStyle}>
                <option value="anonymous">Anonymous</option>
                <option value="public">Public</option>
              </select>
            </label>
          </div>
          <p className="text-sm app-muted">Public attendance shows your demo name to eligible attendees when your profile is discoverable.</p>
          <fieldset className="grid gap-2">
            <legend className="mb-2 text-sm font-medium">Looking for (optional)</legend>
            {intents.map(({ value, label }) => (
              <label key={value} className="flex min-h-8 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="intent"
                  value={value}
                  defaultChecked={attendance?.looking_for.some((intent) => intent === value)}
                  className="size-4 app-checkbox"
                />
                {label}
              </label>
            ))}
          </fieldset>
          <button type="submit" className="app-button app-button-primary justify-self-start">
            {attendance ? "Save attendance" : "Join event"}
          </button>
        </fieldset>
      </form>
      {attendance && (
        <form action={submit} className="mt-3">
          {identity}
          <input type="hidden" name="operation" value="leave" />
          <button type="submit" disabled={pending} className="app-button">
            Leave event
          </button>
        </form>
      )}
      {pending && <p role="status" className="app-feedback mt-2">Updating attendance…</p>}
      {error && <p role="alert" className="app-feedback mt-2">{error}</p>}
    </>
  );
}
