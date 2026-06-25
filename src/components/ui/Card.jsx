export default function Card({ children, className = "", padding = true }) {
  return (
    <div className={`bg-[var(--bg-primary)] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm ${padding ? "p-6" : ""} ${className}`}>
      {children}
    </div>
  );
}
