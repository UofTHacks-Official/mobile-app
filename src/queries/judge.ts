import {
  getJudgeSchedules,
  getSponsorByPin,
  judgeLogin,
} from "@/requests/judge";
import { JudgeLoginRequest } from "@/types/judge";
import { devError } from "@/utils/logger";
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
 */
export const useJudgeSchedules = (judgeId: number | null) => {
  return useQuery({
    queryKey: ["judge-schedules", judgeId],
    queryFn: async () => {
      if (!judgeId) throw new Error("Judge ID is required");
      try {
        const data = await getJudgeSchedules(judgeId);
        return data.schedules;
      } catch (error) {
        devError("Judge schedules fetch error:", error);
        throw error;
      }
    },
    enabled: !!judgeId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};
