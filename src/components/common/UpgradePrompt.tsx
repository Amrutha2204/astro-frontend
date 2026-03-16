import { useRouter } from "next/router";
import styles from "@/styles/dashboard.module.css";

interface UpgradePromptProps {
  featureName?: string;
  className?: string;
}

export default function UpgradePrompt({ featureName = "This feature", className = "" }: UpgradePromptProps) {
  const router = useRouter();
  return (
    <div className={`p-6 text-center max-w-[400px] mx-auto my-8 ${className}`}>
      <div className="text-[2.5rem] mb-2">🔒</div>
      <h3 className="mb-2 text-[1.1rem]">Premium feature</h3>
      <p className="text-gray-500 mb-4 text-[0.95rem]">
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
