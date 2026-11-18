import Link from "next/link";
import { notFound } from "next/navigation";
import AttendeeList from "../../../../components/ui/AttendeeList";
import { lookingForOptions } from "../../../../lib/data/demo-state";
import { fixtureRepository } from "../../../../lib/data/fixture-repository";
import AttendanceForm from "./AttendanceForm";

const dateTime = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const participation = await fixtureRepository.getEventParticipation(id);
  if (!participation) notFound();
  const { access, event } = participation;
  const neighbourhood = fixtureRepository.listNeighbourhoods().find(({ slug }) => slug === event.neighbourhood)?.name
    ?? event.neighbourhood;
  const attendance = access === "attending" ? participation.attendance : null;

  return (
    <>
      <Link href="/explore" className="text-sm font-medium text-emerald-900 underline underline-offset-4">Back to Explore</Link>
      <article className="mt-4 rounded-lg border border-stone-300 bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          <span className="rounded-sm bg-amber-100 px-2 py-1 text-amber-950">Sample event</span>
          <span className="text-emerald-900">{event.domain === "chess" ? "Chess" : "Hackathon"}</span>
          {event.is_junior_event && <span className="text-stone-700">Junior event</span>}
        </div>
        <h1 className="mt-3 font-serif text-3xl tracking-tight sm:text-5xl">{event.title}</h1>
        <p className="mt-4 max-w-2xl text-stone-700">{event.description}</p>
        <dl className="mt-5 grid gap-4 border-y border-stone-200 py-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-semibold">Date and time (IST)</dt>
            <dd className="mt-1"><time dateTime={event.start_at}>{dateTime.format(new Date(event.start_at))}</time></dd>
            <dd>Ends <time dateTime={event.end_at}>{dateTime.format(new Date(event.end_at))}</time></dd>
          </div>
          <div>
            <dt className="font-semibold">Venue</dt>
            <dd className="mt-1">{event.venue_name} · {neighbourhood}</dd>
            <dd>{event.level_note}</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm font-semibold">
          {event.is_junior_event && "Sample counts · "}{event.interestedCount} interested · {event.goingCount} going
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-stone-700">
          {event.registration_url ? (
            <a href={event.registration_url} className="text-emerald-900 underline">Registration</a>
          ) : (
            <p>Sample event — no external registration link</p>
          )}
          {event.source_url && <a href={event.source_url} className="text-emerald-900 underline">Event source</a>}
        </div>
      </article>

      {access === "junior" ? (
        <p className="mt-5 text-sm text-stone-700">Junior events show synthetic aggregate counts only.</p>
      ) : access === "guest" ? (
        <p className="mt-5 text-sm text-stone-700">Start a demo using the controls above to record your participation.</p>
      ) : "personaId" in participation && (
        <section aria-labelledby="participation" className="mt-5 rounded-lg border border-stone-300 bg-white p-5 sm:p-7">
          <h2 id="participation" className="text-xl font-semibold">Your attendance</h2>
          <p className="mt-2 text-sm text-stone-700">This records demo participation intent only. It does not register you for the event.</p>
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
            <h2 id="participants" className="text-xl font-semibold">People at this event</h2>
            <Link href={`/people?event=${event.id}`} className="text-sm font-medium text-emerald-900 underline underline-offset-4">View People</Link>
          </div>
          <AttendeeList
            attendees={participation.attendees.slice(0, 3)}
            eventId={event.id}
            personaId={participation.personaId}
          />
        </section>
      )}
    </>
  );
}
