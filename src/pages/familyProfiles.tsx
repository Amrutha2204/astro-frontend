import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFamilyProfiles,
  createFamilyProfile,
  updateFamilyProfile,
  deleteFamilyProfile,
} from "@/services/familyService";
import { FamilyProfile, CreateFamilyProfilePayload } from "@/data/family";
import { astroApi } from "@/services/api";
import {
  horoscopeApi,
  DailyHoroscopeResponse,
} from "@/services/horoscopeService";
import styles from "@/styles/familyProfiles.module.css";
import dashboardStyles from "@/styles/dashboard.module.css";
import AppSidebar from "@/components/layout/AppSidebar";
import AppHeader from "@/components/layout/AppHeader";
import DatePickerField from "@/components/ui/DatePickerField";
import TimePickerField from "@/components/ui/TimePickerField";
import Loading from "@/components/ui/Loading";
import {
  selectToken,
  selectIsRehydrated,
  selectIsGuest,
  clearToken,
} from "@/store/slices/authSlice";
import { isValidJwtFormat } from "@/utils/auth";
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

  const [selectedMemberData, setSelectedMemberData] = useState<{
    kundli?: any;
    calendar?: any;
    dailyHoroscope?: DailyHoroscopeResponse;
    name?: string;
  } | null>(null);

  const [loadingMemberData, setLoadingMemberData] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Auth redirect
  useEffect(() => {
    if (!rehydrated) return;
    if (isGuest || !isValidJwtFormat(token)) {
      dispatch(clearToken());
      router.replace("/auth/login");
    }
  }, [rehydrated, isGuest, token, dispatch, router]);

  // Load profiles
  const loadProfiles = async () => {
    if (!isValidJwtFormat(token)) return;
    try {
      setProfilesLoading(true);
      const data = await fetchFamilyProfiles(token);
      setProfiles(data);
    } catch (error) {
      console.error(error);
    } finally {
      setProfilesLoading(false);
    }
  };

  useEffect(() => {
    if (!rehydrated || isGuest || !isValidJwtFormat(token)) return;
    loadProfiles();
  }, [rehydrated, isGuest, token]);

  // Toast
  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Validation
  const validateForm = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.dob) return "Date of Birth is required";
    if (!form.birthPlace.trim()) return "Birth Place is required";
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
    if (!deleteId) return;
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

      const dailyHoroscope =
        await horoscopeApi.getDailyHoroscopeGuest({
          dob: profile.dob,
          birthTime: profile.birthTime || "00:00",
          placeOfBirth: profile.birthPlace,
        });

      setSelectedMemberData({
        kundli,
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

  if (!rehydrated) return null;

  const getInitial = (name: string) => (name && name[0]) ? name[0].toUpperCase() : "?";

  return (
    <div className={dashboardStyles.dashboardContainer}>
      <AppHeader />
      <div className={dashboardStyles.dashboardContent}>
        <AppSidebar />
        <main className={dashboardStyles.mainContent}>
          <div className={dashboardStyles.kundliContainer}>
            <div className={styles.wrapper}>
              <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Family Profiles</h1>
                <span className={styles.memberCount}>
                  {profiles.length} / {MAX_FREE_MEMBERS} members
                </span>
              </div>

              <div className={styles.formCard}>
                <h2 className={styles.formCardTitle}>
                  {editingId ? "Edit member" : "Add family member"}
                </h2>
                <form onSubmit={handleSubmit}>
                  <div className={styles.formGrid}>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel} htmlFor="fp-name">Name *</label>
                      <input
                        id="fp-name"
                        className={styles.input}
                        placeholder="Full name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel} htmlFor="fp-dob">Date of birth *</label>
                      <DatePickerField
                        id="fp-dob"
                        value={form.dob}
                        onChange={(v) => setForm({ ...form, dob: v })}
                        placeholder="dd/mm/yyyy"
                        aria-label="Date of birth"
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel} htmlFor="fp-place">Birth place *</label>
                      <input
                        id="fp-place"
                        className={styles.input}
                        placeholder="City"
                        value={form.birthPlace}
                        onChange={(e) => setForm({ ...form, birthPlace: e.target.value })}
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel} htmlFor="fp-time">Birth time</label>
                      <TimePickerField
                        id="fp-time"
                        value={form.birthTime}
                        onChange={(v) => setForm({ ...form, birthTime: v })}
                        placeholder="--:--"
                        aria-label="Birth time"
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel} htmlFor="fp-relation">Relation</label>
                      <input
                        id="fp-relation"
                        className={styles.input}
                        placeholder="e.g. Mother, Father"
                        value={form.relation}
                        onChange={(e) => setForm({ ...form, relation: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className={styles.submitRow}>
                    <button
                      type="submit"
                      className={styles.primaryButton}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving…" : editingId ? "Update profile" : "Add member"}
                    </button>
                    {formError && <p className={styles.formError}>{formError}</p>}
                  </div>
                </form>
                {profiles.length >= MAX_FREE_MEMBERS && (
                  <>
                    <div className={styles.upgradeBox}>
                      <p className={styles.upgradeText}>Upgrade to add more members.</p>
                      <button
                        type="button"
                        className={styles.subscribeButton}
                        onClick={() => setShowSubscribeModal(true)}
                      >
                        Subscribe
                      </button>
                    </div>
                    <p className={styles.limitWarning}>
                      Free plan allows only {MAX_FREE_MEMBERS} family members.
                    </p>
                  </>
                )}
              </div>

              <h2 className={styles.sectionTitle}>Members</h2>
              {profilesLoading ? (
                <div className={styles.loadingWrap}>
                  <Loading text="Loading family profiles..." variant="page" />
                </div>
              ) : profiles.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>👨‍👩‍👧‍👦</div>
                  <div className={styles.emptyTitle}>No family members yet</div>
                  <p className={styles.emptyText}>
                    Add a member above with name, date of birth, and birth place to view their Kundli and horoscope.
                  </p>
                </div>
              ) : (
                <div className={styles.profileList}>
                  {profiles.map((p) => (
                    <div key={p.id} className={styles.profileCard}>
                      <div className={styles.profileHeader}>
                        <div className={styles.profileAvatar}>{getInitial(p.name)}</div>
                        <div className={styles.profileName}>{p.name}</div>
                      </div>
                      <div className={styles.profileMeta}>
                        {p.relation && (
                          <div className={styles.profileMetaRow}>
                            <span className={styles.profileMetaLabel}>Relation</span>
                            <span>{p.relation}</span>
                          </div>
                        )}
                        <div className={styles.profileMetaRow}>
                          <span className={styles.profileMetaLabel}>Birth place</span>
                          <span>{p.birthPlace}</span>
                        </div>
                        <div className={styles.profileMetaRow}>
                          <span className={styles.profileMetaLabel}>DOB</span>
                          <span>{p.dob}</span>
                        </div>
                      </div>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={styles.actionsEdit}
                          onClick={() => handleEdit(p)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className={styles.actionsDelete}
                          onClick={() => handleDeleteClick(p.id)}
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          className={styles.actionsView}
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
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Delete member?</h3>
            <p className={styles.modalBody}>This cannot be undone.</p>
            <div className={styles.modalActions}>
              <button type="button" className={styles.modalCancel} onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button type="button" className={styles.modalDanger} onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Error</h3>
            <p className={styles.modalBody}>{errorMessage}</p>
            <div className={styles.modalActions}>
              <button type="button" className={styles.modalConfirm} onClick={() => setShowErrorModal(false)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles.modalLarge}`}>
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => {
                setShowModal(false);
                setSelectedMemberData(null);
              }}
              aria-label="Close"
            >
              ×
            </button>
            <h3 className={styles.modalTitle}>
              {selectedMemberData?.name ?? "Member"}&apos;s astrology
            </h3>
            {loadingMemberData ? (
              <div className={styles.loadingWrap}>
                <Loading text="Loading Kundli & horoscope..." variant="page" />
              </div>
            ) : selectedMemberData ? (
              <div className={styles.memberData}>
                <div className={styles.memberDataSection}>
                  <h4 className={styles.memberDataTitle}>Kundli</h4>
                  <ul className={styles.memberDataList}>
                    <li><strong>Lagna</strong> {selectedMemberData.kundli?.lagna ?? "—"}</li>
                    <li><strong>Moon sign</strong> {selectedMemberData.kundli?.moonSign ?? "—"}</li>
                    <li><strong>Sun sign</strong> {selectedMemberData.kundli?.sunSign ?? "—"}</li>
                    <li><strong>Nakshatra</strong> {selectedMemberData.kundli?.nakshatra ?? "—"}</li>
                    <li><strong>Pada</strong> {selectedMemberData.kundli?.pada ?? "—"}</li>
                  </ul>
                </div>
                <div className={styles.memberDataSection}>
                  <h4 className={styles.memberDataTitle}>Calendar</h4>
                  <ul className={styles.memberDataList}>
                    <li><strong>Date</strong> {selectedMemberData.calendar?.date ?? "—"}</li>
                    <li><strong>Tithi</strong> {selectedMemberData.calendar?.tithi ?? "—"}</li>
                    <li><strong>Nakshatra</strong> {selectedMemberData.calendar?.nakshatra ?? "—"}</li>
                  </ul>
                </div>
                <div className={styles.memberDataSection}>
                  <h4 className={styles.memberDataTitle}>Daily horoscope</h4>
                  {selectedMemberData.dailyHoroscope ? (
                    <div className={styles.horoscopeCard}>
                      <p><strong>Theme:</strong> {selectedMemberData.dailyHoroscope.mainTheme}</p>
                      <p><strong>Advice:</strong> {selectedMemberData.dailyHoroscope.doAvoid ?? "—"}</p>
                      <p><strong>Reason:</strong> {selectedMemberData.dailyHoroscope.reason}</p>
                    </div>
                  ) : (
                    <p className={styles.modalBody} style={{ marginBottom: 0 }}>No horoscope available.</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {showSubscribeModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Add more members</h3>
            <p className={styles.modalBody}>
              Free plan allows only <strong>{MAX_FREE_MEMBERS} family members</strong>. Subscribe to add more.
            </p>
            <div className={styles.subscribeActions}>
              <button
                type="button"
                className={styles.modalCancel}
                onClick={() => setShowSubscribeModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalConfirm}
                onClick={() => router.push("/subscription/plans")}
              >
                View plans
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className={styles.toast}>{toastMessage}</div>
      )}
    </div>
  );
}