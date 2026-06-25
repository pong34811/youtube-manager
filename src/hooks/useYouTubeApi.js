import { useQuery } from "@tanstack/react-query";
import { fetchChannelData, fetchChannelVideosForYear, fetchVideoCategories } from "../utils/youtube";

export function useChannelInfo(apiKey, channelId) {
  return useQuery({
    queryKey: ["channel", apiKey, channelId],
    queryFn: () => fetchChannelData(apiKey, channelId),
    enabled: !!apiKey && !!channelId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useChannelVideos(apiKey, channelId, year) {
  return useQuery({
    queryKey: ["videos", apiKey, channelId, year],
    queryFn: () => fetchChannelVideosForYear(apiKey, channelId, year),
    enabled: !!apiKey && !!channelId && year !== undefined,
    staleTime: 5 * 60 * 1000,
  });
}

export function useVideoCategories(apiKey) {
  return useQuery({
    queryKey: ["categories", apiKey],
    queryFn: () => fetchVideoCategories(apiKey),
    enabled: !!apiKey,
    staleTime: 24 * 60 * 60 * 1000,
  });
}
