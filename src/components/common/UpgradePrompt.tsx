import { useRouter } from "next/router";

interface UpgradePromptProps {
  featureName?: string;
  className?: string;
}

export default function UpgradePrompt({
  featureName = "This feature",
  className = "",
}: UpgradePromptProps) {
  const router = useRouter();
  return (
    <div className={`mx-auto my-8 max-w-[400px] p-6 text-center ${className}`}>
      <div className="mb-2 text-[2.5rem]">🔒</div>
      <h3 className="mb-2 text-[1.1rem]">Premium feature</h3>
      <p className="mb-4 text-[0.95rem] text-[#666666]">
        {featureName} requires an active subscription.
      </p>
      <button
        type="button"
        className="mt-[14px] w-full rounded-[12px] bg-[linear-gradient(135deg,#8b5e34_0%,#6b4423_100%)] px-5 py-4 text-[16px] font-[700] text-white shadow-[0_8px_24px_rgba(107,68,35,0.3)] transition-all duration-300 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-[2px] hover:bg-[linear-gradient(135deg,#a67a4a_0%,#7d5a3c_100%)] hover:shadow-[0_12px_36px_rgba(107,68,35,0.4)]"
        onClick={() => router.push("/subscription/plans")}
      >
        Upgrade / Subscribe
      </button>
    </div>
  );
}
