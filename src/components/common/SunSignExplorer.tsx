import { useState } from "react";

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
  Pisces: "Empathic dreamer guided by imagination.",
};

const ALL_SIGNS = Object.keys(SIGN_MEANINGS);

export default function SunSignExplorer({ userSign }: { userSign: string }) {
  const [selected, setSelected] = useState(userSign);

  return (
    <div className="mt-[30px]">
      <h2 className="mb-6 border-b-[2px] border-b-[#d4a574] pb-[14px] text-[26px] font-bold tracking-[-0.01em] text-[#6b4423]">
        ☀ Sun Sign Explorer
      </h2>

      <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
        {ALL_SIGNS.map((sign) => {
          const isActive = selected === sign;
          const isUser = sign === userSign;

          return (
            <button
              key={sign}
              onClick={() => setSelected(sign)}
              className={`rounded-[12px] border px-[14px] py-[14px] font-medium transition-all duration-200 ease-in-out hover:-translate-y-[2px] hover:bg-[#f2f2f2] ${isActive ? "border-[2px] border-[#684804] bg-[#d6964e22]" : "border border-[#c9c9c9] bg-[#fafafa]"} ${isUser ? "font-bold" : ""}`}
            >
              {sign}
              {isUser && " ⭐"}
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-[16px] border-[2px] border-[#c5720d] bg-[linear-gradient(135deg,#fff9f2,#d6b162)] p-[22px] shadow-[0_6px_18px_rgba(0,0,0,0.06)] transition-all duration-[250ms] ease-in-out hover:-translate-y-[2px] hover:shadow-[0_10px_24px_rgba(0,0,0,0.1)]">
        <h3 className="mb-[10px] font-bold text-[#130e01]">✨ {selected}</h3>

        <p className="text-[16px] leading-[1.6] text-[#333333]">{SIGN_MEANINGS[selected]}</p>
      </div>
    </div>
  );
}
