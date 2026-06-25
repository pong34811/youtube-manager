import Card from "../../components/ui/Card";
import { formatNumber } from "../../utils/youtube";
import { getTopVideos } from "../../utils/analytics";

export default function TopVideosWidget({ videos }) {
  const top = getTopVideos(videos || []);

  return (
    <Card>
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">Top 10 Videos</h3>
      <div className="space-y-3">
        {top.map((v, i) => (
          <div key={v.id} className="flex items-center space-x-3">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300" : "bg-gray-100 dark:bg-gray-700 text-gray-500"}`}>
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{v.snippet.title}</p>
              <p className="text-xs text-[var(--text-secondary)]">{formatNumber(parseInt(v.statistics.viewCount))} views</p>
            </div>
          </div>
        ))}
        {top.length === 0 && <p className="text-sm text-[var(--text-secondary)]">No video data available</p>}
      </div>
    </Card>
  );
}
