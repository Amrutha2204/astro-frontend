import styles from "@/styles/dashboard.module.css";

interface LoadingProps {
  text?: string;
}

export default function Loading({ text = "Loading..." }: LoadingProps) {
  return (
    <div className={styles.loadingContainer}>
      <p>{text}</p>
    </div>
  );
}