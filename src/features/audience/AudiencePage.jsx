import { useState, useEffect } from "react";
import { useAllConfigs } from "../../hooks/useChannelData";
import Card from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import EmptyState from "../../components/ui/EmptyState";

export default function AudiencePage() {
  const { configs } = useAllConfigs();
  const configList = Object.entries(configs).map(([id, c]) => ({ id, ...c }));
  const [selectedConfigId, setSelectedConfigId] = useState("");

  useEffect(() => {
    if (!selectedConfigId && configList.length > 0) {
      setSelectedConfigId(configList[0].id);
    }
  }, [configs, selectedConfigId]);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Audience</h1>
        <div className="w-56">
          <Select
            options={configList.map((c) => ({ value: c.id, label: c.channelName || c.id }))}
            value={selectedConfigId} onChange={setSelectedConfigId}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">Returning vs New Viewers</h3>
          <EmptyState title="Data Unavailable" description="Audience demographics require YouTube Analytics API access." />
        </Card>
        <Card>
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">Demographics</h3>
          <EmptyState title="Data Unavailable" description="Age and gender data require YouTube Analytics API access." />
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">Top Countries</h3>
          <EmptyState title="Data Unavailable" description="Geographic data requires YouTube Analytics API access." />
        </Card>
        <Card>
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">Device Types</h3>
          <EmptyState title="Data Unavailable" description="Device data requires YouTube Analytics API access." />
        </Card>
      </div>
    </div>
  );
}
