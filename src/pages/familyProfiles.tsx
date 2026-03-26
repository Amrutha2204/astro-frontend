import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFamilyProfiles,
  createFamilyProfile,
  updateFamilyProfile,
  deleteFamilyProfile,
} from "@/services/familyService";
import { type FamilyProfile, type CreateFamilyProfilePayload } from "@/data/family";
import { astroApi } from "@/services/api";
import { horoscopeApi, type DailyHoroscopeResponse } from "@/services/horoscopeService";
import AppSidebar from "@/components/layout/AppSidebar";
import AppHeader from "@/components/layout/AppHeader";
import DatePickerField from "@/components/ui/DatePickerField";
import TimePickerField from "@/components/ui/TimePickerField";
import PlaceAutocomplete from "@/components/ui/PlaceAutocomplete";
import Loading from "@/components/ui/Loading";
import {
  selectToken,
  selectIsRehydrated,
  selectIsGuest,
  clearToken,
} from "@/store/slices/authSlice";
import { isValidJwtFormat } from "@/utils/auth";

type MemberKundli = {
  lagna?: string;
  moonSign?: string;
  sunSign?: string;
  nakshatra?: string;
  pada?: string;
};

type MemberCalendar = {
  date?: string;
  tithi?: string;
  nakshatra?: string;
};

const MAX_FREE_MEMBERS = 4;

