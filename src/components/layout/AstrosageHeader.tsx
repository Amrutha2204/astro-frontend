import { useState } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/astrosage.module.css";

const AstrosageHeader = () => {
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button 
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Go back"
          title="Go back"
        >
          ✕
        </button>
        <div className={styles.logo}>Jyotishya Darshan</div>
      </div>

      <div className={styles.headerIcons}>
        <button
          className={styles.iconButton}
          title="Home"
          aria-label="Go to dashboard"
          onClick={() => router.push("/dashboard")}
        >
          🏠
        </button>
        {showSearch ? (
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
              autoFocus
              aria-label="Search"
            />
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => {
                setShowSearch(false);
                setSearchQuery("");
              }}
              aria-label="Close search"
            >
              ✕
            </button>
          </form>
        ) : (
          <button
            className={styles.iconButton}
            title="Search"
            aria-label="Open search"
            onClick={() => setShowSearch(true)}
          >
            🔍
          </button>
        )}
      </div>

      <div className={styles.headerRight}>
        <div className={styles.currency}>
          <span className={styles.currencySymbol}>₹</span>
          <span className={styles.currencyAmount}>0.0</span>
        </div>
      </div>
    </header>
  );
};

export default AstrosageHeader;

