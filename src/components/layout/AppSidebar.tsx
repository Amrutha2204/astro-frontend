import { useRouter } from "next/router";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import styles from "@/styles/dashboard.module.css";

const AppSidebar = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const isGuest = useSelector(selectIsGuest);

  const handleLogout = useCallback(() => {
    dispatch(clearToken());
    router.push("/auth/login");
  }, [dispatch, router]);

  const menuItems = isGuest ? GUEST_MENU : AUTH_MENU;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.kundliName}>{isGuest ? "Jyotishya Darshan" : "My Kundli"}</h2>
      </div>

      <nav className={styles.sidebarNav}>
        <ul className={styles.menuList}>
          {menuItems.map((item) => (
            <li key={item.id} className={styles.menuItem}>
              <Link
                href={item.href}
                className={`${styles.menuButton} ${router.pathname === item.href ? styles.menuButtonActive : ""}`}
              >
                <span className={styles.menuLabel}>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.sidebarFooter}>
        {isGuest ? (
          <>
            <Link href="/auth/login" className={`${styles.menuButton} ${router.pathname === "/auth/login" ? styles.menuButtonActive : ""} no-underline`}>
              <span className={styles.menuLabel}>Login</span>
            </Link>
            <Link href="/auth/register" className={`${styles.menuButton} ${router.pathname === "/auth/register" ? styles.menuButtonActive : ""} no-underline mt-1`}>
              <span className={styles.menuLabel}>Register</span>
            </Link>
          </>
        ) : (
          <button className={styles.logoutButton} onClick={handleLogout} aria-label="Logout">
            <span className={styles.menuLabel}>Logout</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default AppSidebar;
