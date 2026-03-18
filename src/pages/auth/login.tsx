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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const pageClass = "relative flex min-h-screen flex-col bg-[#faf8f5]";
  const headerClass = "relative z-[1] px-6 pb-7 pt-12 text-center";
  const cardClass =
    "max-h-[85vh] w-full max-w-[440px] overflow-y-auto rounded-[16px] border border-[#e8ddd0] border-t-[3px] border-t-[#6b4423] bg-white px-8 py-9 shadow-[0_10px_40px_rgba(92,64,51,0.1),0_2px_8px_rgba(0,0,0,0.04)]";
  const labelClass = "m-0 text-[14px] font-semibold text-[#374151]";
  const inputClass =
    "w-full rounded-[8px] border border-[#e8ddd0] bg-[#faf8f5] px-[14px] py-3 text-[15px] outline-none transition-[border-color,background,box-shadow] duration-200 placeholder:text-[#9ca3af] focus:border-[#6b4423] focus:bg-white focus:shadow-[0_0_0_3px_rgba(107,68,35,0.12)] disabled:cursor-not-allowed disabled:bg-[#f9fafb] disabled:opacity-60";

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
        if (!isValidJwtFormat(token)) {
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
          <div className="mb-7 text-center">
            <h1 className="m-0 mb-2 text-[26px] font-bold leading-[1.2] tracking-[-0.02em] text-[#5c4033]">
              Login
            </h1>
            <p className="m-0 text-[14px] leading-[1.5] text-[#5c5047]">
              Enter your credentials to access your personalized astrology insights
            </p>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-[18px]">
            <div className="flex flex-col gap-2">
              <label className={labelClass}>
                Email Address <span className="font-bold text-[#6b4423]">*</span>
              </label>
              <input
                type="email"
                value={email}
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                autoComplete="email"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClass}>
                Password <span className="font-bold text-[#6b4423]">*</span>
              </label>
              <input
                type="password"
                value={password}
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                autoComplete="current-password"
                className={inputClass}
              />
              <div className="mt-[-4px] text-right">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    showError("Forgot password feature coming soon!");
                  }}
                  className="text-[13px] font-medium text-[#6b4423] no-underline transition-colors duration-200 hover:text-[#5c3a1f] hover:underline"
                >
                  Forgot Password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-[8px] bg-[#6b4423] px-6 py-[14px] text-[16px] font-semibold text-white transition-all duration-200 hover:-translate-y-px hover:bg-[#5c3a1f] hover:shadow-[0_4px_12px_rgba(107,68,35,0.25)] disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-7 border-t border-[#e8ddd0] pt-[22px] text-center">
            <p className="m-0 text-[14px] leading-[1.5] text-[#5c5047]">
              Don&apos;t have an account?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/auth/register");
                }}
                className="font-semibold text-[#6b4423] no-underline transition-colors duration-200 hover:text-[#5c3a1f]"
              >
                Register here
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
