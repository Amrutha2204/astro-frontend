import { useRouter } from "next/router";
import styles from "@/styles/dashboard.module.css";

interface UpgradePromptProps {
  featureName?: string;
  className?: string;
}

export default function UpgradePrompt({ featureName = "This feature", className = "" }: UpgradePromptProps) {
  const router = useRouter();
  return (
    <div className={className} style={{ padding: "1.5rem", textAlign: "center", maxWidth: "400px", margin: "2rem auto" }}>
      <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🔒</div>
      <h3 style={{ marginBottom: "0.5rem", fontSize: "1.1rem" }}>Premium feature</h3>
      <p style={{ color: "#666", marginBottom: "1rem", fontSize: "0.95rem" }}>
        {featureName} requires an active subscription.
      </p>
      <button
        type="button"
        className={styles.chatNowButton}
        onClick={() => router.push("/subscription/plans")}
      >
        Upgrade / Subscribe
      </button>
    </div>
  );
}
