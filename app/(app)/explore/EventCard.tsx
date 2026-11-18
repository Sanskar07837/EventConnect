import Link from "next/link";
import type { EventSummary } from "../../../lib/data/repository";

const dateTime = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
});

export default function EventCard({ event, neighbourhood }: { event: EventSummary; neighbourhood: string }) {
  const { interestedCount, goingCount } = event;

  return (
    <article id={event.id} className="flex h-full scroll-mt-6 flex-col rounded-lg border border-stone-300 bg-white p-5">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span className="rounded-sm bg-amber-100 px-2 py-1 text-amber-950">Sample event</span>
        <span className="text-emerald-900">{event.domain === "chess" ? "Chess" : "Hackathon"}</span>
        {event.is_junior_event && <span className="text-stone-600">Junior event</span>}
      </div>
      <h3 className="mt-3 text-xl font-semibold tracking-tight">
        <Link href={`/events/${event.id}`} className="underline-offset-4 hover:underline">{event.title}</Link>
      </h3>
      <time className="mt-2 text-sm font-medium" dateTime={event.start_at}>
        {dateTime.format(new Date(event.start_at))}
      </time>
      <p className="mt-1 text-sm text-stone-700">{event.venue_name} · {neighbourhood}</p>
      <p className="mt-3 text-sm leading-relaxed text-stone-700">{event.description}</p>
      <div className="mt-auto pt-4">
        <p className="border-t border-stone-200 pt-3 text-sm">
          {event.is_junior_event && "Sample counts · "}{interestedCount} interested · {goingCount} going
        </p>
        {event.registration_url ? (
          <a href={event.registration_url} className="mt-2 inline-block text-sm text-emerald-900 underline">Registration</a>
        ) : (
          <p className="mt-2 text-sm text-stone-600">Sample event — no external registration link</p>
        )}
        {event.source_url && (
          <a href={event.source_url} className="mt-2 block text-sm text-emerald-900 underline">Event source</a>
        )}
      </div>
    </article>
  );
}
