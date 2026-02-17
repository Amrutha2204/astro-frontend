import { useState } from "react";
import dashboard from "@/styles/dashboard.module.css";
import zodiac from "@/styles/zodiac.module.css";

const SIGN_MEANINGS: Record<string, string> = {
  Aries: "Bold, energetic leader driven by action.",
  Taurus: "Grounded, loyal, comfort-loving builder.",
  Gemini: "Curious communicator with fast thinking.",
  Cancer: "Emotional nurturer guided by intuition.",
  Leo: "Confident creator who shines naturally.",
  Virgo: "Detail-focused helper seeking perfection.",
  Libra: "Harmony-seeker valuing beauty and balance.",
  Scorpio: "Intense transformer with deep insight.",
  Sagittarius: "Explorer driven by truth and freedom.",
  Capricorn: "Strategic achiever focused on success.",
  Aquarius: "Visionary thinker breaking conventions.",
  Pisces: "Empathic dreamer guided by imagination."
};

const ALL_SIGNS = Object.keys(SIGN_MEANINGS);

export default function SunSignExplorer({
  userSign
}: {
  userSign: string;
}) {
  const [selected, setSelected] = useState(userSign);

  return (
    <div className={zodiac.container}>
      <h2 className={dashboard.sectionTitle}>
        ☀ Sun Sign Explorer
      </h2>

      {/* Sign Grid */}
      <div className={zodiac.grid}>
        {ALL_SIGNS.map((sign) => {
          const isActive = selected === sign;
          const isUser = sign === userSign;

          return (
            <button
              key={sign}
              onClick={() => setSelected(sign)}
              className={`
                ${zodiac.signButton}
                ${isActive ? zodiac.active : ""}
                ${isUser ? zodiac.userSign : ""}
              `}
            >
              {sign}
              {isUser && " ⭐"}
            </button>
          );
        })}
      </div>

      {/* Meaning Card */}
      <div className={zodiac.meaningCard}>
        <h3 className={zodiac.meaningTitle}>
          ✨ {selected}
        </h3>

        <p className={zodiac.meaningText}>
          {SIGN_MEANINGS[selected]}
        </p>
      </div>
    </div>
  );
}