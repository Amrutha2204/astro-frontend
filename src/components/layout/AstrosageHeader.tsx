import { useRouter } from "next/router";
import styles from "@/styles/astrosage.module.css";

const AstrosageHeader = () => {
  const router = useRouter();

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button className={styles.closeButton}>✕</button>
        <div className={styles.logo}>Jyotishya Darshan</div>
      </div>

      <div className={styles.headerIcons}>
        <button
          className={styles.iconButton}
          title="Home"
          onClick={() => router.push("/dashboard")}
        >
          🏠
        </button>
        <button className={styles.iconButton} title="Search">
          🔍
        </button>
      </div>

      <div className={styles.headerRight}>
        <div className={styles.currency}>
          <span className={styles.currencySymbol}>₹</span>
          <span className={styles.currencyAmount}>0.0</span>
        </div>
      </div>
    </header>
  );
};

export default AstrosageHeader;

