import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import { formatNumber } from "../../utils/youtube";
import { useLocale } from "../../hooks/useLocale";

export default function VideoTable({ videos, onRowClick }) {
  const { t } = useLocale();
  const getCtrBadge = (views, likes) => {
    if (!views || views === 0) return null;
    const ctr = (likes / views) * 100;
    if (ctr > 8) return <Badge variant="success">🔥 {ctr.toFixed(1)}%</Badge>;
    if (ctr < 2) return <Badge variant="danger">▼ {ctr.toFixed(1)}%</Badge>;
    return null;
  };

  const columns = [
    { key: "thumb", label: "", render: (row) => (
      <img src={row.snippet.thumbnails?.default?.url} alt="" className="w-20 h-12 rounded object-cover" />
    )},
    { key: "title", label: t("videos.tableTitle"), className: "min-w-[200px]", render: (row) => (
      <div>
        <p className="font-medium truncate max-w-[300px]">{row.snippet.title}</p>
        <p className="text-xs text-[var(--text-secondary)]">{new Date(row.snippet.publishedAt).toLocaleDateString("th-TH")}</p>
      </div>
    )},
    { key: "views", label: t("videos.tableViews"), render: (row) => formatNumber(parseInt(row.statistics?.viewCount || 0)) },
    { key: "likes", label: t("videos.tableLikes"), render: (row) => formatNumber(parseInt(row.statistics?.likeCount || 0)) },
    { key: "ctr", label: t("videos.tableCtr"), render: (row) => getCtrBadge(parseInt(row.statistics?.viewCount), parseInt(row.statistics?.likeCount)) },
  ];

  return <Table columns={columns} data={videos || []} onRowClick={onRowClick} />;
}
