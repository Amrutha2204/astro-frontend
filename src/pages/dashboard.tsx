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
    getUserDetails(token)
      .then((data: unknown) => {
        const d = data as { dob?: string; birthPlace?: string } | null;
        const hasBirthData = d?.dob && d?.birthPlace && String(d.dob).trim() && String(d.birthPlace).trim();
        if (!hasBirthData) router.replace("/birth-details");
      })
      .catch(() => {
        router.replace("/birth-details");
      });
  }, [rehydrated, isGuest, token, router]);

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
      icon: "🪐",
      description: "View your complete birth chart with planetary positions",
      onClick: () => router.push("/kundli"),
    },
    {
      id: "natal-chart",
      title: "Natal Chart",
      icon: "⭐",
      description: "Get your birth chart with Sun, Moon, and Ascendant",
      onClick: () => router.push("/natal-chart"),
    },
    {
      id: "horoscope-today",
      title: "Daily Horoscope",
      icon: "🌙",
      description: "Personalized daily horoscope based on your birth chart",
      onClick: () => router.push("/horoscope/today"),
    },
    {
      id: "horoscope-weekly",
      title: "Weekly Horoscope",
      icon: "📅",
      description: "Your personalized weekly predictions",
      onClick: () => router.push("/horoscope/weekly"),
    },
    {
      id: "horoscope-monthly",
      title: "Monthly Horoscope",
      icon: "📆",
      description: "Monthly insights and predictions",
      onClick: () => router.push("/horoscope/monthly"),
    },
    {
      id: "calendar",
      title: "Astrology Calendar",
      icon: "📅",
      description: "Today's moon phase, tithi, and planetary events",
      onClick: () => router.push("/calendar"),
    },
    {
      id: "transits",
      title: "Today's Transits",
      icon: "⚛️",
      description: "Current planetary positions and transits",
      onClick: () => router.push("/transits"),
    },
    {
      id: "dasha",
      title: "Dasha Analysis",
      icon: "🔄",
      description: "Current Mahadasha and Antardasha periods",
      onClick: () => router.push("/dasha"),
    },
    {
      id: "dosha",
      title: "Dosha Check",
      icon: "⚠️",
      description: "Check Manglik, Nadi, and Bhakoot doshas",
      onClick: () => router.push("/dosha"),
    },
    {
      id: "compatibility",
      title: "Match Horoscope",
      icon: "💕",
      description: "Guna Milan and marriage compatibility",
      onClick: () => router.push("/compatibility"),
    },
    {
      id: "remedies",
      title: "Remedies",
      icon: "🔮",
      description: "Astrological remedies and recommendations",
      onClick: () => router.push("/remedies"),
    },
    {
      id: "ai-chat",
      title: "AI Astrology Assistant",
      icon: "🤖",
      description: "Ask questions and get AI-powered astrology insights",
      onClick: () => router.push("/ai-assistant/chat"),
    },
    {
      id: "ai-explain",
      title: "Explain My Kundli",
      icon: "💬",
      description: "Get AI explanation of your birth chart",
      onClick: () => router.push("/ai-assistant/explain-kundli"),
    },
    {
      id: "ai-suggestions",
      title: "Daily Suggestions",
      icon: "✨",
      description: "Personalized daily suggestions based on transits",
      onClick: () => router.push("/ai-assistant/suggestions"),
    },
    {
      id: "subscription",
      title: "Subscription Plans",
      icon: "📋",
      description: "View and manage your subscription",
      onClick: () => router.push("/subscription/plans"),
    },
    {
      id: "payment",
      title: "Wallet & Payment",
      icon: "💰",
      description: "Add money to wallet and pay with Razorpay",
      onClick: () => router.push("/payment"),
    },
    {
      id: "reports",
      title: "Premium Reports",
      icon: "📄",
      description: "Generate and download Kundli PDF reports",
      onClick: () => router.push("/reports"),
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: "🔔",
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
              <ServiceCard
                key={service.id}
                title={service.title}
                icon={service.icon}
                description={service.description}
                onClick={service.onClick}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
