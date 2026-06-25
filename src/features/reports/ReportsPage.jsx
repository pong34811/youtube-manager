import { useState } from "react";
import { useAllConfigs } from "../../hooks/useChannelData";
import { useChannelVideos } from "../../hooks/useYouTubeApi";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Spinner from "../../components/ui/Spinner";
import * as XLSX from "xlsx";

const REPORT_TYPES = [
  { id: "basic", label: "Basic", icon: "📊", color: "from-blue-500 to-blue-600", desc: "Yearly/monthly stats + video list" },
  { id: "content", label: "Content", icon: "📈", color: "from-purple-500 to-purple-600", desc: "Engagement analysis and duration performance" },
  { id: "timing", label: "Timing", icon: "⏰", color: "from-amber-500 to-amber-600", desc: "Best upload times and days" },
  { id: "growth", label: "Growth", icon: "📈", color: "from-emerald-500 to-emerald-600", desc: "Year-over-year comparison" },
  { id: "complete", label: "Complete", icon: "📦", color: "from-red-500 to-pink-600", desc: "All reports in one file" },
];

function ReportsPage() {
  const { configs } = useAllConfigs();
  const configList = Object.entries(configs).map(([id, c]) => ({ id, ...c }));
  const [selectedConfigId, setSelectedConfigId] = useState(configList[0]?.id || "");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedType, setSelectedType] = useState("basic");
  const [generating, setGenerating] = useState(false);

  const selectedConfig = configList.find((c) => c.id === selectedConfigId);
  const { data: videos } = useChannelVideos(selectedConfig?.apiKey, selectedConfig?.channelId, selectedYear);

  const generateReport = () => {
    if (!videos || videos.length === 0) return;
    setGenerating(true);
    try {
      const ws = XLSX.utils.json_to_sheet(
        videos.map((v) => ({
          Title: v.snippet.title,
          Published: new Date(v.snippet.publishedAt).toLocaleDateString(),
          Views: parseInt(v.statistics?.viewCount || 0),
          Likes: parseInt(v.statistics?.likeCount || 0),
          Comments: parseInt(v.statistics?.commentCount || 0),
        }))
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Videos");
      XLSX.writeFile(wb, `report_${selectedConfig?.channelName || "channel"}_${selectedYear}.xlsx`);
    } catch (err) {
      console.error("Report generation error:", err);
    } finally {
      setGenerating(false);
    }
  };

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const y = new Date().getFullYear() - i;
    return { value: y, label: String(y + 543) };
  });

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Reports</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">Configuration</h3>
          <div className="space-y-4">
            <Select
              label="Channel"
              options={configList.map((c) => ({ value: c.id, label: c.channelName || c.id }))}
              value={selectedConfigId} onChange={setSelectedConfigId}
            />
            <Select
              label="Year"
              options={yearOptions}
              value={selectedYear} onChange={(v) => setSelectedYear(Number(v))}
            />
            {videos && <p className="text-sm text-[var(--text-secondary)]">{videos.length} videos found</p>}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">Report Type</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {REPORT_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedType === type.id
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="text-2xl">{type.icon}</span>
                <p className="font-semibold text-[var(--text-primary)] mt-1">{type.label}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">{type.desc}</p>
              </button>
            ))}
          </div>
          <Button
            onClick={generateReport}
            disabled={generating || !videos || videos.length === 0}
            icon={generating ? <Spinner size="sm" /> : <span>📥</span>}
          >
            {generating ? "Generating..." : "Download Report"}
          </Button>
        </Card>
      </div>
    </div>
  );
}

export default ReportsPage;
