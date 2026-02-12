import { useRouter } from "next/router";
import Link from "next/link";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import PageHead from "@/components/common/PageHead";
import { useLanguage } from "@/contexts/LanguageContext";
import styles from "@/styles/home.module.css";
import dStyles from "@/styles/dashboard.module.css";

const QUICK_LINK_KEYS = [
  { labelKey: "freeKundli", descKey: "freeKundliDesc", href: "/guest-kundli" },
  { labelKey: "todaysHoroscope", descKey: "todaysHoroscopeDesc", href: "/guest-horoscope" },
  { labelKey: "matchCompatibility", descKey: "matchCompatibilityDesc", href: "/compatibility" },
  { labelKey: "calendarPanchang", descKey: "calendarPanchangDesc", href: "/calendar" },
  { labelKey: "transits", descKey: "transitsDesc", href: "/transits" },
  { labelKey: "dasha", descKey: "dashaDesc", href: "/guest-dasha" },
  { labelKey: "doshaCheck", descKey: "doshaCheckDesc", href: "/guest-dosha" },
];

export default function Home() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div className={dStyles.dashboardContainer}>
      <PageHead title="Home" description="Vedic horoscope, Kundli, Dasha, Dosha check, marriage match, and Panchang. Try free without login." />
      <AppHeader />
      <div className={dStyles.dashboardContent}>
        <AppSidebar />
        <main className={dStyles.mainContent}>
          <div className={styles.container}>
            <header className={styles.header}>
              <h1>🪔 {t("appName")}</h1>
              <p className={styles.tagline}>{t("tagline")}</p>
              <ul className={styles.benefits}>
                <li>{t("benefit1")}</li>
                <li>{t("benefit2")}</li>
                <li>{t("benefit3")}</li>
              </ul>
              <p className={styles.socialProof}>{t("socialProof")}</p>
              <div className={styles.actions}>
                <button onClick={() => router.push("/auth/login")}>{t("login")}</button>
                <button onClick={() => router.push("/auth/register")}>{t("register")}</button>
              </div>
            </header>
            <section className={styles.content}>
              <h2>{t("whatToExplore")}</h2>
              <p>{t("chooseService")}</p>
              <p className={styles.disclaimer}>{t("disclaimer")}</p>
              <div className={styles.serviceCards}>
                {QUICK_LINK_KEYS.map((item) => (
                  <Link key={item.href} href={item.href} className={styles.serviceCard}>
                    <h3>{t(item.labelKey)}</h3>
                    <p>{t(item.descKey)}</p>
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