import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { loginUser } from "@/services/authService";
import { showError, showSuccess } from "@/utils/toast";
import styles from "@/styles/login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      showError("Please enter both email and password");
      return;
    }

    setLoading(true);

    // Use Promise.catch to prevent unhandled rejection - don't use async/await
    const loginPromise = loginUser({ 
      email: trimmedEmail.toLowerCase(), 
      password: trimmedPassword 
    });

    loginPromise
      .then((res) => {
        // Check if response status is 401
        if (res.status === 401) {
          showError("Invalid email or password. Please check your credentials and try again.");
          setLoading(false);
          return;
        }

        const token = res.data?.accessToken?.trim();
        if (!token || token.split(".").length !== 3) {
          showError("Invalid token received from server");
          setLoading(false);
          return;
        }
        localStorage.setItem("token", token);
        showSuccess("Login successful!");
        router.push("/dashboard");
      })
      .catch((err: unknown) => {
        // Handle all errors gracefully - prevent Next.js error overlay
        setLoading(false);
        
        let errorMessage = "Invalid email or password";
        
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
        } else if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
          errorMessage = err.message;
        }
        
        // Show toast instead of alert
        showError(errorMessage);
        console.error("Login error:", err);
        
        // Return to prevent any further error propagation
        return;
      });
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.authHeader}>
        <div className={styles.authLogo}>
          <span className={styles.authLogoIcon}>🪔</span>
          <span>Jyotishya Darshan</span>
        </div>
        <p className={styles.authTagline}>Vedic Astrology • Horoscope • Panchangam</p>
      </div>
      <div className={styles.loginWrapper}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <h1 className={styles.title}>Login</h1>
            <p className={styles.subtitle}>Enter your credentials to access your personalized astrology insights</p>
          </div>

          <form onSubmit={submit} className={styles.loginForm}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                Email Address <span className={styles.required}>*</span>
              </label>
              <input
                type="email"
                value={email}
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                autoComplete="email"
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                Password <span className={styles.required}>*</span>
              </label>
              <input
                type="password"
                value={password}
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                autoComplete="current-password"
                className={styles.input}
              />
              <div className={styles.forgotPassword}>
                <a 
                  href="#" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    showError("Forgot password feature coming soon!"); 
                  }}
                  className={styles.forgotLink}
                >
                  Forgot Password?
                </a>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className={styles.loginButton}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className={styles.footer}>
            <p className={styles.registerText}>
              Don't have an account?{" "}
              <a 
                href="#" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  router.push("/auth/register"); 
                }}
                className={styles.registerLink}
              >
                Register here
              </a>
            </p>
            <div className={styles.backToHome}>
              <a 
                href="#" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  router.push("/"); 
                }}
                className={styles.backToHomeLink}
              >
                ← Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
