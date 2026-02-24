import { useEffect, useState } from "react";
import {
  fetchFamilyProfiles,
  createFamilyProfile,
  updateFamilyProfile,
  deleteFamilyProfile,
} from "@/services/familyService";
import { FamilyProfile, CreateFamilyProfilePayload } from "@/data/family";
import { astroApi } from "@/services/api";
import { horoscopeApi, DailyHoroscopeResponse } from "@/services/horoscopeService";
import styles from "@/styles/familyProfiles.module.css";
import dashboardStyles from "@/styles/dashboard.module.css";
import AppSidebar from "@/components/layout/AppSidebar";
import AppHeader from "@/components/layout/AppHeader";

export default function FamilyProfiles() {
  const token = localStorage.getItem("token") || "";

  const [editingId, setEditingId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<FamilyProfile[]>([]);
  const [form, setForm] = useState<CreateFamilyProfilePayload>({
    name: "",
    dob: "",
    birthPlace: "",
    birthTime: "",
    relation: "",
  });

  // Selected member astrology
  const [selectedMemberData, setSelectedMemberData] = useState<{
    kundli?: any;
    calendar?: any;
    dailyHoroscope?: DailyHoroscopeResponse;
    name?: string;
  } | null>(null);
  const [loadingMemberData, setLoadingMemberData] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Load profiles
  const loadProfiles = async () => {
    const data = await fetchFamilyProfiles(token);
    setProfiles(data);
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateFamilyProfile(editingId, form, token);
      setEditingId(null);
    } else {
      await createFamilyProfile(form, token);
    }
    setForm({ name: "", dob: "", birthPlace: "", birthTime: "", relation: "" });
    loadProfiles();
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

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this profile?")) return;
    await deleteFamilyProfile(id, token);
    loadProfiles();
  };

  const viewMemberData = async (profile: FamilyProfile) => {
    setLoadingMemberData(true);
    setShowModal(true);
    try {
      const kundli = await astroApi.getGuestKundli({
        dob: profile.dob,
        birthTime: profile.birthTime,
        placeOfBirth: profile.birthPlace,
        unknownTime: !profile.birthTime,
      });

      const calendar = await astroApi.getGuestCalendar(profile.birthPlace);

      const dailyHoroscope = await horoscopeApi.getDailyHoroscopeGuest({
        dob: profile.dob,
        birthTime: profile.birthTime || "00:00",
        placeOfBirth: profile.birthPlace,
      });

      setSelectedMemberData({ kundli, calendar, dailyHoroscope, name: profile.name });
    } catch (err) {
      console.error(err);
      alert("Failed to fetch astrology data.");
      setShowModal(false);
    } finally {
      setLoadingMemberData(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMemberData(null);
  };

  return (
    <div className={dashboardStyles.dashboardContainer}>
      <AppHeader />
      <div className={dashboardStyles.mainContent}>
        <AppSidebar />

        <div className={styles.container}>
          <h2 className={styles.title}>Family Profiles</h2>

          {/* Form Card */}
          <div className={styles.card}>
            <form onSubmit={handleSubmit} className={styles.formGrid}>
              <input
                className={styles.input}
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                type="date"
                className={styles.input}
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
              />
              <input
                className={styles.input}
                placeholder="Birth Place"
                value={form.birthPlace}
                onChange={(e) => setForm({ ...form, birthPlace: e.target.value })}
              />
              <input
                type="time"
                className={styles.input}
                value={form.birthTime}
                onChange={(e) => setForm({ ...form, birthTime: e.target.value })}
              />
              <input
                className={styles.input}
                placeholder="Relation"
                value={form.relation}
                onChange={(e) => setForm({ ...form, relation: e.target.value })}
              />
              <button className={styles.button}>{editingId ? "Update Profile" : "Add Profile"}</button>
            </form>
          </div>

          {/* Profile List */}
          <div className={styles.profileList}>
            {profiles.map((p) => (
              <div key={p.id} className={styles.profileCard}>
                <div className={styles.profileName}>{p.name}</div>
                <div><strong>Relation:</strong> {p.relation}</div>
                <div><strong>Place:</strong> {p.birthPlace}</div>
                <div><strong>DOB:</strong> {p.dob}</div>
                <div className={styles.actions}>
                  <button onClick={() => handleEdit(p)}>Edit</button>
                  <button onClick={() => handleDelete(p.id)}>Delete</button>
                  <button onClick={() => viewMemberData(p)}>View Astrology</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedMemberData && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button className={styles.modalClose} onClick={closeModal}>×</button>
            <h3>{selectedMemberData.name}'s Astrology</h3>

            {loadingMemberData ? (
              <p>Loading...</p>
            ) : (
              <div className={styles.memberData}>
                {/* Kundli */}
                <h4>Kundli</h4>
                <ul>
                  <li><strong>Lagna:</strong> {selectedMemberData.kundli.lagna}</li>
                  <li><strong>Moon Sign:</strong> {selectedMemberData.kundli.moonSign}</li>
                  <li><strong>Sun Sign:</strong> {selectedMemberData.kundli.sunSign || "—"}</li>
                  <li><strong>Nakshatra:</strong> {selectedMemberData.kundli.nakshatra}</li>
                  <li><strong>Pada:</strong> {selectedMemberData.kundli.pada}</li>
                </ul>

                {/* Calendar */}
                <h4>Calendar</h4>
                <ul>
                  <li><strong>Date:</strong> {selectedMemberData.calendar.date}</li>
                  <li><strong>Tithi:</strong> {selectedMemberData.calendar.tithi || "—"}</li>
                  <li><strong>Nakshatra:</strong> {selectedMemberData.calendar.nakshatra || "—"}</li>
                  {selectedMemberData.calendar.majorPlanetaryEvents?.length > 0 && (
                    <li><strong>Major Events:</strong> {selectedMemberData.calendar.majorPlanetaryEvents.join(", ")}</li>
                  )}
                </ul>

                {/* Daily Horoscope */}
                <h4>Daily Horoscope</h4>
                {selectedMemberData.dailyHoroscope ? (
                  <div className={styles.horoscopeCard}>
                    <p><strong>Theme:</strong> {selectedMemberData.dailyHoroscope.mainTheme}</p>
                    <p><strong>Advice:</strong> {selectedMemberData.dailyHoroscope.doAvoid || "—"}</p>
                    <p><strong>Reason:</strong> {selectedMemberData.dailyHoroscope.reason}</p>
                  </div>
                ) : <p>No horoscope available</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}