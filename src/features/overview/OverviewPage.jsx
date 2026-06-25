import { useState } from "react";
import { useAllConfigs } from "../../hooks/useChannelData";
import { useChannelInfo, useChannelVideos } from "../../hooks/useYouTubeApi";
import Select from "../../components/ui/Select";
import Spinner from "../../components/ui/Spinner";
import KpiRow from "./KpiRow";
import TopVideosWidget from "./TopVideosWidget";
import QuickInsights from "./QuickInsights";

export default function OverviewPage() {
  const { configs } = useAllConfigs();
  const configList = Object.entries(configs).map(([id, c]) => ({ id, ...c }));
  const [selectedConfigId, setSelectedConfigId] = useState("");
  const configId = selectedConfigId || configList[0]?.id || "";
  const selectedConfig = configList.find((c) => c.id === configId);
  const currentYear = new Date().getFullYear();
  const { data: channelData, isLoading: channelLoading } = useChannelInfo(selectedConfig?.apiKey, selectedConfig?.channelId);
  const { data: videos, isLoading: videosLoading } = useChannelVideos(selectedConfig?.apiKey, selectedConfig?.channelId, currentYear);

  const isLoading = channelLoading || videosLoading;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Overview</h1>
        <div className="w-64">
          <Select
            options={configList.map((c) => ({ value: c.id, label: c.channelName || c.id }))}
            value={configId}
            onChange={setSelectedConfigId}
          />
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopVideosWidget videos={videos} />
            <QuickInsights videos={videos} />
          </div>
        </>
      )}
    </div>
  );
}
