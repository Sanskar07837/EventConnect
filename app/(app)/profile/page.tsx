import ConnectionForm from "../../../components/ui/ConnectionForm";
import { fixtureRepository } from "../../../lib/data/fixture-repository";

export default async function ProfilePage() {
  const profile = await fixtureRepository.getOwnProfile();
  return (
    <>
      <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">Profile</h1>
      {!profile ? (
        <p className="mt-4 text-stone-700">Start a demo to view your profile and manage contact sharing.</p>
      ) : (
        <>
          <section aria-labelledby="own-profile" className="mt-5 rounded-lg border border-stone-300 bg-white p-5 sm:p-7">
            <p className="text-sm font-semibold text-emerald-900">{profile.demo_label}</p>
            <h2 id="own-profile" className="mt-2 text-2xl font-semibold">{profile.display_name}</h2>
            <p className="mt-2 text-sm text-stone-700">{profile.bio}</p>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="font-semibold">Interests</dt><dd>{profile.interests.join(" · ") || "None listed"}</dd></div>
              <div><dt className="font-semibold">Skills</dt><dd>{profile.skills.join(" · ") || "None listed"}</dd></div>
            </dl>
          </section>
          <section aria-labelledby="contact-sharing" className="mt-5 rounded-lg border border-stone-300 bg-white p-5 sm:p-7">
            <h2 id="contact-sharing" className="text-xl font-semibold">Contact sharing</h2>
            <p className="mt-2 text-sm text-stone-700">Share your demo contact with the other participant only after a request is accepted.</p>
            <p className="mt-3 text-sm font-semibold">Sharing is {profile.share_contact_on_accept ? "on" : "off"}.</p>
            <ConnectionForm kind="sharing" personaId={profile.id} enabled={profile.share_contact_on_accept} />
          </section>
        </>
      )}
    </>
  );
}
