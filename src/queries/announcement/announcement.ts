import { fetchAllAnnouncements } from "@/requests/announcement";
import { devError } from "@/utils/logger";
import { useQuery } from "@tanstack/react-query";

/**
 * TanStack Query hook for fetching announcements
 * @param enabled - Whether the query should be enabled (default: true)
 * @returns Query result with announcements data
 */
export const useAnnouncementsData = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      try {
        const data = await fetchAllAnnouncements();
        return data;
      } catch (error) {
        devError("Announcements fetch error:", error);
        throw error;
      }
    },
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      if (failureCount >= 3) return false;

      if (error instanceof Error && error.message.includes("404")) {
        return false;
      }

      return true;
    },
  });
};
