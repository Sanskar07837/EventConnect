import Link from "next/link";
import { notFound } from "next/navigation";
import AttendeeList from "../../../components/ui/AttendeeList";
import { fixtureRepository } from "../../../lib/data/fixture-repository";

const linkStyle = "font-medium text-emerald-900 underline underline-offset-4";

export default async function PeoplePage({ searchParams }: {
  searchParams: Promise<{ event?: string | string[] }>;
}) {
  const { event: selected } = await searchParams;
  if (selected !== undefined && typeof selected !== "string") notFound();
  const participation = selected === undefined ? null : await fixtureRepository.getEventParticipation(selected);
  if (selected !== undefined && !participation) notFound();
  const attended = participation ? null : await fixtureRepository.listAttendedEvents();

  return (
    <>
      <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">People</h1>
      {participation ? (
        <section aria-labelledby="selected-event" className="mt-5">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="selected-event" className="text-2xl font-semibold">{participation.event.title}</h2>
            <Link href={`/events/${participation.event.id}`} className={linkStyle}>Event details</Link>
          </div>
          {participation.access === "junior" && (
            <div className="rounded-lg border border-stone-300 bg-white p-5 text-sm">
              <p>Junior events show synthetic aggregate counts only.</p>
              <p className="mt-2 font-semibold">
                Sample counts · {participation.event.interestedCount} interested · {participation.event.goingCount} going
              </p>
            </div>
          )}
          {participation.access === "guest" && <p>Start a demo to discover people at events you join.</p>}
          {participation.access === "not-attending" && <p>Join this event from its details page to discover eligible attendees.</p>}
          {participation.access === "attending" && (
            <AttendeeList
              attendees={participation.attendees}
              eventId={participation.event.id}
              personaId={participation.personaId}
            />
          )}
          {participation.access !== "junior" && (
            <p className="mt-5 text-sm"><Link href="/people" className={linkStyle}>Choose another event</Link></p>
          )}
        </section>
      ) : (
        <section aria-labelledby="people-events" className="mt-5">
          <h2 id="people-events" className="text-2xl font-semibold">Your events</h2>
          {!attended ? (
            <p className="mt-3">Start a demo to discover people at events you join.</p>
          ) : attended.length === 0 ? (
            <p className="mt-3">You haven’t joined any events. <Link href="/explore" className={linkStyle}>Explore Bengaluru</Link></p>
          ) : (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {attended.map(({ id, title }) => (
                <li key={id} className="rounded-lg border border-stone-300 bg-white p-4">
                  <Link href={`/people?event=${id}`} className={linkStyle}>{title}</Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
}
