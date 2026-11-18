import Link from "next/link";
import AvatarPicker from "../../../components/ui/AvatarPicker";
import ConnectionForm from "../../../components/ui/ConnectionForm";
import PersonAvatar from "../../../components/ui/PersonAvatar";
import { fixtureRepository } from "../../../lib/data/fixture-repository";
import type { OwnProfile } from "../../../lib/data/repository";

export const dynamic = "force-dynamic";

function ProfileFields({ profile }: { profile: OwnProfile }) {
  return (
    <dl className="grid gap-4 text-sm sm:grid-cols-2">
      <div>
        <dt className="font-semibold">Interests</dt>
        <dd className="mt-1 app-muted">{profile.interests.join(" · ") || "None listed"}</dd>
      </div>
      <div>
        <dt className="font-semibold">Skills</dt>
        <dd className="mt-1 app-muted">{profile.skills.join(" · ") || "None listed"}</dd>
      </div>
    </dl>
  );
}

function ProfileCompletion({ profile }: { profile: OwnProfile }) {
  const fields = [
    { label: "Bio", done: Boolean(profile.bio.trim()) },
    { label: "Interests", done: profile.interests.some((item) => item.trim() !== "") },
    { label: "Skills", done: profile.skills.some((item) => item.trim() !== "") },
    { label: "Event looking-for preference", done: profile.eventPreferences.some(({ intents }) => intents.length > 0) },
    { label: "Location", done: Boolean(profile.neighbourhoodLabel) },
    { label: "Selected avatar", done: profile.avatarId !== null },
  ];
  const completed = fields.filter(({ done }) => done).length;
  const percent = Math.round(completed / fields.length * 100);

  return (
    <section aria-labelledby="profile-completion" className="app-card p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 id="profile-completion" className="font-serif text-2xl">Profile completion</h2>
        <p className="font-serif text-3xl app-accent">{percent}%</p>
      </div>
      <progress aria-labelledby="profile-completion" value={percent} max={100} className="mt-3 block h-2.5 w-full accent-(--app-forest)" />
      <p className="mt-2 text-sm app-muted">{completed} of {fields.length} fields complete</p>
      <ul className="mt-4 space-y-2 border-t app-divider pt-3 text-sm">
        {fields.map(({ label, done }) => (
          <li key={label} className="flex items-baseline justify-between gap-3">
            <span>{label}</span>
            <span className={done ? "text-xs app-muted" : "app-badge"}>{done ? "Complete" : "Missing"}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function AttendeePreview({ profile }: { profile: OwnProfile }) {
  const event = profile.eventPreferences.find(({ isPublic }) => isPublic);

  return (
    <section aria-labelledby="attendee-preview" className="app-card p-5 sm:p-7">
      <h2 id="attendee-preview" className="font-serif text-3xl">Attendee preview</h2>
      <p className="mt-2 text-sm leading-relaxed app-muted">
        Your profile can be seen only by eligible adults who attend the same non-junior event, when your attendance is public and your profile is discoverable.
      </p>
      {!profile.discoverable || !event ? (
        <p className="mt-4 rounded-lg bg-(--app-ivory) p-4 text-sm">
          {!profile.discoverable ? "Your profile is hidden because discoverability is off." : "Your profile is hidden because you have no public attendance."}
        </p>
      ) : (
        <article className="mt-4 rounded-lg border app-divider bg-(--app-ivory) p-4 sm:p-5">
          <p className="mb-3 text-xs font-medium app-muted">Preview for {event.title}</p>
          <div className="flex flex-wrap items-center gap-3">
            <PersonAvatar name={profile.display_name} avatarId={profile.avatarId} />
            <div className="min-w-0 flex-1">
              <h3 className="font-serif text-2xl leading-tight">{profile.display_name}</h3>
              {profile.neighbourhoodLabel && <p className="mt-1 text-sm app-muted">{profile.neighbourhoodLabel}, Bengaluru</p>}
            </div>
            <span className="app-badge">{event.status === "going" ? "Going" : "Interested"}</span>
          </div>
          <p className="my-4 text-sm leading-relaxed">{profile.bio}</p>
          <ProfileFields profile={profile} />
          {event.intents.length > 0 && <p className="mt-3 text-sm"><strong>Looking for</strong> · {event.intents.join(" · ")}</p>}
        </article>
      )}
    </section>
  );
}

export default async function ProfilePage() {
  const profile = await fixtureRepository.getOwnProfile();

  return (
    <>
      <header className="border-b app-divider pb-6 sm:pb-8">
        <h1 className="text-5xl leading-none tracking-tight sm:text-7xl">Profile</h1>
        <p className="mt-3 max-w-prose leading-relaxed app-muted">
          See what eligible attendees can discover about your demo persona and manage contact sharing.
        </p>
      </header>
      {!profile ? (
        <p className="mt-6 app-card p-5 text-sm app-muted">Start a demo to view your profile and manage contact sharing.</p>
      ) : (
        <>
          <section aria-labelledby="own-profile" className="mt-6 app-card p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <PersonAvatar name={profile.display_name} avatarId={profile.avatarId} large />
              <div className="min-w-0 sm:flex-1">
                <p className="app-badge">{profile.demo_label}</p>
                <h2 id="own-profile" className="mt-2 font-serif text-3xl leading-tight sm:text-5xl">{profile.display_name}</h2>
                {profile.neighbourhoodLabel && <p className="mt-1 text-sm app-muted">{profile.neighbourhoodLabel}, Bengaluru</p>}
              </div>
            </div>
            <p className="mt-4 max-w-prose leading-relaxed">{profile.bio}</p>
          </section>

          <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
            <div className="grid min-w-0 gap-5 lg:col-start-2 lg:row-start-1">
              <section aria-labelledby="contact-sharing" className="app-card p-5 sm:p-6">
                <h2 id="contact-sharing" className="font-serif text-3xl">Contact sharing</h2>
                <p className="mt-3"><span className="app-badge">Sharing is {profile.share_contact_on_accept ? "on" : "off"}.</span></p>
                <p className="mt-3 text-sm leading-relaxed app-muted">
                  When sharing is on, the other participant may see your handle only after a request has been accepted. When sharing is off, your handle stays hidden, including for accepted requests.
                </p>
                <p className="mt-2 text-sm leading-relaxed app-muted">
                  You can change this setting anytime. Turning it off revokes access on the next authorised read of Connections.
                </p>
                <ConnectionForm kind="sharing" personaId={profile.id} enabled={profile.share_contact_on_accept} />
              </section>

              <ProfileCompletion profile={profile} />

              <section aria-labelledby="avatar-heading" className="app-card p-5 sm:p-6">
                <h2 id="avatar-heading" className="font-serif text-3xl">Avatar</h2>
                <p id="avatar-scope" className="mt-2 text-sm leading-relaxed app-muted">
                  Choose an illustration or use your initials. Your choice is saved for this persona in this browser’s demo session.
                </p>
                <AvatarPicker key={profile.id} personaId={profile.id} name={profile.display_name} avatarId={profile.avatarId} />
              </section>
            </div>

            <div className="grid min-w-0 gap-5 lg:col-start-1 lg:row-start-1">
              <section aria-labelledby="profile-details" className="app-card p-5 sm:p-7">
                <h2 id="profile-details" className="mb-4 font-serif text-3xl">Interests and skills</h2>
                <ProfileFields profile={profile} />
              </section>

              <section aria-labelledby="looking-for" className="app-card p-5 sm:p-7">
                <h2 id="looking-for" className="font-serif text-3xl">Looking for</h2>
                <p className="mt-2 text-sm leading-relaxed app-muted">Set what you’re looking for in the attendance form for each event.</p>
                {profile.eventPreferences.length > 0 ? (
                  <ul className="mt-4">
                    {profile.eventPreferences.map(({ eventId, title, intents, isPublic }) => (
                      <li key={eventId} className="border-t app-divider py-3 text-sm">
                        <Link href={`/events/${eventId}`} className="font-medium app-accent underline underline-offset-4">{title}</Link>
                        <p className="mt-1 app-muted">
                          {intents.join(" · ") || "No looking-for preference set"}{!isPublic && " · Anonymous attendance"}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : <p className="mt-3 text-sm app-muted">Join an event to save a looking-for preference.</p>}
              </section>

              <AttendeePreview profile={profile} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
