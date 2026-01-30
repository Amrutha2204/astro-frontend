import styles from "@/styles/dashboard.module.css";

type Props = {
  /** "guest" = we don't store your data; "loggedIn" = based on saved details */
  variant: "guest" | "loggedIn";
  /** Show a short tip about birth time accuracy */
  showAccuracyTip?: boolean;
  className?: string;
};

const messages = {
  guest:
    "This result is based only on the details you entered. We don't store or share your data.",
  loggedIn: "This result is based on your saved birth details.",
};

const accuracyTip =
  "For best accuracy, use a precise birth time (hours and minutes).";

export default function TrustNote({
  variant,
  showAccuracyTip = false,
  className,
}: Props) {
  return (
    <div
      className={`${styles.trustNote} ${className ?? ""}`.trim()}
      role="status"
    >
      <span className={styles.trustNoteText}>{messages[variant]}</span>
      {showAccuracyTip && (
        <span className={styles.trustNoteTip}>{accuracyTip}</span>
      )}
    </div>
  );
}
