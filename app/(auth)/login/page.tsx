import type { Metadata } from "next";
import Link from "next/link";
import { fixtureRepository } from "../../../lib/data/fixture-repository";
import AuthPreview from "./AuthPreview";
import styles from "./login.module.css";

export const metadata: Metadata = { title: "Sign in | EventConnect" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const demoEnabled = process.env.DEMO_MODE === "true";
  const profile = demoEnabled ? await fixtureRepository.getOwnProfile() : null;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" prefetch={false} className={styles.brand}>EventConnect</Link>
      </header>
      <AuthPreview demoEnabled={demoEnabled} activePersona={profile?.display_name ?? null} />
    </div>
  );
}
