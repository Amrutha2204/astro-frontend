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
  const [selectedRemedy, setSelectedRemedy] = useState<any>(null);

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

                <div className={styles.remedySection}>
                  <div className={styles.remedySectionHeader}>
                    <h2 className={styles.remedySectionTitle}>💎 Gemstones</h2>
                    <span className={styles.remedyCount}>{remedies.gemstones.length} items</span>
                  </div>
                  <div className={styles.remedyButtonContainer}>
                    {remedies.gemstones.length > 0 ? (
                      remedies.gemstones.map((remedy, index) => (
                        <button
                          key={`gemstone-${index}`}
                          className={`${styles.remedyButton} ${selectedRemedy?.uniqueKey === `gemstone-${index}` ? styles.activeRemedyButton : ''}`}
                          onClick={() => setSelectedRemedy({...remedy, uniqueKey: `gemstone-${index}`, type: 'gemstone', emoji: '💎'})}
                          style={{
                            borderColor: getRemedyColor('gemstone'),
                            backgroundColor: selectedRemedy?.uniqueKey === `gemstone-${index}` ? getRemedyColor('gemstone') : 'transparent',
                            color: selectedRemedy?.uniqueKey === `gemstone-${index}` ? '#fff' : getRemedyColor('gemstone'),
                          }}
                        >
                          💎 {remedy.name}
                        </button>
                      ))
                    ) : (
                      <p className={styles.noItems}>No gemstone recommendations</p>
                    )}
                  </div>
                </div>

                <div className={styles.remedySection}>
                  <div className={styles.remedySectionHeader}>
                    <h2 className={styles.remedySectionTitle}>🕉️ Mantras</h2>
                    <span className={styles.remedyCount}>{remedies.mantras.length} items</span>
                  </div>
                  <div className={styles.remedyButtonContainer}>
                    {remedies.mantras.length > 0 ? (
                      remedies.mantras.map((remedy, index) => (
                        <button
                          key={`mantra-${index}`}
                          className={`${styles.remedyButton} ${selectedRemedy?.uniqueKey === `mantra-${index}` ? styles.activeRemedyButton : ''}`}
                          onClick={() => setSelectedRemedy({...remedy, uniqueKey: `mantra-${index}`, type: 'mantra', emoji: '🕉️'})}
                          style={{
                            borderColor: getRemedyColor('mantra'),
                            backgroundColor: selectedRemedy?.uniqueKey === `mantra-${index}` ? getRemedyColor('mantra') : 'transparent',
                            color: selectedRemedy?.uniqueKey === `mantra-${index}` ? '#fff' : getRemedyColor('mantra'),
                          }}
                        >
                          🕉️ {remedy.name}
                        </button>
                      ))
                    ) : (
                      <p className={styles.noItems}>No mantra recommendations</p>
                    )}
                  </div>
                </div>

                <div className={styles.remedySection}>
                  <div className={styles.remedySectionHeader}>
                    <h2 className={styles.remedySectionTitle}>🌙 Fasting</h2>
                    <span className={styles.remedyCount}>{remedies.fastingDays.length} items</span>
                  </div>
                  <div className={styles.remedyButtonContainer}>
                    {remedies.fastingDays.length > 0 ? (
                      remedies.fastingDays.map((remedy, index) => (
                        <button
                          key={`fasting-${index}`}
                          className={`${styles.remedyButton} ${selectedRemedy?.uniqueKey === `fasting-${index}` ? styles.activeRemedyButton : ''}`}
                          onClick={() => setSelectedRemedy({...remedy, uniqueKey: `fasting-${index}`, type: 'fasting', emoji: '🌙'})}
                          style={{
                            borderColor: getRemedyColor('fasting'),
                            backgroundColor: selectedRemedy?.uniqueKey === `fasting-${index}` ? getRemedyColor('fasting') : 'transparent',
                            color: selectedRemedy?.uniqueKey === `fasting-${index}` ? '#fff' : getRemedyColor('fasting'),
                          }}
                        >
                          🌙 {remedy.name}
                        </button>
                      ))
                    ) : (
                      <p className={styles.noItems}>No fasting recommendations</p>
                    )}
                  </div>
                </div>

                <div className={styles.remedySection}>
                  <div className={styles.remedySectionHeader}>
                    <h2 className={styles.remedySectionTitle}>🙏 Donations</h2>
                    <span className={styles.remedyCount}>{remedies.donations.length} items</span>
                  </div>
                  <div className={styles.remedyButtonContainer}>
                    {remedies.donations.length > 0 ? (
                      remedies.donations.map((remedy, index) => (
                        <button
                          key={`donation-${index}`}
                          className={`${styles.remedyButton} ${selectedRemedy?.uniqueKey === `donation-${index}` ? styles.activeRemedyButton : ''}`}
                          onClick={() => setSelectedRemedy({...remedy, uniqueKey: `donation-${index}`, type: 'donation', emoji: '🙏'})}
                          style={{
                            borderColor: getRemedyColor('donation'),
                            backgroundColor: selectedRemedy?.uniqueKey === `donation-${index}` ? getRemedyColor('donation') : 'transparent',
                            color: selectedRemedy?.uniqueKey === `donation-${index}` ? '#fff' : getRemedyColor('donation'),
                          }}
                        >
                          🙏 {remedy.name}
                        </button>
                      ))
                    ) : (
                      <p className={styles.noItems}>No donation recommendations</p>
                    )}
                  </div>
                </div>

                <div className={styles.remedySection}>
                  <div className={styles.remedySectionHeader}>
                    <h2 className={styles.remedySectionTitle}>🕯️ Rituals</h2>
                    <span className={styles.remedyCount}>{remedies.rituals.length} items</span>
                  </div>
                  <div className={styles.remedyButtonContainer}>
                    {remedies.rituals.length > 0 ? (
                      remedies.rituals.map((remedy, index) => (
                        <button
                          key={`ritual-${index}`}
                          className={`${styles.remedyButton} ${selectedRemedy?.uniqueKey === `ritual-${index}` ? styles.activeRemedyButton : ''}`}
                          onClick={() => setSelectedRemedy({...remedy, uniqueKey: `ritual-${index}`, type: 'ritual', emoji: '🕯️'})}
                          style={{
                            borderColor: getRemedyColor('ritual'),
                            backgroundColor: selectedRemedy?.uniqueKey === `ritual-${index}` ? getRemedyColor('ritual') : 'transparent',
                            color: selectedRemedy?.uniqueKey === `ritual-${index}` ? '#fff' : getRemedyColor('ritual'),
                          }}
                        >
                          🕯️ {remedy.name}
                        </button>
                      ))
                    ) : (
                      <p className={styles.noItems}>No ritual recommendations</p>
                    )}
                  </div>
                </div>

                {selectedRemedy && (
                  <div className={styles.remedyDetailBox}>
                    <div className={styles.remedyDetailHeader}>
                      <h3 className={styles.remedyDetailTitle}>{selectedRemedy.emoji} {selectedRemedy.name}</h3>
                      <button
                        className={styles.closeButton}
                        onClick={() => setSelectedRemedy(null)}
                        aria-label="Close details"
                      >
                        ✕
                      </button>
                    </div>
                    <div className={styles.remedyDetailContent}>
                      <p className={styles.remedyDetailDescription}>{selectedRemedy.description}</p>
                      {(selectedRemedy.timing || selectedRemedy.frequency) && (
                        <div className={styles.remedyDetailInfo}>
                          {selectedRemedy.timing && (
                            <div className={styles.detailItem}>
                              <strong>Timing:</strong>
                              <span>{selectedRemedy.timing}</span>
                            </div>
                          )}
                          {selectedRemedy.frequency && (
                            <div className={styles.detailItem}>
                              <strong>Frequency:</strong>
                              <span>{selectedRemedy.frequency}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
