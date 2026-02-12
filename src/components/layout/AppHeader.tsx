import Link from "next/link";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import styles from "@/styles/dashboard.module.css";
import { selectIsGuest } from "@/store/slices/authSlice";
import { useLanguage } from "@/contexts/LanguageContext";

const AppHeader = () => {
  const router = useRouter();
  const isGuest = useSelector(selectIsGuest);
  const { locale, setLocale, t } = useLanguage();

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
        <div className={styles.logo}>{t("appName")}</div>
      </div>

      <div className={styles.headerRight}>
        <div className={styles.langToggle}>
          <button
            type="button"
            onClick={() => setLocale("en")}
            className={locale === "en" ? styles.langActive : styles.langBtn}
            aria-pressed={locale === "en"}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLocale("hi")}
            className={locale === "hi" ? styles.langActive : styles.langBtn}
            aria-pressed={locale === "hi"}
          >
            हिंदी
          </button>
        </div>
        {isGuest ? (
          <>
            <Link href="/auth/login" className={styles.headerLink}>{t("login")}</Link>
            <Link href="/auth/register" className={styles.headerLink}>{t("register")}</Link>
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
