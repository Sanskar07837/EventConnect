import Link from "next/link";
import { notFound } from "next/navigation";
import AttendeeList from "../../../components/ui/AttendeeList";
import { fixtureRepository } from "../../../lib/data/fixture-repository";

const linkStyle = "font-medium app-accent underline underline-offset-4";

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
      <header className="border-b app-divider pb-6 sm:pb-8">
        <h1 className="text-5xl leading-none tracking-tight sm:text-7xl">People</h1>
        <p className="mt-3 max-w-prose leading-relaxed app-muted">
          Meet fictional demo attendees who have opted to be discovered at an event you share.
        </p>
      </header>
      {participation ? (
        <section aria-labelledby="selected-event" className="mt-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 app-card p-5">
            <div>
              <p className="app-badge">Sample event</p>
              <h2 id="selected-event" className="mt-2 font-serif text-3xl tracking-tight">{participation.event.title}</h2>
            </div>
            <Link href={`/events/${participation.event.id}`} className="app-button">Event details</Link>
          </div>
          {participation.access === "junior" && (
            <div className="app-card p-5 text-sm">
              <p>Junior events show synthetic aggregate counts only.</p>
              <p className="mt-2 font-semibold">
                Sample counts · {participation.event.interestedCount} interested · {participation.event.goingCount} going
              </p>
            </div>
          )}
          {participation.access === "guest" && (
            <p className="app-card p-5 text-sm app-muted">Start a demo to discover people at events you join.</p>
          )}
          {participation.access === "not-attending" && (
            <p className="app-card p-5 text-sm app-muted">Join this event from its details page to discover eligible attendees.</p>
          )}
          {participation.access === "attending" && (
            <AttendeeList
              attendees={participation.attendees}
              eventId={participation.event.id}
              eventTitle={participation.event.title}
              personaId={participation.personaId}
              sharesOwnContact={participation.sharesOwnContact}
            />
          )}
          {participation.access !== "junior" && (
            <p className="mt-5 text-sm"><Link href="/people" className={linkStyle}>Choose another event</Link></p>
          )}
        </section>
      ) : (
        <section aria-labelledby="people-events" className="mt-6">
          <h2 id="people-events" className="font-serif text-3xl tracking-tight">Your events</h2>
          {!attended ? (
            <p className="mt-4 app-card p-5 text-sm app-muted">Start a demo to discover people at events you join.</p>
          ) : attended.length === 0 ? (
            <div className="mt-4 app-card p-5">
              <p className="text-sm app-muted">You haven’t joined any events yet.</p>
              <Link href="/explore" className="mt-3 app-button">Explore Bengaluru</Link>
            </div>
          ) : (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {attended.map(({ id, title }) => (
                <li key={id}>
                  <Link href={`/people?event=${id}`} className="flex h-full items-center justify-between gap-3 app-card p-5 app-accent hover:underline">
                    <span className="font-serif text-xl">{title}</span><span aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
}
