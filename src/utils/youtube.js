import { getNextKey, markKeyFailed } from "./apiKeyManager";

async function fetchWithFallback(urlFn, maxRetries = 15) {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const apiKey = await getNextKey();
    if (!apiKey) throw new Error("No API key configured");
    try {
      const response = await fetch(urlFn(apiKey));
      const data = await response.json();
      if (data.error) {
        const isQuota = data.error.code === 403 || data.error.code === 429;
        if (isQuota) {
          markKeyFailed(apiKey);
          lastError = new Error(data.error.message);
          continue;
        }
        throw new Error(data.error.message);
      }
      return data;
    } catch (err) {
      if (err.name === "AbortError") throw err;
      if (err.message?.includes("quota") || err.message?.includes("dailyLimit") || err.message?.includes("exceeded") || err.message?.includes("rateLimit")) {
        lastError = err;
        continue;
      }
      throw err;
    }
  }
  throw lastError || new Error("All API keys exhausted");
}

export const fetchChannelData = async (channelId) => {
  const data = await fetchWithFallback(
    (key) => `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${key}`
  );
  return data.items?.[0];
};

export const fetchChannelVideosForYear = async (channelId, year) => {
  const uploadsPlaylistId = channelId.replace("UC", "UU");
  let allVideoIds = [];
  let nextPageToken = "";

  try {
    do {
      const urlFn = (key) => {
        let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&playlistId=${uploadsPlaylistId}&key=${key}`;
        if (nextPageToken) url += "&pageToken=" + nextPageToken;
        return url;
      };
      const data = await fetchWithFallback(urlFn);
      if (data.error) throw new Error(data.error.message);
      allVideoIds = allVideoIds.concat(
        (data.items || []).map((item) => item.contentDetails.videoId)
      );
      nextPageToken = data.nextPageToken || "";
    } while (nextPageToken);

    if (allVideoIds.length === 0) return [];

    let detailedVideos = [];

    for (let i = 0; i < allVideoIds.length; i += 50) {
      const chunk = allVideoIds.slice(i, i + 50);
      const idsString = chunk.join(",");
      const data = await fetchWithFallback(
        (key) => `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${idsString}&key=${key}`
      );
      detailedVideos = detailedVideos.concat(data.items || []);
    }

    if (year != null) {
      detailedVideos = detailedVideos.filter((v) => {
        const y = new Date(v.snippet.publishedAt).getFullYear();
        return y === year;
      });
    }

    return detailedVideos;
  } catch (error) {
    console.error("Error fetching video details:", error);
    throw error;
  }
};

export const fetchVideoCategories = async () => {
  try {
    const data = await fetchWithFallback(
      (key) => `https://www.googleapis.com/youtube/v3/videoCategories?part=snippet&regionCode=TH&key=${key}`
    );
    const map = {};
    (data.items || []).forEach((cat) => {
      if (cat.snippet.assignable) {
        map[cat.id] = cat.snippet.title;
      }
    });
    return map;
  } catch {
    return {};
  }
};

export const formatNumber = (num) => {
  if (num == null) return "0";
  return Number(num).toLocaleString();
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
