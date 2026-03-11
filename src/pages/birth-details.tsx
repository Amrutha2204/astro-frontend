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

  useEffect(() => {
    if (!rehydrated) return;
    if (!token) {
      router.push("/auth/login");
      return;
    }
    getUserDetails(token)
      .then((data) => {
        const d = data as { dob?: string; placeOfBirth?: string };
        if (d?.dob && d?.placeOfBirth) router.push("/dashboard");
      })
      .finally(() => setLoading(false));
  }, [rehydrated, token, router]);

  const submit = async () => {
    if (!token) return;
    try {
      await saveBirthDetails(token, { dob, birthTime, placeOfBirth });
      router.push("/dashboard");
    } catch (err) {
      showError("Failed to save birth details");
      console.error(err);
    }
  };

  if (!rehydrated || (rehydrated && !token)) {
    return <p>Loading...</p>;
  }
  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="max-w-md mx-auto my-16">
      <h2>Birth Details</h2>
      <label>Date of Birth</label>
      <DatePickerField value={dob} onChange={setDob} placeholder="dd/mm/yyyy" aria-label="Date of birth" />
      <label>Birth Time</label>
      <TimePickerField value={birthTime} onChange={setBirthTime} placeholder="--:--" step={1} aria-label="Birth time" />
      <label>Place of Birth</label>
      <PlaceAutocomplete value={placeOfBirth} onChange={setPlaceOfBirth} placeholder="e.g. Mumbai, Maharashtra, India or town/village" aria-label="Place of birth" />
      <button onClick={submit}>Save & Continue</button>
    </div>
  );
}
