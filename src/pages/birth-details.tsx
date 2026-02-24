import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { getUserDetails, saveBirthDetails } from "@/services/userService";
import { showError } from "@/utils/toast";
import { selectToken, selectIsRehydrated } from "@/store/slices/authSlice";

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
      <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
      <label>Birth Time</label>
      <input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} />
      <label>Place of Birth</label>
      <input value={placeOfBirth} onChange={(e) => setPlaceOfBirth(e.target.value)} />
      <button onClick={submit}>Save & Continue</button>
    </div>
  );
}
