import { useRouter } from "next/router";
import Link from "next/link";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import styles from "@/styles/home.module.css";
import dStyles from "@/styles/dashboard.module.css";

const QUICK_LINKS = [
  { label: "Today's Horoscope", desc: "Daily prediction for your zodiac sign", href: "/guest-horoscope" },
  { label: "Match / Compatibility", desc: "Check compatibility with your partner", href: "/compatibility" },
  { label: "Calendar (Panchang)", desc: "Auspicious days and festivals", href: "/calendar" },
  { label: "Transits", desc: "Current planetary positions", href: "/transits" },
  { label: "Dasha", desc: "Planetary periods in your life", href: "/guest-dasha" },
  { label: "Dosha Check", desc: "Manglik and other dosha analysis", href: "/guest-dosha" },
];

export default function Home() {
  const router = useRouter();

  return (
    <div className={dStyles.dashboardContainer}>
      <AppHeader />
      <div className={dStyles.dashboardContent}>
        <AppSidebar />
        <main className={dStyles.mainContent}>
          <div className={styles.container}>
            <header className={styles.header}>
              <h1>🪔 Jyotishya Darshan</h1>
              <p>Vedic Horoscope • Marriage Match • Panchang</p>
              <div className={styles.actions}>
                <button onClick={() => router.push("/auth/login")}>Login</button>
                <button onClick={() => router.push("/auth/register")}>Register</button>
              </div>
            </header>
            <section className={styles.content}>
              <h2>What would you like to explore?</h2>
              <p>
                Choose a service below. No login needed to try Horoscope, Match, Calendar, Transits, Dasha and Dosha.
              </p>
              <div className={styles.serviceCards}>
                {QUICK_LINKS.map((item) => (
                  <Link key={item.href} href={item.href} className={styles.serviceCard}>
                    <h3>{item.label}</h3>
                    <p>{item.desc}</p>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
