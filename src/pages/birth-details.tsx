import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getUserDetails, saveBirthDetails } from "@/services/userService";
import { showError } from "@/utils/toast";

export default function BirthDetails() {
  const router = useRouter();

  const [dob, setDob] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [placeOfBirth, setPlaceOfBirth] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    getUserDetails(token)
      .then((res) => {
        const data = res.data;

        // If already filled → go to dashboard
        if (data.dob && data.placeOfBirth) {
          router.push("/dashboard");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const submit = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await saveBirthDetails(token, {
        dob,
        birthTime,
        placeOfBirth,
      });

      router.push("/dashboard");
    } catch (err) {
      showError("Failed to save birth details");
      console.error(err);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ maxWidth: "400px", margin: "60px auto" }}>
      <h2>Birth Details</h2>

      <label>Date of Birth</label>
      <input
        type="date"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
      />

      <label>Birth Time</label>
      <input
        type="time"
        value={birthTime}
        onChange={(e) => setBirthTime(e.target.value)}
      />

      <label>Place of Birth</label>
      <input
        value={placeOfBirth}
        onChange={(e) => setPlaceOfBirth(e.target.value)}
      />

      <button onClick={submit}>Save & Continue</button>
    </div>
  );
}
