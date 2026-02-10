import { useState } from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { loginUser } from "@/services/authService";
import { showError, showSuccess } from "@/utils/toast";
import { setToken } from "@/store/slices/authSlice";
import styles from "@/styles/login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      showError("Please enter both email and password");
      return;
    }

    setLoading(true);

    loginUser({ email: trimmedEmail.toLowerCase(), password: trimmedPassword })
      .then((res) => {
        if (res.status === 401) {
          showError("Invalid email or password. Please check your credentials.");
          setLoading(false);
          return;
        }

        const token = res.data?.accessToken?.trim();
        if (!token || token.split(".").length !== 3) {
          showError("Invalid token received from server");
          setLoading(false);
          return;
        }

        dispatch(setToken(token));

        // Save birthPlace from login response
        if (res.data.user?.birthPlace) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }

        showSuccess("Login successful!");
        router.push("/dashboard");
      })
      .catch((err: unknown) => {
        setLoading(false);
        const errorMessage =
          err && typeof err === "object" && "message" in err && typeof (err as Error).message === "string"
            ? (err as Error).message
            : "Invalid email or password";
        showError(errorMessage);
        console.error("Login error:", err);
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