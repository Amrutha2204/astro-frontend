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
      const res = await loginUser({ email, password });

      localStorage.setItem("token", res.data.token);

      router.push("/dashboard");
    } catch (err) {
      alert("Invalid email or password");
      console.error(err);
    }
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

        <button onClick={submit}>Login</button>
      </div>
    </div>
  );
}
