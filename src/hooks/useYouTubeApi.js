import { useQuery } from "@tanstack/react-query";
import { fetchChannelData, fetchChannelVideosForYear, fetchVideoCategories } from "../utils/youtube";

export function useChannelInfo(channelId) {
  return useQuery({
    queryKey: ["channel", channelId],
    queryFn: () => fetchChannelData(channelId),
    enabled: !!channelId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useChannelVideos(channelId, year) {
  return useQuery({
    queryKey: ["videos", channelId, year],
    queryFn: () => fetchChannelVideosForYear(channelId, year),
    enabled: !!channelId && year !== undefined,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAllChannelVideos(channelId) {
  return useQuery({
    queryKey: ["allChannelVideos", channelId],
    queryFn: () => fetchChannelVideosForYear(channelId, null),
    enabled: !!channelId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useVideoCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchVideoCategories(),
    staleTime: 24 * 60 * 60 * 1000,
  });
}
