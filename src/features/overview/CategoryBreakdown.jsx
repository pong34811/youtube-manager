import Card from "../../components/ui/Card";

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

export default function CategoryBreakdown({ videos, categories }) {
  if (!videos || videos.length === 0) return null;

  const groups = {};
  let noCat = 0;
  videos.forEach((v) => {
    const catId = v.snippet.categoryId;
    if (!catId) { noCat++; return; }
    if (!groups[catId]) groups[catId] = [];
    groups[catId].push(v);
  });

  const sorted = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length);

  return (
    <Card>
      <h3 className="text-base  text-[var(--text-primary)] mb-3">
        หมวดหมู่คลิป ({videos.length} คลิป)
      </h3>
      <div className="space-y-1.5">
        {sorted.map((catId) => {
          const catName = categories[catId] || CATEGORY_NAMES[catId] || `ID:${catId}`;
          return (
            <div key={catId} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <span className="text-sm text-[var(--text-primary)]">{catName}</span>
              <span className="text-sm text-[var(--text-secondary)] font-medium">{groups[catId].length} คลิป</span>
            </div>
          );
        })}
        {noCat > 0 && (
          <div className="flex items-center justify-between py-1.5 px-2 rounded-lg">
            <span className="text-sm text-gray-400">ไม่ระบุหมวด</span>
            <span className="text-sm text-gray-400 font-medium">{noCat} คลิป</span>
          </div>
        )}
      </div>
    </Card>
  );
}
