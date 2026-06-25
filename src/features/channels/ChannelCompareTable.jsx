export default function ChannelCompareTable({ channels }) {
  if (channels.length < 2) return null;

  return (
    <div className="bg-[var(--bg-primary)] rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm mt-6">
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">Compare Channels</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="px-4 py-2 text-left text-[var(--text-secondary)] font-medium">Property</th>
              {channels.map((ch) => <th key={ch.id} className="px-4 py-2 text-left text-[var(--text-primary)] font-medium">{ch.channelName}</th>)}
            </tr>
          </thead>
          <tbody>
            {[
              { key: "channelName", label: "Name" },
              { key: "channelId", label: "Channel ID" },
              { key: "apiKey", label: "API Key" },
            ].map((col) => (
              <tr key={col.key} className="border-b border-gray-100 dark:border-gray-700/50">
                <td className="px-4 py-2 text-[var(--text-secondary)]">{col.label}</td>
                {channels.map((ch) => (
                  <td key={ch.id} className="px-4 py-2 text-[var(--text-primary)] font-mono text-sm">
                    {col.key === "apiKey" ? ch[col.key]?.substring(0, 10) + "..." : ch[col.key] || "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
