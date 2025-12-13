import { fetchAllAnnouncements } from "@/requests/announcement";
import { UserType } from "@/types/announcement";
import { devError } from "@/utils/logger";
import { useQuery } from "@tanstack/react-query";

/**
 * TanStack Query hook for fetching announcements filtered by user type
 * @param userType - The user type to filter announcements by (null means not yet loaded)
 * @param enabled - Whether the query should be enabled (default: true)
 * @returns Query result with announcements data filtered for the user type
 */
export const useAnnouncementsData = (
  userType: UserType | null,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["announcements", userType],
    queryFn: async () => {
      try {
        const data = await fetchAllAnnouncements();
        // Filter announcements based on user_types field
        // If user_types is not present or empty, show to all users (backwards compatibility)
        // Otherwise, only show if the user's type is in the user_types array
        return data.filter((announcement) => {
          if (
            !announcement.user_types ||
            announcement.user_types.length === 0
          ) {
            return true; // Show to all users if no user_types specified
          }
          return userType ? announcement.user_types.includes(userType) : false;
        });
      } catch (error) {
        devError("Announcements fetch error:", error);
        throw error;
      }
    },
    enabled: enabled && userType !== null,
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
