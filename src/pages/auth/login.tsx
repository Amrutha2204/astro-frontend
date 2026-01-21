import { useState } from "react";
import { useRouter } from "next/router";
import { loginUser } from "@/services/authService";
import styles from "@/styles/login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    try {
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();

      if (!trimmedEmail || !trimmedPassword) {
        alert("Please enter both email and password");
        return;
      }

      const res = await loginUser({ 
        email: trimmedEmail.toLowerCase(), 
        password: trimmedPassword 
      });

      const token = res.data.accessToken?.trim();
      if (!token || token.split(".").length !== 3) {
        alert("Invalid token received from server");
        return;
      }
      localStorage.setItem("token", token);

      router.push("/dashboard");
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = error.response?.data?.message || error.message || "Invalid email or password";
      alert(errorMessage);
      console.error("Login error:", err);
    }
  };

  const goBack = () => {
    router.push("/"); // Navigate to index.tsx
  };

  const logout = () => {
    localStorage.removeItem("token"); // Clear token
    router.push("/"); // Navigate to index.tsx
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>🪔 Divine Login</h1>

        <label>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button onClick={submit}>Login</button>
          <button onClick={goBack}>Back</button>
          <button onClick={logout}>Logout</button>
        </div>
      </div>
    </div>
  );
}
