import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { getUserDetails, saveBirthDetails } from "@/services/userService";
import { showError } from "@/utils/toast";
import { selectToken, selectIsRehydrated } from "@/store/slices/authSlice";
import DatePickerField from "@/components/ui/DatePickerField";
import TimePickerField from "@/components/ui/TimePickerField";
import PlaceAutocomplete from "@/components/ui/PlaceAutocomplete";

export default function BirthDetails() {
  const router = useRouter();
  const rehydrated = useSelector(selectIsRehydrated);
  const token = useSelector(selectToken);

  const [dob, setDob] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [placeOfBirth, setPlaceOfBirth] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const pageClass =
    "min-h-screen bg-[linear-gradient(135deg,#fffbf5_0%,#fdf6eb_100%)] font-[Georgia,serif]";
  const centerClass = "flex min-h-screen items-center justify-center";
  const cardClass =
    "mx-auto mb-6 w-full max-w-[520px] rounded-[20px] border-[2px] border-[#e4cfa6] bg-[linear-gradient(135deg,#fff9f1_0%,#fffaf2_100%)] px-[52px] py-12 shadow-[0_20px_60px_rgba(122,46,46,0.15),0_0_100px_rgba(180,123,69,0.08)] backdrop-blur-[12px]";
  const labelClass =
    "mb-[10px] block text-[14px] font-bold uppercase tracking-[0.08em] text-[#6b4423]";

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
      <div className={`${pageClass} ${centerClass}`}>
        <div className={cardClass}>
          <p className="m-0 mb-8 text-center text-[15px] font-medium leading-[1.7] text-[#6b5b52]">
            Loading...
          </p>
        </div>
      </div>
    );
  }
  if (loading) {
    return (
      <div className={`${pageClass} ${centerClass}`}>
        <div className={cardClass}>
          <p className="m-0 mb-8 text-center text-[15px] font-medium leading-[1.7] text-[#6b5b52]">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${pageClass} ${centerClass}`}>
      <div className={cardClass}>
        <h1 className="m-0 mb-[14px] text-center text-[32px] font-extrabold tracking-[-0.02em] text-transparent bg-[linear-gradient(135deg,#8b5e34_0%,#6b4423_100%)] bg-clip-text">
          Birth Details
        </h1>
        <p className="m-0 mb-8 text-center text-[15px] font-medium leading-[1.7] text-[#6b5b52]">
          Your birth date, time and place are used for accurate Kundli, horoscope and dashas.
        </p>

        <label className={labelClass} htmlFor="birth-dob">
          Date of Birth
        </label>
        <DatePickerField
          id="birth-dob"
          value={dob}
          onChange={setDob}
          placeholder="dd/mm/yyyy"
          aria-label="Date of birth"
        />

        <label className={labelClass} htmlFor="birth-time">
          Birth Time
        </label>
        <TimePickerField
          id="birth-time"
          value={birthTime}
          onChange={setBirthTime}
          placeholder="--:--"
          step={1}
          aria-label="Birth time"
        />

        <label className={labelClass} htmlFor="birth-place">
          Birth place *
        </label>
        <PlaceAutocomplete
          id="birth-place"
          value={placeOfBirth}
          onChange={setPlaceOfBirth}
          placeholder="e.g. Mumbai, Maharashtra, India or town/village"
          required
          aria-label="Birth place"
        />

        <button
          type="button"
          className="mt-[14px] w-full rounded-[12px] bg-[linear-gradient(135deg,#8b5e34_0%,#6b4423_100%)] px-5 py-4 text-[16px] font-bold text-white shadow-[0_8px_24px_rgba(107,68,35,0.3)] transition-all duration-300 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-[2px] hover:bg-[linear-gradient(135deg,#a67a4a_0%,#7d5a3c_100%)] hover:shadow-[0_12px_36px_rgba(107,68,35,0.4)] disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none"
          onClick={submit}
          disabled={saving || !placeOfBirth.trim()}
        >
          {saving ? "Saving…" : "Save & Continue"}
        </button>
      </div>
    </div>
  );
}
