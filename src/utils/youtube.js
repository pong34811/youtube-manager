export const fetchChannelData = async (apiKey, channelId) => {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`
  );
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.items[0];
};

export const fetchChannelVideosForYear = async (apiKey, channelId, year) => {
  const toBangkokISO = (y, m, d) => {
    const date = new Date(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T00:00:00+07:00`);
    return date.toISOString();
  };
  const startDate = toBangkokISO(year, 1, 1);
  const endDate = toBangkokISO(year + 1, 1, 1);
  let searchResults = [];
  let nextPageToken = "";

  try {
    do {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=date&publishedAfter=${startDate}&publishedBefore=${endDate}&maxResults=50&key=${apiKey}${
        nextPageToken ? "&pageToken=" + nextPageToken : ""
      }`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      searchResults = searchResults.concat(data.items || []);
      nextPageToken = data.nextPageToken || "";
    } while (nextPageToken);

    if (searchResults.length === 0) return [];

    const videoIds = searchResults.map((item) => item.id.videoId);
    let detailedVideos = [];

    for (let i = 0; i < videoIds.length; i += 50) {
      const chunk = videoIds.slice(i, i + 50);
      const idsString = chunk.join(",");
      const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${idsString}&key=${apiKey}`;
      const statsResponse = await fetch(statsUrl);
      const statsData = await statsResponse.json();
      if (statsData.error) throw new Error(statsData.error.message);
      detailedVideos = detailedVideos.concat(statsData.items || []);
    }

    return detailedVideos;
  } catch (error) {
    console.error("Error fetching video details:", error);
    throw error;
  }
};

export const fetchVideoCategories = async (apiKey) => {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videoCategories?part=snippet&regionCode=TH&key=${apiKey}`
  );
  const data = await response.json();
  if (data.error) return {};
  const map = {};
  (data.items || []).forEach((cat) => {
    if (cat.snippet.assignable) {
      map[cat.id] = cat.snippet.title;
    }
  });
  return map;
};

export const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

export const formatDuration = (duration) => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return "0:00";

  const hours = (match[1] || "").replace("H", "");
  const minutes = (match[2] || "").replace("M", "");
  const seconds = (match[3] || "").replace("S", "");

  let parts = [];
  if (hours) parts.push(hours);
  parts.push(
    minutes ? (minutes.length === 1 && hours ? "0" + minutes : minutes) : "0"
  );
  parts.push(seconds ? (seconds.length === 1 ? "0" + seconds : seconds) : "00");

  return parts.join(":");
};

export const generateYearOptions = (channelCreatedDate) => {
  const createdYear = new Date(channelCreatedDate).getFullYear();
  const currentYear = new Date().getFullYear();
  const years = [];

  for (let year = currentYear; year >= createdYear; year--) {
    years.push({ value: year, label: year + 543 });
  }

  return years;
};
