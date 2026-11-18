import type { Attendee } from "../../lib/data/repository";
import ConnectionForm from "./ConnectionForm";

export default function AttendeeList({ attendees, eventId, personaId }: {
  attendees: Attendee[];
  eventId: string;
  personaId: string;
}) {
  if (attendees.length === 0) {
    return <p className="text-sm text-stone-700">No discoverable attendees have made their participation public yet.</p>;
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {attendees.map(({ id, label, status, intents, hasRequest }) => (
        <li key={id} className="rounded-md border border-stone-300 bg-white p-4">
          <p className="font-semibold">{label}</p>
          <p className="mt-1 text-sm text-stone-700">{status === "going" ? "Going" : "Interested"}</p>
          {intents.length > 0 && <p className="mt-2 text-sm text-stone-700">{intents.join(" · ")}</p>}
          {hasRequest ? (
            <p className="mt-3 text-sm text-stone-700">
              Request in <a href="/connections" className="text-emerald-900 underline underline-offset-4">Connections</a>
            </p>
          ) : (
            <ConnectionForm kind="send" personaId={personaId} eventId={eventId} targetId={id} label={label} />
          )}
        </li>
      ))}
    </ul>
  );
}
