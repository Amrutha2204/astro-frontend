export default function ErrorMessage({
  message = "Unable to load data. Please try again.",
}: {
  message?: string;
}) {
  return <div className="error-box">⚠️ {message}</div>;
}
