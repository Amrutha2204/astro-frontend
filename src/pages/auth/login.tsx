import { useState } from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { loginUser } from "@/services/authService";
import { showError, showSuccess } from "@/utils/toast";
import { setToken } from "@/store/slices/authSlice";
import { isValidJwtFormat } from "@/utils/auth";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const getPasswordStrength = (password: string) => {
    if (password.length < 4) {
      return "Weak";
    }
    if (password.length < 8) {
      return "Medium";
    }
    return "Strong";
  };
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

    loginUser({ email: trimmedEmail.toLowerCase(), password: trimmedPassword })
      .then((res) => {
        if (res.status === 401) {
          showError("Invalid email or password. Please check your credentials.");
          setLoading(false);
          return;
        }

        const rawToken = res.data?.accessToken;

        if (!rawToken || !isValidJwtFormat(rawToken)) {
          showError("Invalid token received from server");
          setLoading(false);
          return;
        }

        const token = rawToken.trim(); // now guaranteed string
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
          err &&
          typeof err === "object" &&
          "message" in err &&
          typeof (err as Error).message === "string"
            ? (err as Error).message
            : "Invalid email or password";
        showError(errorMessage);
        console.error("Login error:", err);
      });
  };

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center 
  bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 
  dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 
  text-gray-800 dark:text-gray-200 overflow-hidden px-4"
    >
      {/* 🌌 Floating background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Left soft */}
        <div className="absolute top-24 left-16 w-32 h-32 bg-amber-300/20 rounded-full blur-3xl animate-floatSlow" />

        {/* Right soft */}
        <div className="absolute bottom-24 right-16 w-36 h-36 bg-orange-300/20 rounded-full blur-3xl animate-floatSlow2" />

        {/* Center subtle */}
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-yellow-300/20 rounded-full blur-2xl animate-floatSlow -translate-x-1/2 -translate-y-1/2" />
      </div>
      {/* 🌟 TOP HEADER (FIXED ISSUE HERE) */}
      <div className="text-center mb-8 z-10">
        <h1 className="text-3xl font-bold text-amber-900 dark:text-yellow-300 flex items-center justify-center gap-2">
          🪔 Jyotishya Darshan
        </h1>
        <p className="text-sm text-amber-700 dark:text-gray-300">
          Vedic Astrology • Horoscope • Panchangam
        </p>
      </div>

      {/* 💎 CARD */}
      <div className="relative z-10 w-full max-w-md">
        <div className="p-[1px] rounded-3xl bg-gradient-to-br from-amber-200 via-orange-200 to-yellow-200 shadow-2xl">
          <div className="rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl px-10 py-12">
            {/* Title */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-amber-900 dark:text-yellow-300">
                Welcome Back
              </h2>
              <p className="text-sm text-amber-700 dark:text-gray-300 mt-1">
                Continue your astrology journey ✨
              </p>
            </div>

            {/* Form */}
            <form onSubmit={submit} className="flex flex-col gap-5">
              {/* Email */}
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder=" "
                  className={`peer w-full px-4 pt-5 pb-2 rounded-xl 
    bg-white/70 dark:bg-gray-700/70 
    border ${!email ? "border-amber-200" : "border-amber-400"} 
    focus:outline-none focus:ring-2 focus:ring-amber-400`}
                />

                <label
                  className="absolute left-4 top-2 text-xs text-amber-700 dark:text-gray-300 
    transition-all 
    peer-placeholder-shown:top-3.5 
    peer-placeholder-shown:text-sm 
    peer-placeholder-shown:text-gray-400 
    peer-focus:top-2 peer-focus:text-xs peer-focus:text-amber-700"
                >
                  Email Address
                </label>

                {!email && <p className="text-xs text-red-500 mt-1">Email is required</p>}
              </div>

              {/* Password */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder=" "
                  className={`peer w-full px-4 pt-5 pb-2 pr-12 rounded-xl 
    bg-white/70 dark:bg-gray-700/70 
    border ${!password ? "border-amber-200" : "border-amber-400"} 
    focus:outline-none focus:ring-2 focus:ring-amber-400`}
                />

                {/* Floating label */}
                <label
                  className="absolute left-4 top-2 text-xs text-amber-700 dark:text-gray-300 
    transition-all 
    peer-placeholder-shown:top-3.5 
    peer-placeholder-shown:text-sm 
    peer-placeholder-shown:text-gray-400 
    peer-focus:top-2 peer-focus:text-xs peer-focus:text-amber-700"
                >
                  Password
                </label>

                {/* 👁 Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                >
                  {showPassword ? "🙈" : "👁"}
                </button>

                {/* Validation */}
                {!password && <p className="text-xs text-red-500 mt-1">Password is required</p>}

                {/* Strength */}
                {password && (
                  <p
                    className={`text-xs mt-1 ${
                      getPasswordStrength(password) === "Weak"
                        ? "text-red-500"
                        : getPasswordStrength(password) === "Medium"
                          ? "text-yellow-500"
                          : "text-green-500"
                    }`}
                  >
                    Strength: {getPasswordStrength(password)}
                  </p>
                )}

                {/* Forgot */}
                <div className="text-right mt-2">
                  <button
                    type="button"
                    onClick={() => showError("Forgot password coming soon")}
                    className="text-xs text-amber-700 dark:text-yellow-300 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 py-3 rounded-xl font-semibold 
              bg-gradient-to-r from-amber-600 to-orange-500 
              text-white shadow-lg hover:scale-[1.02] hover:shadow-xl 
              transition"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-[1px] bg-amber-200 dark:bg-gray-700" />
              <span className="text-xs text-amber-600 dark:text-gray-400">OR</span>
              <div className="flex-1 h-[1px] bg-amber-200 dark:bg-gray-700" />
            </div>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-amber-700 dark:text-gray-300">
                Don’t have an account?{" "}
                <span
                  onClick={() => router.push("/auth/register")}
                  className="text-amber-900 dark:text-yellow-300 font-semibold cursor-pointer"
                >
                  Register
                </span>
              </p>

              <div className="mt-3">
                <span
                  onClick={() => router.push("/")}
                  className="text-sm text-amber-700 dark:text-gray-400 cursor-pointer hover:underline"
                >
                  ← Back to Home
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
