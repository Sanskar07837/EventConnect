import Link from "next/link";
import { fixtureRepository } from "../../../lib/data/fixture-repository";
import EventCard from "./EventCard";

const domains = new Map([["chess", "Chess"], ["hackathon", "Hackathons"]]);
const monthLabel = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", month: "long", year: "numeric" });
const monthParts = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", month: "2-digit", year: "numeric" });
const selectStyle = "min-h-11 w-full rounded-md border border-stone-400 bg-white px-3 text-sm";

function eventMonth(startAt: string) {
  const parts = monthParts.formatToParts(new Date(startAt));
  return `${parts.find(({ type }) => type === "year")?.value}-${parts.find(({ type }) => type === "month")?.value}`;
}

function validFilter(value: string | string[] | undefined, options: ReadonlyMap<string, string>) {
  return typeof value === "string" && options.has(value) ? value : "";
}

export default async function ExplorePage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [params, events] = await Promise.all([searchParams, fixtureRepository.listEvents()]);
  const neighbourhoods = new Map(fixtureRepository.listNeighbourhoods().map(({ slug, name }) => [slug, name]));
  const sorted = [...events].sort((first, second) => Date.parse(first.start_at) - Date.parse(second.start_at));
  const months = new Map(sorted.map(({ start_at }) => [eventMonth(start_at), monthLabel.format(new Date(start_at))]));
  const domain = validFilter(params.domain, domains);
  const month = validFilter(params.month, months);
  const neighbourhood = validFilter(params.neighbourhood, neighbourhoods);
  const filtered = sorted.filter((event) =>
    (!domain || event.domain === domain)
    && (!month || eventMonth(event.start_at) === month)
    && (!neighbourhood || event.neighbourhood === neighbourhood));
  const featured = !domain && !month && !neighbourhood
    ? [...domains.keys()].flatMap((key) => {
      const event = sorted.find((item) => item.domain === key && !item.is_junior_event);
      return event ? [event] : [];
    })
    : [];

  return (
    <>
      <header>
        <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">Explore Bengaluru</h1>
        <p className="mt-2 text-stone-700">Browse fictional chess events and hackathons across the city.</p>
      </header>

      {featured.length > 0 && (
        <section aria-labelledby="featured-events" className="mt-6 rounded-lg border border-emerald-800/25 bg-emerald-50 p-4 sm:p-5">
          <h2 id="featured-events" className="text-sm font-semibold text-emerald-950">Featured sample events</h2>
          <ul className="mt-2 grid gap-3 sm:grid-cols-2">
            {featured.map((event) => (
              <li key={event.id}>
                <a className="font-medium text-emerald-950 underline underline-offset-4" href={`#${event.id}`}>
                  {event.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <form
        aria-label="Filter events"
        action="/explore"
        method="get"
        className="mt-6 grid items-end gap-3 rounded-lg border border-stone-300 bg-white p-4 sm:grid-cols-3 lg:grid-cols-[1fr_1fr_1.3fr_auto]"
      >
        {([
          ["domain", "Domain", "All domains", domain, domains],
          ["month", "Date", "Any month", month, months],
          ["neighbourhood", "Neighbourhood", "All neighbourhoods", neighbourhood, neighbourhoods],
        ] as const).map(([name, label, unfiltered, selected, options]) => (
          <label key={name} className="grid gap-1 text-sm font-medium">
            {label}
            <select name={name} defaultValue={selected} className={selectStyle}>
              <option value="">{unfiltered}</option>
              {[...options].map(([value, text]) => <option key={value} value={value}>{text}</option>)}
            </select>
          </label>
        ))}
        <div className="flex flex-wrap items-center gap-3 sm:col-span-3 lg:col-span-1">
          <button type="submit" className="min-h-11 rounded-md bg-emerald-900 px-4 text-sm font-semibold text-white hover:bg-emerald-800">
            Apply filters
          </button>
          {(domain || month || neighbourhood) && (
            <Link href="/explore" className="py-2 text-sm text-emerald-900 underline underline-offset-4">Clear filters</Link>
          )}
        </div>
      </form>

      <section aria-labelledby="event-list" className="mt-8">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h2 id="event-list" className="text-2xl font-semibold tracking-tight">Sample events</h2>
          <p className="text-sm text-stone-600">{filtered.length} {filtered.length === 1 ? "event" : "events"}</p>
        </div>
        {filtered.length > 0 ? (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {filtered.map((event) => (
              <li key={event.id}>
                <EventCard event={event} neighbourhood={neighbourhoods.get(event.neighbourhood) ?? event.neighbourhood} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-lg border border-stone-300 bg-white p-5 text-stone-700">No sample events match these filters.</p>
        )}
      </section>
    </>
  );
}
