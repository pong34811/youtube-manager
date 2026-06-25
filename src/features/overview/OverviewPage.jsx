import { useState } from "react";
import { useAllConfigs } from "../../hooks/useChannelData";
import { useChannelInfo, useChannelVideos } from "../../hooks/useYouTubeApi";
import { useLocale } from "../../hooks/useLocale";
import Select from "../../components/ui/Select";
import Spinner from "../../components/ui/Spinner";
import Card from "../../components/ui/Card";
import KpiCard from "../../components/ui/KpiCard";
import KpiRow from "./KpiRow";
import TopVideosWidget from "./TopVideosWidget";
import QuickInsights from "./QuickInsights";
import { analyzePerformance, analyzeWeekdayPattern, analyzeKeywords, analyzeTitleLength } from "../../utils/analytics";
import { formatNumber } from "../../utils/youtube";

export default function OverviewPage() {
  const { t } = useLocale();
  const { configs } = useAllConfigs();
  const configList = Object.entries(configs).map(([id, c]) => ({ id, ...c }));
  const [selectedConfigId, setSelectedConfigId] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const configId = selectedConfigId || configList[0]?.id || "";
  const selectedConfig = configList.find((c) => c.id === configId);
  const currentYear = new Date().getFullYear();
  const { data: channelData, isLoading: channelLoading } = useChannelInfo(selectedConfig?.apiKey, selectedConfig?.channelId);
  const { data: videos, isLoading: videosLoading } = useChannelVideos(selectedConfig?.apiKey, selectedConfig?.channelId, selectedYear);

  const isLoading = channelLoading || videosLoading;

  const performance = videos ? analyzePerformance(videos) : null;
  const weekdayPattern = videos ? analyzeWeekdayPattern(videos) : null;
  const keywords = videos ? analyzeKeywords(videos) : null;
  const titleLen = videos ? analyzeTitleLength(videos) : null;
  const avgViews = videos?.length > 0
    ? Math.round(videos.reduce((s, v) => s + parseInt(v.statistics?.viewCount || 0), 0) / videos.length)
    : 0;
  const avgLikes = videos?.length > 0
    ? Math.round(videos.reduce((s, v) => s + parseInt(v.statistics?.likeCount || 0), 0) / videos.length)
    : 0;

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const y = currentYear - i;
    return { value: y, label: String(y + 543) };
  });

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t("page.overview")}</h1>
        <div className="flex space-x-3">
          <div className="w-56">
            <Select
              options={configList.map((c) => ({ value: c.id, label: c.channelName || c.id }))}
              value={configId}
              onChange={setSelectedConfigId}
            />
          </div>
          <div className="w-32">
            <Select options={yearOptions} value={selectedYear} onChange={(v) => setSelectedYear(Number(v))} />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : (
        <>
          <KpiRow
            totalViews={parseInt(channelData?.statistics?.viewCount || 0)}
            totalSubs={parseInt(channelData?.statistics?.subscriberCount || 0)}
            totalWatchTime={0}
            totalVideos={parseInt(channelData?.statistics?.videoCount || 0)}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <TopVideosWidget videos={videos} />
            <QuickInsights videos={videos} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard label={t("analytics.avgViews")} value={formatNumber(avgViews)} trend={0} />
            <KpiCard label={t("analytics.avgCtr")} value="—" trend={0} />
            <KpiCard label={t("analytics.avgRetention")} value="—" trend={0} />
            <KpiCard label={t("analytics.avgLikes")} value={formatNumber(avgLikes)} trend={0} />
          </div>

          {performance && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card>
                  <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">{t("analytics.uploadPattern")}</h3>
                  <div className="space-y-2">
                    {weekdayPattern?.map((d) => (
                      <div key={d.day} className="flex items-center space-x-3">
                        <span className="w-16 text-sm text-[var(--text-secondary)]">{d.day}</span>
                        <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${d.percentage}%` }} />
                        </div>
                        <span className="text-sm font-medium text-[var(--text-primary)] w-12 text-right">{d.count}</span>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card>
                  <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">{t("analytics.contentAnalysis")}</h3>
                  <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">{t("analytics.topKeywords")}</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {keywords?.map((k) => (
                      <span key={k.word} className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 rounded text-xs font-medium">
                        {k.word} ({k.count})
                      </span>
                    ))}
                  </div>
                  {titleLen && (
                    <>
                      <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">{t("analytics.titleLength")}</h4>
                      <div className="space-y-1">
                        {titleLen.categories.map((cat) => (
                          <div key={cat.range} className="flex items-center justify-between text-sm">
                            <span className="text-[var(--text-secondary)]">{cat.range}</span>
                            <span className="text-[var(--text-primary)] font-medium">{cat.count} ({cat.percentage}%)</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </Card>
              </div>

              <Card>
                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">{t("analytics.performanceOverview")}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{performance.totalVideos}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{t("analytics.totalVideos")}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{performance.avgPerMonth}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{t("analytics.avgPerMonth")}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{performance.avgGap}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{t("analytics.avgGap")}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{performance.mostActiveMonth}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{t("analytics.mostActive")} ({performance.mostActiveCount})</p>
                  </div>
                </div>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
