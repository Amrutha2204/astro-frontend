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
  const languageButtonClass =
    "cursor-pointer rounded-md border border-white/30 px-3 py-1 text-xs text-white transition-all duration-200";

  return (
    <header
      className="flex h-[56px] items-center justify-between px-6
bg-gradient-to-r from-rose-900 via-orange-800 to-amber-700
text-white shadow-lg backdrop-blur-md border-b border-white/10"
    >
      <div className="flex items-center gap-[15px]">
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-sm font-bold
hover:bg-white/30 hover:scale-110 active:scale-95 transition-all duration-200"
          onClick={handleBack}
          aria-label={backTitle}
          title={backTitle}
        >
          ←
        </button>
        <button
          type="button"
          className="mx-[-4px] px-3 py-1 text-lg font-bold tracking-wide
bg-white/10 rounded-lg hover:bg-white/20
transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
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
                ? `${languageButtonClass} bg-white/30 font-semibold shadow`
                : `${languageButtonClass} bg-white/10 hover:bg-white/20`
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
                ? `${languageButtonClass} bg-white/30 font-semibold shadow`
                : `${languageButtonClass} bg-white/10 hover:bg-white/20`
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
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white no-underline
bg-white/10 hover:bg-white/20 transition-all duration-300"
            >
              {t("login")}
            </Link>
            <Link
              href="/auth/register"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white no-underline
bg-white/10 hover:bg-white/20 transition-all duration-300"
            >
              {t("register")}
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold backdrop-blur-sm">
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
