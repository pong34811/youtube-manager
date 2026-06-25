import Card from "../../components/ui/Card";

function extractGameName(title, tags) {
  const games = [
    "VALORANT", "Genshin Impact", "Roblox", "Minecraft", "PUBG", "Fortnite",
    "Among Us", "League of Legends", "Apex Legends", "Overwatch", "FIFA",
    "GTA", "Grand Theft Auto", "Call of Duty", "Rocket League", "Dota 2",
    "Counter-Strike", "CSGO", "Honkai", "Star Rail", "Zenless Zone Zero",
    "Mobile Legends", "Free Fire", "Ragnarok", "Elden Ring", "Zelda",
    "Pokémon", "Pokemon", "Animal Crossing", "Stardew Valley", "Skyrim",
    "Cyberpunk", "Wuthering Waves", "Blue Archive", "Arknights",
    "Tower of Fantasy", "MapleStory", "Lost Ark", "Diablo", "World of Warcraft",
    "Mario", "Sonic", "Resident Evil", "Final Fantasy", "Persona",
  ];
  const combined = [title, ...(tags || [])].join(" ");
  for (const game of games) {
    if (combined.toLowerCase().includes(game.toLowerCase())) return game;
  }
  return null;
}

export default function CategoryBreakdown({ videos, categories }) {
  if (!videos || videos.length === 0) return null;

  const groups = {};
  videos.forEach((v) => {
    const catId = v.snippet.categoryId || "unknown";
    if (!groups[catId]) groups[catId] = [];
    groups[catId].push(v);
  });

  const categoryIds = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length);

  return (
    <Card>
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">หมวดหมู่คลิป</h3>
      <div className="space-y-3">
        {categoryIds.map((catId) => {
          const catVideos = groups[catId];
          const catName = categories[catId] || `Category ${catId}`;
          const gamingGames = catId === "20" ? [...new Set(catVideos.map((v) => extractGameName(v.snippet.title, v.snippet.tags)).filter(Boolean))] : [];

          return (
            <div key={catId} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-[var(--text-primary)]">{catName}</span>
                <span className="text-sm text-[var(--text-secondary)]">{catVideos.length} คลิป</span>
              </div>
              {gamingGames.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {gamingGames.map((game) => (
                    <span key={game} className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded text-xs">
                      {game}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
