import Link from "next/link";
import type { ReactNode } from "react";

const navigation = [
  { href: "/explore", label: "Explore" },
  { href: "/people", label: "People" },
  { href: "/connections", label: "Connections" },
  { href: "/profile", label: "Profile" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:z-20 focus:bg-white focus:p-3">
        Skip to content
      </a>
      <header className="border-b border-stone-300">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link className="font-serif text-2xl" href="/">EventConnect</Link>
          <nav aria-label="Main navigation" className="fixed inset-x-0 bottom-0 z-10 border-t border-stone-300 bg-white sm:static sm:border-0 sm:bg-transparent">
            <ul className="flex flex-wrap justify-evenly sm:gap-4">
              {navigation.map(({ href, label }) => (
                <li key={href}>
                  <Link className="block px-2 py-3 text-sm font-medium hover:underline" href={href}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-5xl px-4 pt-8 pb-24 sm:px-6">
        {children}
      </main>
    </>
  );
}
