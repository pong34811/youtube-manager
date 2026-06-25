import { useLocale } from "../../hooks/useLocale";
import Card from "../../components/ui/Card";

export default function QuickInsights({ videos }) {
  const { t } = useLocale();
  const insights = (videos || []).slice(0, 5).map((v) => {
    const views = parseInt(v.statistics?.viewCount || 0);
    const likes = parseInt(v.statistics?.likeCount || 0);
    const ctr = views > 0 ? ((likes / views) * 100).toFixed(1) : 0;
    return { id: v.id, title: v.snippet.title, views, ctr, badge: views > 100000 ? "🔥" : views > 50000 ? "⭐" : null };
  });

  return (
    <Card>
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">{t("overview.quickInsights")}</h3>
      <div className="space-y-3">
        {insights.length > 0 ? insights.map((v) => (
          <div key={v.id} className="flex items-center justify-between">
            <p className="text-sm text-[var(--text-primary)] truncate flex-1">{v.title}</p>
            {v.badge && <span className="ml-2">{v.badge}</span>}
          </div>
        )) : <p className="text-sm text-[var(--text-secondary)]">{t("overview.noInsights")}</p>}
      </div>
    </Card>
  );
}
