import { type ReactNode } from "react";

interface ServiceCardProps {
  title: string;
  icon: ReactNode;
  description: string;
  onClick?: () => void;
  buttonText?: string;
  buttonColor?: "red" | "purple" | "blue";
}

const ServiceCard = ({
  title,
  icon,
  description,
  onClick,
  buttonText,
  buttonColor = "red",
}: ServiceCardProps) => {
  const buttonColorClass =
    buttonColor === "purple"
      ? "bg-[#9333ea] text-white hover:bg-[#7e22ce]"
      : buttonColor === "blue"
        ? "bg-[#2563eb] text-white hover:bg-[#1d4ed8]"
        : "bg-[#6b4423] text-white hover:bg-[#5c3a1f]";

  return (
    <div
      className="flex cursor-pointer flex-col overflow-hidden rounded-[12px] border border-[var(--border)] bg-[var(--card-bg)] p-0 text-[var(--text-main)] shadow-[0_1px_3px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
      onClick={onClick}
    >
      <div className="mb-3 flex h-[60px] items-center justify-center text-[48px]">{icon}</div>
      <h3 className="mx-4 mb-[6px] text-[16px] font-semibold text-[#1f2937]">{title}</h3>
      <p className="mx-4 mb-4 flex-1 text-[13px] leading-[1.5] text-[#6b7280]">{description}</p>
      {buttonText && (
        <button
          type="button"
          className={`mt-2 w-full rounded-[6px] px-4 py-2 text-[14px] font-semibold transition-colors duration-200 ${buttonColorClass}`}
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
};

export default ServiceCard;
