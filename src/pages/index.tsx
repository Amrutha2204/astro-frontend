import { useRouter } from "next/router";
import Link from "next/link";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import PageHead from "@/components/common/PageHead";
import { useLanguage } from "@/contexts/LanguageContext";

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
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
      <PageHead
        title="Home"
        description="Vedic horoscope, Kundli, Dasha, Dosha check, marriage match, and Panchang. Try free without login."
      />
      <AppHeader />
      <div className="flex w-full">
        <AppSidebar />
        <main className="ml-[250px] h-[calc(100vh-50px)] w-full overflow-y-auto overflow-x-hidden bg-[var(--bg-main)] p-6 max-[768px]:ml-[200px]">
          <div className="mx-auto min-h-full max-w-[900px] bg-transparent font-[system-ui,-apple-system,'Segoe_UI',Roboto,sans-serif] text-[#3b2f2f]">
            <header className="border-b border-b-[#e8ddd0] px-5 pb-8 pt-10 text-center">
              <h1 className="mb-2 text-[32px] font-bold text-[#5c4033]">🪔 {t("appName")}</h1>
              <p className="mb-5 text-[15px] text-[#6b5b52]">{t("tagline")}</p>
              <ul className="mx-auto mb-4 max-w-[480px] list-none p-0 text-left">
                <li className="relative py-[6px] pl-7 text-[14px] leading-[1.6] text-[#5c5047] before:absolute before:left-0 before:font-bold before:text-[#6b4423] before:content-['✓']">
                  {t("benefit1")}
                </li>
                <li className="relative py-[6px] pl-7 text-[14px] leading-[1.6] text-[#5c5047] before:absolute before:left-0 before:font-bold before:text-[#6b4423] before:content-['✓']">
                  {t("benefit2")}
                </li>
                <li className="relative py-[6px] pl-7 text-[14px] leading-[1.6] text-[#5c5047] before:absolute before:left-0 before:font-bold before:text-[#6b4423] before:content-['✓']">
                  {t("benefit3")}
                </li>
              </ul>
              <p className="mb-2 text-[13px] italic text-[#6b5b52]">{t("socialProof")}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => router.push("/auth/login")}
                  className="m-0 rounded-[8px] bg-[#6b4423] px-6 py-3 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-[#5c3a1f]"
                >
                  {t("login")}
                </button>
                <button
                  onClick={() => router.push("/auth/register")}
                  className="m-0 rounded-[8px] border-[2px] border-[#6b4423] bg-transparent px-6 py-3 text-[15px] font-semibold text-[#6b4423] transition-colors duration-200 hover:bg-[#f5ebe0]"
                >
                  {t("register")}
                </button>
              </div>
            </header>
            <section className="mx-auto mt-10 max-w-full text-center">
              <h2 className="mb-3 text-[18px] font-semibold text-[#5c4033]">
                {t("whatToExplore")}
              </h2>
              <p className="text-[15px] leading-[1.6] text-[#5c5047]">{t("chooseService")}</p>
              <p className="mx-auto mt-4 max-w-[520px] text-[12px] text-[#8a7a6f]">
                {t("disclaimer")}
              </p>
              <div className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 text-left">
                {QUICK_LINK_KEYS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-[10px] border border-[#e8ddd0] bg-white p-5 text-inherit no-underline transition-all duration-200 hover:border-[#6b4423] hover:shadow-[0_4px_12px_rgba(107,68,35,0.12)]"
                  >
                    <h3 className="mb-[6px] text-[16px] font-semibold text-[#5c4033]">
                      {t(item.labelKey)}
                    </h3>
                    <p className="m-0 text-[13px] leading-[1.5] text-[#6b5b52]">
                      {t(item.descKey)}
                    </p>
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
