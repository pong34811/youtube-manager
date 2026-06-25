import { useState } from "react";
import { useAllConfigs } from "../../hooks/useChannelData";
import { useLocale } from "../../hooks/useLocale";
import { useChannelVideos } from "../../hooks/useYouTubeApi";
import Select from "../../components/ui/Select";
import Spinner from "../../components/ui/Spinner";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import VideoTable from "./VideoTable";
import VideoDetailModal from "./VideoDetailModal";

export default function VideosPage() {
  const { t } = useLocale();
  const { configs } = useAllConfigs();
  const configList = Object.entries(configs).map(([id, c]) => ({ id, ...c }));
  const [selectedConfigId, setSelectedConfigId] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedVideo, setSelectedVideo] = useState(null);
  const configId = selectedConfigId || configList[0]?.id || "";
  const selectedConfig = configList.find((c) => c.id === configId);
  const { data: videos, isLoading } = useChannelVideos(selectedConfig?.apiKey, selectedConfig?.channelId, selectedYear);

  const insightCards = (videos || []).slice(0, 3).map((v) => {
    const views = parseInt(v.statistics?.viewCount || 0);
    const likes = parseInt(v.statistics?.likeCount || 0);
    const ctr = views > 0 ? ((likes / views) * 100).toFixed(1) : 0;
    const type = views > 100000 ? "success" : ctr < 2 ? "danger" : "info";
    return { id: v.id, title: v.snippet.title, label: views > 100000 ? t("videos.viral") : ctr < 2 ? t("videos.lowCtr") : t("videos.normal"), type };
  });

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const y = new Date().getFullYear() - i;
    return { value: y, label: String(y + 543) };
  });

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl  text-[var(--text-primary)]">{t("videos.title")}</h1>
        <div className="flex space-x-3">
          <div className="w-56">
            <Select
              options={configList.map((c) => ({ value: c.id, label: c.channelName || c.id }))}
              value={configId} onChange={setSelectedConfigId}
            />
          </div>
          <div className="w-32">
            <Select options={yearOptions} value={selectedYear} onChange={(v) => setSelectedYear(Number(v))} />
          </div>
        </div>
      </div>

      {insightCards.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {insightCards.map((ins) => (
            <Badge key={ins.id} variant={ins.type}>{ins.label}: {ins.title.substring(0, 30)}</Badge>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : !videos || videos.length === 0 ? (
        <Card>
          <EmptyState title={t("videos.noVideos")} description={t("videos.noVideosDesc")} />
        </Card>
      ) : (
        <Card padding={false}>
          <VideoTable videos={videos} onRowClick={setSelectedVideo} />
        </Card>
      )}

      <VideoDetailModal video={selectedVideo} open={!!selectedVideo} onClose={() => setSelectedVideo(null)} />
    </div>
  );
}
