import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import { remediesApi, RemedyRecommendations } from "@/services/remediesService";
import { showError } from "@/utils/toast";
import styles from "@/styles/dashboard.module.css";

const REDIRECT_DELAY_MS = 2000;

export default function RemediesPage() {
  const router = useRouter();
  const [remedies, setRemedies] = useState<RemedyRecommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'gemstones' | 'mantras' | 'fasting' | 'donations' | 'rituals'>('gemstones');

  const fetchRemedies = async () => {
    try {
      const token = localStorage.getItem("token")?.trim();
      if (!token) {
        router.push("/auth/login");
        return;
      }

      if (token.split(".").length !== 3) {
        setError("Invalid token format. Please login again.");
        localStorage.removeItem("token");
        setTimeout(() => router.push("/auth/login"), REDIRECT_DELAY_MS);
        return;
      }

      setLoading(true);
      const data = await remediesApi.getRecommendations(token);
      setRemedies(data);
      setError(null);
    } catch (err) {
      const error = err as { message?: string };
      const errorMessage = error.message || "Failed to load remedies";
      setError(errorMessage);
      showError(errorMessage);
      console.error("Error fetching remedies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRemedies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getRemedyIcon = (type: string) => {
    switch (type) {
      case 'gemstone':
        return '💎';
      case 'mantra':
        return '🕉️';
      case 'fasting':
        return '🌙';
      case 'donation':
        return '🙏';
      case 'ritual':
        return '🕯️';
      default:
        return '✨';
    }
  };

  const getRemedyColor = (type: string) => {
    switch (type) {
      case 'gemstone':
        return '#9333ea';
      case 'mantra':
        return '#3b82f6';
      case 'fasting':
        return '#10b981';
      case 'donation':
        return '#f59e0b';
      case 'ritual':
        return '#ec4899';
      default:
        return '#6b7280';
    }
  };

  const getActiveRemedies = () => {
    if (!remedies) return [];
    switch (activeTab) {
      case 'gemstones':
        return remedies.gemstones;
      case 'mantras':
        return remedies.mantras;
      case 'fasting':
        return remedies.fastingDays;
      case 'donations':
        return remedies.donations;
      case 'rituals':
        return remedies.rituals;
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <AppHeader />
        <div className={styles.dashboardContent}>
          <AppSidebar />
          <main className={styles.mainContent}>
            <div className={styles.loadingContainer}>
              <p>Loading your personalized remedies...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboardContainer}>
        <AppHeader />
        <div className={styles.dashboardContent}>
          <AppSidebar />
          <main className={styles.mainContent}>
            <div className={styles.errorContainer}>
              <p className={styles.errorText}>Error: {error}</p>
              <div className={styles.buttonGroup}>
                <button onClick={fetchRemedies} className={styles.backButton}>
                  🔄 Retry
                </button>
                <button onClick={() => router.push("/auth/login")} className={styles.backButton}>
                  Go to Login
                </button>
              </div>
            </div>
          </main>
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
          <div className={styles.pageHeader}>
            <button onClick={() => router.back()} className={styles.backButton}>
              ← Back
            </button>
            <button onClick={fetchRemedies} className={styles.refreshButton}>
              🔄 Refresh
            </button>
          </div>

          <div className={styles.kundliContainer}>
            <h1 className={styles.sectionTitle}>Astrological Remedies</h1>
            <p style={{ color: '#6b7280', marginBottom: '30px' }}>
              Personalized remedies and recommendations based on your birth chart to enhance positive energies and mitigate challenges.
            </p>

            {remedies && (
              <>
                <div className={styles.bestTimingCard}>
                  <h3 className={styles.cardTitle}>Best Timing for Remedies</h3>
                  <div className={styles.timingDetails}>
                    <div className={styles.timingItem}>
                      <strong>Day:</strong> {remedies.bestTiming.day}
                    </div>
                    <div className={styles.timingItem}>
                      <strong>Time:</strong> {remedies.bestTiming.time}
                    </div>
                    {remedies.bestTiming.tithi && (
                      <div className={styles.timingItem}>
                        <strong>Tithi:</strong> {remedies.bestTiming.tithi}
                      </div>
                    )}
                    {remedies.bestTiming.nakshatra && (
                      <div className={styles.timingItem}>
                        <strong>Nakshatra:</strong> {remedies.bestTiming.nakshatra}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.remediesTabs}>
                  <button
                    className={activeTab === 'gemstones' ? styles.activeRemedyTab : styles.remedyTab}
                    onClick={() => setActiveTab('gemstones')}
                    style={{ borderBottomColor: activeTab === 'gemstones' ? getRemedyColor('gemstone') : 'transparent' }}
                  >
                    💎 Gemstones ({remedies.gemstones.length})
                  </button>
                  <button
                    className={activeTab === 'mantras' ? styles.activeRemedyTab : styles.remedyTab}
                    onClick={() => setActiveTab('mantras')}
                    style={{ borderBottomColor: activeTab === 'mantras' ? getRemedyColor('mantra') : 'transparent' }}
                  >
                    🕉️ Mantras ({remedies.mantras.length})
                  </button>
                  <button
                    className={activeTab === 'fasting' ? styles.activeRemedyTab : styles.remedyTab}
                    onClick={() => setActiveTab('fasting')}
                    style={{ borderBottomColor: activeTab === 'fasting' ? getRemedyColor('fasting') : 'transparent' }}
                  >
                    🌙 Fasting ({remedies.fastingDays.length})
                  </button>
                  <button
                    className={activeTab === 'donations' ? styles.activeRemedyTab : styles.remedyTab}
                    onClick={() => setActiveTab('donations')}
                    style={{ borderBottomColor: activeTab === 'donations' ? getRemedyColor('donation') : 'transparent' }}
                  >
                    🙏 Donations ({remedies.donations.length})
                  </button>
                  <button
                    className={activeTab === 'rituals' ? styles.activeRemedyTab : styles.remedyTab}
                    onClick={() => setActiveTab('rituals')}
                    style={{ borderBottomColor: activeTab === 'rituals' ? getRemedyColor('ritual') : 'transparent' }}
                  >
                    🕯️ Rituals ({remedies.rituals.length})
                  </button>
                </div>

                <div className={styles.remediesList}>
                  {getActiveRemedies().length > 0 ? (
                    getActiveRemedies().map((remedy, index) => (
                      <div
                        key={index}
                        className={styles.remedyCard}
                        style={{ borderLeftColor: getRemedyColor(remedy.type) }}
                      >
                        <div className={styles.remedyHeader}>
                          <div className={styles.remedyIconName}>
                            <span className={styles.remedyIcon}>{getRemedyIcon(remedy.type)}</span>
                            <h4 className={styles.remedyName}>{remedy.name}</h4>
                          </div>
                        </div>
                        <p className={styles.remedyDescription}>{remedy.description}</p>
                        {(remedy.timing || remedy.frequency) && (
                          <div className={styles.remedyDetails}>
                            {remedy.timing && (
                              <div className={styles.remedyDetail}>
                                <strong>Timing:</strong> {remedy.timing}
                              </div>
                            )}
                            {remedy.frequency && (
                              <div className={styles.remedyDetail}>
                                <strong>Frequency:</strong> {remedy.frequency}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className={styles.noRemedies}>
                      <p>No {activeTab} recommendations available at this time.</p>
                      <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '10px' }}>
                        Consult an astrologer for personalized recommendations.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
