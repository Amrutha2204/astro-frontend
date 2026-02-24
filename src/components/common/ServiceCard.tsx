import { ReactNode } from "react";
import styles from "@/styles/dashboard.module.css";

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
  return (
    <div className={styles.serviceCard} onClick={onClick}>
      <div className={styles.cardIcon}>{icon}</div>
      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardDescription}>{description}</p>
      {buttonText && (
        <button
          type="button"
          className={`${styles.cardButton} ${
            styles[
              `button${buttonColor.charAt(0).toUpperCase() + buttonColor.slice(1)}`
            ]
          }`}
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

