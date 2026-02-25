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
import {
  selectToken,
  selectIsRehydrated,
  selectIsGuest,
  clearToken,
} from "@/store/slices/authSlice";
import { isValidJwtFormat } from "@/utils/auth";

export default function FamilyProfiles() {
  const router = useRouter();
  const dispatch = useDispatch();
  const rehydrated = useSelector(selectIsRehydrated);
  const isGuest = useSelector(selectIsGuest);
  const token = useSelector(selectToken) ?? "";

  const [profiles, setProfiles] = useState<FamilyProfile[]>([]);
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
      const data = await fetchFamilyProfiles(token);
      setProfiles(data);
    } catch (error) {
      console.error(error);
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

  return (
    <div className={dashboardStyles.dashboardContainer}>
      <AppHeader />
      <div className={dashboardStyles.mainContent}>
        <AppSidebar />

        <div className={styles.container}>
          <h2 className={styles.title}>Family Profiles</h2>

          <div className={styles.card}>
            <form onSubmit={handleSubmit} className={styles.formGrid}>
              <input
                className={styles.input}
                placeholder="Name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />

              <input
                type="date"
                className={styles.input}
                value={form.dob}
                onChange={(e) =>
                  setForm({ ...form, dob: e.target.value })
                }
              />

              <input
                className={styles.input}
                placeholder="Birth Place"
                value={form.birthPlace}
                onChange={(e) =>
                  setForm({ ...form, birthPlace: e.target.value })
                }
              />

              <input
                type="time"
                className={styles.input}
                value={form.birthTime}
                onChange={(e) =>
                  setForm({ ...form, birthTime: e.target.value })
                }
              />

              <input
                className={styles.input}
                placeholder="Relation"
                value={form.relation}
                onChange={(e) =>
                  setForm({ ...form, relation: e.target.value })
                }
              />

              <button
                className={styles.button}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Saving..."
                  : editingId
                  ? "Update Profile"
                  : "Add Profile"}
              </button>

              {formError && (
                <p className={styles.errorText}>{formError}</p>
              )}
            </form>
          </div>

          <div className={styles.profileList}>
            {profiles.map((p) => (
              <div key={p.id} className={styles.profileCard}>
                <div className={styles.profileName}>{p.name}</div>
                <div><strong>Relation:</strong> {p.relation}</div>
                <div><strong>Place:</strong> {p.birthPlace}</div>
                <div><strong>DOB:</strong> {p.dob}</div>

                <div className={styles.actions}>
                  <button onClick={() => handleEdit(p)}>Edit</button>
                  <button onClick={() => handleDeleteClick(p.id)}>Delete</button>
                  <button onClick={() => viewMemberData(p)}>
                    View Astrology
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Delete Profile?</h3>
            <p>Are you sure?</p>
            <div className={styles.modalActions}>
              <button onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Error</h3>
            <p>{errorMessage}</p>
            <button onClick={() => setShowErrorModal(false)}>OK</button>
          </div>
        </div>
      )}

{/* ASTROLOGY MODAL */}
{showModal && selectedMemberData && (
  <div className={styles.modalOverlay}>
    <div className={styles.modal}>
      <button
        className={styles.modalClose}
        onClick={() => {
          setShowModal(false);
          setSelectedMemberData(null);
        }}
      >
        ×
      </button>

      <h3>{selectedMemberData.name}'s Astrology</h3>

      {loadingMemberData ? (
        <p>Loading...</p>
      ) : (
        <div className={styles.memberData}>
          <h4>Kundli</h4>
          <ul>
            <li><strong>Lagna:</strong> {selectedMemberData.kundli?.lagna}</li>
            <li><strong>Moon Sign:</strong> {selectedMemberData.kundli?.moonSign}</li>
            <li><strong>Sun Sign:</strong> {selectedMemberData.kundli?.sunSign || "—"}</li>
            <li><strong>Nakshatra:</strong> {selectedMemberData.kundli?.nakshatra}</li>
            <li><strong>Pada:</strong> {selectedMemberData.kundli?.pada}</li>
          </ul>

          <h4>Calendar</h4>
          <ul>
            <li><strong>Date:</strong> {selectedMemberData.calendar?.date}</li>
            <li><strong>Tithi:</strong> {selectedMemberData.calendar?.tithi || "—"}</li>
            <li><strong>Nakshatra:</strong> {selectedMemberData.calendar?.nakshatra || "—"}</li>
          </ul>

          <h4>Daily Horoscope</h4>
          {selectedMemberData.dailyHoroscope ? (
            <div className={styles.horoscopeCard}>
              <p><strong>Theme:</strong> {selectedMemberData.dailyHoroscope.mainTheme}</p>
              <p><strong>Advice:</strong> {selectedMemberData.dailyHoroscope.doAvoid || "—"}</p>
              <p><strong>Reason:</strong> {selectedMemberData.dailyHoroscope.reason}</p>
            </div>
          ) : (
            <p>No horoscope available</p>
          )}
        </div>
      )}
    </div>
  </div>
)}
      {showToast && (
        <div className={styles.toast}>{toastMessage}</div>
      )}
    </div>
  );
}