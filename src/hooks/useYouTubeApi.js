import { useQuery } from "@tanstack/react-query";
import { fetchChannelData, fetchChannelVideosForYear } from "../utils/youtube";

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
    enabled: !!apiKey && !!channelId && !!year,
    staleTime: 5 * 60 * 1000,
  });
}
