import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import styles from "@/styles/dashboard.module.css";

export default function CalendarPage() {
  return (
    <div className={styles.dashboardContainer}>
      <AppHeader />
      <div className={styles.dashboardContent}>
        <AppSidebar />
        <main className={styles.mainContent}>
          <h1 className={styles.pageTitle} style={{ marginBottom: 16 }}>Astrology Calendar</h1>
          <div className={styles.noDataContainer}>
            <div className={styles.noDataIcon}>📅</div>
            <h3 className={styles.noDataTitle}>No Data Found</h3>
            <p className={styles.noDataMessage}>Calendar data is currently unavailable. This section is under development.</p>
          </div>
        </main>
      </div>
    </div>
  );
}
