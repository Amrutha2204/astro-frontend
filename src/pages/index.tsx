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
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 text-gray-800 relative">
      {/* Background glow */}
      <div className="pointer-events-none fixed top-[-100px] left-[-100px] w-[400px] h-[400px] bg-amber-300/30 rounded-full blur-3xl" />
      <div className="pointer-events-none fixed bottom-[-120px] right-[-120px] w-[400px] h-[400px] bg-orange-300/30 rounded-full blur-3xl" />
      <PageHead title="Home" description="Vedic astrology platform" />

      <div className="fixed top-0 left-0 right-0 z-50">
        <AppHeader />
      </div>

      <div className="flex">
        <AppSidebar />

        <main className="ml-[250px] max-[768px]:ml-[200px] w-full p-6 pt-24 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-12">
            {/* 🌟 HERO SECTION */}
            <section className="flex items-center justify-center text-center">
              <div className="w-full">
                <div className="relative rounded-3xl overflow-hidden p-[1px] bg-gradient-to-br from-amber-200 via-orange-200 to-yellow-200">
                  <div className="relative rounded-3xl bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 px-8 py-14 shadow-xl">
                    {/* Glow */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.6),transparent_70%)]" />

                    {/* Blur blobs */}
                    <div className="absolute -top-24 -left-24 w-80 h-80 bg-amber-300/30 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-orange-300/30 rounded-full blur-3xl" />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center">
                      {/* Title */}
                      <h1 className="text-4xl md:text-5xl font-bold text-amber-900 mb-4">
                        🪔 {t("appName")}
                      </h1>

                      {/* Tagline */}
                      <p className="text-amber-800 max-w-2xl mb-8">{t("tagline")}</p>

                      {/* Benefits */}
                      <ul className="space-y-3 mb-8 max-w-md text-left">
                        {[t("benefit1"), t("benefit2"), t("benefit3")].map((item, i) => (
                          <li key={i} className="flex gap-3 items-start text-amber-900">
                            <span className="bg-amber-700 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs">
                              ✓
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>

                      {/* Social proof */}
                      <p className="text-sm italic text-amber-700 mb-8">{t("socialProof")}</p>

                      {/* Buttons */}
                      <div className="flex gap-5 flex-wrap justify-center">
                        <button
                          onClick={() => router.push("/auth/login")}
                          className="px-8 py-3 rounded-xl bg-amber-700 text-white font-semibold shadow-lg hover:bg-amber-800 transition"
                        >
                          {t("login")}
                        </button>

                        <button
                          onClick={() => router.push("/auth/register")}
                          className="px-8 py-3 rounded-xl border border-amber-700 text-amber-900 font-semibold hover:bg-amber-100 transition"
                        >
                          {t("register")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 🔎 EXPLORE SECTION */}
            <section className="text-center">
              <h2 className="text-2xl font-semibold text-amber-900 mb-2">{t("whatToExplore")}</h2>

              <p className="text-amber-700 max-w-xl mx-auto">{t("chooseService")}</p>

              <p className="text-xs text-amber-600 mt-2 max-w-md mx-auto">{t("disclaimer")}</p>
            </section>

            {/* 🎴 CARDS */}
            <section>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {QUICK_LINK_KEYS.map((item, index) => {
                  const images = [
                    "https://res.cloudinary.com/dmxmm7emu/image/upload/v1773318834/kundli_mvpzmg.png",
                    "https://res.cloudinary.com/dmxmm7emu/image/upload/v1773318877/horoscope1_mujgmf.jpg",
                    "https://res.cloudinary.com/dmxmm7emu/image/upload/v1773318832/match_maxpfl.png",
                    "https://res.cloudinary.com/dmxmm7emu/image/upload/v1773319090/calendar_zgnjmc.png",
                    "https://res.cloudinary.com/dmxmm7emu/image/upload/v1773318834/transits_exssqn.png",
                    "https://res.cloudinary.com/dmxmm7emu/image/upload/v1773319041/dasha_atl93j.png",
                    "https://res.cloudinary.com/dmxmm7emu/image/upload/v1773318877/dosha_mfmhni.png",
                  ];

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group relative rounded-3xl overflow-hidden bg-white border border-amber-200 shadow-md hover:shadow-2xl transition"
                    >
                      {/* Image */}
                      <div
                        className="h-44 bg-cover bg-center"
                        style={{ backgroundImage: `url(${images[index]})` }}
                      />

                      {/* Soft overlay line */}
                      <div className="absolute top-40 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-300 to-transparent opacity-60" />

                      {/* Content */}
                      <div className="p-6 bg-gradient-to-br from-white via-amber-50 to-orange-50">
                        <h3 className="text-lg font-semibold text-amber-900 mb-2 group-hover:text-amber-700 transition">
                          {t(item.labelKey)}
                        </h3>

                        <p className="text-sm text-amber-700 leading-relaxed">{t(item.descKey)}</p>
                      </div>

                      {/* Glow on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-amber-200/10 transition" />
                    </Link>
                  );
                })}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
