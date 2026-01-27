import { useRouter } from "next/router";
import Link from "next/link";
import styles from "@/styles/dashboard.module.css";

const AppSidebar = () => {
  const router = useRouter();

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem("token");
    
    // Clear any cached data
    localStorage.clear();
    
    // Force navigation and prevent back button access
    // Using window.location.replace prevents back navigation
    window.location.replace("/auth/login");
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "→", href: "/dashboard" },
    { id: "kundli", label: "My Kundli", icon: "→", href: "/kundli" },
    {
      id: "horoscope",
      label: "Horoscope",
      icon: "→",
      href: "/horoscope/today",
    },
    { id: "calendar", label: "Calendar", icon: "→", href: "/calendar" },
    { id: "transits", label: "Transits", icon: "→", href: "/transits" },
    { id: "dasha", label: "Dasha", icon: "→", href: "/dasha" },
    { id: "dosha", label: "Dosha Check", icon: "→", href: "/dosha" },
    {
      id: "compatibility",
      label: "Match Horoscope",
      icon: "→",
      href: "/compatibility",
    },
    { id: "remedies", label: "Remedies", icon: "→", href: "/remedies" },
    {
      id: "ai-assistant",
      label: "AI Assistant",
      icon: "→",
      href: "/ai-assistant/chat",
    },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.kundliName}>My Kundli</h2>
      </div>

      <nav className={styles.sidebarNav}>
        <ul className={styles.menuList}>
          {menuItems.map((item) => (
            <li key={item.id} className={styles.menuItem}>
              <Link
                href={item.href || "#"}
                className={`${styles.menuButton} ${
                  router.pathname === item.href ? styles.menuButtonActive : ""
                }`}
              >
                <span className={styles.menuIcon}>{item.icon}</span>
                <span className={styles.menuLabel}>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.sidebarFooter}>
        <button
          className={styles.logoutButton}
          onClick={handleLogout}
          aria-label="Logout"
        >
          <span className={styles.menuIcon}>🚪</span>
          <span className={styles.menuLabel}>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;

