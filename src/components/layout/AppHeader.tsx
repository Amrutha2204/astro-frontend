import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import styles from "@/styles/dashboard.module.css";
import { selectIsGuest, selectToken, selectIsRehydrated } from "@/store/slices/authSlice";
import { isValidJwtFormat } from "@/utils/auth";
import { useLanguage } from "@/contexts/LanguageContext";
import { paymentApi } from "@/services/paymentService";
import ThemeToggle from "@/components/common/ThemeToggle";

const AppHeader = () => {
  const router = useRouter();
  const isGuest = useSelector(selectIsGuest);
  const token = useSelector(selectToken);
  const rehydrated = useSelector(selectIsRehydrated);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const { locale, setLocale, t } = useLanguage();

  useEffect(() => {
    if (!rehydrated || isGuest || !isValidJwtFormat(token)) {
      setWalletBalance(null);
      return;
    }
    paymentApi
      .getBalance(token!)
      .then((r) => setWalletBalance(r.balanceRupees))
      .catch(() => setWalletBalance(null));
  }, [rehydrated, isGuest, token]);

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
        <ThemeToggle />
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
            <span className={styles.currencyAmount}>
              {walletBalance === null ? "—" : walletBalance.toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
