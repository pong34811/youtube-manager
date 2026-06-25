export default function KpiCard({ label, value, trend, trendLabel, icon }) {
  const isUp = trend > 0;
  return (
    <div className="bg-[var(--bg-primary)] rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-[var(--text-secondary)]">{label}</span>
        {icon && <span className="text-[var(--text-secondary)]">{icon}</span>}
      </div>
      <div className="text-3xl text-[var(--text-primary)] mb-1">{value}</div>
      <div className="flex items-center space-x-1">
        <span className={`text-sm ${isUp ? "text-green-600" : "text-red-600"}`}>
          {isUp ? "▲" : "▼"} {Math.abs(trend)}%
        </span>
        {trendLabel && <span className="text-xs text-[var(--text-secondary)]">{trendLabel}</span>}
      </div>
    </div>
  );
}
