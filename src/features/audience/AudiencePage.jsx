import { useState } from "react";
import { useAllConfigs } from "../../hooks/useChannelData";
import { useChannelInfo } from "../../hooks/useYouTubeApi";
import { useChannelVideos } from "../../hooks/useYouTubeApi";
import { useLocale } from "../../hooks/useLocale";
import Card from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import Spinner from "../../components/ui/Spinner";
import KpiCard from "../../components/ui/KpiCard";
import Badge from "../../components/ui/Badge";
import {
  analyzeContentPerformance,
  analyzePerformance,
  analyzeWeekdayPattern,
} from "../../utils/analytics";
import { formatNumber } from "../../utils/youtube";

const durationLabels = {
  "สั้น (< 5 นาที)": "audience.short",
  "ปานกลาง (5-15 นาที)": "audience.medium",
  "ยาว (15-30 นาที)": "audience.long",
  "ยาวมาก (> 30 นาที)": "audience.veryLong",
};

export default function AudiencePage() {
  const { t } = useLocale();
  const { configs } = useAllConfigs();
  const configList = Object.entries(configs).map(([id, c]) => ({ id, ...c }));
  const [selectedConfigId, setSelectedConfigId] = useState("");
  const configId = selectedConfigId || configList[0]?.id || "";
  const selectedConfig = configList.find((c) => c.id === configId);
  const currentYear = new Date().getFullYear();
  const { data: channelData, isLoading: channelLoading } = useChannelInfo(
    selectedConfig?.apiKey,
    selectedConfig?.channelId
  );
  const { data: videos, isLoading: videosLoading } = useChannelVideos(
    selectedConfig?.apiKey,
    selectedConfig?.channelId,
    currentYear
  );

  const isLoading = channelLoading || videosLoading;

  const subs = parseInt(channelData?.statistics?.subscriberCount || 0);
  const totalViews = parseInt(channelData?.statistics?.viewCount || 0);
  const totalVideos = parseInt(channelData?.statistics?.videoCount || 0);

  const performance = videos ? analyzeContentPerformance(videos) : null;
  const uploadPattern = videos ? analyzeWeekdayPattern(videos) : null;
  const uploadStats = videos ? analyzePerformance(videos) : null;

  const subsPerVideo = totalVideos > 0 ? (subs / totalVideos).toFixed(1) : 0;
  const viewsPerSub = subs > 0 ? (totalViews / subs).toFixed(1) : 0;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t("page.audience")}</h1>
        <div className="w-56">
          <Select
            options={configList.map((c) => ({ value: c.id, label: c.channelName || c.id }))}
            value={configId} onChange={setSelectedConfigId}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard label={t("audience.totalSubs")} value={formatNumber(subs)} trend={0} />
            <KpiCard label={t("audience.totalViews")} value={formatNumber(totalViews)} trend={0} />
            <KpiCard label={t("audience.subsPerVideo")} value={String(subsPerVideo)} trend={0} />
            <KpiCard label={t("audience.viewsPerSub")} value={String(viewsPerSub)} trend={0} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">{t("audience.engagementOverview")}</h3>
              {performance ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-2xl font-bold text-[var(--text-primary)]">{performance.avgEngagementRate}%</p>
                      <p className="text-xs text-[var(--text-secondary)]">{t("audience.avgEngagement")}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-2xl font-bold text-[var(--text-primary)]">
                        {videos && videos.length > 0
                          ? formatNumber(Math.round(videos.reduce((s, v) => s + parseInt(v.statistics?.likeCount || 0), 0) / videos.length))
                          : 0}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">{t("audience.avgLikesPerVideo")}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-2xl font-bold text-[var(--text-primary)]">
                        {videos && videos.length > 0
                          ? formatNumber(Math.round(videos.reduce((s, v) => s + parseInt(v.statistics?.commentCount || 0), 0) / videos.length))
                          : 0}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">{t("audience.avgCommentsPerVideo")}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-[var(--text-secondary)]">{t("audience.uploadSchedule")}</p>
                    {uploadPattern?.map((d) => (
                      <div key={d.day} className="flex items-center space-x-3">
                        <span className="w-16 text-sm text-[var(--text-secondary)]">{d.day}</span>
                        <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${d.percentage}%` }} />
                        </div>
                        <span className="text-sm font-medium text-[var(--text-primary)] w-8 text-right">{d.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[var(--text-secondary)] py-8 text-center">{t("audience.noData")}</p>
              )}
            </Card>

            <Card>
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">{t("audience.topContent")}</h3>
              {performance && performance.topByEngagement.length > 0 ? (
                <div className="space-y-3">
                  {performance.topByEngagement.slice(0, 5).map((v, i) => (
                    <div key={v.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <span className="text-sm font-bold text-[var(--text-secondary)] w-6 mt-1">{i + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{v.snippet.title}</p>
                        <div className="flex space-x-2 mt-1">
                          <Badge variant={v.engagementRate > 10 ? "success" : v.engagementRate > 5 ? "info" : "warning"}>
                            {v.engagementRate}% {t("audience.engagement")}
                          </Badge>
                          <span className="text-xs text-[var(--text-secondary)]">{formatNumber(v.views)} {t("audience.views")}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--text-secondary)] py-8 text-center">{t("audience.noData")}</p>
              )}
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">{t("audience.audiencePreference")}</h3>
              {performance && performance.durationPerformance.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-[var(--text-secondary)] mb-2">{t("audience.viewsByLength")}</p>
                  {performance.durationPerformance.filter((d) => d.count > 0).map((d) => (
                    <div key={d.range} className="flex items-center space-x-3">
                      <span className="text-sm text-[var(--text-secondary)] w-36">{t(durationLabels[d.range] || d.range)}</span>
                      <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-500 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (d.totalViews / Math.max(...performance.durationPerformance.filter((x) => x.count > 0).map((x) => x.totalViews))) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-[var(--text-primary)] w-20 text-right">
                        {formatNumber(d.avgViews)} avg
                      </span>
                    </div>
                  ))}
                  {performance.durationPerformance.filter((d) => d.count > 0).length === 0 && (
                    <p className="text-sm text-[var(--text-secondary)] py-4 text-center">{t("audience.noDuration")}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[var(--text-secondary)] py-8 text-center">{t("audience.noData")}</p>
              )}
            </Card>

            <Card>
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">{t("audience.uploadConsistency")}</h3>
              {uploadStats ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-2xl font-bold text-[var(--text-primary)]">{uploadStats.totalVideos}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{t("audience.videosThisYear")}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-2xl font-bold text-[var(--text-primary)]">{uploadStats.avgPerMonth}/mo</p>
                      <p className="text-xs text-[var(--text-secondary)]">{t("audience.uploadFrequency")}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-2xl font-bold text-[var(--text-primary)]">{uploadStats.avgGap} days</p>
                      <p className="text-xs text-[var(--text-secondary)]">{t("audience.avgGap")}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-2xl font-bold text-[var(--text-primary)]">{uploadStats.mostActiveMonth}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{t("audience.mostActive")} ({uploadStats.mostActiveCount} videos)</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[var(--text-secondary)] py-8 text-center">{t("audience.noData")}</p>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
