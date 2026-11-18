import Link from "next/link";
import type { EventSummary } from "../../../lib/data/repository";
import { eventCategory, eventCity, eventDateTime, eventImage, eventStatus } from "../event-presentation";

export default function EventCard({ event, neighbourhood, now }: {
  event: EventSummary;
  neighbourhood: string;
  now: number;
}) {
  const { interestedCount, goingCount } = event;
  const image = eventImage(event);
  const href = "/events/" + event.id;

  return (
    <article id={event.id} className="flex h-full scroll-mt-6 flex-col app-card">
      <figure>
        <picture className="block">
          <source media="(min-width: 768px)" srcSet={image.desktopSrc} width={1600} height={1195} />
          <img src={image.mobileSrc} alt={image.alt} width={800} height={597} loading="lazy" decoding="async" className="block h-auto w-full rounded-t-[calc(var(--app-radius)-1px)]" />
        </picture>
        <figcaption className="px-4 pt-2 text-xs app-muted sm:px-5">AI-generated illustration</figcaption>
      </figure>

      <div className="flex flex-1 flex-col px-4 pt-3 pb-4 sm:px-5 sm:pb-5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold">
          <span className="app-badge">Sample event</span>
          <span className="app-accent">{eventCategory[event.domain]}</span>
          <span className="app-muted">· {eventStatus(event, now)}</span>
          {event.is_junior_event && <span className="app-muted">· Junior event</span>}
        </div>
        <h3 className="mt-3 font-serif text-2xl leading-tight tracking-tight">
          <Link href={href} className="underline-offset-4 hover:underline">{event.title}</Link>
        </h3>
        <time className="mt-3 text-sm font-medium" dateTime={event.start_at}>
          {eventDateTime.format(new Date(event.start_at))}
        </time>
        <p className="mt-1 text-sm app-muted">{event.venue_name} · {neighbourhood}, {eventCity}</p>
        <p className="mt-2 text-sm app-muted">Price not listed</p>

        <div className="mt-auto pt-4">
          <p className="border-t app-divider pt-3 text-sm">
            {event.is_junior_event && "Sample counts · "}{interestedCount} interested · {goingCount} going
          </p>
          {event.registration_url ? (
            <a href={event.registration_url} className="mt-2 inline-block text-sm app-accent underline">Registration</a>
          ) : (
            <p className="mt-1 text-xs app-muted">Sample event — no external registration link</p>
          )}
          {event.source_url && (
            <a href={event.source_url} className="mt-2 block text-sm app-accent underline">Event source</a>
          )}
          <Link href={href} className="mt-4 app-button app-button-primary" aria-label={"View event: " + event.title}>View event</Link>
        </div>
      </div>
    </article>
  );
}
