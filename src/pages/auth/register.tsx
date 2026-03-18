import React, { useState } from "react";
import { useRouter } from "next/router";
import { registerUser } from "@/services/authService";
import { showError, showSuccess, showWarning } from "@/utils/toast";
import PlaceAutocomplete from "@/components/ui/PlaceAutocomplete";

export default function Register() {
  const router = useRouter();
  const guestId = typeof router.query.guestId === "string" ? router.query.guestId : undefined;
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pageClass = "relative flex min-h-screen flex-col bg-gradient-to-br from-[#fff7ed] via-[#ffedd5] to-[#fde68a] dark:from-gray-900 dark:to-gray-800";
  const headerClass = "relative z-[1] px-6 pb-7 pt-12 text-center";
  const cardClass = `
w-full max-w-xl rounded-3xl 
backdrop-blur-xl bg-white/80 dark:bg-gray-900/70 
border border-white/20 
shadow-[0_25px_80px_rgba(0,0,0,0.2)] 
px-6 py-7
transition-all duration-500 hover:shadow-[0_30px_100px_rgba(0,0,0,0.25)]
`;
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

  const getPasswordStrength = (password: string) => {
  if (password.length < 4) return "Weak";
  if (password.length < 8) return "Medium";
  return "Strong";
};

  return (
    <div className={pageClass}>
      <div className={headerClass}>
        <div className="mb-[6px] flex items-center justify-center gap-[10px] text-[28px] font-bold tracking-[-0.02em] text-amber-700">
          <span className="text-[32px] opacity-95">🪔</span>
          <span>Jyotishya Darshan</span>
        </div>
        <p className="m-0 text-[13px] font-medium tracking-[0.02em] text-amber-600">
          Vedic Astrology • Horoscope • Panchangam
        </p>
      </div>
      <div className="relative z-[1] flex flex-1 items-center justify-center px-5 pb-8 pt-6">
        <div className={cardClass}>
          <div className="mb-6 text-center">
            <h1 className="m-0 mb-2 text-[26px] font-bold leading-[1.2] tracking-[-0.02em] text-gray-800 dark:text-white">
              New Registration
            </h1>
            <p className="m-0 text-[14px] leading-[1.5] text-gray-500">
              Create your account to access personalized astrology insights
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRegister();
            }}
            className="flex flex-col gap-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="relative">
  <input
    type="text"
    name="name"
    value={formData.name}
    onChange={handleChange}
    placeholder=" "
    disabled={loading}
    className="peer w-full px-4 pt-5 pb-2 rounded-xl 
    bg-white/70 backdrop-blur-md 
    border border-amber-200 
    focus:outline-none focus:ring-2 focus:ring-amber-400"
  />

  <label className="absolute left-4 top-2 text-xs text-gray-600 dark:text-gray-300 peer-focus:text-amber-500
    transition-all 
    peer-placeholder-shown:top-3.5 
    peer-placeholder-shown:text-sm 
    peer-placeholder-shown:text-gray-400 
    peer-focus:top-2 peer-focus:text-xs peer-focus:text-amber-700">
    Full Name
  </label>

  {!formData.name && (
    <p className="text-xs text-red-500 mt-1">Name is required</p>
  )}
</div>

  <div className="relative">
  <input
    type="email"
    name="email"
    value={formData.email}
    onChange={handleChange}
    placeholder=" "
    className="peer w-full px-4 pt-5 pb-2 rounded-xl 
    bg-white/80 
    border border-gray-200 
    focus:outline-none focus:ring-2 focus:ring-amber-400"
  />

  <label className="absolute left-4 top-2 text-xs text-gray-600 
    peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm 
    peer-placeholder-shown:text-gray-400 
    peer-focus:top-2 peer-focus:text-xs peer-focus:text-amber-500">
    Email Address
  </label>

  {formData.email && !formData.email.includes("@") && (
    <p className="text-xs text-red-500 mt-1">Invalid email</p>
  )}
</div>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">


  <div className="relative">

  <input
    type={showPassword ? "text" : "password"}
    name="password"
    value={formData.password}
    onChange={handleChange}
    placeholder=" "
    className="peer w-full px-4 pt-5 pb-2 pr-12 rounded-xl 
     bg-white/80 border border-gray-200
    focus:outline-none focus:ring-2 focus:ring-amber-400"
  />

  <label className="absolute left-4 top-2 text-xs text-amber-700 
    transition-all 
    peer-placeholder-shown:top-3.5 
    peer-placeholder-shown:text-sm 
    peer-placeholder-shown:text-gray-400 
    peer-focus:top-2 peer-focus:text-xs peer-focus:text-amber-700">
    Password
  </label>

  {/* Toggle */}
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2"
  >
    {showPassword ? "🙈" : "👁"}
  </button>

  {/* Strength */}
  {formData.password && (
    <p
      className={`text-xs mt-1 ${
        getPasswordStrength(formData.password) === "Weak"
          ? "text-red-500"
          : getPasswordStrength(formData.password) === "Medium"
          ? "text-yellow-500"
          : "text-green-500"
      }`}
    >
      Strength: {getPasswordStrength(formData.password)}
    </p>
  )}
