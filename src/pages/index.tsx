import { useRouter } from "next/router";
import styles from "@/styles/home.module.css";

export default function Home() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>🪔 Jyotishya Darshan</h1>
        <p>Vedic Astrology • Horoscope • Panchangam</p>

        <div className={styles.actions}>
          <button onClick={() => router.push("/auth/login")}>Login</button>
          <button onClick={() => router.push("/auth/register")}>Register</button>
        </div>
      </header>

      <section className={styles.content}>
        <h2>Know Your Destiny Through Vedic Wisdom</h2>
        <p>
          Discover daily horoscope, planetary movements and life guidance
          based on ancient Jyotishya Shastra.
        </p>
      </section>
    </div>
  );
}
