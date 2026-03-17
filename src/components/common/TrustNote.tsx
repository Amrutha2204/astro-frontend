type Props = {
  /** "guest" = we don't store your data; "loggedIn" = based on saved details */
  variant: "guest" | "loggedIn";
  /** Show a short tip about birth time accuracy */
  showAccuracyTip?: boolean;
  className?: string;
};

const messages = {
  guest: "This result is based only on the details you entered. We don't store or share your data.",
  loggedIn: "This result is based on your saved birth details.",
};

const guidanceLine = "For guidance only. Consider consulting an expert for major life decisions.";

const accuracyTip = "For best accuracy, use a precise birth time (hours and minutes).";

export default function TrustNote({ variant, showAccuracyTip = false, className }: Props) {
  return (
    <div
      className={`mt-6 flex flex-col gap-2 rounded-[12px] border border-[#e8ddd0] bg-[#fdf8f3] p-4 text-[13px] text-[#6b5b52] ${className ?? ""}`.trim()}
      role="status"
    >
      <span className="font-medium text-[#5c4033]">{messages[variant]}</span>
      <span className="leading-[1.6]">{guidanceLine}</span>
      {showAccuracyTip && <span className="leading-[1.6]">{accuracyTip}</span>}
    </div>
  );
}
