import ConnectionForm from "../../../components/ui/ConnectionForm";
import ConnectionsHistoryGuard, { connectionsRegionId } from "../../../components/ui/ConnectionsHistoryGuard";
import PersonAvatar from "../../../components/ui/PersonAvatar";
import { fixtureRepository } from "../../../lib/data/fixture-repository";
import type { ConnectionView } from "../../../lib/data/repository";

export const dynamic = "force-dynamic";

const date = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium" });
const statuses = { pending: "Pending", accepted: "Accepted", declined: "Declined", cancelled: "Cancelled" };

async function AcceptedContact({ requestId, personaId }: { requestId: string; personaId: string }) {
  const contact = await fixtureRepository.getContactForRequest(requestId, personaId);

  return (
    <p className="mt-4 border-t app-divider pt-3 text-sm wrap-anywhere">
      {contact ? <><strong>Shared contact</strong> · {contact}</> : "Contact not shared."}
    </p>
  );
}

function RequestCard({ request, personaId, sharesOwnContact }: {
  request: ConnectionView;
  personaId: string;
  sharesOwnContact: boolean;
}) {
  const name = request.counterpart?.display_name;

  return (
    <li className="min-w-0 app-card p-5">
      <div className="flex items-start gap-3">
        <PersonAvatar name={name} />
        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-2xl leading-tight">{name ?? "Other demo participant"}</h3>
          <p className="mt-1 text-sm app-muted">{request.eventTitle}</p>
        </div>
        <span className="app-badge">{statuses[request.status]}</span>
      </div>
      <p className="mt-3 text-xs app-muted">
        {request.direction === "incoming" ? "Received" : "Sent"} ·{" "}
        <time dateTime={request.createdAt}>{date.format(new Date(request.createdAt))}</time>
      </p>
      {request.counterpart?.bio && <p className="mt-3 text-sm app-muted">{request.counterpart.bio}</p>}
      <div className="mt-4 rounded-lg bg-(--app-ivory) p-3">
        <p className="text-xs font-semibold">Request note</p>
        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed wrap-anywhere">{request.note}</p>
      </div>
      {request.status === "pending" && (
        <div className="mt-4 border-t app-divider pt-3">
          {request.direction === "incoming" && (
            <>
              <p className="text-sm">
                If you accept, your contact handle <strong>{sharesOwnContact ? "WILL" : "WILL NOT"}</strong> be shared with the sender.
              </p>
              <p className="mt-1 text-xs leading-relaxed app-muted">
                This reflects your current setting. Your handle can only be shared after acceptance, and you can revoke sharing in{" "}
                <a href="/profile" className="app-accent underline underline-offset-4">Profile</a>.
                {" "}You’ll see the sender’s handle only after acceptance and only if they independently opted in.
              </p>
            </>
          )}
          <ConnectionForm kind="transition" personaId={personaId} requestId={request.id} direction={request.direction} />
        </div>
      )}
      {request.status === "accepted" && <AcceptedContact requestId={request.id} personaId={personaId} />}
    </li>
  );
}

function RequestSection({ id, title, requests, personaId, sharesOwnContact, empty, history = false }: {
  id: string;
  title: string;
  requests: ConnectionView[];
  personaId: string;
  sharesOwnContact: boolean;
  empty: string;
  history?: boolean;
}) {
  return (
    <section className="min-w-0" aria-labelledby={id}>
      <div className="flex items-baseline gap-3">
        <h2 id={id} className="font-serif text-3xl leading-tight tracking-tight">{title}</h2>
        {requests.length > 0 && (
          <span className="app-badge" aria-label={requests.length + (requests.length === 1 ? " request" : " requests")}>
            {requests.length}
          </span>
        )}
      </div>
      {requests.length > 0 ? (
        <ul className={history ? "mt-4 grid gap-4 md:grid-cols-2" : "mt-4 grid gap-4"}>
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} personaId={personaId} sharesOwnContact={sharesOwnContact} />
          ))}
        </ul>
      ) : (
        <p className="mt-4 app-card p-5 text-sm app-muted">{empty}</p>
      )}
    </section>
  );
}

export default async function ConnectionsPage() {
  const view = await fixtureRepository.listConnections();

  return (
    <>
      <header className="border-b app-divider pb-6 sm:pb-8">
        <h1 className="text-5xl leading-none tracking-tight sm:text-7xl">Connections</h1>
        <p className="mt-3 max-w-prose leading-relaxed app-muted">
          Review requests and connections from fictional demo events. Manage contact sharing in your{" "}
          <a href="/profile" className="app-accent underline underline-offset-4">Profile</a>.
        </p>
      </header>
      <ConnectionsHistoryGuard />
      {!view ? (
        <p className="mt-6 app-card p-5 text-sm app-muted">Start a demo to view your connection requests.</p>
      ) : (
        <div id={connectionsRegionId} className="mt-6 space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <RequestSection
              id="incoming"
              title="Incoming requests"
              requests={view.requests.filter(({ direction, status }) => direction === "incoming" && status === "pending")}
              personaId={view.personaId}
              sharesOwnContact={view.sharesOwnContact}
              empty="No incoming requests are waiting for a response."
            />
            <RequestSection
              id="outgoing"
              title="Sent requests"
              requests={view.requests.filter(({ direction, status }) => direction === "outgoing" && status === "pending")}
              personaId={view.personaId}
              sharesOwnContact={view.sharesOwnContact}
              empty="You have no pending sent requests."
            />
          </div>
          <RequestSection
            id="history"
            title="Accepted connections and history"
            requests={view.requests.filter(({ status }) => status !== "pending")}
            personaId={view.personaId}
            sharesOwnContact={view.sharesOwnContact}
            empty="Accepted, declined and cancelled requests will appear here."
            history
          />
        </div>
      )}
    </>
  );
}
