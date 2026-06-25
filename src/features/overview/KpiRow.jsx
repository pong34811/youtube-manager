import { useLocale } from "../../hooks/useLocale";
import KpiCard from "../../components/ui/KpiCard";

export default function KpiRow({ totalViews, totalSubs, totalVideos, trends }) {
  const { t } = useLocale();
  const format = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n?.toLocaleString() || "0";
  };

  const kpis = [
    { label: t("overview.totalViews"), value: format(totalViews), trend: trends?.views, trendLabel: "เทียบกับปีที่แล้ว", icon: "👁" },
    { label: t("overview.totalSubs"), value: format(totalSubs), trend: trends?.subs, trendLabel: "เทียบกับปีที่แล้ว", icon: "👥" },
    { label: t("overview.publishedVideos"), value: totalVideos?.toLocaleString() || "0", trend: trends?.videos, trendLabel: "เทียบกับปีที่แล้ว", icon: "🎬" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {kpis.map((kpi, i) => (
        <KpiCard key={i} {...kpi} />
      ))}
    </div>
  );
}