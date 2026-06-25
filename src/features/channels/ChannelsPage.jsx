import { useState } from "react";
import { ref, remove } from "firebase/database";
import { database } from "../../firebase";
import { useAllConfigs } from "../../hooks/useChannelData";
import { useLocale } from "../../hooks/useLocale";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import ChannelCard from "./ChannelCard";
import ConfigFormModal from "./ConfigFormModal";
import ChannelCompareTable from "./ChannelCompareTable";

export default function ChannelsPage() {
  const { t } = useLocale();
  const { configs } = useAllConfigs();
  const configList = Object.entries(configs).map(([id, c]) => ({ id, ...c }));
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [compareIds, setCompareIds] = useState([]);

  const compareList = configList.filter((c) => compareIds.includes(c.id));

  const handleDelete = async (channel) => {
    if (confirm(`Delete "${channel.channelName}"?`)) {
      await remove(ref(database, `youtube-configs/${channel.id}`));
    }
  };

  const handleCompare = (channel) => {
    setCompareIds((prev) =>
      prev.includes(channel.id) ? prev.filter((id) => id !== channel.id) : [...prev, channel.id]
    );
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl  text-[var(--text-primary)]">{t("page.channels")}</h1>
        <Button onClick={() => { setEditing(null); setShowForm(true); }} icon={<span>+</span>}>{t("channels.add")}</Button>
      </div>

      {configList.length === 0 ? (
        <EmptyState
          icon={<svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
          title={t("channels.noChannels")}
          description={t("channels.noChannelsDesc")}
          action={<Button onClick={() => setShowForm(true)}>{t("channels.addFirst")}</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {configList.map((ch) => (
            <ChannelCard
              key={ch.id}
              channel={ch}
              onEdit={() => { setEditing(ch); setShowForm(true); }}
              onDelete={handleDelete}
              onCompare={handleCompare}
              isSelected={compareIds.includes(ch.id)}
            />
          ))}
        </div>
      )}

      {compareList.length >= 2 && <ChannelCompareTable channels={compareList} />}

      <ConfigFormModal open={showForm} onClose={() => { setShowForm(false); setEditing(null); }} editingConfig={editing} />
    </div>
  );
}
