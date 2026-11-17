import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col items-center justify-center gap-5 px-6 text-center">
      <h1 className="font-serif text-5xl sm:text-7xl">EventConnect</h1>
      <p>Discover events. Meet people. Do more together.</p>
      <Link className="rounded bg-emerald-900 px-5 py-3 text-white" href="/explore">
        Explore Bengaluru
      </Link>
    </main>
  );
}
