import { useRouter } from "next/router";

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
    <div className="mb-6 flex items-center justify-between border-b border-b-[#e5e7eb] pb-4">
      <button
        type="button"
        onClick={handleBack}
        className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white
bg-gradient-to-r from-rose-700 via-orange-600 to-amber-500
shadow-md transition-all duration-300
hover:scale-105 hover:shadow-lg active:scale-95"
        aria-label={backAriaLabel}
      >
        ← {backLabel}
      </button>

      {title &&
        (onTitleClick ? (
          <button
            type="button"
            className="rounded-[6px] bg-transparent px-2 py-1 text-[18px] font-semibold text-[#1f2937] transition-[background,color] duration-150 ease-in-out hover:bg-[#f5ebe0] hover:text-[#6b4423]"
            onClick={onTitleClick}
          >
            {title}
          </button>
        ) : (
          <span className="text-[18px] font-semibold text-[#1f2937]">{title}</span>
        ))}

      {onRefresh && (
        <div className="flex items-center gap-[10px]">
          <button
            type="button"
            onClick={onRefresh}
            className="flex items-center gap-[6px] rounded-[6px] border border-[#6b4423] bg-white px-4 py-2 text-[14px] font-medium text-[#6b4423] transition-all duration-200 hover:bg-[#6b4423] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
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
