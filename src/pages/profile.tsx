import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import PageHeader from "@/components/layout/PageHeader";
import { selectIsRehydrated, selectToken, clearToken } from "@/store/slices/authSlice";
import { isValidJwtFormat } from "@/utils/auth";
import { getUserDetails } from "@/services/userService";
import styles from "@/styles/dashboard.module.css";
import Loading from "@/components/ui/Loading";
import ErrorMessage from "@/components/ui/ErrorMessage";

type UserDetails = {
  name?: string | null;
  email?: string | null;
  dob?: string | null;
  birthPlace?: string | null;
  birthTime?: string | null;
  timezone?: string | null;
};

const ProfilePage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const rehydrated = useSelector(selectIsRehydrated);
  const token = useSelector(selectToken);

  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    const t = token?.trim();
    if (!isValidJwtFormat(t)) {
      dispatch(clearToken());
      router.replace("/auth/login");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getUserDetails(t!);
      setUser(data as UserDetails);
    } catch (e) {
      const err = e as { message?: string };
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [token, dispatch, router]);

  useEffect(() => {
    if (!rehydrated) return;
    fetchProfile();
  }, [rehydrated, fetchProfile]);

  if (!rehydrated || (loading && !user && !error)) {
    return (
      <div className={styles.dashboardContainer}>
        <AppHeader />
        <div className={styles.dashboardContent}>
          <AppSidebar />
          <main className={styles.mainContent}>
            <Loading text="Loading your profile..." />
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
              title="Profile"
              onBack={() => router.push("/dashboard")}
              backAriaLabel="Go back to dashboard"
              onTitleClick={fetchProfile}
              refreshLabel="🔄 Refresh"
              onRefresh={fetchProfile}
              refreshAriaLabel="Refresh profile"
              disableRefresh={loading}
            />

            <h1 className={styles.pageTitle}>Profile</h1>

            {error && <ErrorMessage message={error} />}

            {user && (
              <div className={styles.kundliContent}>
                <div className={styles.kundliSection}>
                  <h2 className={styles.sectionTitle}>Account</h2>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Name</span>
                      <span className={styles.infoContent}>{user.name || "—"}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Email</span>
                      <span className={styles.infoValue}>{user.email || "—"}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.kundliSection}>
                  <h2 className={styles.sectionTitle}>Birth details</h2>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Date of birth</span>
                      <span className={styles.infoValue}>{user.dob || "—"}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Birth place</span>
                      <span className={styles.infoValue}>{user.birthPlace || "—"}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Birth time</span>
                      <span className={styles.infoValue}>{user.birthTime || "—"}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Time zone</span>
                      <span className={styles.infoValue}>{user.timezone || "—"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;

