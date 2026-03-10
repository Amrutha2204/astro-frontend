import { useRouter } from "next/router";
import styles from "@/styles/dashboard.module.css";

interface PageHeaderProps {
  onBack?: () => void;
  backLabel?: string;
  backAriaLabel?: string;
  title?: string;
  /**
   * If provided, title becomes a clickable button.
   * If omitted, title is rendered as plain text.
   */
  onTitleClick?: () => void;
  onRefresh?: () => void;
  refreshLabel?: string;
  refreshAriaLabel?: string;
  disableRefresh?: boolean;
}

export default function PageHeader({
  onBack,
  backLabel = "Back",
  backAriaLabel,
  title,
  onTitleClick,
  onRefresh,
  refreshLabel = "🔄 Refresh",
  refreshAriaLabel,
  disableRefresh,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className={styles.pageHeader}>
      <button
        type="button"
        onClick={handleBack}
        className={styles.backButton}
        aria-label={backAriaLabel}
      >
        ← {backLabel}
      </button>

      {title && (
        onTitleClick ? (
          <button
            type="button"
            className={styles.pageTitleButton}
            onClick={onTitleClick}
          >
            {title}
          </button>
        ) : (
          <span className={styles.pageTitleLabel}>{title}</span>
        )
      )}

      {onRefresh && (
        <div className={styles.headerActions}>
          <button
            type="button"
            onClick={onRefresh}
            className={styles.refreshButton}
            aria-label={refreshAriaLabel}
            disabled={disableRefresh}
          >
            {refreshLabel}
          </button>
        </div>
      )}
    </div>
  );
}

