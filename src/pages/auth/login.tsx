import { useState } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      alert("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);

      // ✅ FRONTEND-ONLY LOGIN (NO BACKEND)
      // Fake token
      const fakeToken = "frontend-dummy-token";

      localStorage.setItem("token", fakeToken);
      localStorage.setItem("userEmail", trimmedEmail);

      // ✅ Navigate to dashboard
      router.push("/dashboard");
    } catch (error) {
      alert("Login failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    router.push("/");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    router.push("/");
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>🪔 Divine Login</h1>

        <label>Email</label>
        <input
          type="email"
          value={email}
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          placeholder="Enter your password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
          <button onClick={submit} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <button onClick={goBack}>Back</button>
          <button onClick={logout}>Logout</button>
        </div>
      </div>
    </div>
  );
}
