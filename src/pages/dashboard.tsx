import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import ServiceCard from "@/components/common/ServiceCard";
import styles from "@/styles/dashboard.module.css";

export default function Dashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication on mount
    const token = localStorage.getItem("token")?.trim();
    
    if (!token || token.split(".").length !== 3) {
      // No valid token, redirect to login
      localStorage.removeItem("token");
      router.replace("/auth/login");
      return;
    }
    
    setIsAuthenticated(true);
    setLoading(false);
  }, [router]);

  // Prevent browser back/forward navigation after logout
  useEffect(() => {
    const handlePopState = () => {
      const token = localStorage.getItem("token")?.trim();
      if (!token || token.split(".").length !== 3) {
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
  ];

  // Show loading or redirect if not authenticated
  if (loading || !isAuthenticated) {
    return (
      <div className={styles.dashboardContainer}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh',
          fontSize: '16px',
          color: '#6b7280'
        }}>
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
                buttonText={service.buttonText}
                buttonColor={service.buttonColor}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
