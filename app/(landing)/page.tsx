import Link from "next/link";
import Scene from "../../components/landing/Scene";
import Wordmark from "../../components/landing/Wordmark";
import styles from "../../components/landing/landing.module.css";

export default function LandingPage() {
  return (
    <main className={styles.landing}>
      <Scene>
        <Link className={styles.explore} href="/explore">
          Explore Bengaluru <span aria-hidden="true">↗︎</span>
        </Link>
        <Wordmark />
        <p className={styles.disclosure}>Stylized Visuals</p>
      </Scene>
    </main>
  );
}
