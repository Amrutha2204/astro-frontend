import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { getUserDetails, saveBirthDetails } from "@/services/userService";
import { showError } from "@/utils/toast";
import { selectToken, selectIsRehydrated } from "@/store/slices/authSlice";
import DatePickerField from "@/components/ui/DatePickerField";
import TimePickerField from "@/components/ui/TimePickerField";
import PlaceAutocomplete from "@/components/ui/PlaceAutocomplete";
import formStyles from "@/styles/birthDetails.module.css";

export default function BirthDetails() {
  const router = useRouter();
  const rehydrated = useSelector(selectIsRehydrated);
  const token = useSelector(selectToken);

  const [dob, setDob] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [placeOfBirth, setPlaceOfBirth] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!rehydrated) return;
    if (!token) {
      router.push("/auth/login");
      return;
    }
    getUserDetails(token)
      .then((data) => {
        const d = data as { dob?: string; birthPlace?: string; birthTime?: string };
        if (d?.dob && d?.birthPlace) router.push("/dashboard");
        if (d?.dob) setDob(d.dob);
        if (d?.birthPlace) setPlaceOfBirth(d.birthPlace);
        if (d?.birthTime) setBirthTime(d.birthTime ?? "");
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : "Failed to load details";
        showError(msg);
      })
      .finally(() => setLoading(false));
  }, [rehydrated, token, router]);

  const toDobISO = (value: string): string => {
    if (!value?.trim()) return value;
    const s = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const ddmmyy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (ddmmyy) return `${ddmmyy[3]}-${ddmmyy[2].padStart(2, "0")}-${ddmmyy[1].padStart(2, "0")}`;
    return s;
  };

  const submit = async () => {
    if (!token) return;
    if (!placeOfBirth.trim()) {
      showError("Please enter your birth place");
      return;
    }
    if (!dob.trim()) {
      showError("Please enter your date of birth");
      return;
    }
    setSaving(true);
    try {
      await saveBirthDetails(token, { dob: toDobISO(dob), birthTime, placeOfBirth });
      router.push("/dashboard");
    } catch (err) {
      showError("Failed to save birth details");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!rehydrated || (rehydrated && !token)) {
    return (
      <div className={formStyles.container}>
        <div className={formStyles.card}>
          <p className={formStyles.subtitle}>Loading...</p>
        </div>
      </div>
    );
  }
  if (loading) {
    return (
      <div className={formStyles.container}>
        <div className={formStyles.card}>
          <p className={formStyles.subtitle}>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={formStyles.container}>
      <div className={formStyles.card}>
        <h1 className={formStyles.title}>Birth Details</h1>
        <p className={formStyles.subtitle}>
          Your birth date, time and place are used for accurate Kundli, horoscope and dashas.
        </p>

        <label className={formStyles.label} htmlFor="birth-dob">Date of Birth</label>
        <DatePickerField
          id="birth-dob"
          value={dob}
          onChange={setDob}
          placeholder="dd/mm/yyyy"
          aria-label="Date of birth"
          className={formStyles.input}
        />

        <label className={formStyles.label} htmlFor="birth-time">Birth Time</label>
        <TimePickerField
          id="birth-time"
          value={birthTime}
          onChange={setBirthTime}
          placeholder="--:--"
          step={1}
          aria-label="Birth time"
          className={formStyles.input}
        />

        <label className={formStyles.label} htmlFor="birth-place">Birth place *</label>
        <PlaceAutocomplete
          id="birth-place"
          value={placeOfBirth}
          onChange={setPlaceOfBirth}
          placeholder="e.g. Mumbai, Maharashtra, India or town/village"
          required
          aria-label="Birth place"
          className={formStyles.input}
        />

        <button
          type="button"
          className={formStyles.button}
          onClick={submit}
          disabled={saving || !placeOfBirth.trim()}
        >
          {saving ? "Saving…" : "Save & Continue"}
        </button>
      </div>
    </div>
  );
}
