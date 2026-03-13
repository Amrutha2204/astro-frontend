import { useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import ServiceCard from "@/components/common/ServiceCard";
import styles from "@/styles/dashboard.module.css";
import { store } from "@/store";
import { selectIsRehydrated, selectIsGuest, selectToken, clearToken } from "@/store/slices/authSlice";
import { isValidJwtFormat } from "@/utils/auth";
import { showError } from "@/utils/toast";
import { getUserDetails } from "@/services/userService";

export default function Dashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const rehydrated = useSelector(selectIsRehydrated);
  const isGuest = useSelector(selectIsGuest);
  const token = useSelector(selectToken);

  useEffect(() => {
    if (!rehydrated) return;
    if (isGuest) {
      dispatch(clearToken());
      router.replace("/auth/login");
    }
  }, [rehydrated, isGuest, dispatch, router]);

  useEffect(() => {
    if (!rehydrated || isGuest || !token?.trim()) return;
    getUserDetails(token).catch((e: unknown) => {
      const msg = e instanceof Error ? e.message : "Request failed";
      showError(msg);
    });
  }, [rehydrated, isGuest, token]);

  useEffect(() => {
    const handlePopState = () => {
      const t = store.getState().auth.token;
      if (!isValidJwtFormat(t)) router.replace("/auth/login");
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
      image: "https://res.cloudinary.com/dmxmm7emu/image/upload/v1773318834/subscription_triizn.png",
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
      image: "https://res.cloudinary.com/dmxmm7emu/image/upload/v1773319052/notification_qpjsgg.png",
      description: "Daily horoscope push notification settings",
      onClick: () => router.push("/settings/notifications"),
    },
  ];

  if (!rehydrated || isGuest) {
    return (
      <div className={styles.dashboardContainer}>
        <div className="flex items-center justify-center h-screen text-base text-gray-500">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <AppHeader />
      <div className={styles.dashboardContent}>
        <AppSidebar />
        <main className={styles.mainContent}>
          <div className={styles.banner}>
            <div className={styles.bannerContent}>
              <h2 className={styles.bannerTitle}>AI Astrology Assistant</h2>
              <p className={styles.bannerSubtitle}>
                Get personalized insights and explanations powered by AI
              </p>
              <button
                className={styles.chatNowButton}
                onClick={() => router.push("/ai-assistant/chat")}
              >
                Chat Now
              </button>
            </div>
            <div className={styles.bannerAstrologers}>
              <div className={styles.astrologerCard}>
                <div className={styles.astrologerAvatar}>🤖</div>
              </div>
            </div>
          </div>

          <div className={styles.servicesGrid}>
  {services.map((service) => (
    <div
      key={service.id}
      className={styles.serviceCard}
      style={{ backgroundColor: service.color }}
      onClick={service.onClick}
    >
      {service.image && (
        <img
          src={service.image}
          alt=""
          className={styles.cardImage}
        />
      )}
      <h3 className={styles.cardTitle}>{service.title}</h3>
      <p className={styles.cardDescription}>{service.description}</p>
    </div>
  ))}
</div>
        </main>
      </div>
    </div>
  );
}
