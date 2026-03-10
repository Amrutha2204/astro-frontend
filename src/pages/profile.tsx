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
import profileStyles from "@/styles/profile.module.css";
import Loading from "@/components/ui/Loading";
import ErrorMessage from "@/components/ui/ErrorMessage";

/** Raw API response: user-details with nested user */
type ApiUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  timezone?: string | null;
  profilePic?: string | null;
  roleId?: number;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type ApiUserDetails = {
  id?: string;
  guestName?: string | null;
  dob?: string | null;
  birthPlace?: string | null;
  birthTime?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  user?: ApiUser | null;
};

/** Normalized display shape */
type ProfileDisplay = {
  name: string;
  email: string;
  phoneNumber: string;
  timezone: string;
  profilePic: string | null;
  dob: string;
  birthPlace: string;
  birthTime: string;
  createdAt: string;
  updatedAt: string;
};

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString(undefined, { dateStyle: "medium" });
  } catch {
    return value;
  }
}

function formatTime(value: string | null | undefined): string {
  if (!value) return "—";
  return value;
}

function normalizeProfile(data: ApiUserDetails | null): ProfileDisplay | null {
  if (!data) return null;
  const u = data.user;
  const name = (u?.name ?? data.guestName ?? "").trim() || "—";
  return {
    name: name || "—",
    email: (u?.email ?? "").trim() || "—",
    phoneNumber: (u?.phoneNumber ?? "").trim() || "—",
    timezone: (u?.timezone ?? "").trim() || "—",
    profilePic: (u?.profilePic ?? "").trim() || null,
    dob: formatDate(data.dob),
    birthPlace: (data.birthPlace ?? "").trim() || "—",
    birthTime: formatTime(data.birthTime) || "—",
    createdAt: formatDate(data.createdAt ?? u?.createdAt),
    updatedAt: formatDate(data.updatedAt ?? u?.updatedAt),
  };
}

function getInitial(name: string): string {
  const n = (name || "").trim();
  if (!n || n === "—") return "?";
  const parts = n.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return n.slice(0, 2).toUpperCase();
}

const ProfilePage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const rehydrated = useSelector(selectIsRehydrated);
  const token = useSelector(selectToken);

  const [profile, setProfile] = useState<ProfileDisplay | null>(null);
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
      const data = await getUserDetails(t!) as ApiUserDetails;
      setProfile(normalizeProfile(data));
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

  if (!rehydrated || (loading && !profile && !error)) {
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

            <h1 className={profileStyles.pageTitle}>Profile</h1>

            {error && <ErrorMessage message={error} />}

            {profile && (
              <div className={profileStyles.wrapper}>
                <div className={profileStyles.profileHero}>
                  <div className={profileStyles.profileAvatarWrap}>
                    <div className={profileStyles.profileAvatar}>
                      {profile.profilePic ? (
                        <img src={profile.profilePic} alt="" />
                      ) : (
                        getInitial(profile.name)
                      )}
                    </div>
                  </div>
                  <div className={profileStyles.profileHeroInfo}>
                    <div className={profileStyles.profileHeroName}>{profile.name}</div>
                    <div className={profileStyles.profileHeroEmail}>{profile.email}</div>
                  </div>
                </div>

                <section className={profileStyles.section} aria-labelledby="account-heading">
                  <h2 id="account-heading" className={profileStyles.sectionTitle}>Account</h2>
                  <div className={profileStyles.infoList}>
                    <div className={profileStyles.infoRow}>
                      <span className={profileStyles.infoLabel}>Name</span>
                      <span className={profileStyles.infoValue}>{profile.name}</span>
                    </div>
                    <div className={profileStyles.infoRow}>
                      <span className={profileStyles.infoLabel}>Email</span>
                      <span className={profileStyles.infoValue}>{profile.email}</span>
                    </div>
                    <div className={profileStyles.infoRow}>
                      <span className={profileStyles.infoLabel}>Phone</span>
                      <span className={profile.phoneNumber === "—" ? profileStyles.infoValueEmpty : profileStyles.infoValue}>
                        {profile.phoneNumber}
                      </span>
                    </div>
                    <div className={profileStyles.infoRow}>
                      <span className={profileStyles.infoLabel}>Time zone</span>
                      <span className={profileStyles.infoValue}>{profile.timezone}</span>
                    </div>
                  </div>
                </section>

                <section className={profileStyles.section} aria-labelledby="birth-heading">
                  <h2 id="birth-heading" className={profileStyles.sectionTitle}>Birth details</h2>
                  <div className={profileStyles.infoList}>
                    <div className={profileStyles.infoRow}>
                      <span className={profileStyles.infoLabel}>Date of birth</span>
                      <span className={profileStyles.infoValue}>{profile.dob}</span>
                    </div>
                    <div className={profileStyles.infoRow}>
                      <span className={profileStyles.infoLabel}>Birth place</span>
                      <span className={profileStyles.infoValue}>{profile.birthPlace}</span>
                    </div>
                    <div className={profileStyles.infoRow}>
                      <span className={profileStyles.infoLabel}>Birth time</span>
                      <span className={profileStyles.infoValue}>{profile.birthTime}</span>
                    </div>
                  </div>
                </section>

                <section className={profileStyles.section} aria-labelledby="meta-heading">
                  <h2 id="meta-heading" className={profileStyles.sectionTitle}>Account info</h2>
                  <div className={profileStyles.infoList}>
                    <div className={profileStyles.infoRow}>
                      <span className={profileStyles.infoLabel}>Member since</span>
                      <span className={profileStyles.infoValue}>{profile.createdAt}</span>
                    </div>
                    <div className={profileStyles.infoRow}>
                      <span className={profileStyles.infoLabel}>Last updated</span>
                      <span className={profileStyles.infoValue}>{profile.updatedAt}</span>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
