import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

const Card = ({ children, className = "" }: CardProps) => {
  return (
    <div className={`rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
