import Link from "next/link";
import { fixtureRepository } from "../../../lib/data/fixture-repository";
import { eventCategory, eventCity, eventRenderTime, eventTimeZone } from "../event-presentation";
import EventCard from "./EventCard";

const domains = new Map([["chess", eventCategory.chess], ["hackathon", "Hackathons"]]);
const monthLabel = new Intl.DateTimeFormat("en-IN", { timeZone: eventTimeZone, month: "long", year: "numeric" });
const monthParts = new Intl.DateTimeFormat("en-IN", { timeZone: eventTimeZone, month: "2-digit", year: "numeric" });

function eventMonth(startAt: string) {
  const parts = monthParts.formatToParts(new Date(startAt));
  return [parts.find(({ type }) => type === "year")?.value, parts.find(({ type }) => type === "month")?.value].join("-");
}

function validFilter(value: string | string[] | undefined, options: ReadonlyMap<string, string>) {
  return typeof value === "string" && options.has(value) ? value : "";
}

export default async function ExplorePage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [params, events] = await Promise.all([searchParams, fixtureRepository.listEvents()]);
  const now = eventRenderTime();
  const neighbourhoods = new Map(fixtureRepository.listNeighbourhoods().map(({ slug, name }) => [slug, name]));
  const sorted = [...events].sort((first, second) => Date.parse(first.start_at) - Date.parse(second.start_at));
  const months = new Map(sorted.map(({ start_at }) => [eventMonth(start_at), monthLabel.format(new Date(start_at))]));
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 120) : "";
  const searchTerms = query ? query.toLowerCase().split(/\s+/).filter(Boolean) : [];
  const domain = validFilter(params.domain, domains);
  const month = validFilter(params.month, months);
  const neighbourhood = validFilter(params.neighbourhood, neighbourhoods);
  const hasFilters = Boolean(query || domain || month || neighbourhood);
  const filtered = sorted.filter((event) => {
    const searchable = [event.title, event.venue_name, eventCategory[event.domain], domains.get(event.domain)]
      .join(" ").toLowerCase();
    return searchTerms.every((term) => searchable.includes(term))
      && (!domain || event.domain === domain)
      && (!month || eventMonth(event.start_at) === month)
      && (!neighbourhood || event.neighbourhood === neighbourhood);
  });
  const featured = !hasFilters
    ? [...domains.keys()].flatMap((key) => {
      const event = sorted.find((item) => item.domain === key && !item.is_junior_event);
      return event ? [event] : [];
    })
    : [];

  return (
    <>
      <header className="border-b app-divider pb-6 sm:pb-8">
        <h1 className="text-5xl leading-[1.02] tracking-tight sm:text-7xl">Explore {eventCity}</h1>
        <p className="mt-3 max-w-prose leading-relaxed app-muted">
          Discover chess tournaments and hackathons across Bengaluru. Browse fictional sample events by venue, month or neighbourhood.
        </p>
      </header>

      <form
        aria-label="Search and filter events"
        action="/explore"
        method="get"
        className="mt-6 grid min-w-0 items-end gap-4 app-card p-4 sm:grid-cols-3 sm:p-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.25fr)]"
      >
        <label className="grid min-w-0 gap-1.5 text-sm font-medium sm:col-span-3 lg:col-span-1">
          Search events
          <input
            type="search"
            name="q"
            defaultValue={query}
            maxLength={120}
            placeholder="Title, venue or category"
            className="app-input w-full"
          />
        </label>
        {([
          ["domain", "Category", "All categories", domain, domains],
          ["month", "Date", "Any month", month, months],
          ["neighbourhood", "Neighbourhood", "All neighbourhoods", neighbourhood, neighbourhoods],
        ] as const).map(([name, label, unfiltered, selected, options]) => (
          <label key={name} className="grid min-w-0 gap-1.5 text-sm font-medium">
            {label}
            <select name={name} defaultValue={selected} className="app-input w-full">
              <option value="">{unfiltered}</option>
              {[...options].map(([value, text]) => <option key={value} value={value}>{text}</option>)}
            </select>
          </label>
        ))}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:col-span-full">
          <button type="submit" className="app-button app-button-primary">Show events</button>
          {hasFilters && (
            <Link href="/explore" className="py-2 text-sm app-accent underline underline-offset-4">Clear all filters</Link>
          )}
        </div>
      </form>

      {featured.length > 0 && (
        <section aria-labelledby="featured-events" className="mt-6 flex flex-wrap items-baseline gap-x-5 gap-y-2 border-b app-divider pb-5">
          <h2 id="featured-events" className="text-sm font-semibold">Featured sample events</h2>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {featured.map((event) => (
              <li key={event.id}>
                <a className="app-accent underline underline-offset-4" href={"#" + event.id}>{event.title}</a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="event-list" className="mt-8 sm:mt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="event-list" className="font-serif text-3xl tracking-tight sm:text-4xl">Sample events</h2>
          <p className="text-sm app-muted">{filtered.length} {filtered.length === 1 ? "event" : "events"}</p>
        </div>
        {filtered.length > 0 ? (
          <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((event) => (
              <li key={event.id}>
                <EventCard event={event} now={now} neighbourhood={neighbourhoods.get(event.neighbourhood) ?? event.neighbourhood} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-5 app-card p-5 sm:p-7">
            <h3 className="font-serif text-2xl">No matching events</h3>
            <p className="mt-2 text-sm app-muted">Try a shorter search or choose a different month, category or neighbourhood.</p>
            <Link href="/explore" className="mt-4 app-button">Browse all Bengaluru events</Link>
          </div>
        )}
      </section>
    </>
  );
}
