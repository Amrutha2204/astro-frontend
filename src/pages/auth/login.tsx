import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { loginUser } from "@/services/authService";
import styles from "@/styles/login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();

      if (!trimmedEmail || !trimmedPassword) {
        alert("Please enter both email and password");
        return;
      }

      setLoading(true);

      const res = await loginUser({ 
        email: trimmedEmail.toLowerCase(), 
        password: trimmedPassword 
      });

      const token = res.data.accessToken?.trim();
      if (!token || token.split(".").length !== 3) {
        alert("Invalid token received from server");
        setLoading(false);
        return;
      }
      localStorage.setItem("token", token);

      router.push("/dashboard");
    } catch (err: unknown) {
      let errorMessage = "Invalid email or password";
      
      // Handle axios errors using axios.isAxiosError helper
      if (axios.isAxiosError(err)) {
        const axiosError = err;
        
        if (axiosError.response?.status === 401) {
          errorMessage = axiosError.response?.data?.message || "Invalid email or password. Please check your credentials and try again.";
        } else if (axiosError.response?.status === 404) {
          errorMessage = "Authentication service not found. Please check if the backend is running on port 8001.";
        } else if (axiosError.response?.status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.message) {
          errorMessage = axiosError.message;
        }
      } 
      // Handle other errors
      else if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
        errorMessage = err.message;
      }
      
      alert(errorMessage);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    router.push("/");
  };

  const logout = () => {
    localStorage.removeItem("token");
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
          disabled={loading}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          placeholder="Enter your password"
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        <div className={styles.buttonGroup}>
          <button 
            onClick={submit} 
            disabled={loading}
            className={styles.primaryButton}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <button 
            onClick={goBack}
            disabled={loading}
            className={styles.secondaryButton}
          >
            Back
          </button>
          <button 
            onClick={logout}
            disabled={loading}
            className={styles.secondaryButton}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
