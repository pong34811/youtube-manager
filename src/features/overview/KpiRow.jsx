import { useLocale } from "../../hooks/useLocale";
import KpiCard from "../../components/ui/KpiCard";

export default function KpiRow({ totalViews, totalSubs, totalVideos }) {
  const { t } = useLocale();
  const format = (n) => n?.toLocaleString() || "0";

  const kpis = [
    { label: t("overview.totalViews"), value: format(totalViews), icon: "👁" },
    { label: t("overview.totalSubs"), value: format(totalSubs), icon: "👥" },
    { label: t("overview.publishedVideos"), value: totalVideos?.toLocaleString() || "0", icon: "🎬" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {kpis.map((kpi, i) => (
        <KpiCard key={i} {...kpi} />
      ))}
    </div>
  );
}