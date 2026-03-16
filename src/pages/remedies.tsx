import { useState, useEffect, useCallback, useRef } from "react";
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
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const remedyCategories = [
    { id: 'gemstone', name: 'Gemstones', emoji: '💎', color: '#9333ea', image: 'https://res.cloudinary.com/dmxmm7emu/image/upload/v1773319764/gemstone-card_mhfefz.jpg' },
    { id: 'mantra', name: 'Mantras', emoji: '🕉️', color: '#3b82f6', image: 'https://res.cloudinary.com/dmxmm7emu/image/upload/v1773319765/mantra-card_rlzlef.jpg' },
    { id: 'ritual', name: 'Rituals', emoji: '🕯️', color: '#ec4899', image: 'https://res.cloudinary.com/dmxmm7emu/image/upload/v1773319765/ritual-card_geae4r.jpg' },
    { id: 'donation', name: 'Donations', emoji: '🙏', color: '#f59e0b', image: 'https://res.cloudinary.com/dmxmm7emu/image/upload/v1773319763/donation-card_fpyp3d.jpg' },
    { id: 'fasting', name: 'Fasting', emoji: '🌙', color: '#10b981', image: 'https://res.cloudinary.com/dmxmm7emu/image/upload/v1773319764/fasting-card_arkw78.jpg' },
  ];

  const getRemedyIcon = (type: string) => {
    const category = remedyCategories.find(c => c.id === type);
    return category?.emoji || '✨';
  };

  const getRemedyColor = (type: string) => {
    const category = remedyCategories.find(c => c.id === type);
    return category?.color || '#6b7280';
  };

  const getCategoryData = (categoryId: string) => {
    if (!remedies) return [];
    switch (categoryId) {
      case 'gemstone':
        return remedies.gemstones;
      case 'mantra':
        return remedies.mantras;
      case 'ritual':
        return remedies.rituals;
      case 'donation':
        return remedies.donations;
      case 'fasting':
        return remedies.fastingDays;
      default:
        return [];
    }
  };

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

  const getDetailGridClass = (remedy: any) => {
    // For items with many properties, use fullWidth
    const propertyCount = [
      remedy.timing,
      remedy.frequency,
      remedy.duration,
      remedy.benefits,
      remedy.guidelines,
      remedy.items
    ].filter(Boolean).length;
    
    return propertyCount > 4 ? styles.fullWidth : '';
  };

  const getRemedyImagePath = (type: string, name: string) => {
    const lowerName = name?.toLowerCase().replace(/\s+/g, '-') || 'default';
    return `/images/remedies/${type}/${lowerName}.jpg`;
  };

  const getGemstoneColor = (name: string) => {
    const gemstoneColors: { [key: string]: { color: string; hex: string } } = {
      'emerald': { color: 'Emerald Green', hex: '#50C878' },
      'ruby': { color: 'Deep Red', hex: '#E0115F' },
      'sapphire': { color: 'Royal Blue', hex: '#0F52BA' },
      'diamond': { color: 'Colorless', hex: '#F0F8FF' },
      'pearl': { color: 'White', hex: '#FFFDD0' },
      'coral': { color: 'Coral Orange', hex: '#FF7F50' },
      'opal': { color: 'Rainbow White', hex: '#E8DAEF' },
      'topaz': { color: 'Golden Yellow', hex: '#FFC600' },
      'amethyst': { color: 'Purple', hex: '#9966CC' },
      'citrine': { color: 'Pale Yellow', hex: '#F1C40F' },
      'turquoise': { color: 'Turquoise', hex: '#40E0D0' },
      'garnet': { color: 'Deep Red', hex: '#DC143C' },
    };
    
    const lowerName = name?.toLowerCase() || 'diamond';
    return gemstoneColors[lowerName] || { color: 'Stone', hex: '#A9A9A9' };
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
            <p className={styles.remedyDescription}>
              Personalized remedies based on your birth chart details to enhance positive energies and mitigate challenges.
            </p>
            {error && <ErrorMessage message={error} />}

            {remedies && (
              <>
                <div className={styles.remediesGridContainer}>
                  {remedyCategories.map((category) => {
                    const count = getCategoryData(category.id).length;
                    return (
                      <button
                        key={category.id}
                        className={styles.remedyCategoryCard}
                        onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                        style={{
                          background: `linear-gradient(135deg, ${category.color}40 0%, ${category.color}20 100%)`
                        }}
                      >
                        <div className={styles.categoryCardImage}>
                          <img
                            src={category.image}
                            alt={category.name}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <div className={styles.categoryCardOverlay} />
                        </div>
                        <div className={styles.categoryCardContent}>
                          <h3 className={styles.categoryCardTitle}>{category.name}</h3>
                          <p className={styles.categoryCardCount}>{count} items</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {expandedCategory && (
                  <div className={styles.expandedCategorySection}>
                    <div className={styles.expandedCategoryHeader}>
                      <h2 className={styles.expandedCategoryTitle}>
                        {remedyCategories.find(c => c.id === expandedCategory)?.emoji}{' '}
                        {remedyCategories.find(c => c.id === expandedCategory)?.name}
                      </h2>
                      <button
                        className={styles.closeExpandButton}
                        onClick={() => setExpandedCategory(null)}
                      >
                        ✕
                      </button>
                    </div>
                    <div className={styles.itemsGridContainer}>
                      {getCategoryData(expandedCategory).map((remedy, index) => (
                        <button
                          key={`${expandedCategory}-${index}`}
                          className={styles.remedyItemCard}
                          onClick={() => setSelectedRemedy({
                            ...remedy,
                            uniqueKey: `${expandedCategory}-${index}`,
                            type: expandedCategory,
                            emoji: remedyCategories.find(c => c.id === expandedCategory)?.emoji || '✨'
                          })}
                          style={{
                            borderTopColor: getRemedyColor(expandedCategory)
                          }}
                        >
                          <p className={styles.remedyItemName}>{remedy.name}</p>
                          <p className={styles.remedyItemDescription}>
                            {remedy.description?.substring(0, 80)}...
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRemedy && (
                  <div className={styles.remedyModalOverlay} onClick={() => setSelectedRemedy(null)}>
                    <div className={styles.remedyModalContainer} onClick={(e) => e.stopPropagation()}>
                      <div className={styles.remedyDetailBox}>
                        <div className={styles.remedyImageSection}>
                          <img
                            src={getRemedyImagePath(selectedRemedy.type, selectedRemedy.name)}
                            alt={selectedRemedy.name}
                            className={styles.remedyImage}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>

                        {selectedRemedy.type === 'gemstone' && (
                          <div className={styles.gemstoneHeader}>
                            <div
                              className={styles.colorSwatch}
                              style={{
                                background: getGemstoneColor(selectedRemedy.name).hex,
                                boxShadow: `0 0 30px ${getGemstoneColor(selectedRemedy.name).hex}80`
                              }}
                            />
                            <div className={styles.gemstoneInfo}>
                              <p className={styles.colorLabel}>Stone Color</p>
                              <p className={styles.colorName}>
                                {getGemstoneColor(selectedRemedy.name).color}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        <div className={styles.remedyDetailHeader}>
                          <h3 className={styles.remedyDetailTitle}>
                            {selectedRemedy.emoji} {selectedRemedy.name}
                          </h3>
                          <button
  className={styles.closeButton}
  onClick={() => setSelectedRemedy(null)}
  aria-label="Close details"
  style={{ background: getRemedyColor(selectedRemedy.type) }}
>
                            ✕
                          </button>
                        </div>
                        <div className={styles.remedyDetailContent}>
                          {selectedRemedy.description && (
                            <div>
                              <p className={styles.remedyDetailDescription}>
                                {selectedRemedy.description}
                              </p>
                            </div>
                          )}
                          
                          {(selectedRemedy.timing || selectedRemedy.frequency || selectedRemedy.benefits || selectedRemedy.duration || selectedRemedy.guidelines || selectedRemedy.items) && (
                            <div className={`${styles.remedyDetailInfo} ${getDetailGridClass(selectedRemedy)}`}>
                              {selectedRemedy.timing && (
                                <div className={styles.detailItem}>
                                  <strong>⏰ Best Timing</strong>
                                  <span>{selectedRemedy.timing}</span>
                                </div>
                              )}
                              {selectedRemedy.frequency && (
                                <div className={styles.detailItem}>
                                  <strong>🔄 Frequency</strong>
                                  <span>{selectedRemedy.frequency}</span>
                                </div>
                              )}
                              {selectedRemedy.duration && (
                                <div className={styles.detailItem}>
                                  <strong>⏱️ Duration</strong>
                                  <span>{selectedRemedy.duration}</span>
                                </div>
                              )}
                              {selectedRemedy.benefits && (
                                <div className={styles.detailItem}>
                                  <strong>✨ Benefits</strong>
                                  <span>{selectedRemedy.benefits}</span>
                                </div>
                              )}
                              {selectedRemedy.guidelines && (
                                <div className={styles.detailItem}>
                                  <strong>📋 Guidelines</strong>
                                  <span>{selectedRemedy.guidelines}</span>
                                </div>
                              )}
                              {selectedRemedy.items && (
                                <div className={styles.detailItem}>
                                  <strong>📦 Items Needed</strong>
                                  <span>{selectedRemedy.items}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {selectedRemedy.type === 'gemstone' && selectedRemedy.descriptions && (
                            <div className={styles.remedyDetailSection}>
                              <p className={styles.remedyDetailHeading}>
                                💎 Gemstone Properties
                              </p>
                              <p className={styles.remedyDetailText}>
                                {selectedRemedy.descriptions}
                              </p>
                            </div>
                          )}

                          {selectedRemedy.type === 'mantra' && selectedRemedy.descriptions && (
                            <div style={{ marginTop: '8px', paddingTop: '16px', borderTop: '1px solid rgba(107, 68, 35, 0.1)' }}>
                              <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b4423', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                🕉️ Mantra Details
                              </p>
                              <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.6', fontStyle: 'italic' }}>
                                {selectedRemedy.descriptions}
                              </p>
                            </div>
                          )}

                          {selectedRemedy.type === 'donation' && selectedRemedy.descriptions && (
                            <div style={{ marginTop: '8px', paddingTop: '16px', borderTop: '1px solid rgba(107, 68, 35, 0.1)' }}>
                              <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b4423', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                🙏 Donation Purpose
                              </p>
                              <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.6' }}>
                                {selectedRemedy.descriptions}
                              </p>
                            </div>
                          )}

                          {selectedRemedy.type === 'ritual' && selectedRemedy.descriptions && (
                            <div style={{ marginTop: '8px', paddingTop: '16px', borderTop: '1px solid rgba(107, 68, 35, 0.1)' }}>
                              <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b4423', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                🕯️ Ritual Steps
                              </p>
                              <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.6' }}>
                                {selectedRemedy.descriptions}
                              </p>
                            </div>
                          )}

                          {selectedRemedy.type === 'fasting' && selectedRemedy.descriptions && (
                            <div style={{ marginTop: '8px', paddingTop: '16px', borderTop: '1px solid rgba(107, 68, 35, 0.1)' }}>
                              <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b4423', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                🌙 Fasting Guidelines
                              </p>
                              <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.6' }}>
                                {selectedRemedy.descriptions}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
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
