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
import Badge from "../../components/ui/Badge";
import {
  analyzePerformance,
  analyzeWeekdayPattern,
  analyzeKeywords,
  analyzeTitleLength,
  analyzeContentPerformance,
  parseDuration,
} from "../../utils/analytics";
import { formatNumber } from "../../utils/youtube";

const durationLabels = {
  "สั้นมาก (< 30 วิ)": "audience.veryShort",
  "30 วิ ถึง 59 วิ": "audience.30to59s",
  "1 - 3 นาที": "audience.1to3min",
  "3 - 5 นาที": "audience.3to5min",
  "ปานกลาง (5-15 นาที)": "audience.medium",
  "ยาว (15-30 นาที)": "audience.long",
  "30 นาที ถึง 1 ชั่วโมง": "audience.30to1h",
  "1 ชั่วโมง ถึง 3 ชั่วโมง": "audience.1to3h",
  "ยาวมาก (> 3 ชั่วโมง)": "audience.veryLong",
};

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
  const yearParam = selectedYear === "all" ? null : Number(selectedYear);
  const { data: videos, isLoading: videosLoading } = useChannelVideos(selectedConfig?.apiKey, selectedConfig?.channelId, yearParam);

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
  const avgComments = videos?.length > 0
    ? Math.round(videos.reduce((s, v) => s + parseInt(v.statistics?.commentCount || 0), 0) / videos.length)
    : 0;

  const contentPerformance = videos ? analyzeContentPerformance(videos) : null;

  // Compute year-over-year trends from video data
  const trends = (() => {
    if (!videos || videos.length < 2) return null;
    const byYear = {};
    videos.forEach(v => {
      const y = new Date(v.snippet.publishedAt).getFullYear();
      if (!byYear[y]) byYear[y] = [];
      byYear[y].push(v);
    });
    const sortedYears = Object.keys(byYear).sort((a, b) => b - a);
    if (sortedYears.length < 2) return null;
    const curr = byYear[sortedYears[0]];
    const prev = byYear[sortedYears[1]];
    const currViews = curr.reduce((s, v) => s + parseInt(v.statistics?.viewCount || 0), 0);
    const prevViews = prev.reduce((s, v) => s + parseInt(v.statistics?.viewCount || 0), 0);
    return {
      views: prevViews > 0 ? Math.round(((currViews - prevViews) / prevViews) * 100) : null,
      subs: null,
      videos: prev.length > 0 ? Math.round(((curr.length - prev.length) / prev.length) * 100) : null,
    };
  })();

  const availableYears = videos?.length
    ? [...new Set(videos.map(v => new Date(v.snippet.publishedAt).getFullYear()))].sort((a, b) => b - a)
    : [];
  const displayYears = availableYears.length > 0 ? availableYears : [currentYear];
  const yearOptions = [
    { value: "all", label: "ทั้งหมด" },
    ...displayYears.map(y => ({ value: String(y), label: String(y + 543) })),
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl  text-[var(--text-primary)]">{t("page.overview")}</h1>
        <div className="flex space-x-3">
          <div className="w-56">
            <Select
              options={configList.map((c) => ({ value: c.id, label: c.channelName || c.id }))}
              value={configId}
              onChange={setSelectedConfigId}
            />
          </div>
          <div className="w-32">
            <Select options={yearOptions} value={String(selectedYear)} onChange={(v) => setSelectedYear(v)} />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : (
        <>
          {performance && (
            <Card className="mb-6">
              <h3 className="text-base  text-[var(--text-primary)] mb-4">{t("analytics.performanceOverview")}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl text-[var(--text-primary)]">{performance.totalVideos}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{t("analytics.totalVideos")}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl text-[var(--text-primary)]">{performance.avgPerMonth}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{t("analytics.avgPerMonth")}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl text-[var(--text-primary)]">{performance.avgGap}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{t("analytics.avgGap")}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl text-[var(--text-primary)]">{performance.mostActiveMonth}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{t("analytics.mostActive")} ({performance.mostActiveCount})</p>
                </div>
              </div>
            </Card>
          )}

          <KpiRow
            totalViews={parseInt(channelData?.statistics?.viewCount || 0)}
            totalSubs={parseInt(channelData?.statistics?.subscriberCount || 0)}
            totalVideos={parseInt(channelData?.statistics?.videoCount || 0)}
            trends={trends}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard label={t("analytics.avgViews")} value={formatNumber(avgViews)} trend={0} />
            <KpiCard label={t("analytics.avgLikes")} value={formatNumber(avgLikes)} trend={0} />
            <KpiCard label={t("audience.avgCommentsPerVideo")} value={formatNumber(avgComments)} trend={0} />
            <KpiCard label={t("audience.avgEngagement")} value={contentPerformance ? `${contentPerformance.avgEngagementRate}%` : "—"} trend={0} />
          </div>

          {contentPerformance && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <h3 className="text-base text-[var(--text-primary)] mb-1">{t("audience.topContent")}</h3>
                <p className="text-xs text-[var(--text-secondary)] mb-4">เรียงตาม Engagement Rate (👍+💬 ÷ 👁) — ยิ่งสูง = ผู้ชมโต้ตอบกับคลิปนี้มาก</p>
                {contentPerformance.topByEngagement.length > 0 ? (
                  <div className="space-y-3">
                    {contentPerformance.topByEngagement.slice(0, 5).map((v, i) => (
                      <div key={v.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <span className="text-sm  text-[var(--text-secondary)] w-6 mt-1">{i + 1}.</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{v.snippet.title}</p>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                            <Badge variant={v.engagementRate > 10 ? "success" : v.engagementRate > 5 ? "info" : "warning"}>
                              {v.engagementRate}% {t("audience.engagement")}
                            </Badge>
                            <span className="text-xs text-[var(--text-secondary)]">{formatNumber(v.views)} {t("audience.views")}</span>
                            <span className="text-xs text-[var(--text-secondary)]">👍 {formatNumber(v.likes)}</span>
                            <span className="text-xs text-[var(--text-secondary)]">💬 {formatNumber(v.comments)}</span>
                            <span className="text-xs text-[var(--text-secondary)]">{new Date(v.snippet.publishedAt).toLocaleDateString("en-GB")}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--text-secondary)] py-8 text-center">{t("audience.noData")}</p>
                )}
              </Card>
              <Card>
                <h3 className="text-base text-[var(--text-primary)] mb-1">{t("audience.audiencePreference")}</h3>
                <p className="text-xs text-[var(--text-secondary)] mb-4">ยอดดูเฉลี่ยแยกตามความยาวคลิป — ช่วยบอกว่าควรทำคลิปยาวเท่าไหร่</p>
                {videos && (() => {
                  const longest = videos.reduce((max, v) => {
                    if (!v.contentDetails?.duration) return max;
                    const secs = parseDuration(v.contentDetails.duration);
                    return secs > max.secs ? { secs, title: v.snippet.title, duration: v.contentDetails.duration } : max;
                  }, { secs: 0, title: "", duration: "" });
                  if (longest.secs > 0) {
                    const h = Math.floor(longest.secs / 3600);
                    const m = Math.floor((longest.secs % 3600) / 60);
                    return <p className="text-xs text-[var(--text-secondary)] mb-3 max-w-full">📏 คลิปยาวสุด: {h} ชม. {m} นาที</p>;
                  }
                  return null;
                })()}
                {contentPerformance.durationPerformance.filter((d) => d.count > 0).length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-[var(--text-secondary)] mb-2">{t("audience.viewsByLength")}</p>
                    {contentPerformance.durationPerformance.filter((d) => d.count > 0).map((d) => (
                      <div key={d.range} className="flex items-center space-x-3">
                        <span className="text-sm text-[var(--text-secondary)] w-36 shrink-0">{t(durationLabels[d.range] || d.range)}</span>
                        <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-violet-500 rounded-full transition-all"
                            style={{ width: `${Math.min(100, (d.totalViews / Math.max(...contentPerformance.durationPerformance.filter((x) => x.count > 0).map((x) => x.totalViews))) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-[var(--text-primary)] w-32 text-right whitespace-nowrap">
                          {d.count} คลิป · {formatNumber(d.avgViews)} วิว/คลิป
                        </span>
                      </div>
                    ))}
                  </div>
                  ) : (
                  <p className="text-sm text-[var(--text-secondary)] py-8 text-center">{t("audience.noDuration")}</p>
                )}
                {contentPerformance.durationPerformance.filter((d) => d.count > 0).length > 0 && (
                  <p className="text-xs text-[var(--text-secondary)] mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    💡 สรุป: ช่วง "{t(durationLabels[contentPerformance.durationPerformance.filter((d) => d.count > 0).sort((a, b) => b.avgViews - a.avgViews)[0]?.range] || contentPerformance.durationPerformance.filter((d) => d.count > 0).sort((a, b) => b.avgViews - a.avgViews)[0]?.range)}" มียอดดูเฉลี่ยสูงสุด
                  </p>
                )}
              </Card>
            </div>
          )}

          {performance && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card>
                  <h3 className="text-base  text-[var(--text-primary)] mb-4">{t("analytics.uploadPattern")}</h3>
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
                  <h3 className="text-base  text-[var(--text-primary)] mb-4">{t("analytics.contentAnalysis")}</h3>
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

            </>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <TopVideosWidget videos={videos} />
            <div className="space-y-6">
              <QuickInsights videos={videos} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
