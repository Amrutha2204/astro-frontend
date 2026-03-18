interface LoadingProps {
  text?: string;
  /** "page" = centered block (min-height), "inline" = compact row */
  variant?: "page" | "inline";
}

export default function Loading({ text = "Loading...", variant = "page" }: LoadingProps) {
  const isPage = variant === "page";
  return (
    <div
      className={
        isPage
          ? "flex min-h-[320px] flex-col items-center justify-center gap-4 text-[16px] text-[#6b7280]"
          : "flex items-center justify-center gap-[10px] p-4 text-[14px] text-[#6b7280]"
      }
    >
      <span
        className="inline-block h-5 w-5 animate-spin rounded-full border-[3px] border-[#d4c4a8] border-t-[#6b4423]"
        aria-hidden
      />
      {text && <span className="font-medium">{text}</span>}
    </div>
  );
}
