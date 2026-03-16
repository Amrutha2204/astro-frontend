import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import PageHeader from "@/components/layout/PageHeader";
import { selectIsRehydrated, selectToken, clearToken } from "@/store/slices/authSlice";
import { isValidJwtFormat } from "@/utils/auth";
import { getUserDetails } from "@/services/userService";
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
      const data = (await getUserDetails(t!)) as ApiUserDetails;
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
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
        <AppHeader />
        <div className="flex w-full">
          <AppSidebar />
          <main className="ml-[250px] h-[calc(100vh-50px)] w-full overflow-y-auto overflow-x-hidden bg-[var(--bg-main)] p-6 max-[768px]:ml-[200px]">
            <Loading text="Loading your profile..." />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
      <AppHeader />
      <div className="flex w-full">
        <AppSidebar />
        <main className="ml-[250px] h-[calc(100vh-50px)] w-full overflow-y-auto overflow-x-hidden bg-[var(--bg-main)] p-6 max-[768px]:ml-[200px]">
          <div className="relative mx-auto max-w-[1200px]">
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

            <h1 className="mb-6 text-[28px] font-bold text-[#2d2a26]">Profile</h1>

            {error && <ErrorMessage message={error} />}

            {profile && (
              <div className="mx-auto max-w-[720px]">
                <div className="mb-6 flex flex-wrap items-center gap-6 rounded-[20px] bg-[linear-gradient(145deg,#2d2438_0%,#1a1625_50%,#15121c_100%)] px-9 py-8 text-white shadow-[0_12px_40px_rgba(0,0,0,0.2)]">
                  <div className="shrink-0">
                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[20px] border-[2px] border-[rgba(255,255,255,0.2)] bg-[linear-gradient(135deg,rgba(255,255,255,0.15)_0%,rgba(255,255,255,0.08)_100%)] text-[32px] font-bold text-white">
                      {profile.profilePic ? (
                        <img
                          src={profile.profilePic}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        getInitial(profile.name)
                      )}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 text-[24px] font-bold text-white">{profile.name}</div>
                    <div className="text-[15px] text-[#e8e4dc] opacity-90">{profile.email}</div>
                  </div>
                </div>

                <section
                  className="mb-5 rounded-[16px] border border-[#e8dfd2] bg-white px-7 py-6 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
                  aria-labelledby="account-heading"
                >
                  <h2
                    id="account-heading"
                    className="mb-[18px] border-b border-b-[#f0ebe3] pb-[10px] text-[16px] font-semibold text-[#6b4423]"
                  >
                    Account
                  </h2>
                  <div className="flex flex-col gap-[14px]">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <span className="min-w-[120px] text-[13px] font-semibold text-[#6b5b52]">
                        Name
                      </span>
                      <span className="break-words text-right text-[15px] text-[#2d2a26]">
                        {profile.name}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <span className="min-w-[120px] text-[13px] font-semibold text-[#6b5b52]">
                        Email
                      </span>
                      <span className="break-words text-right text-[15px] text-[#2d2a26]">
                        {profile.email}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <span className="min-w-[120px] text-[13px] font-semibold text-[#6b5b52]">
                        Phone
                      </span>
                      <span
                        className={
                          profile.phoneNumber === "—"
                            ? "break-words text-right text-[15px] italic text-[#9c8b73]"
                            : "break-words text-right text-[15px] text-[#2d2a26]"
                        }
                      >
                        {profile.phoneNumber}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <span className="min-w-[120px] text-[13px] font-semibold text-[#6b5b52]">
                        Time zone
                      </span>
                      <span className="break-words text-right text-[15px] text-[#2d2a26]">
                        {profile.timezone}
                      </span>
                    </div>
                  </div>
                </section>

                <section
                  className="mb-5 rounded-[16px] border border-[#e8dfd2] bg-white px-7 py-6 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
                  aria-labelledby="birth-heading"
                >
                  <h2
                    id="birth-heading"
                    className="mb-[18px] border-b border-b-[#f0ebe3] pb-[10px] text-[16px] font-semibold text-[#6b4423]"
                  >
                    Birth details
                  </h2>
                  <div className="flex flex-col gap-[14px]">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <span className="min-w-[120px] text-[13px] font-semibold text-[#6b5b52]">
                        Date of birth
                      </span>
                      <span className="break-words text-right text-[15px] text-[#2d2a26]">
                        {profile.dob}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <span className="min-w-[120px] text-[13px] font-semibold text-[#6b5b52]">
                        Birth place
                      </span>
                      <span className="break-words text-right text-[15px] text-[#2d2a26]">
                        {profile.birthPlace}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <span className="min-w-[120px] text-[13px] font-semibold text-[#6b5b52]">
                        Birth time
                      </span>
                      <span className="break-words text-right text-[15px] text-[#2d2a26]">
                        {profile.birthTime}
                      </span>
                    </div>
                  </div>
                </section>

                <section
                  className="mb-5 rounded-[16px] border border-[#e8dfd2] bg-white px-7 py-6 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
                  aria-labelledby="meta-heading"
                >
                  <h2
                    id="meta-heading"
                    className="mb-[18px] border-b border-b-[#f0ebe3] pb-[10px] text-[16px] font-semibold text-[#6b4423]"
                  >
                    Account info
                  </h2>
                  <div className="flex flex-col gap-[14px]">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <span className="min-w-[120px] text-[13px] font-semibold text-[#6b5b52]">
                        Member since
                      </span>
                      <span className="break-words text-right text-[15px] text-[#2d2a26]">
                        {profile.createdAt}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <span className="min-w-[120px] text-[13px] font-semibold text-[#6b5b52]">
                        Last updated
                      </span>
                      <span className="break-words text-right text-[15px] text-[#2d2a26]">
                        {profile.updatedAt}
                      </span>
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
