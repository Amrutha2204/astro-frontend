import React, { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { registerUser } from "@/services/authService";
import { showError, showSuccess, showWarning } from "@/utils/toast";
import styles from "@/styles/login.module.css";

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    dob: "",
    birthPlace: "",
    birthTime: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      showError("Name is required");
      return false;
    }
    if (!formData.email.trim()) {
      showError("Email is required");
      return false;
    }
    if (!formData.email.includes("@")) {
      showError("Please enter a valid email address");
      return false;
    }
    if (!formData.password) {
      showError("Password is required");
      return false;
    }
    if (formData.password.length < 8) {
      showWarning("Password must be at least 8 characters long");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      showError("Passwords do not match");
      return false;
    }
    if (!formData.dob) {
      showError("Date of birth is required");
      return false;
    }
    if (!formData.birthPlace.trim()) {
      showError("Birth place is required");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        phoneNumber: formData.phoneNumber.trim() || undefined,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
        roleId: 1,
        guestId: null,
        dob: formData.dob,
        birthPlace: formData.birthPlace.trim(),
        birthTime: formData.birthTime || undefined
      };

      const res = await registerUser(payload as any);

      showSuccess("Registration successful! Please login.");
      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
    } catch (err: unknown) {
      let errorMessage = "Registration failed. Please try again.";
      
      if (axios.isAxiosError(err)) {
        const axiosError = err;
        
        if (axiosError.response?.status === 400) {
          errorMessage = axiosError.response?.data?.message || "Invalid registration data. Please check all fields.";
        } else if (axiosError.response?.status === 409) {
          errorMessage = "Email already exists. Please use a different email or login.";
        } else if (axiosError.response?.status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      }
      
      showError(errorMessage);
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
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
        <div className={styles.registerCard}>
          <div className={styles.loginHeader}>
            <h1 className={styles.title}>New Registration</h1>
            <p className={styles.subtitle}>Create your account to access personalized astrology insights</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }} className={styles.registerForm}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                Full Name <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                placeholder="Enter your full name"
                onChange={handleChange}
                disabled={loading}
                required
                className={styles.input}
                autoComplete="name"
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                Email Address <span className={styles.required}>*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                placeholder="Enter your email"
                onChange={handleChange}
                disabled={loading}
                required
                className={styles.input}
                autoComplete="email"
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  Password <span className={styles.required}>*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  placeholder="Min 8 chars"
                  onChange={handleChange}
                  disabled={loading}
                  required
                  minLength={8}
                  className={styles.input}
                  autoComplete="new-password"
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  Confirm Password <span className={styles.required}>*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  placeholder="Re-enter password"
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className={styles.input}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  Phone Number <span style={{ color: '#9ca3af', fontWeight: 'normal', fontSize: '12px' }}>(Optional)</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  placeholder="Phone number"
                  onChange={handleChange}
                  disabled={loading}
                  className={styles.input}
                  autoComplete="tel"
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  Date of Birth <span className={styles.required}>*</span>
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  Birth Place <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="birthPlace"
                  value={formData.birthPlace}
                  placeholder="City, State, Country"
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  Birth Time
                </label>
                <input
                  type="time"
                  name="birthTime"
                  value={formData.birthTime}
                  onChange={handleChange}
                  disabled={loading}
                  className={styles.input}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className={styles.loginButton}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <div className={styles.footer}>
            <p className={styles.registerText}>
              Already have an account?{" "}
              <a 
                href="#" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  router.push("/auth/login"); 
                }}
                className={styles.registerLink}
              >
                Login here
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
