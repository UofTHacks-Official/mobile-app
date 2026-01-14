import {
  getJudgeSchedules,
  getSavedHackers,
  getSponsorByPin,
  isHackerSaved,
  judgeLogin,
  registerJudge,
  saveHacker,
  unsaveHacker,
} from "@/requests/judge";
import { JudgeLoginRequest, JudgeRegisterRequest } from "@/types/judge";
import { devError } from "@/utils/logger";
import {
  MOCK_JUDGING_SCHEDULES,
  USE_MOCK_JUDGING_DATA,
} from "@/utils/mockJudgingData";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
 * Mutation hook for judge registration
 */
export const useJudgeRegister = () => {
  return useMutation({
    mutationFn: async (registrationData: JudgeRegisterRequest) => {
      try {
        const data = await registerJudge(registrationData);
        return data;
      } catch (error) {
        devError("Judge registration error:", error);
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
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        // Filter schedules for this judge
        const judgeSchedules = MOCK_JUDGING_SCHEDULES.filter(
          (s) => s.judge_id === judgeId
        );
        return judgeSchedules;
      }

      try {
        const data = await getJudgeSchedules(judgeId);
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

/**
 * Mutation hook for saving a hacker
 */
export const useSaveHacker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hackerId: number) => {
      try {
        const data = await saveHacker(hackerId);
        return data;
      } catch (error) {
        devError("Save hacker error:", error);
        throw error;
      }
    },
    onSuccess: (_, hackerId) => {
      // Invalidate saved hackers list to refetch
      queryClient.invalidateQueries({ queryKey: ["saved-hackers"] });
      // Invalidate the is-saved check for this specific hacker
      queryClient.invalidateQueries({
        queryKey: ["is-hacker-saved", hackerId],
      });
    },
  });
};

/**
 * Mutation hook for unsaving a hacker
 */
export const useUnsaveHacker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hackerId: number) => {
      try {
        const data = await unsaveHacker(hackerId);
        return data;
      } catch (error) {
        devError("Unsave hacker error:", error);
        throw error;
      }
    },
    onSuccess: (_, hackerId) => {
      // Invalidate saved hackers list to refetch
      queryClient.invalidateQueries({ queryKey: ["saved-hackers"] });
      // Invalidate the is-saved check for this specific hacker
      queryClient.invalidateQueries({
        queryKey: ["is-hacker-saved", hackerId],
      });
    },
  });
};

/**
 * Query hook for fetching saved hackers
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of items per page
 * @param enabled - Whether to enable this query (default: true)
 */
export const useSavedHackers = (
  page: number = 1,
  pageSize: number = 20,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["saved-hackers", page, pageSize],
    queryFn: async () => {
      try {
        const data = await getSavedHackers(page, pageSize);
        return data;
      } catch (error) {
        devError("Saved hackers fetch error:", error);
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
 * Query hook for checking if a specific hacker is saved
 * @param hackerId - The hacker ID to check
 * @param enabled - Whether to enable this query (default: true)
 */
export const useIsHackerSaved = (
  hackerId: number | null,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["is-hacker-saved", hackerId],
    queryFn: async () => {
      if (!hackerId) throw new Error("Hacker ID is required");

      try {
        const data = await isHackerSaved(hackerId);
        return data.is_saved;
      } catch (error) {
        devError("Check hacker saved status error:", error);
        throw error;
      }
    },
    enabled: enabled && !!hackerId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};
