import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import PageHeader from "@/components/layout/PageHeader";
import { remediesApi, RemedyRecommendations } from "@/services/remediesService";
import { selectToken, selectIsRehydrated, clearToken } from "@/store/slices/authSlice";
import styles from "@/styles/dashboard.module.css";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Loading from "@/components/ui/Loading";

const REDIRECT_DELAY_MS = 2000;

export default function RemediesPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const rehydrated = useSelector(selectIsRehydrated);
  const token = useSelector(selectToken);
  const [remedies, setRemedies] = useState<RemedyRecommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'gemstones' | 'mantras' | 'fasting' | 'donations' | 'rituals'>('gemstones');

  const fetchRemedies = useCallback(async () => {
    const t = token?.trim();
    if (!t || t.split(".").length !== 3) {
      dispatch(clearToken());
      setTimeout(() => router.push("/auth/login"), REDIRECT_DELAY_MS);
      return;
    }
    try {
      setLoading(true);
      const data = await remediesApi.getRecommendations(t);
      setRemedies(data);
      setError(null);
    } catch (err) {
      const e = err as { message?: string };
      const msg = e.message || "Failed to load remedies";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [token, dispatch, router]);

  useEffect(() => {
    if (!rehydrated) return;
    if (!token?.trim() || token.trim().split(".").length !== 3) {
      dispatch(clearToken());
      setTimeout(() => router.push("/auth/login"), REDIRECT_DELAY_MS);
      return;
    }
    fetchRemedies();
  }, [rehydrated, token, dispatch, router, fetchRemedies]);

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
            <Loading text="Loading your Remedies.."/>
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
          <div className={styles.kundliContainer}>
            <PageHeader
              onBack={() => router.back()}
              onRefresh={fetchRemedies}
              refreshAriaLabel="Refresh remedies"
              disableRefresh={loading}
            />
            <h1 className={styles.sectionTitle}>Astrological Remedies</h1>
            {error && <ErrorMessage message={error} />}
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
