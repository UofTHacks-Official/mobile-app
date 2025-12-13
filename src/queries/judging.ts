import {
  generateJudgingSchedules,
  getAllJudgingSchedules,
  getJudgingScheduleById,
  startJudgingTimer,
} from "@/requests/judging";
import { devError } from "@/utils/logger";
import {
  MOCK_JUDGING_SCHEDULES,
  USE_MOCK_JUDGING_DATA,
} from "@/utils/mockJudgingData";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * TanStack Query hook for fetching all judging schedules
 * @param enabled - Whether to enable this query (default: true)
 * @returns Query result with all judging schedules
 */
export const useAllJudgingSchedules = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["judging-schedules"],
    queryFn: async () => {
      console.log("[DEBUG] Fetching all judging schedules...");
      // Use mock data if enabled
      if (USE_MOCK_JUDGING_DATA) {
        console.log("[DEBUG] Using mock data");
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        return MOCK_JUDGING_SCHEDULES;
      }

      try {
        console.log("[DEBUG] Calling GET /api/v13/judges/schedules/all");
        const data = await getAllJudgingSchedules();
        console.log("[DEBUG] Received schedules:", data);
        return data;
      } catch (error) {
        devError("All judging schedules fetch error:", error);
        throw error;
      }
    },
    enabled,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * TanStack Query hook for fetching a judging schedule by ID
 * @param judgingScheduleId - The ID of the judging schedule
 * @returns Query result with judging schedule data
 */
export const useJudgingScheduleById = (judgingScheduleId: number) => {
  return useQuery({
    queryKey: ["judging-schedule", judgingScheduleId],
    queryFn: async () => {
      // Use mock data if enabled
      if (USE_MOCK_JUDGING_DATA) {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 300));
        const schedule = MOCK_JUDGING_SCHEDULES.find(
          (s) => s.judging_schedule_id === judgingScheduleId
        );
        if (!schedule) {
          throw new Error("Schedule not found (404)");
        }
        return schedule;
      }

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
 * TanStack Query mutation hook for starting a judging timer
 * @returns Mutation result for starting the judging timer
 */
export const useStartJudgingTimer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (judgingScheduleId: number) => {
      // Use mock data if enabled
      if (USE_MOCK_JUDGING_DATA) {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        const schedule = MOCK_JUDGING_SCHEDULES.find(
          (s) => s.judging_schedule_id === judgingScheduleId
        );
        if (!schedule) {
          throw new Error("Schedule not found");
        }
        // Return schedule with actual_timestamp set to now
        return {
          ...schedule,
          actual_timestamp: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

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
      // Also invalidate the all schedules list to reflect the change
      queryClient.invalidateQueries({ queryKey: ["judging-schedules"] });
    },
  });
};

/**
 * TanStack Query mutation hook for generating judging schedules (Admin only)
 * @returns Mutation result for generating schedules
 */
export const useGenerateJudgingSchedules = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        const data = await generateJudgingSchedules();
        return data;
      } catch (error: any) {
        devError("Generate judging schedules error:", error);
        devError("Error response:", error?.response?.data);
        devError("Error status:", error?.response?.status);
        throw error;
      }
    },
    onSuccess: async () => {
      console.log("[DEBUG] Generation successful, invalidating queries...");
      // Invalidate all schedule queries to refetch the new data
      await queryClient.invalidateQueries({ queryKey: ["judging-schedules"] });
      await queryClient.invalidateQueries({ queryKey: ["judge-schedules"] });
      // Force refetch
      await queryClient.refetchQueries({ queryKey: ["judging-schedules"] });
      console.log("[DEBUG] Queries invalidated and refetched");
    },
  });
};
