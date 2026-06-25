import KpiCard from "../../components/ui/KpiCard";

export default function KpiRow({ totalViews, totalSubs, totalWatchTime, revenue, totalVideos }) {
  const format = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n?.toLocaleString() || "0";
  };

  const kpis = [
    { label: "Total Views", value: format(totalViews), trend: 12, icon: "👁" },
    { label: "Total Subscribers", value: format(totalSubs), trend: 5, icon: "👥" },
    { label: "Watch Time (hrs)", value: format(totalWatchTime), trend: 8, icon: "⏱" },
    { label: "Revenue", value: revenue ? `$${format(revenue)}` : "—", trend: -2, icon: "💰" },
    { label: "Published Videos", value: totalVideos?.toLocaleString() || "0", trend: 3, icon: "🎬" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
      {kpis.map((kpi, i) => (
        <KpiCard key={i} {...kpi} />
      ))}
    </div>
  );
}
