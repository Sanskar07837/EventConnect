import Link from "next/link";
import { notFound } from "next/navigation";
import AttendeeList from "../../../../components/ui/AttendeeList";
import { lookingForOptions } from "../../../../lib/data/demo-state";
import { fixtureRepository } from "../../../../lib/data/fixture-repository";
import { eventCategory, eventCity, eventDateTime, eventImage, eventRenderTime, eventStatus } from "../../event-presentation";
import AttendanceForm from "./AttendanceForm";

export default async function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const participation = await fixtureRepository.getEventParticipation(id);
  if (!participation) notFound();
  const { access, event } = participation;
  const now = eventRenderTime();
  const image = eventImage(event);
  const neighbourhood = fixtureRepository.listNeighbourhoods().find(({ slug }) => slug === event.neighbourhood)?.name
    ?? event.neighbourhood;
  const attendance = access === "attending" ? participation.attendance : null;

  return (
    <>
      <Link href="/explore" className="text-sm font-medium app-accent underline underline-offset-4">Back to Explore</Link>
      <article className="mt-4 space-y-5">
        <div className="grid items-center gap-5 app-card p-4 sm:p-7 md:grid-cols-2 md:gap-8">
          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold">
              <span className="app-badge">Sample event</span>
              <span className="app-accent">{eventCategory[event.domain]}</span>
              <span className="app-muted">· {eventStatus(event, now)}</span>
              {event.is_junior_event && <span className="app-muted">· Junior event</span>}
            </div>
            <h1 className="mt-3 text-4xl leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl">{event.title}</h1>
            <p className="mt-4 text-sm app-muted">{event.venue_name} · {neighbourhood}, {eventCity}</p>
            <p className="mt-2 text-sm font-medium">Host not listed</p>
          </div>
          <figure>
            <picture className="block">
              <source media="(min-width: 768px)" srcSet={image.desktopSrc} width={1600} height={1195} />
              <img src={image.mobileSrc} alt={image.alt} width={800} height={597} fetchPriority="high" decoding="async" className="block h-auto w-full" />
            </picture>
            <figcaption className="mt-2 text-xs app-muted">AI-generated illustration</figcaption>
          </figure>
        </div>

        <div className="grid items-start gap-5 md:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
          <section aria-labelledby="about-event" className="app-card p-5 sm:p-7">
            <h2 id="about-event" className="font-serif text-3xl">About the event</h2>
            <p className="mt-3 max-w-prose leading-relaxed app-muted">{event.description}</p>
            <p className="mt-4 text-sm font-medium">{event.level_note}</p>
          </section>
          <section aria-labelledby="event-info" className="app-card p-5 sm:p-7">
            <h2 id="event-info" className="font-serif text-2xl">Event information</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="font-semibold">Schedule (IST)</dt>
                <dd className="mt-1 app-muted">Starts <time dateTime={event.start_at}>{eventDateTime.format(new Date(event.start_at))}</time></dd>
                <dd className="app-muted">Ends <time dateTime={event.end_at}>{eventDateTime.format(new Date(event.end_at))}</time></dd>
              </div>
              <div className="border-t app-divider pt-3">
                <dt className="font-semibold">Attendance</dt>
                <dd className="mt-1 app-muted">
                  {event.is_junior_event && "Sample counts · "}{event.interestedCount} interested · {event.goingCount} going
                </dd>
              </div>
              <div className="border-t app-divider pt-3">
                <dt className="font-semibold">Registration</dt>
                <dd className="mt-1 app-muted">Price not listed</dd>
                {event.registration_url ? (
                  <dd><a href={event.registration_url} className="mt-2 app-button app-button-primary">Registration</a></dd>
                ) : (
                  <dd className="mt-1 app-muted">Sample event — no external registration link</dd>
                )}
                {event.source_url && (
                  <dd className="mt-2"><a href={event.source_url} className="app-accent underline">Event source</a></dd>
                )}
              </div>
            </dl>
          </section>
        </div>
      </article>

      {access === "junior" ? (
        <p className="mt-5 text-sm app-muted">Junior events show synthetic aggregate counts only.</p>
      ) : access === "guest" ? (
        <p className="mt-5 text-sm app-muted">Start a demo using the controls above to record your participation.</p>
      ) : "personaId" in participation && (
        <section aria-labelledby="participation" className="mt-5 app-card p-5 sm:p-7">
          <h2 id="participation" className="font-serif text-3xl">Your attendance</h2>
          <p className="mt-2 text-sm app-muted">This records demo participation intent only. It does not register you for the event.</p>
          <AttendanceForm
            key={`${participation.personaId}:${event.id}:${JSON.stringify(attendance)}`}
            eventId={event.id}
            personaId={participation.personaId}
            attendance={attendance}
            intents={lookingForOptions(event.domain)}
          />
        </section>
      )}

      {participation.access === "attending" && (
        <section aria-labelledby="participants" className="mt-8">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="participants" className="font-serif text-3xl">People at this event</h2>
            <Link href={`/people?event=${event.id}`} className="app-button">Find people</Link>
          </div>
          <AttendeeList
            attendees={participation.attendees.slice(0, 3)}
            eventId={event.id}
            eventTitle={event.title}
            personaId={participation.personaId}
            sharesOwnContact={participation.sharesOwnContact}
            compact
          />
        </section>
      )}
    </>
  );
}
