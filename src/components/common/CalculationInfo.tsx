import styles from "@/styles/dashboard.module.css";

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
const methodologyLine = "Based on standard Vedic astrology methods.";

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
    <div className={`${styles.calculationInfo} ${className ?? ""}`.trim()} role="status">
      {method && <span className={styles.calculationMethod}>{method}</span>}
      {note && <span className={styles.calculationNote}>{note}</span>}
      <span className={styles.calculationNote}>{methodologyLine}</span>
    </div>
  );
}
