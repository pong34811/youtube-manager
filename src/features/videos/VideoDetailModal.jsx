import Modal from "../../components/ui/Modal";
import { useLocale } from "../../hooks/useLocale";

export default function VideoDetailModal({ video, open, onClose }) {
  const { t } = useLocale();
  if (!video) return null;
  const v = video.statistics || {};

  return (
    <Modal open={open} onClose={onClose} title={video.snippet.title}>
      <div className="space-y-4">
        <img src={video.snippet.thumbnails?.maxres?.url || video.snippet.thumbnails?.high?.url} alt="" className="w-full rounded-lg" />
        <p className="text-sm text-[var(--text-secondary)]">{video.snippet.description?.substring(0, 200)}</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-[var(--text-primary)]">{parseInt(v.viewCount || 0).toLocaleString()}</p>
            <p className="text-xs text-[var(--text-secondary)]">{t("common.views")}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-[var(--text-primary)]">{parseInt(v.likeCount || 0).toLocaleString()}</p>
            <p className="text-xs text-[var(--text-secondary)]">{t("common.likes")}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-[var(--text-primary)]">{parseInt(v.commentCount || 0).toLocaleString()}</p>
            <p className="text-xs text-[var(--text-secondary)]">{t("common.comments")}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-[var(--text-primary)]">{new Date(video.snippet.publishedAt).toLocaleDateString("th-TH")}</p>
            <p className="text-xs text-[var(--text-secondary)]">{t("videos.published")}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
