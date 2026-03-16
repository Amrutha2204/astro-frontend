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

  const homeHref = isGuest ? "/" : "/dashboard";
  const sidebarTitle = isGuest ? "Jyotishya Darshan" : "My Kundli";
  const sidebarTitleAria = isGuest ? "Go to home" : "Go to dashboard";
  const menuButtonBase =
    "flex w-full items-center gap-[10px] px-5 py-3 text-left text-[14px] text-white transition-colors duration-200";
  const menuButtonState = (active: boolean) =>
    `${menuButtonBase} ${active ? "bg-white/15 font-semibold" : "bg-transparent hover:bg-white/10"}`;

  return (
    <aside className="fixed left-0 top-[50px] flex h-[calc(100vh-50px)] w-[260px] shrink-0 flex-col overflow-hidden bg-[var(--accent)] text-white shadow-[2px_0_4px_rgba(0,0,0,0.1)] max-[768px]:w-[200px]">
      <div className="shrink-0 border-b border-white/20 p-5">
        <Link
          href={homeHref}
          className="mt-0 block rounded-[8px] px-3 py-2 text-[18px] font-semibold text-white no-underline transition-colors duration-200 hover:bg-white/15 active:bg-white/20"
          aria-label={sidebarTitleAria}
          title={sidebarTitleAria}
        >
          {sidebarTitle}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-0 py-[10px]">
        <ul className="m-0 list-none p-0">
          {menuItems.map((item) => (
            <li key={item.id} className="m-0">
              <Link href={item.href} className={menuButtonState(router.pathname === item.href)}>
                <span className="flex-1">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto border-t border-white/20 px-0 py-[10px]">
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
            className={`${menuButtonBase} bg-transparent hover:bg-white/15 active:bg-white/20`}
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
