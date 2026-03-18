import { useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import { store } from "@/store";
import {
  selectIsRehydrated,
  selectIsGuest,
  selectToken,
  clearToken,
} from "@/store/slices/authSlice";
import { isValidJwtFormat } from "@/utils/auth";
import { showError } from "@/utils/toast";
import { getUserDetails } from "@/services/userService";
import Image from "next/image";
export default function Dashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const rehydrated = useSelector(selectIsRehydrated);
  const isGuest = useSelector(selectIsGuest);
  const token = useSelector(selectToken);
  const pageClass = "min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]";
  const contentClass = "flex w-full";
  const mainClass =
    "ml-[250px] h-[calc(100vh-50px)] w-full overflow-y-auto overflow-x-hidden bg-[var(--bg-main)] p-6 max-[768px]:ml-[200px]";

  useEffect(() => {
    if (!rehydrated) {
      return;
    }
    if (isGuest) {
      dispatch(clearToken());
      router.replace("/auth/login");
    }
  }, [rehydrated, isGuest, dispatch, router]);

  useEffect(() => {
    if (!rehydrated || isGuest || !token?.trim()) {
      return;
    }
    getUserDetails(token).catch((e: unknown) => {
      const msg = e instanceof Error ? e.message : "Request failed";
      showError(msg);
    });
  }, [rehydrated, isGuest, token]);

  useEffect(() => {
    const handlePopState = () => {
      const t = store.getState().auth.token;
      if (!isValidJwtFormat(t)) {
        router.replace("/auth/login");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [router]);

  const services = [
    {
      id: "kundli",
      title: "My Kundli",
      color: "#FFF5E6",
      image: "https://res.cloudinary.com/dmxmm7emu/image/upload/v1773318834/kundli_mvpzmg.png",
      description: "View your complete birth chart with planetary positions",
      onClick: () => router.push("/kundli"),
    },
    {
      id: "natal-chart",
      title: "Natal Chart",
      color: "#FFF5E6",
      image: "https://res.cloudinary.com/dmxmm7emu/image/upload/v1773319054/natalchart_bvocpc.png",
      description: "Get your birth chart with Sun, Moon, and Ascendant",
      onClick: () => router.push("/natal-chart"),
    },
    {
      id: "horoscope-today",
      title: "Daily Horoscope",
      color: "#FFF5E6",
      image: "https://res.cloudinary.com/dmxmm7emu/image/upload/v1773318877/horoscope1_mujgmf.jpg",
      description: "Personalized daily horoscope based on your birth chart",
      onClick: () => router.push("/horoscope/today"),
    },
    {
      id: "horoscope-weekly",
      title: "Weekly Horoscope",
      color: "#FFF5E6",
      image: "https://res.cloudinary.com/dmxmm7emu/image/upload/v1773319063/week_nbkswr.jpg",
      description: "Your personalized weekly predictions",
      onClick: () => router.push("/horoscope/weekly"),
    },
    {
      id: "horoscope-monthly",
      title: "Monthly Horoscope",
      color: "#FFF5E6",
      image: "https://res.cloudinary.com/dmxmm7emu/image/upload/v1773318878/month1_ksx3cj.jpg",
      description: "Monthly insights and predictions",
      onClick: () => router.push("/horoscope/monthly"),
    },
    {
      id: "calendar",
      title: "Astrology Calendar",
      color: "#FFF5E6",
      image: "https://res.cloudinary.com/dmxmm7emu/image/upload/v1773319090/calendar_zgnjmc.png",
      description: "Today's moon phase, tithi, and planetary events",
      onClick: () => router.push("/calendar"),
    },
    {
      id: "transits",
      title: "Today's Transits",
      color: "#FFF5E6",
      image: "https://res.cloudinary.com/dmxmm7emu/image/upload/v1773318834/transits_exssqn.png",
      description: "Current planetary positions and transits",
      onClick: () => router.push("/transits"),
    },
    {
      id: "dasha",
      title: "Dasha Analysis",
      color: "#FFF5E6",
      image: "https://res.cloudinary.com/dmxmm7emu/image/upload/v1773319041/dasha_atl93j.png",
      description: "Current Mahadasha and Antardasha periods",
      onClick: () => router.push("/dasha"),
    },
    {
      id: "dosha",
      title: "Dosha Check",
      color: "#FFF5E6",
      image: "https://res.cloudinary.com/dmxmm7emu/image/upload/v1773318877/dosha_mfmhni.png",
      description: "Check Manglik, Nadi, and Bhakoot doshas",
      onClick: () => router.push("/dosha"),
    },
    {
      id: "compatibility",
      title: "Match Horoscope",
      color: "#FFF5E6",
      image: "https://res.cloudinary.com/dmxmm7emu/image/upload/v1773318832/match_maxpfl.png",
      description: "Guna Milan and marriage compatibility",
      onClick: () => router.push("/compatibility"),
    },
    {
      id: "remedies",
      title: "Remedies",
      color: "#FFF5E6",
      image: "https://res.cloudinary.com/dmxmm7emu/image/upload/v1773318887/remedy_vv56gv.png",
      description: "Astrological remedies and recommendations",
      onClick: () => router.push("/remedies"),
    },
    {
      id: "ai-chat",
      title: "AI Astrology Assistant",
      color: "#FFF5E6",
      image: "https://res.cloudinary.com/dmxmm7emu/image/upload/v1773318830/ai_op1bkl.png",
      description: "Ask questions and get AI-powered astrology insights",
      onClick: () => router.push("/ai-assistant/chat"),
    },
    {
      id: "ai-explain",
      title: "Explain My Kundli",
      color: "#FFF5E6",
      image: "https://res.cloudinary.com/dmxmm7emu/image/upload/v1773318830/explain_mfia27.png",
      description: "Get AI explanation of your birth chart",
      onClick: () => router.push("/ai-assistant/explain-kundli"),
    },
    {
      id: "ai-suggestions",
      title: "Daily Suggestions",
      color: "#FFF5E6",
      image: "https://res.cloudinary.com/dmxmm7emu/image/upload/v1773319054/suggestions_hwsqj5.png",
      description: "Personalized daily suggestions based on transits",
      onClick: () => router.push("/ai-assistant/suggestions"),
    },
    {
      id: "subscription",
      title: "Subscription Plans",
      color: "#FFF5E6",
      image:
        "https://res.cloudinary.com/dmxmm7emu/image/upload/v1773318834/subscription_triizn.png",
      description: "View and manage your subscription",
      onClick: () => router.push("/subscription/plans"),
    },
    {
      id: "payment",
      title: "Wallet & Payment",
      color: "#FFF5E6",
      image: "https://res.cloudinary.com/dmxmm7emu/image/upload/v1773318845/wallet_eicy4h.png",
      description: "Add money to wallet and pay with Razorpay",
      onClick: () => router.push("/payment"),
    },
    {
      id: "reports",
      title: "Premium Reports",
      color: "#FFF5E6",
      image: "https://res.cloudinary.com/dmxmm7emu/image/upload/v1773318833/reports_a3tt6b.png",
      description: "Generate and download Kundli PDF reports",
      onClick: () => router.push("/reports"),
    },
    {
      id: "notifications",
      title: "Notifications",
      color: "#FFF5E6",
      image:
        "https://res.cloudinary.com/dmxmm7emu/image/upload/v1773319052/notification_qpjsgg.png",
      description: "Daily horoscope push notification settings",
      onClick: () => router.push("/settings/notifications"),
    },
  ];

  if (!rehydrated || isGuest) {
    return (
      <div className={pageClass}>
        <div className="flex items-center justify-center h-screen text-base text-gray-500">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className={pageClass}>
      <AppHeader />
      <div className={contentClass}>
        <AppSidebar />
        <main className={mainClass}>
          <div className="mb-5 flex items-center justify-between rounded-[12px] border border-[#e8ddd0] bg-[linear-gradient(135deg,#f5ebe0_0%,#ede4d8_100%)] p-[30px] shadow-[0_4px_6px_rgba(0,0,0,0.08)] max-[768px]:flex-col max-[768px]:text-center">
            <div className="flex-1">
              <h2 className="mb-[10px] text-[28px] font-bold text-[#6b4423]">
                AI Astrology Assistant
              </h2>
              <p className="mb-5 text-[16px] text-[#5c4033]">
                Get personalized insights and explanations powered by AI
              </p>
              <button
                className="rounded-[8px] bg-[#6b4423] px-[30px] py-3 text-[16px] font-semibold text-white transition-colors duration-200 hover:bg-[#5c3a1f]"
                onClick={() => router.push("/ai-assistant/chat")}
              >
                Chat Now
              </button>
            </div>
            <div className="flex items-center gap-[15px] max-[768px]:mt-5">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                <div className="text-[40px]">🤖</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5 max-[768px]:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] max-[768px]:gap-[15px]">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex cursor-pointer flex-col overflow-hidden rounded-[12px] border border-[var(--border)] bg-[#FFF5E6] text-[var(--text-main)] shadow-[0_1px_3px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
                onClick={service.onClick}
              >
                {service.image && (
                  <div className="relative h-[140px] w-full bg-[#f5f0e8]">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 280px"
                      className="object-cover object-center"
                    />
                  </div>
                )}
                <h3 className="mx-4 mt-3 mb-[6px] text-[16px] font-semibold text-[#1f2937]">
                  {service.title}
                </h3>
                <p className="mx-4 mb-4 flex-1 text-[13px] leading-[1.5] text-[#6b7280]">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
