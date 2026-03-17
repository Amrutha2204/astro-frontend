import { InputHTMLAttributes, FC } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

const Input: FC<InputProps> = ({ className = "", ...props }) => {
  return <input className={`input-field ${className}`} {...props} />;
};

export default Input;
