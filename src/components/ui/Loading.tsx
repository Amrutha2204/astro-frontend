import styles from "@/styles/dashboard.module.css";

interface LoadingProps {
  text?: string;
  /** "page" = centered block (min-height), "inline" = compact row */
  variant?: "page" | "inline";
}

export default function Loading({ text = "Loading...", variant = "page" }: LoadingProps) {
  const isPage = variant === "page";
  return (
    <div className={isPage ? styles.loadingContainer : styles.loadingInline}>
      <span className={styles.loadingSpinner} aria-hidden />
      {text && <span className={styles.loadingText}>{text}</span>}
    </div>
  );
}
