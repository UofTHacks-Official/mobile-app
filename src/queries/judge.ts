import {
  getJudgeSchedules,
  getSponsorByPin,
  judgeLogin,
} from "@/requests/judge";
import { JudgeLoginRequest } from "@/types/judge";
import { devError } from "@/utils/logger";
import {
  MOCK_JUDGING_SCHEDULES,
  USE_MOCK_JUDGING_DATA,
} from "@/utils/mockJudgingData";
import { useMutation, useQuery } from "@tanstack/react-query";

/**
 * Mutation hook for getting sponsor by PIN
 */
export const useGetSponsorByPin = () => {
  return useMutation({
    mutationFn: async (pin: number) => {
      try {
        const data = await getSponsorByPin(pin);
        return data;
      } catch (error) {
        devError("Get sponsor by PIN error:", error);
        throw error;
      }
    },
  });
};

/**
 * Mutation hook for judge login
 */
export const useJudgeLogin = () => {
  return useMutation({
    mutationFn: async (credentials: JudgeLoginRequest) => {
      try {
        const data = await judgeLogin(credentials);
        return data;
      } catch (error) {
        devError("Judge login error:", error);
        throw error;
      }
    },
  });
};

/**
 * Query hook for fetching judge's schedules
 * @param judgeId - The judge ID
 * @param enabled - Whether to enable this query (default: true)
 */
export const useJudgeSchedules = (
  judgeId: number | null,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["judge-schedules", judgeId],
    queryFn: async () => {
      if (!judgeId) throw new Error("Judge ID is required");

      // Use mock data if enabled
      if (USE_MOCK_JUDGING_DATA) {
        console.log(`[DEBUG] Using mock data for judge ${judgeId}`);
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        // Filter schedules for this judge
        const judgeSchedules = MOCK_JUDGING_SCHEDULES.filter(
          (s) => s.judge_id === judgeId
        );
        console.log(
          `[DEBUG] Mock schedules for judge ${judgeId}:`,
          judgeSchedules
        );
        return judgeSchedules;
      }

      try {
        console.log(`[DEBUG] Fetching schedules for judge ${judgeId}`);
        const data = await getJudgeSchedules(judgeId);
        console.log(
          `[DEBUG] Judge ${judgeId} schedules response:`,
          JSON.stringify(data, null, 2)
        );
        return data.schedules;
      } catch (error) {
        devError("Judge schedules fetch error:", error);
        throw error;
      }
    },
    enabled: enabled && !!judgeId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};
