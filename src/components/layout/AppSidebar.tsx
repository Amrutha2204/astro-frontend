import { useRouter } from "next/router";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import { selectIsGuest, selectRoleId, clearToken, ADMIN_ROLE_ID } from "@/store/slices/authSlice";

type NavItem = { id: string; label: string; href: string };

const GUEST_MENU: NavItem[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "kundli", label: "Free Kundli", href: "/guest-kundli" },
  { id: "transits", label: "Transits", href: "/transits" },
  { id: "calendar", label: "Calendar", href: "/calendar" },
  { id: "horoscope", label: "Horoscope", href: "/guest-horoscope" },
  { id: "dasha", label: "Dasha", href: "/guest-dasha" },
  { id: "dosha", label: "Dosha", href: "/guest-dosha" },
  { id: "compatibility", label: "Match", href: "/compatibility" },
];

const AUTH_MENU_BASE: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard" },
  { id: "kundli", label: "My Kundli", href: "/kundli" },
  { id: "horoscope", label: "Horoscope", href: "/horoscope/today" },
  { id: "calendar", label: "Calendar", href: "/calendar" },
  { id: "transits", label: "Transits", href: "/transits" },
  { id: "dasha", label: "Dasha", href: "/dasha" },
  { id: "dosha", label: "Dosha Check", href: "/dosha" },
  { id: "compatibility", label: "Match", href: "/compatibility" },
  { id: "remedies", label: "Remedies", href: "/remedies" },
  { id: "family", label: "Family Profiles", href: "/familyProfiles" },
  { id: "career-guidance", label: "Career Guidance", href: "/career-guidance" },
  { id: "shareable-card", label: "Shareable Card", href: "/shareable-card" },
  { id: "ai-assistant", label: "AI Assistant", href: "/ai-assistant/chat" },
  { id: "subscription", label: "Subscription", href: "/subscription/plans" },
  { id: "payment", label: "Wallet & Payment", href: "/payment" },
  { id: "reports", label: "Premium Reports", href: "/reports" },
  { id: "profile", label: "Profile", href: "/profile" },
  { id: "notifications", label: "Notifications", href: "/settings/notifications" },
];

const AppSidebar = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const isGuest = useSelector(selectIsGuest);
  const roleId = useSelector(selectRoleId);
  const isAdmin = roleId === ADMIN_ROLE_ID;

  const handleLogout = useCallback(() => {
    dispatch(clearToken());
    router.push("/auth/login");
  }, [dispatch, router]);

  const menuItems = isGuest
    ? GUEST_MENU
    : isAdmin
      ? [...AUTH_MENU_BASE, { id: "admin", label: "Admin", href: "/admin" }]
      : AUTH_MENU_BASE;

  const menuButtonBase =
    "group relative flex w-full items-center gap-3 px-6 py-3 text-left text-sm text-white/90 rounded-lg no-underline transition-all duration-300";
  const menuButtonState = (active: boolean) =>
    `${menuButtonBase} ${
      active
        ? "bg-white/20 text-white font-semibold shadow-lg"
        : "hover:bg-white/10 hover:text-white hover:translate-x-1"
    }`;

  return (
    <aside
      className="fixed left-0 top-[56px] flex h-[calc(100vh-50px)] w-[260px] shrink-0 flex-col overflow-hidden
bg-gradient-to-b from-rose-900 via-orange-800 to-amber-700
text-white
shadow-2xl backdrop-blur-md
border-r border-white/10
max-[768px]:w-[200px]"
    >
      <div className="shrink-0 border-b border-white/10 p-6 bg-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-2">
          {/* Logo Circle */}
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full
      bg-gradient-to-br from-yellow-300 via-orange-400 to-rose-500
      text-lg font-bold text-white shadow-lg"
          >
            ॐ
          </div>

          {/* Brand Text */}
          <div className="flex flex-col">
            <h1 className="text-lg font-bold tracking-wide text-white">Jyotishya Darshan</h1>
            <p className="text-xs text-white/70">Vedic Astrology Portal</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-0 py-[10px]">
        <ul className="m-0 list-none p-3 space-y-1">
          {menuItems.map((item) => (
            <li key={item.id} className="m-0">
              <Link href={item.href} className={menuButtonState(router.pathname === item.href)}>
                {router.pathname === item.href && (
                  <span className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-yellow-300 to-rose-400 rounded-r" />
                )}
                <span className="flex-1">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto border-t border-white/10 p-3 bg-white/5 backdrop-blur-sm">
        {isGuest ? (
          <>
            <Link
              href="/auth/login"
              className={`${menuButtonState(router.pathname === "/auth/login")} no-underline`}
            >
              <span className="flex-1">Login</span>
            </Link>
            <Link
              href="/auth/register"
              className={`${menuButtonState(router.pathname === "/auth/register")} mt-1 no-underline`}
            >
              <span className="flex-1">Register</span>
            </Link>
          </>
        ) : (
          <button
            className="flex w-full items-center gap-3 px-6 py-3 text-sm text-red-200 hover:text-white hover:bg-red-500/20 transition-all duration-300 rounded-lg"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <span className="flex-1">Logout</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default AppSidebar;
