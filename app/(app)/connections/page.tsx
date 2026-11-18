import ConnectionForm from "../../../components/ui/ConnectionForm";
import ConnectionsHistoryGuard, { connectionsRegionId } from "../../../components/ui/ConnectionsHistoryGuard";
import { fixtureRepository } from "../../../lib/data/fixture-repository";
import type { ConnectionView } from "../../../lib/data/repository";

export const dynamic = "force-dynamic";

const date = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium" });
const statuses = { pending: "Pending", accepted: "Accepted", declined: "Declined", cancelled: "Cancelled" };

function RequestCard({ request, personaId }: { request: ConnectionView; personaId: string }) {
  return (
    <li className="rounded-lg border border-stone-300 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-semibold">{request.counterpart?.display_name ?? "Other demo participant"}</h3>
        <span className="rounded-sm bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-950">
          {statuses[request.status]}
        </span>
      </div>
      <p className="mt-1 text-sm text-stone-700">
        {request.eventTitle} · <time dateTime={request.createdAt}>{date.format(new Date(request.createdAt))}</time>
      </p>
      {request.counterpart?.bio && <p className="mt-3 text-sm text-stone-700">{request.counterpart.bio}</p>}
      <p className="mt-3 whitespace-pre-wrap break-words text-sm">{request.note}</p>
      {request.status === "pending" && (
        <ConnectionForm kind="transition" personaId={personaId} requestId={request.id} direction={request.direction} />
      )}
      {request.status === "accepted" && (
        <p className="mt-4 border-t border-stone-200 pt-3 text-sm">
          {request.contact ? <><strong>Shared contact</strong> · {request.contact}</> : "Contact not shared."}
        </p>
      )}
    </li>
  );
}

export default async function ConnectionsPage() {
  const view = await fixtureRepository.listConnections();
  return (
    <>
      <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">Connections</h1>
      <ConnectionsHistoryGuard />
      {!view ? (
        <p className="mt-4 text-stone-700">Start a demo to view your connection requests.</p>
      ) : (
        <div id={connectionsRegionId}>
          <p className="mt-2 text-sm text-stone-700">Review your requests or manage sharing in your <a href="/profile" className="text-emerald-900 underline">profile</a>.</p>
          {(["incoming", "outgoing"] as const).map((direction) => {
            const requests = view.requests.filter((request) => request.direction === direction);
            return (
              <section key={direction} aria-labelledby={direction} className="mt-8">
                <h2 id={direction} className="text-xl font-semibold">
                  {direction === "incoming" ? "Incoming requests" : "Outgoing requests"}
                </h2>
                {requests.length ? (
                  <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                    {requests.map((request) => <RequestCard key={request.id} request={request} personaId={view.personaId} />)}
                  </ul>
                ) : <p className="mt-2 text-sm text-stone-700">No {direction} requests.</p>}
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
