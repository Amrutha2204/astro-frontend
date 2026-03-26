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
import Image from "next/image";

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
  if (!value) {
    return "—";
  }
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      return value;
    }
    return d.toLocaleDateString(undefined, { dateStyle: "medium" });
  } catch {
    return value;
  }
}

function formatTime(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }
  return value;
}

function normalizeProfile(data: ApiUserDetails | null): ProfileDisplay | null {
  if (!data) {
    return null;
  }
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
  if (!n || n === "—") {
    return "?";
  }
  const parts = n.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
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
    if (!rehydrated) {
      return;
    }
    fetchProfile();
  }, [rehydrated, fetchProfile]);

  if (!rehydrated || (loading && !profile && !error)) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_15%_20%,#ffe7d6_0%,transparent_35%),radial-gradient(circle_at_85%_10%,#e0f2fe_0%,transparent_40%),radial-gradient(circle_at_80%_80%,#ede9fe_0%,transparent_40%),linear-gradient(135deg,#fffaf5_0%,#f8f4ff_50%,#f0f9ff_100%)] text-[var(--text-main)]">
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_20%,#ffe7d6_0%,transparent_35%),radial-gradient(circle_at_85%_10%,#e0f2fe_0%,transparent_40%),radial-gradient(circle_at_80%_80%,#ede9fe_0%,transparent_40%),linear-gradient(135deg,#fffaf5_0%,#f8f4ff_50%,#f0f9ff_100%)] text-[var(--text-main)]">
      <AppHeader />
      <div className="flex w-full">
        <AppSidebar />
        <main className="ml-[250px] h-[calc(100vh-50px)] w-full overflow-y-auto overflow-x-hidden bg-[var(--bg-main)] p-6 max-[768px]:ml-[200px]">
          <div className="relative mx-auto max-w-[1200px]">
            <PageHeader
              onBack={() => router.push("/dashboard")}
              backAriaLabel="Go back to dashboard"
              onTitleClick={fetchProfile}
              refreshLabel="🔄 Refresh"
              onRefresh={fetchProfile}
              refreshAriaLabel="Refresh profile"
              disableRefresh={loading}
            />

           <div className="mb-10 flex flex-col items-center">
  <div className="mb-2 text-[28px]">👤</div>

  <h1 className="text-[36px] font-extrabold bg-gradient-to-r from-[#7c3aed] via-[#ec4899] to-[#f59e0b] bg-clip-text text-transparent">
    Profile
  </h1>

  <p className="mt-1 text-[14px] text-[#6b7280]">
    Your personal cosmic identity ✨
  </p>
</div>

            {error && <ErrorMessage message={error} />}

            {profile && (
              <div className="mx-auto max-w-[720px]">
                <div className="mb-6 flex flex-wrap items-center gap-6 rounded-[24px] 
bg-gradient-to-r from-[#7c3aed] via-[#ec4899] to-[#f59e0b] 
px-9 py-8 text-white 
shadow-[0_12px_40px_rgba(124,58,237,0.35)]">
                  <div className="shrink-0">
                    <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-[20px] 
border border-white/40 
bg-white/20 backdrop-blur-md 
text-[32px] font-bold text-white 
shadow-[0_6px_20px_rgba(255,255,255,0.3)]">
                      {profile.profilePic ? (
                        <Image
                          src={profile.profilePic}
                          alt="Profile picture"
                          fill
                          sizes="80px"
                          className="object-cover"
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
                    className="mb-[18px] border-b border-b-[#f0ebe3] pb-[10px] text-[16px] font-semibold text-[#7c3aed]"
                  >
                    Account
                  </h2>
                  <div className="flex flex-col gap-[14px]">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <span className="min-w-[120px] text-[13px] font-semibold text-[#6b7280]">
                        Name
                      </span>
                      <span className="break-words text-right text-[15px] text-[#1f2937]">
                        {profile.name}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <span className="min-w-[120px] text-[13px] font-semibold text-[#6b7280]">
                        Email
                      </span>
                      <span className="break-words text-right text-[15px] text-[#1f2937]">
                        {profile.email}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <span className="min-w-[120px] text-[13px] font-semibold text-[#6b7280]">
                        Phone
                      </span>
                      <span
                        className={
                          profile.phoneNumber === "—"
                            ? "break-words text-right text-[15px] italic text-[#9c8b73]"
                            : "break-words text-right text-[15px] text-[#1f2937]"
                        }
                      >
                        {profile.phoneNumber}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <span className="min-w-[120px] text-[13px] font-semibold text-[#6b7280]">
                        Time zone
                      </span>
                      <span className="break-words text-right text-[15px] text-[#1f2937]">
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
                    className="mb-[18px] border-b border-b-[#f0ebe3] pb-[10px] text-[16px] font-semibold text-[#7c3aed]"
                  >
                    Birth details
                  </h2>
                  <div className="flex flex-col gap-[14px]">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <span className="min-w-[120px] text-[13px] font-semibold text-[#6b7280]">
                        Date of birth
                      </span>
                      <span className="break-words text-right text-[15px] text-[#1f2937]">
                        {profile.dob}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <span className="min-w-[120px] text-[13px] font-semibold text-[#6b7280]">
                        Birth place
                      </span>
                      <span className="break-words text-right text-[15px] text-[#1f2937]">
                        {profile.birthPlace}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <span className="min-w-[120px] text-[13px] font-semibold text-[#6b7280]">
                        Birth time
                      </span>
                      <span className="break-words text-right text-[15px] text-[#1f2937]">
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
                    className="mb-[18px] border-b border-b-[#f0ebe3] pb-[10px] text-[16px] font-semibold text-[#7c3aed]"
                  >
                    Account info
                  </h2>
                  <div className="flex flex-col gap-[14px]">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <span className="min-w-[120px] text-[13px] font-semibold text-[#6b7280]">
                        Member since
                      </span>
                      <span className="break-words text-right text-[15px] text-[#1f2937]">
                        {profile.createdAt}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <span className="min-w-[120px] text-[13px] font-semibold text-[#6b7280]">
                        Last updated
                      </span>
                      <span className="break-words text-right text-[15px] text-[#1f2937]">
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
