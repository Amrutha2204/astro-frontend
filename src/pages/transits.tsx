import { useEffect } from "react";
import { useRouter } from "next/router";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import styles from "@/styles/dashboard.module.css";

export default function TransitsPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token")?.trim();
    if (!token || token.split(".").length !== 3) {
      router.replace("/auth/login");
    }
  }, [router]);

  return (
    <div className={styles.dashboardContainer}>
      <AppHeader />
      <div className={styles.dashboardContent}>
        <AppSidebar />
        <main className={styles.mainContent}>
          <div className={styles.noDataContainer}>
            <div className={styles.noDataIcon}>⚛️</div>
            <h2 className={styles.noDataTitle}>No Data Found</h2>
            <p className={styles.noDataMessage}>
              This feature is coming soon. We're working on bringing you today's planetary transits and their effects.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

