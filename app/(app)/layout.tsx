import type { ReactNode } from "react";
import PersonaSwitcher from "../../components/ui/PersonaSwitcher";
import { fixtureRepository } from "../../lib/data/fixture-repository";

const navigation = [
  { href: "/explore", label: "Explore" },
  { href: "/people", label: "People" },
  { href: "/connections", label: "Connections" },
  { href: "/profile", label: "Profile" },
];

export default async function AppLayout({ children }: { children: ReactNode }) {
  const demoEnabled = process.env.DEMO_MODE === "true";
  const [profile, personas] = demoEnabled
    ? await Promise.all([fixtureRepository.getOwnProfile(), fixtureRepository.listPersonaOptions()])
    : [null, []] as const;
  const current = profile ? personas.find(({ id }) => id === profile.id) ?? null : null;

  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:z-20 focus:bg-white focus:p-3">
        Skip to content
      </a>
      <header className="border-b border-stone-300">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          {/* A document navigation prevents the private route from entering same-document history. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="font-serif text-2xl" href="/">EventConnect</a>
          <nav aria-label="Main navigation" className="fixed inset-x-0 bottom-0 z-10 border-t border-stone-300 bg-white sm:static sm:border-0 sm:bg-transparent">
            <ul className="flex flex-wrap justify-evenly sm:gap-4">
              {navigation.map(({ href, label }) => (
                <li key={href}>
                  <a className="block px-2 py-3 text-sm font-medium hover:underline" href={href}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-5xl px-4 pt-8 pb-24 sm:px-6">
        {demoEnabled && (
          <PersonaSwitcher
            current={current ? { id: current.id, label: current.display_name } : null}
            personas={current ? personas.map(({ id, display_name }) => ({ id, label: display_name })) : []}
          />
        )}
        {children}
        <footer className="mt-12 border-t border-stone-300 pt-4 text-sm text-stone-600">
          Sample events and demo personas are fictional. Demo changes are stored temporarily for this browser.
        </footer>
      </main>
    </>
  );
}
