import { InputHTMLAttributes } from "react";

type InputProps = {
  label: string;
  id: string;
} & InputHTMLAttributes<HTMLInputElement>;

const Input = ({ label, id, className = "", ...props }: InputProps) => {
  return (
    <label className="flex w-full flex-col gap-1 text-sm text-gray-700" htmlFor={id}>
      <span className="font-medium">{label}</span>
      <input
        id={id}
        className={`w-full rounded-md border border-gray-200 px-3 py-2 text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 ${className}`}
        {...props}
      />
    </label>
  );
};

export default Input;
