import { useRouter } from "next/router";
import styles from "@/styles/dashboard.module.css";

export default function Dashboard() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🕉 Welcome to Your Jyotish Dashboard</h2>

      <div className={styles.cards}>
        <div
          className={styles.card}
          onClick={() => router.push("/birth-details")}
        >
          🪐 Enter Birth Details
        </div>

        <div
          className={styles.card}
          onClick={() => router.push("/my-day")}
        >
          🌙 My Day Today
        </div>
      </div>
    </div>
  );
}
