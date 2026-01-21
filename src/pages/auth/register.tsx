import { useRouter } from "next/router";
import styles from "@/styles/auth.module.css";

export default function Register() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <h2>🪔 New Registration</h2>

        <label>Name</label>
        <input />

        <label>Email</label>
        <input />

        <label>Password</label>
        <input type="password" />

        <button onClick={() => router.push("/auth/login")}>
          Register
        </button>

        <p onClick={() => router.push("/auth/login")}>
          Already registered? Login
        </p>
      </div>
    </div>
  );
}
