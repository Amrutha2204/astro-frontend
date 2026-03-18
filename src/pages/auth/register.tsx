import React, { useState } from "react";
import { useRouter } from "next/router";
import { registerUser } from "@/services/authService";
import { showError, showSuccess, showWarning } from "@/utils/toast";
import PlaceAutocomplete from "@/components/ui/PlaceAutocomplete";

export default function Register() {
  const router = useRouter();
  const guestId = typeof router.query.guestId === "string" ? router.query.guestId : undefined;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pageClass = "relative flex min-h-screen flex-col bg-[#faf8f5]";
  const headerClass = "relative z-[1] px-6 pb-7 pt-12 text-center";
  const cardClass =
    "max-h-[85vh] w-full max-w-[560px] overflow-y-auto rounded-[16px] border border-[#e8ddd0] border-t-[3px] border-t-[#6b4423] bg-white px-8 py-9 shadow-[0_10px_40px_rgba(92,64,51,0.1),0_2px_8px_rgba(0,0,0,0.04)]";
  const labelClass = "m-0 text-[14px] font-semibold text-[#374151]";
  const inputClass =
    "w-full rounded-[8px] border border-[#e8ddd0] bg-[#faf8f5] px-[14px] py-3 text-[15px] outline-none transition-[border-color,background,box-shadow] duration-200 placeholder:text-[#9ca3af] focus:border-[#6b4423] focus:bg-white focus:shadow-[0_0_0_3px_rgba(107,68,35,0.12)] disabled:cursor-not-allowed disabled:bg-[#f9fafb] disabled:opacity-60";
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    dob: "",
    birthPlace: "",
    birthTime: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
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
    if (!guestId) {
      if (!formData.dob) {
        showError("Date of birth is required");
        return false;
      }
      if (!formData.birthPlace.trim()) {
        showError("Birth place is required");
        return false;
      }
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

      const payload = guestId
        ? {
            name: formData.name.trim(),
            email: formData.email.toLowerCase().trim(),
            password: formData.password,
            phoneNumber: formData.phoneNumber.trim() || undefined,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
            roleId: 1,
            guestId,
          }
        : {
            name: formData.name.trim(),
            email: formData.email.toLowerCase().trim(),
            password: formData.password,
            phoneNumber: formData.phoneNumber.trim() || undefined,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
            roleId: 1,
            dob: formData.dob,
            birthPlace: formData.birthPlace.trim(),
            birthTime: formData.birthTime || undefined,
          };

      const { status, data } = await registerUser(payload);

      if (status < 200 || status >= 300) {
        const message =
          data &&
          typeof data === "object" &&
          "message" in data &&
          typeof (data as { message?: string }).message === "string"
            ? (data as { message: string }).message
            : "Registration failed. Please try again.";
        setError(message);
        showError(message);
        return;
      }

      if (formData.birthPlace.trim()) {
        localStorage.setItem("birthPlace", formData.birthPlace.trim());
      }
      showSuccess("Registration successful! Please login.");
      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
    } catch (err: unknown) {
      const errorMessage =
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as Error).message === "string"
          ? (err as Error).message
          : "Registration failed. Please try again.";
      setError(errorMessage);
      showError(errorMessage);
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={pageClass}>
      <div className="absolute inset-x-0 top-0 z-0 h-[180px] bg-[linear-gradient(180deg,#5c3a1f_0%,#6b4423_45%,#c4a77d_100%)]" />
      <div className={headerClass}>
        <div className="mb-[6px] flex items-center justify-center gap-[10px] text-[28px] font-bold tracking-[-0.02em] text-white">
          <span className="text-[32px] opacity-95">🪔</span>
          <span>Jyotishya Darshan</span>
        </div>
        <p className="m-0 text-[13px] font-medium tracking-[0.02em] text-white/88">
          Vedic Astrology • Horoscope • Panchangam
        </p>
      </div>
      <div className="relative z-[1] flex flex-1 items-center justify-center px-5 pb-8 pt-6">
        <div className={cardClass}>
          <div className="mb-6 text-center">
            <h1 className="m-0 mb-2 text-[26px] font-bold leading-[1.2] tracking-[-0.02em] text-[#5c4033]">
              New Registration
            </h1>
            <p className="m-0 text-[14px] leading-[1.5] text-[#5c5047]">
              Create your account to access personalized astrology insights
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRegister();
            }}
            className="flex flex-col gap-[18px]"
          >
            <div className="flex flex-col gap-2">
              <label className={labelClass}>
                Full Name <span className="font-bold text-[#6b4423]">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                placeholder="Enter your full name"
                onChange={handleChange}
                disabled={loading}
                required
                className={inputClass}
                autoComplete="name"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClass}>
                Email Address <span className="font-bold text-[#6b4423]">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                placeholder="Enter your email"
                onChange={handleChange}
                disabled={loading}
                required
                className={inputClass}
                autoComplete="email"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className={labelClass}>
                  Password <span className="font-bold text-[#6b4423]">*</span>
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
                  className={inputClass}
                  autoComplete="new-password"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelClass}>
                  Confirm Password <span className="font-bold text-[#6b4423]">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  placeholder="Re-enter password"
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className={inputClass}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className={labelClass}>
                  Phone Number <span className="font-normal text-[#6b5b52]">(Optional)</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  placeholder="Phone number"
                  onChange={handleChange}
                  disabled={loading}
                  className={inputClass}
                  autoComplete="tel"
                />
              </div>
              {!guestId && (
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>
                    Date of Birth <span className="font-bold text-[#6b4423]">*</span>
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    disabled={loading}
                    required
                    className={`${inputClass} formDateInput`}
                  />
                </div>
              )}
            </div>

            {guestId && (
              <p className="mb-4 text-sm text-green-600">
                We&apos;ll use the birth details you provided.
              </p>
            )}

            {!guestId && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className={labelClass}>
                    Birth place <span className="font-bold text-[#6b4423]">*</span>
                  </label>
                  <PlaceAutocomplete
                    value={formData.birthPlace}
                    onChange={(v) => {
                      setFormData({ ...formData, birthPlace: v });
                      setError(null);
                    }}
                    placeholder="e.g. Mumbai, Maharashtra, India or town/village"
                    required
                    disabled={loading}
                    aria-label="Birth place"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className={labelClass}>Birth Time</label>
                  <input
                    type="time"
                    name="birthTime"
                    value={formData.birthTime}
                    onChange={handleChange}
                    disabled={loading}
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            {error && (
              <p
                className="m-0 mb-2 rounded-[8px] border border-[#fecaca] bg-[#fef2f2] px-3 py-[10px] text-[14px] text-[#b91c1c]"
                role="alert"
              >
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-[8px] bg-[#6b4423] px-6 py-[14px] text-[16px] font-semibold text-white transition-all duration-200 hover:-translate-y-px hover:bg-[#5c3a1f] hover:shadow-[0_4px_12px_rgba(107,68,35,0.25)] disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <div className="mt-7 border-t border-[#e8ddd0] pt-[22px] text-center">
            <p className="m-0 text-[14px] leading-[1.5] text-[#5c5047]">
              Already have an account?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/auth/login");
                }}
                className="font-semibold text-[#6b4423] no-underline transition-colors duration-200 hover:text-[#5c3a1f]"
              >
                Login here
              </a>
            </p>
            <div className="mt-4">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/");
                }}
                className="text-[13px] font-medium text-[#6b4423] no-underline transition-colors duration-200 hover:text-[#5c3a1f] hover:underline"
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
