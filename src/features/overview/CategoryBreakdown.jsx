import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

const CATEGORY_NAMES = {
  "1": "Film & Animation", "2": "Autos & Vehicles", "10": "Music",
  "15": "Pets & Animals", "17": "Sports", "18": "Short Movies",
  "19": "Travel & Events", "20": "Gaming", "21": "Videoblogging",
  "22": "People & Blogs", "23": "Comedy", "24": "Entertainment",
  "25": "News & Politics", "26": "Howto & Style", "27": "Education",
  "28": "Science & Technology", "29": "Nonprofits & Activism",
  "30": "Movies", "31": "Anime & Animation", "32": "Action & Adventure",
  "33": "Classics", "34": "Comedy", "35": "Documentary", "36": "Drama",
  "37": "Family", "38": "Foreign", "39": "Horror", "40": "Sci-Fi & Fantasy",
  "41": "Thriller", "42": "Shorts", "43": "Shows", "44": "Trailers",
};

const GAME_KEYWORDS = [
  { name: "VALORANT", kw: ["valorant", "val"] },
  { name: "Genshin Impact", kw: ["genshin", "genshin impact"] },
  { name: "Roblox", kw: ["roblox"] },
  { name: "Minecraft", kw: ["minecraft", "mc"] },
  { name: "PUBG", kw: ["pubg", "battlegrounds"] },
  { name: "Fortnite", kw: ["fortnite"] },
  { name: "Among Us", kw: ["among us"] },
  { name: "League of Legends", kw: ["league of legends", "lol", "league"] },
  { name: "Apex Legends", kw: ["apex legends", "apex"] },
  { name: "Overwatch 2", kw: ["overwatch"] },
  { name: "FIFA 25", kw: ["fifa 25", "fc 25"] },
  { name: "FIFA 24", kw: ["fifa 24", "fc 24", "ea fc 24"] },
  { name: "FIFA", kw: ["fifa", "ea fc"] },
  { name: "GTA V", kw: ["gta v", "gta 5", "grand theft auto v"] },
  { name: "GTA", kw: ["gta", "grand theft auto"] },
  { name: "Call of Duty", kw: ["call of duty", "cod", "black ops", "warzone"] },
  { name: "Rocket League", kw: ["rocket league"] },
  { name: "Dota 2", kw: ["dota 2", "dota"] },
  { name: "Counter-Strike 2", kw: ["counter-strike 2", "cs2", "csgo", "counter-strike"] },
  { name: "Honkai Star Rail", kw: ["honkai star rail", "hsr"] },
  { name: "Honkai Impact 3rd", kw: ["honkai impact"] },
  { name: "Zenless Zone Zero", kw: ["zenless zone zero", "zzz"] },
  { name: "Mobile Legends", kw: ["mobile legends", "mlbb"] },
  { name: "Free Fire", kw: ["free fire"] },
  { name: "Ragnarok Online", kw: ["ragnarok"] },
  { name: "Elden Ring", kw: ["elden ring"] },
  { name: "The Legend of Zelda", kw: ["zelda", "tears of the kingdom", "breath of the wild"] },
  { name: "Pokémon", kw: ["pokemon", "pokémon", "pocket pair"] },
  { name: "Animal Crossing", kw: ["animal crossing"] },
  { name: "Stardew Valley", kw: ["stardew valley"] },
  { name: "Skyrim", kw: ["skyrim", "elder scrolls"] },
  { name: "Cyberpunk 2077", kw: ["cyberpunk 2077", "cyberpunk"] },
  { name: "Wuthering Waves", kw: ["wuthering waves", "wuwa"] },
  { name: "Blue Archive", kw: ["blue archive"] },
  { name: "Arknights", kw: ["arknights"] },
  { name: "Tower of Fantasy", kw: ["tower of fantasy"] },
  { name: "MapleStory", kw: ["maplestory", "maple story"] },
  { name: "Lost Ark", kw: ["lost ark"] },
  { name: "Diablo IV", kw: ["diablo iv", "diablo 4", "diablo"] },
  { name: "World of Warcraft", kw: ["world of warcraft", "wow"] },
  { name: "Super Mario", kw: ["mario", "super mario"] },
  { name: "Sonic", kw: ["sonic"] },
  { name: "Resident Evil", kw: ["resident evil"] },
  { name: "Final Fantasy", kw: ["final fantasy", "ff7", "ffxiv"] },
  { name: "Persona 5", kw: ["persona 5", "persona"] },
  { name: "Phasmophobia", kw: ["phasmophobia"] },
  { name: "Lethal Company", kw: ["lethal company"] },
  { name: "Stray", kw: ["stray"] },
  { name: "Hogwarts Legacy", kw: ["hogwarts legacy"] },
  { name: "Baldur's Gate 3", kw: ["baldur's gate 3", "bg3"] },
  { name: "Palworld", kw: ["palworld", "pal world"] },
  { name: "Helldivers 2", kw: ["helldivers 2", "helldivers"] },
  { name: "Black Myth Wukong", kw: ["black myth", "wukong"] },
  { name: "R.E.P.O.", kw: ["repo"] },
  { name: "Content Warning", kw: ["content warning"] },
];

function findGame(title, tags) {
  const text = [title, ...(tags || [])].join(" ").toLowerCase();
  const found = [];
  for (const game of GAME_KEYWORDS) {
    if (game.kw.some((kw) => text.includes(kw))) {
      found.push(game.name);
    }
  }
  return found.length > 0 ? [...new Set(found)] : null;
}

export default function CategoryBreakdown({ videos, categories }) {
  if (!videos || videos.length === 0) return null;

  const groups = {};
  videos.forEach((v) => {
    const catId = v.snippet.categoryId || "unknown";
    if (!groups[catId]) groups[catId] = [];
    groups[catId].push(v);
  });

  const maxCount = Math.max(...Object.values(groups).map((g) => g.length));
  const sorted = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length);

  return (
    <Card>
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">หมวดหมู่คลิป</h3>
      <div className="space-y-2">
        {sorted.map((catId) => {
          const catVideos = groups[catId];
          const catName = categories[catId] || CATEGORY_NAMES[catId] || `หมวด ${catId}`;
          const pct = maxCount > 0 ? (catVideos.length / maxCount) * 100 : 0;
          const gameNames = catId === "20" ? [...new Set(catVideos.flatMap((v) => findGame(v.snippet.title, v.snippet.tags) || []))].filter(Boolean) : [];

          return (
            <div key={catId} className="relative p-3 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
              <div className="absolute left-0 top-0 h-full bg-indigo-100 dark:bg-indigo-900/20 transition-all" style={{ width: `${pct}%` }} />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--text-primary)]">{catName}</span>
                  <Badge variant={catVideos.length === maxCount ? "success" : "info"}>{catVideos.length} คลิป</Badge>
                </div>
                {gameNames.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {gameNames.map((g) => (
                      <span key={g} className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded text-xs font-medium">
                        {g}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
