import { useLocale } from "../../hooks/useLocale";

export default function ChannelCard({ channel, onEdit, onDelete, onCompare, isSelected }) {
  const { t } = useLocale();
  return (
    <div className={`bg-[var(--bg-primary)] rounded-xl border p-5 shadow-sm transition-all hover:shadow-md ${isSelected ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-gray-200 dark:border-gray-700"}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold">
            {channel.channelName?.[0] || "C"}
          </div>
          <div>
            <h3 className="font-semibold text-[var(--text-primary)]">{channel.channelName || t("channels.unnamed")}</h3>
            <p className="text-xs text-[var(--text-secondary)]">{t("channels.api")} {channel.apiKey?.substring(0, 8)}...</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <input type="checkbox" checked={isSelected} onChange={() => onCompare(channel)} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
        </div>
      </div>
      <div className="flex items-center space-x-1 mb-3">
        <span className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-xs text-green-600 font-medium">{t("channels.connected")}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-[var(--text-secondary)]">Channel ID: {channel.channelId?.substring(0, 12)}...</span>
      </div>
      <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <button onClick={() => onEdit(channel)} className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">{t("channels.edit")}</button>
        <button onClick={() => onDelete(channel)} className="text-xs px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">{t("channels.delete")}</button>
      </div>
    </div>
  );
}
