import type { Attendee } from "../../lib/data/repository";
import ConnectionForm from "./ConnectionForm";
import PersonAvatar, { personName } from "./PersonAvatar";

export default function AttendeeList({ attendees, eventId, eventTitle, personaId, sharesOwnContact, compact = false }: {
  attendees: Attendee[];
  eventId: string;
  eventTitle: string;
  personaId: string;
  sharesOwnContact: boolean;
  compact?: boolean;
}) {
  if (attendees.length === 0) {
    return <p className="app-card p-5 text-sm app-muted">No discoverable attendees have made their participation public yet.</p>;
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {attendees.map(({ id, avatarId, label, status, intents, hasRequest, bio, neighbourhood, interests, skills, sharedInterests }) => (
        <li key={id} className="flex min-w-0 flex-col app-card p-5">
          <div className="flex items-start gap-3">
            <PersonAvatar name={label} avatarId={avatarId} />
            <div className="min-w-0 flex-1">
              <h3 className="font-serif text-2xl leading-tight">{label}</h3>
              {!compact && neighbourhood && <p className="mt-0.5 text-sm app-muted">{neighbourhood}, Bengaluru</p>}
            </div>
            <span className="app-badge">{status === "going" ? "Going" : "Interested"}</span>
          </div>
          {!compact && (
            <>
              <p className="mt-3 text-sm leading-relaxed">{bio}</p>
              <dl className="mt-4 space-y-2 text-sm">
                {interests.length > 0 && (
                  <div>
                    <dt className="font-semibold">Interests</dt>
                    <dd className="app-muted">{interests.join(" · ")}</dd>
                  </div>
                )}
                {skills.length > 0 && (
                  <div>
                    <dt className="font-semibold">Skills</dt>
                    <dd className="app-muted">{skills.join(" · ")}</dd>
                  </div>
                )}
              </dl>
              {sharedInterests.length > 0 && (
                <p className="mt-3"><span className="app-badge">Shared interests · {sharedInterests.join(", ")}</span></p>
              )}
              <p className="mt-3 text-xs app-muted">{eventTitle}</p>
            </>
          )}
          {intents.length > 0 && <p className="mt-3 text-sm"><strong>Looking for</strong> · {intents.join(" · ")}</p>}

          <div className="mt-auto pt-4">
            {hasRequest ? (
              <p className="border-t app-divider pt-3 text-sm app-muted">
                Request in <a href="/connections" className="app-accent underline underline-offset-4">Connections</a>
              </p>
            ) : (
              <div className="border-t app-divider pt-3">
                <p className="text-sm">
                  If {personName(label)} accepts, your contact handle <strong>{sharesOwnContact ? "WILL" : "WILL NOT"}</strong> be shared with them.
                </p>
                <p className="mt-1 text-xs leading-relaxed app-muted">
                  This reflects your current setting. Sharing happens only after acceptance, and you can revoke it in{" "}
                  <a href="/profile" className="app-accent underline underline-offset-4">Profile</a>.
                </p>
                <ConnectionForm kind="send" personaId={personaId} eventId={eventId} targetId={id} label={label} />
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
