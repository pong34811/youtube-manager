import { useState } from "react";
import { useAllConfigs } from "../../hooks/useChannelData";
import { useChannelInfo } from "../../hooks/useYouTubeApi";
import Card from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import KpiCard from "../../components/ui/KpiCard";
import EmptyState from "../../components/ui/EmptyState";
import { formatNumber } from "../../utils/youtube";

export default function RevenuePage() {
  const { configs } = useAllConfigs();
  const configList = Object.entries(configs).map(([id, c]) => ({ id, ...c }));
  const [selectedConfigId, setSelectedConfigId] = useState("");
  const configId = selectedConfigId || configList[0]?.id || "";
  const selectedConfig = configList.find((c) => c.id === configId);
  const { data: channelData } = useChannelInfo(selectedConfig?.apiKey, selectedConfig?.channelId);

  const totalViews = parseInt(channelData?.statistics?.viewCount || 0);
  const estimatedRevenue = totalViews * 0.002;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Revenue</h1>
        <div className="w-56">
          <Select
            options={configList.map((c) => ({ value: c.id, label: c.channelName || c.id }))}
            value={configId} onChange={setSelectedConfigId}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KpiCard label="Revenue" value={`$${formatNumber(Math.round(estimatedRevenue))}`} trend={15} />
        <KpiCard label="RPM" value="$2.00" trend={2} />
        <KpiCard label="CPM" value="$4.00" trend={-1} />
      </div>

      <Card>
        <EmptyState
          icon={<svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          title="Revenue Data Requires YouTube Adsense Link"
          description="Connect your YouTube channel to Google Adsense and enable the YouTube Analytics API to see detailed revenue data. Current values are estimates based on view counts."
        />
      </Card>
    </div>
  );
}
