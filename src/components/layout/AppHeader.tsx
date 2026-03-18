import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
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
  const shouldDisableWallet = !rehydrated || isGuest || !isValidJwtFormat(token);

  useEffect(() => {
    if (shouldDisableWallet) {
      return;
    }
    paymentApi
      .getBalance(token!)
      .then((r) => setWalletBalance(r.balanceRupees))
      .catch(() => setWalletBalance(null));
  }, [shouldDisableWallet, token]);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(isGuest ? "/" : "/dashboard");
    }
  };

  const handleHomeClick = () => {
    router.push(isGuest ? "/" : "/dashboard");
  };

  const backTitle = "Back to previous page";
  const homeTitle = isGuest ? "Go to home" : "Go to dashboard";
  const headerButtonClass =
    "rounded-[6px] text-white transition-colors duration-200 hover:bg-white/20";
  const languageButtonClass =
    "cursor-pointer rounded-[6px] border border-white/40 bg-transparent px-[10px] py-1 text-[13px] text-white";

  return (
    <header className="flex h-[50px] items-center justify-between bg-[var(--accent)] px-5 shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
      <div className="flex items-center gap-[15px]">
        <button
          type="button"
          className={`${headerButtonClass} flex h-6 w-6 items-center justify-center bg-white/20 text-[14px] font-bold`}
          onClick={handleBack}
          aria-label={backTitle}
          title={backTitle}
        >
          ←
        </button>
        <button
          type="button"
          className={`${headerButtonClass} mx-[-4px] bg-transparent px-[10px] py-[6px] text-[18px] font-bold`}
          onClick={handleHomeClick}
          aria-label={homeTitle}
          title={homeTitle}
        >
          {t("appName")}
        </button>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setLocale("en")}
            className={
              locale === "en"
                ? `${languageButtonClass} bg-white/30 font-semibold`
                : `${languageButtonClass} hover:bg-white/15`
            }
            aria-pressed={locale === "en"}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLocale("hi")}
            className={
              locale === "hi"
                ? `${languageButtonClass} bg-white/30 font-semibold`
                : `${languageButtonClass} hover:bg-white/15`
            }
            aria-pressed={locale === "hi"}
          >
            हिंदी
          </button>
        </div>
        {isGuest ? (
          <>
            <Link
              href="/auth/login"
              className="rounded-[6px] px-3 py-[6px] text-[14px] font-semibold text-white no-underline transition-colors duration-200 hover:bg-white/15"
            >
              {t("login")}
            </Link>
            <Link
              href="/auth/register"
              className="rounded-[6px] px-3 py-[6px] text-[14px] font-semibold text-white no-underline transition-colors duration-200 hover:bg-white/15"
            >
              {t("register")}
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-1 text-[16px] font-semibold text-white">
            <span className="text-[18px]">₹</span>
            <span className="text-[16px]">
              {shouldDisableWallet || walletBalance === null ? "—" : walletBalance.toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
