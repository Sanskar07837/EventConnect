import type { ReactNode } from "react";
import PersonaSwitcher from "../../components/ui/PersonaSwitcher";
import { fixtureRepository } from "../../lib/data/fixture-repository";
import "./app-theme.css";

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
    <div className="app-shell">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:z-20 app-skip-link focus:p-3">
        Skip to content
      </a>
      <header className="app-header">
        <div className="app-container app-header-inner">
          {/* A document navigation prevents the private route from entering same-document history. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="app-brand" href="/">EventConnect</a>
          <nav aria-label="Main navigation" className="app-nav">
            <ul className="app-nav-list">
              {navigation.map(({ href, label }) => (
                <li key={href}>
                  <a className="app-nav-link" href={href}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="app-container app-main">
        {demoEnabled && (
          <PersonaSwitcher
            current={current ? { id: current.id, label: current.display_name } : null}
            personas={current ? personas.map(({ id, display_name }) => ({ id, label: display_name })) : []}
          />
        )}
        {children}
        <footer className="app-footer">
          Sample events and demo personas are fictional. Demo changes are stored temporarily for this browser.
        </footer>
      </main>
    </div>
  );
}