</div>

              <div className="relative">

  <input
    type={showConfirmPassword ? "text" : "password"}
    name="confirmPassword"
    value={formData.confirmPassword}
    onChange={handleChange}
    placeholder=" "
    className="peer w-full px-4 pt-5 pb-2 pr-12 rounded-xl 
    bg-white/80 border border-gray-200
    focus:outline-none focus:ring-2 focus:ring-amber-400"
  />

  <label className="absolute left-4 top-2 text-xs text-amber-700 
    transition-all 
    peer-placeholder-shown:top-3.5 
    peer-placeholder-shown:text-sm 
    peer-placeholder-shown:text-gray-400 
    peer-focus:top-2 peer-focus:text-xs peer-focus:text-amber-700">
    Confirm Password
  </label>

  {/* Toggle */}
  <button
    type="button"
    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2"
  >
    {showConfirmPassword ? "🙈" : "👁"}
  </button>

  {/* Match check */}
  {formData.confirmPassword && (
    <p
      className={`text-xs mt-1 ${
        formData.password === formData.confirmPassword
          ? "text-green-500"
          : "text-red-500"
      }`}
    >
      {formData.password === formData.confirmPassword
        ? "Passwords match"
        : "Passwords do not match"}
    </p>
  )}
</div>
</div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="relative">
  <input
    type="tel"
    name="phoneNumber"
    value={formData.phoneNumber}
    onChange={handleChange}
    placeholder=" "
    disabled={loading}
    className="peer w-full px-4 pt-5 pb-2 rounded-xl 
    bg-white/70 backdrop-blur-md 
    border border-gray-200 
    focus:outline-none focus:ring-2 focus:ring-amber-400"
  />

  <label className="absolute left-4 top-2 text-xs text-gray-600 
    transition-all 
    peer-placeholder-shown:top-3.5 
    peer-placeholder-shown:text-sm 
    peer-placeholder-shown:text-gray-400 
    peer-focus:top-2 peer-focus:text-xs peer-focus:text-amber-600">
    Phone Number (Optional)
  </label>
</div>
              {!guestId && (
                <div className="relative">
  <input
    type="date"
    name="dob"
    value={formData.dob}
    onChange={handleChange}
    disabled={loading}
    required
    className="peer w-full px-4 pt-5 pb-2 rounded-xl 
    bg-white/70 
    border border-gray-200 
    focus:outline-none focus:ring-2 focus:ring-amber-400"
  />

  <label className="absolute left-4 top-2 text-xs text-gray-600">
    Date of Birth *
  </label>
</div>
              )}
            </div>

            {guestId && (
              <p className="mb-4 text-sm text-green-600">
                We&apos;ll use the birth details you provided.
              </p>
            )}

            {!guestId && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="relative">
  <label className="text-xs text-gray-600 mb-1 block">
    Birth Place *
  </label>

  <PlaceAutocomplete
    value={formData.birthPlace}
    onChange={(v) => {
      setFormData({ ...formData, birthPlace: v });
      setError(null);
    }}
    placeholder="e.g. Mumbai, Maharashtra, India"
    required
    disabled={loading}
  />
</div>

<div className="relative">
  <input
    type="time"
    name="birthTime"
    value={formData.birthTime}
    onChange={handleChange}
    disabled={loading}
    className="peer w-full px-4 pt-5 pb-2 rounded-xl 
    bg-white/70 
    border border-gray-200 
    focus:outline-none focus:ring-2 focus:ring-amber-400"
  />

  <label className="absolute left-4 top-2 text-xs text-gray-600">
    Birth Time
  </label>
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
              className="mt-4 w-full rounded-xl 
bg-gradient-to-r from-amber-500 to-orange-500
hover:from-amber-600 hover:to-orange-600
py-3 text-white font-semibold 
shadow-lg hover:scale-[1.03] hover:shadow-2xl 
transition-all duration-300 disabled:opacity-60"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <div className="mt-7 border-t border-[#e8ddd0] pt-[22px] text-center">
            <p className="m-0 text-[14px] leading-[1.5] text-gray-500">
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
