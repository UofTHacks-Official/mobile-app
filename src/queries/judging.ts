import {
  generateJudgingSchedule,
  getJudgingScheduleById,
  startJudgingTimer,
} from "@/requests/judging";
import { devError } from "@/utils/logger";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * TanStack Query hook for fetching a judging schedule by ID
 * @param judgingScheduleId - The ID of the judging schedule
 * @returns Query result with judging schedule data
 */
export const useJudgingScheduleById = (judgingScheduleId: number) => {
  return useQuery({
    queryKey: ["judging-schedule", judgingScheduleId],
    queryFn: async () => {
      try {
        const data = await getJudgingScheduleById(judgingScheduleId);
        return data;
      } catch (error) {
        devError("Judging schedule fetch error:", error);
        throw error;
      }
    },
    enabled: !!judgingScheduleId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (failureCount >= 3) return false;

      if (error instanceof Error && error.message.includes("404")) {
        return false;
      }

      return true;
    },
  });
};

/**
 * TanStack Query mutation hook for generating judging schedules
 * @returns Mutation result for generating judging schedules
 */
export const useGenerateJudgingSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        const data = await generateJudgingSchedule();
        return data;
      } catch (error) {
        devError("Generate judging schedule error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate all judging schedule queries to refetch
      queryClient.invalidateQueries({ queryKey: ["judging-schedule"] });
    },
  });
};

/**
 * TanStack Query mutation hook for starting a judging timer
 * @returns Mutation result for starting the judging timer
 */
export const useStartJudgingTimer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (judgingScheduleId: number) => {
      try {
        const data = await startJudgingTimer(judgingScheduleId);
        return data;
      } catch (error) {
        devError("Start judging timer error:", error);
        throw error;
      }
    },
    onSuccess: (data, judgingScheduleId) => {
      // Update the cache with the new data
      queryClient.setQueryData(["judging-schedule", judgingScheduleId], data);
    },
  });
};