export default function FamilyProfiles() {
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch();
  const rehydrated = useSelector(selectIsRehydrated);
  const isGuest = useSelector(selectIsGuest);
  const token = useSelector(selectToken) ?? "";

  const [profiles, setProfiles] = useState<FamilyProfile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<CreateFamilyProfilePayload>({
    name: "",
    dob: "",
    birthPlace: "",
    birthTime: "",
    relation: "",
  });

  const [formError, setFormError] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const primaryButtonClass =
  "rounded-[14px] bg-gradient-to-r from-[#7c3aed] via-[#ec4899] to-[#f59e0b] px-6 py-3 text-[14px] font-bold text-white shadow-[0_8px_22px_rgba(236,72,153,0.35)] transition-all duration-200 hover:-translate-y-[2px] active:scale-95 hover:shadow-[0_14px_32px_rgba(124,58,237,0.45)] disabled:cursor-not-allowed disabled:opacity-60";

  const [selectedMemberData, setSelectedMemberData] = useState<{
    kundli?: MemberKundli;
    calendar?: MemberCalendar;
    dailyHoroscope?: DailyHoroscopeResponse;
    name?: string;
  } | null>(null);

  const [loadingMemberData, setLoadingMemberData] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Auth redirect
  useEffect(() => {
    if (!rehydrated) {
      return;
    }
    if (isGuest || !isValidJwtFormat(token)) {
      dispatch(clearToken());
      router.replace("/auth/login");
    }
  }, [rehydrated, isGuest, token, dispatch, router]);

  // Load profiles
  const loadProfiles = useCallback(async () => {
    if (!isValidJwtFormat(token)) {
      return;
    }
    try {
      setProfilesLoading(true);
      const data = await fetchFamilyProfiles(token);
      setProfiles(data);
    } catch (error) {
      console.error(error);
    } finally {
      setProfilesLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!rehydrated || isGuest || !isValidJwtFormat(token)) {
      return;
    }
    loadProfiles();
  }, [rehydrated, isGuest, token, loadProfiles]);

  // Toast
  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Validation
  const validateForm = () => {
    if (!form.name.trim()) {
      return "Name is required";
    }
    if (!form.dob) {
      return "Date of Birth is required";
    }
    if (!form.birthPlace.trim()) {
      return "Birth Place is required";
    }
    return null;
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingId && profiles.length >= MAX_FREE_MEMBERS) {
      setShowSubscribeModal(true);
      return;
    }

    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      if (editingId) {
        await updateFamilyProfile(editingId, form, token);
        showSuccessToast("Profile updated successfully!");
        setEditingId(null);
      } else {
        await createFamilyProfile(form, token);
        showSuccessToast("Profile added successfully!");
      }

      setForm({
        name: "",
        dob: "",
        birthPlace: "",
        birthTime: "",
        relation: "",
      });

      loadProfiles();
    } catch (error) {
      console.error(error);
      setFormError("Unable to save profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (profile: FamilyProfile) => {
    setEditingId(profile.id);
    setForm({
      name: profile.name,
      dob: profile.dob,
      birthPlace: profile.birthPlace,
      birthTime: profile.birthTime || "",
      relation: profile.relation || "",
    });
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) {
      return;
    }
    try {
      await deleteFamilyProfile(deleteId, token);
      showSuccessToast("Profile deleted successfully!");
      loadProfiles();
    } catch {
      setErrorMessage("Failed to delete profile.");
      setShowErrorModal(true);
    } finally {
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  const viewMemberData = async (profile: FamilyProfile) => {
    if (!profile.dob || !profile.birthPlace) {
      setErrorMessage("DOB and Birth Place are required.");
      setShowErrorModal(true);
      return;
    }

    setSelectedMemberData({ name: profile.name });
    setLoadingMemberData(true);
    setShowModal(true);

    try {
      const kundli = await astroApi.getGuestKundli({
        dob: profile.dob,
        birthTime: profile.birthTime || "00:00",
        placeOfBirth: profile.birthPlace,
        unknownTime: !profile.birthTime,
      });

      const calendar = await astroApi.getGuestCalendar(profile.birthPlace);

      const dailyHoroscope = await horoscopeApi.getDailyHoroscopeGuest({
        dob: profile.dob,
        birthTime: profile.birthTime || "00:00",
        placeOfBirth: profile.birthPlace,
      });

      setSelectedMemberData({
        kundli: kundli
          ? {
              ...kundli,
              pada: kundli.pada !== null ? String(kundli.pada) : undefined,
            }
          : undefined,
        calendar,
        dailyHoroscope,
        name: profile.name,
      });
    } catch {
      setErrorMessage("Failed to fetch astrology data.");
      setShowErrorModal(true);
      setShowModal(false);
    } finally {
      setLoadingMemberData(false);
    }
  };

  if (!rehydrated) {
    return null;
  }

  const getInitial = (name: string) => (name && name[0] ? name[0].toUpperCase() : "?");

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_20%,#ffe7d6_0%,transparent_35%),radial-gradient(circle_at_85%_10%,#e0f2fe_0%,transparent_40%),radial-gradient(circle_at_80%_80%,#ede9fe_0%,transparent_40%),linear-gradient(135deg,#fffaf5_0%,#f8f4ff_50%,#f0f9ff_100%)] text-[var(--text-main)]">
      <AppHeader />
      <div className="flex w-full">
        <AppSidebar />
        <main className="ml-[250px] h-[calc(100vh-50px)] w-full overflow-y-auto overflow-x-hidden bg-[var(--bg-main)] p-6 max-[768px]:ml-[200px]">
          <div className="relative mx-auto max-w-[1200px]">
            <div className="mx-auto max-w-[920px]">
              <div className="mb-10 text-center">
  <h1 className="text-[36px] font-extrabold tracking-tight bg-gradient-to-r from-[#7c3aed] via-[#ec4899] to-[#f59e0b] bg-clip-text text-transparent drop-shadow-sm">
    Family Profiles ✨
  </h1>
  <p className="mt-2 text-[14px] text-gray-500">
    Manage your loved ones' astrology insights
  </p>
  <span className="mt-2 inline-block text-[13px] font-medium text-gray-600">
    {profiles.length} / {MAX_FREE_MEMBERS} members
  </span>
</div>

              <div className="mb-7 rounded-[20px] border border-white/40 bg-white/70 px-8 py-7 shadow-[0_10px_30px_rgba(139,94,52,0.12)] backdrop-blur-[10px]">
                <h2 className="mb-5 border-b border-b-[#f0ebe3] pb-3 text-[18px] font-semibold text-[#2d2a26]">
                  {editingId ? "Edit member" : "Add family member"}
                </h2>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-x-5 gap-y-4">
                    <div className="flex flex-col gap-[6px]">
                      <label className="text-[13px] font-semibold text-[#4a4238]" htmlFor="fp-name">
                        Name *
                      </label>
                      <input
                        id="fp-name"
                        className="rounded-[12px] border border-[#e5e7eb] bg-white px-[14px] py-3 text-[14px] text-[#1f2937] placeholder:text-[#9ca3af] focus:border-[#7c3aed] focus:outline-none focus:ring-[3px] focus:ring-[rgba(124,58,237,0.15)] transition"
                        placeholder="Full name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col gap-[6px]">
                      <label className="text-[13px] font-semibold text-[#4a4238]" htmlFor="fp-dob">
                        Date of birth *
                      </label>
                      <DatePickerField
                        id="fp-dob"
                        value={form.dob}
                        onChange={(v) => setForm({ ...form, dob: v })}
                        placeholder="dd/mm/yyyy"
                        aria-label="Date of birth"
                      />
                    </div>
                    <div className="flex flex-col gap-[6px]">
                      <label
                        className="text-[13px] font-semibold text-[#4a4238]"
                        htmlFor="fp-place"
                      >
                        Birth place *
                      </label>
                      <PlaceAutocomplete
                        id="fp-place"
                        value={form.birthPlace}
                        onChange={(v) => setForm({ ...form, birthPlace: v })}
                        placeholder="e.g. Mumbai, Maharashtra, India or town/village"
                        aria-label="Birth place"
                      />
                    </div>
                    <div className="flex flex-col gap-[6px]">
                      <label className="text-[13px] font-semibold text-[#4a4238]" htmlFor="fp-time">
                        Birth time
                      </label>
                      <TimePickerField
                        id="fp-time"
                        value={form.birthTime ?? ""}
                        onChange={(v) => setForm({ ...form, birthTime: v })}
                        placeholder="--:--"
                        aria-label="Birth time"
                      />
                    </div>
                    <div className="flex flex-col gap-[6px]">
                      <label
                        className="text-[13px] font-semibold text-[#4a4238]"
                        htmlFor="fp-relation"
                      >
                        Relation
                      </label>
                      <input
                        id="fp-relation"
                        className="rounded-[12px] border border-[#e5e7eb] bg-white px-[14px] py-3 text-[14px] text-[#1f2937] placeholder:text-[#9ca3af] focus:border-[#7c3aed] focus:outline-none focus:ring-[3px] focus:ring-[rgba(124,58,237,0.15)] transition"
                        placeholder="e.g. Mother, Father"
                        value={form.relation}
                        onChange={(e) => setForm({ ...form, relation: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-4">
                    <button
                      type="submit"
                      className={primaryButtonClass}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving…" : editingId ? "Update profile" : "Add member"}
                    </button>
                    {formError && <p className="m-0 text-[14px] text-[#b91c1c]">{formError}</p>}
                  </div>
                </form>
                {profiles.length >= MAX_FREE_MEMBERS && (
                  <>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[#f0dcc4] bg-[linear-gradient(135deg,#fffbf5_0%,#fef7ed_100%)] px-[22px] py-[18px]">
                      <p className="m-0 text-[14px] font-medium text-[#4a4238]">
                        Upgrade to add more members.
                      </p>
                      <button
                        type="button"
                        className={primaryButtonClass}
                        onClick={() => setShowSubscribeModal(true)}
                      >
                        Subscribe
                      </button>
                    </div>
                    <p className="mb-0 mt-[10px] text-[13px] text-[#b45309]">
                      Free plan allows only {MAX_FREE_MEMBERS} family members.
                    </p>
                  </>
                )}
              </div>

              <h2 className="mb-4 text-[18px] font-semibold text-[#2d2a26]">Members</h2>
              {profilesLoading ? (
                <div className="flex min-h-[280px] items-center justify-center">
                  <Loading text="Loading family profiles..." variant="page" />
                </div>
              ) : profiles.length === 0 ? (
                <div className="rounded-[12px] border border-[#e5e7eb] bg-white px-[14px] py-3 text-[14px] text-[#1f2937] placeholder:text-[#9ca3af] focus:border-[#7c3aed] focus:outline-none focus:ring-[3px] focus:ring-[rgba(124,58,237,0.15)] transition">
                  <div className="mb-4 text-[48px] opacity-60">👨‍👩‍👧‍👦</div>
                  <div className="mb-2 text-[18px] font-semibold text-[#4a4238]">
                    No family members yet
                  </div>
                  <p className="mx-auto m-0 max-w-[320px] text-[14px] text-[#6b5b52]">
                    Add a member above with name, date of birth, and birth place to view their
                    Kundli and horoscope.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[18px]">
                  {profiles.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-[18px] border border-white/40 bg-white/70 backdrop-blur-[8px] px-6 py-[22px] shadow-[0_8px_28px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-[4px] hover:shadow-[0_18px_40px_rgba(124,58,237,0.25)]"
                    >
                      <div className="mb-[14px] flex items-start justify-between gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white shadow-md">
                          {getInitial(p.name)}
                        </div>
                        <div className="text-[18px] font-semibold leading-[1.3] text-[#2d2a26]">
                          {p.name}
                        </div>
                      </div>
                      <div className="mb-4 flex flex-col gap-2">
                        {p.relation && (
                          <div className="flex items-baseline gap-2 text-[14px] text-[#4a4238]">
                            <span className="min-w-[70px] font-semibold text-[#6b5b52]">
                              Relation
                            </span>
                            <span>{p.relation}</span>
                          </div>
                        )}
                        <div className="flex items-baseline gap-2 text-[14px] text-[#4a4238]">
                          <span className="min-w-[70px] font-semibold text-[#6b5b52]">
                            Birth place
                          </span>
                          <span className="min-w-0 break-words" title={p.birthPlace}>
                            {p.birthPlace}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2 text-[14px] text-[#4a4238]">
                          <span className="min-w-[70px] font-semibold text-[#6b5b52]">DOB</span>
                          <span>{p.dob}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 border-t border-t-[#f0ebe3] pt-[14px]">
                        <button
                          type="button"
                          className="rounded-[12px] border border-[#e5e7eb] bg-white/80 backdrop-blur-[12px] px-[14px] py-3 text-[14px] text-[#1f2937] placeholder:text-[#9ca3af] focus:border-[#7c3aed] focus:outline-none focus:ring-[3px] focus:ring-[rgba(124,58,237,0.15)] transition"
                          onClick={() => handleEdit(p)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="rounded-[8px] border border-[#fecaca] bg-[#fef2f2] px-[14px] py-2 text-[13px] font-medium text-[#b91c1c] transition-colors duration-200 hover:bg-[#fee2e2]"
                          onClick={() => handleDeleteClick(p.id)}
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          className={primaryButtonClass}
                          onClick={() => viewMemberData(p)}
                        >
                          View astrology
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(0,0,0,0.45)] p-5">
          <div className="relative w-full max-w-[420px] rounded-[16px] bg-white/80 backdrop-blur-[12px] px-8 py-7 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
            <h3 className="mb-3 text-center text-[20px] font-semibold text-[#2d2a26]">
              Delete member?
            </h3>
            <p className="mb-6 text-center text-[15px] leading-[1.5] text-[#4a4238]">
              This cannot be undone.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                className="rounded-[10px] border border-[#e0d4c4] bg-[#f5f0e8] px-5 py-[10px] text-[14px] font-semibold text-[#4a4238] transition-colors duration-200 hover:bg-[#ebe4d8]"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-[10px] bg-[#b91c1c] px-5 py-[10px] text-[14px] font-semibold text-white transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#991b1b]"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(0,0,0,0.45)] p-5">
          <div className="relative w-full max-w-[420px] rounded-[16px] bg-white/80 backdrop-blur-[12px] px-8 py-7 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
            <h3 className="mb-3 text-center text-[20px] font-semibold text-[#2d2a26]">Error</h3>
            <p className="mb-6 text-center text-[15px] leading-[1.5] text-[#4a4238]">
              {errorMessage}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                className="rounded-[10px] border-none bg-[linear-gradient(135deg,#7d5a3c_0%,#6b4423_100%)] px-5 py-[10px] text-[14px] font-semibold text-white shadow-[0_2px_8px_rgba(107,68,35,0.25)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(107,68,35,0.3)]"
                onClick={() => setShowErrorModal(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(0,0,0,0.45)] p-5">
          <div className="relative max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-[16px] bg-white/80 backdrop-blur-[12px] px-8 py-7 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
            <button
              type="button"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-[10px] border-none bg-[#f5f0e8] text-[22px] leading-none text-[#4a4238] transition-colors duration-200 hover:bg-[#e8dfd2]"
              onClick={() => {
                setShowModal(false);
                setSelectedMemberData(null);
              }}
              aria-label="Close"
            >
              ×
            </button>
            <h3 className="mb-3 text-center text-[20px] font-semibold text-[#2d2a26]">
              {selectedMemberData?.name ?? "Member"}&apos;s astrology
            </h3>
            {loadingMemberData ? (
              <div className="flex min-h-[280px] items-center justify-center">
                <Loading text="Loading Kundli & horoscope..." variant="page" />
              </div>
            ) : selectedMemberData ? (
              <div>
                <div className="mb-[22px]">
                  <h4 className="mb-[10px] border-b border-b-[#f0ebe3] pb-[6px] text-[14px] font-semibold text-[#6b4423]">
                    Kundli
                  </h4>
                  <ul className="m-0 list-none p-0">
                    <li className="flex justify-between gap-3 border-b border-b-[#f5f0e8] py-2 text-[14px] text-[#4a4238]">
                      <strong className="font-semibold text-[#2d2a26]">Lagna</strong>{" "}
                      {selectedMemberData.kundli?.lagna ?? "—"}
                    </li>
                    <li className="flex justify-between gap-3 border-b border-b-[#f5f0e8] py-2 text-[14px] text-[#4a4238]">
                      <strong className="font-semibold text-[#2d2a26]">Moon sign</strong>{" "}
                      {selectedMemberData.kundli?.moonSign ?? "—"}
                    </li>
                    <li className="flex justify-between gap-3 border-b border-b-[#f5f0e8] py-2 text-[14px] text-[#4a4238]">
                      <strong className="font-semibold text-[#2d2a26]">Sun sign</strong>{" "}
                      {selectedMemberData.kundli?.sunSign ?? "—"}
                    </li>
                    <li className="flex justify-between gap-3 border-b border-b-[#f5f0e8] py-2 text-[14px] text-[#4a4238]">
                      <strong className="font-semibold text-[#2d2a26]">Nakshatra</strong>{" "}
                      {selectedMemberData.kundli?.nakshatra ?? "—"}
                    </li>
                    <li className="flex justify-between gap-3 py-2 text-[14px] text-[#4a4238]">
                      <strong className="font-semibold text-[#2d2a26]">Pada</strong>{" "}
                      {selectedMemberData.kundli?.pada ?? "—"}
                    </li>
                  </ul>
                </div>
                <div className="mb-[22px]">
                  <h4 className="mb-[10px] border-b border-b-[#f0ebe3] pb-[6px] text-[14px] font-semibold text-[#6b4423]">
                    Calendar
                  </h4>
                  <ul className="m-0 list-none p-0">
                    <li className="flex justify-between gap-3 border-b border-b-[#f5f0e8] py-2 text-[14px] text-[#4a4238]">
                      <strong className="font-semibold text-[#2d2a26]">Date</strong>{" "}
                      {selectedMemberData.calendar?.date ?? "—"}
                    </li>
                    <li className="flex justify-between gap-3 border-b border-b-[#f5f0e8] py-2 text-[14px] text-[#4a4238]">
                      <strong className="font-semibold text-[#2d2a26]">Tithi</strong>{" "}
                      {selectedMemberData.calendar?.tithi ?? "—"}
                    </li>
                    <li className="flex justify-between gap-3 py-2 text-[14px] text-[#4a4238]">
                      <strong className="font-semibold text-[#2d2a26]">Nakshatra</strong>{" "}
                      {selectedMemberData.calendar?.nakshatra ?? "—"}
                    </li>
                  </ul>
                </div>
                <div className="mb-0">
                  <h4 className="mb-[10px] border-b border-b-[#f0ebe3] pb-[6px] text-[14px] font-semibold text-[#6b4423]">
                    Daily horoscope
                  </h4>
                  {selectedMemberData.dailyHoroscope ? (
                    <div className="mt-[10px] rounded-[12px] border border-[#f0dcc4] bg-[linear-gradient(135deg,#fefbf7_0%,#fdf6ed_100%)] px-[18px] py-4">
                      <p>
                        <strong>Theme:</strong> {selectedMemberData.dailyHoroscope.mainTheme}
                      </p>
                      <p>
                        <strong>Advice:</strong> {selectedMemberData.dailyHoroscope.doAvoid ?? "—"}
                      </p>
                      <p>
                        <strong>Reason:</strong> {selectedMemberData.dailyHoroscope.reason}
                      </p>
                    </div>
                  ) : (
                    <p className="mb-0 text-center text-[15px] leading-[1.5] text-[#4a4238]">
                      No horoscope available.
                    </p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {showSubscribeModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(0,0,0,0.45)] p-5">
          <div className="relative w-full max-w-[420px] rounded-[16px] bg-white/80 backdrop-blur-[12px] px-8 py-7 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
            <h3 className="mb-3 text-center text-[20px] font-semibold text-[#2d2a26]">
              Add more members
            </h3>
            <p className="mb-6 text-center text-[15px] leading-[1.5] text-[#4a4238]">
              Free plan allows only <strong>{MAX_FREE_MEMBERS} family members</strong>. Subscribe to
              add more.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                className="rounded-[10px] border border-[#e0d4c4] bg-[#f5f0e8] px-5 py-[10px] text-[14px] font-semibold text-[#4a4238] transition-colors duration-200 hover:bg-[#ebe4d8]"
                onClick={() => setShowSubscribeModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-[10px] border-none bg-[linear-gradient(135deg,#7d5a3c_0%,#6b4423_100%)] px-5 py-[10px] text-[14px] font-semibold text-white shadow-[0_2px_8px_rgba(107,68,35,0.25)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(107,68,35,0.3)]"
                onClick={() => router.push("/subscription/plans")}
              >
                View plans
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed right-6 top-6 rounded-[12px] bg-[linear-gradient(135deg,#0d9488_0%,#0f766e_100%)] px-[22px] py-[14px] text-[14px] text-white shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
