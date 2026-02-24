import Link from "next/link";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import styles from "@/styles/dashboard.module.css";
import { selectIsGuest } from "@/store/slices/authSlice";

const AppHeader = () => {
  const router = useRouter();
  const isGuest = useSelector(selectIsGuest);

  const handleClose = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(isGuest ? "/" : "/dashboard");
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Go back"
          title="Go back"
        >
          ×
        </button>
        <div className={styles.logo}>Jyotishya Darshan</div>
      </div>

      <div className={styles.headerRight}>
        {isGuest ? (
          <>
            <Link href="/auth/login" className={styles.headerLink}>Login</Link>
            <Link href="/auth/register" className={styles.headerLink}>Register</Link>
          </>
        ) : (
          <div className={styles.currency}>
            <span className={styles.currencySymbol}>₹</span>
            <span className={styles.currencyAmount}>0.0</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
