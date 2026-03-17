type Props = {
  /** Optional: show dasha system (e.g. for dasha/kundli pages) */
  showDasha?: boolean;
  /** Optional: show ayanamsa (for chart-related pages) */
  showAyanamsa?: boolean;
  /** Optional: custom short line, e.g. "Birth time in local timezone of birth place." */
  note?: string;
  className?: string;
};

const defaultNote = "Birth time is interpreted in the local timezone of the birth place.";
const methodologyLine =
  "Based on standard Vedic astrology methods. Data from Swiss Ephemeris where applicable.";

export default function CalculationInfo({
  showDasha = true,
  showAyanamsa = true,
  note = defaultNote,
  className,
}: Props) {
  const parts: string[] = [];
  if (showAyanamsa) parts.push("Lahiri ayanamsa");
  if (showDasha) parts.push("Vimshottari dasha");
  const method = parts.length ? `Calculated using ${parts.join(", ")}.` : null;

  return (
    <div
      className={`mt-6 flex flex-col gap-2 rounded-[12px] border border-[#e8ddd0] bg-[#fffaf5] p-4 text-[13px] text-[#6b5b52] ${className ?? ""}`.trim()}
      role="status"
    >
      {method && <span className="font-semibold text-[#5c4033]">{method}</span>}
      {note && <span className="leading-[1.6]">{note}</span>}
      <span className="leading-[1.6]">{methodologyLine}</span>
    </div>
  );
}
