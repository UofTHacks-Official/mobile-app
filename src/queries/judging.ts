import {
  generateJudgingSchedules,
  getAllJudgingSchedules,
  startJudgingTimer,
  startJudgingTimerByRoom,
} from "@/requests/judging";
import { getJudgeSchedules } from "@/requests/judge";
import { devError } from "@/utils/logger";
import {
  MOCK_JUDGING_SCHEDULES,
  USE_MOCK_JUDGING_DATA,
} from "@/utils/mockJudgingData";
import { Schedule, ScheduleType } from "@/types/schedule";
import { JudgingScheduleItem } from "@/types/judging";
import { getJudgeId } from "@/utils/tokens/secureStorage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * TanStack Query hook for fetching all judging schedules (Admin only)
 * @param enabled - Whether to enable this query (default: true)
 * @returns Query result with all judging schedules
 */
export const useAllJudgingSchedules = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["judging-schedules"],
    queryFn: async () => {
      // Use mock data if enabled
      if (USE_MOCK_JUDGING_DATA) {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        return MOCK_JUDGING_SCHEDULES;
      }

      try {
        const data = await getAllJudgingSchedules();
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
 * TanStack Query hook for fetching a specific judge's schedules
 * Uses the judge-specific endpoint that requires judge authentication
 * @param judgeId - The ID of the judge (optional, will auto-fetch if not provided)
 * @param enabled - Whether to enable this query (default: true)
 * @returns Query result with judge's schedules
 */
export const useJudgeSchedules = (
  judgeId?: number | null,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["judge-schedules", judgeId],
    queryFn: async () => {
      // Get judgeId if not provided
      const id = judgeId ?? (await getJudgeId());
      if (!id) {
        throw new Error("Judge ID not found");
      }

      // Use mock data if enabled
      if (USE_MOCK_JUDGING_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const judgeSchedules = MOCK_JUDGING_SCHEDULES.filter(
          (s) => s.judge_id === id
        );
        return judgeSchedules;
      }

      try {
        const response = await getJudgeSchedules(id);
        return response.schedules;
      } catch (error) {
        devError("Judge schedules fetch error:", error);
        throw error;
      }
    },
    enabled: enabled && judgeId !== null,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * TanStack Query hook for fetching a judging schedule by ID
 * Tries cached schedules first to avoid hitting a non-existent detail endpoint.
 * Falls back to the all-schedules endpoint and filters locally.
 * @param judgingScheduleId - The ID of the judging schedule
 * @param options - Optional settings (e.g., refetchInterval for polling)
 * @returns Query result with judging schedule data
 */
export const useJudgingScheduleById = (
  judgingScheduleId: number,
  options?: { refetchInterval?: number }
) => {
  const queryClient = useQueryClient();

  const getCachedSchedule = () => {
    // Try admin schedules cache
    const adminSchedules = queryClient.getQueryData<JudgingScheduleItem[]>([
      "judging-schedules",
    ]);
    const adminMatch = adminSchedules?.find(
      (s) => s.judging_schedule_id === judgingScheduleId
    );
    if (adminMatch) return adminMatch;

    // Try any judge-specific schedules cache
    const judgeSchedules = queryClient.getQueriesData<JudgingScheduleItem[]>({
      queryKey: ["judge-schedules"],
      exact: false,
    });

    for (const [, data] of judgeSchedules) {
      const match = data?.find(
        (s) => s.judging_schedule_id === judgingScheduleId
      );
      if (match) return match;
    }

    return undefined;
  };

  const initialData = getCachedSchedule();

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

      // Prefer cached schedules from other queries to avoid extra fetches
      const cachedSchedule = getCachedSchedule();
      if (cachedSchedule) {
        return cachedSchedule;
      }

      try {
        // Fallback: fetch all schedules and pick the matching one
        const allSchedules = await getAllJudgingSchedules();
        const schedule = allSchedules.find(
          (s) => s.judging_schedule_id === judgingScheduleId
        );
        if (!schedule) {
          throw new Error("Schedule not found (404)");
        }
        return schedule;
      } catch (error) {
        devError("Judging schedule fetch error:", error);
        throw error;
      }
    },
    enabled: !!judgingScheduleId,
    initialData,
    initialDataUpdatedAt: initialData ? Date.now() : undefined,
    refetchOnMount: initialData ? false : true,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchInterval: options?.refetchInterval ?? false,
    refetchIntervalInBackground: !!options?.refetchInterval,
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
 * Note: This now starts timers for ALL judges in a session
 * @returns Mutation result for starting the judging timer (returns array of schedules)
 */
export const useStartJudgingTimer = () => {
  const queryClient = useQueryClient();

  const updateScheduleTimestamp = (
    scheduleId: number,
    actualTimestamp: string
  ) => {
    const applyUpdate = (s?: JudgingScheduleItem) =>
      s
        ? {
            ...s,
            actual_timestamp: actualTimestamp,
            updated_at: actualTimestamp,
          }
        : s;

    const updateList = (list?: JudgingScheduleItem[]) =>
      list?.map((s) =>
        s.judging_schedule_id === scheduleId ? applyUpdate(s)! : s
      );

    // Individual schedule cache
    queryClient.setQueryData(
      ["judging-schedule", scheduleId],
      (prev?: JudgingScheduleItem) => applyUpdate(prev)
    );

    // Admin schedules list
    queryClient.setQueryData(
      ["judging-schedules"],
      (prev?: JudgingScheduleItem[]) => updateList(prev)
    );

    // Judge schedules lists (multiple keys)
    const judgeSchedules = queryClient.getQueriesData<JudgingScheduleItem[]>({
      queryKey: ["judge-schedules"],
      exact: false,
    });
    judgeSchedules.forEach(([key, data]) => {
      queryClient.setQueryData(key, updateList(data));
    });
  };

  const mergeSchedules = (
    list: JudgingScheduleItem[] | undefined,
    updates: JudgingScheduleItem[]
  ) => {
    if (!list) return updates;
    const map = new Map<number, JudgingScheduleItem>();
    list.forEach((s) => map.set(s.judging_schedule_id, s));
    updates.forEach((u) => map.set(u.judging_schedule_id, u));
    return Array.from(map.values());
  };

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
        // Return array of schedules with actual_timestamp set to now
        return [
          {
            ...schedule,
            actual_timestamp: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
      }

      try {
        const data = await startJudgingTimer(judgingScheduleId);
        return data;
      } catch (error) {
        devError("Start judging timer error:", error);
        throw error;
      }
    },
    // Optimistically mark the schedule as started to avoid UI lag
    onMutate: (judgingScheduleId) => {
      const now = new Date().toISOString();
      updateScheduleTimestamp(judgingScheduleId, now);
      return { optimisticTimestamp: now };
    },
    onSuccess: (schedules) => {
      // Update the cache for each schedule returned (all judges in the session)
      schedules.forEach((schedule) => {
        queryClient.setQueryData(
          ["judging-schedule", schedule.judging_schedule_id],
          schedule
        );
      });

      // Update admin schedules list without refetch
      queryClient.setQueryData(
        ["judging-schedules"],
        (prev?: JudgingScheduleItem[]) => mergeSchedules(prev, schedules)
      );

      // Update judge schedules lists without refetch
      const judgeSchedules = queryClient.getQueriesData<JudgingScheduleItem[]>({
        queryKey: ["judge-schedules"],
        exact: false,
      });
      judgeSchedules.forEach(([key, data]) => {
        queryClient.setQueryData(key, mergeSchedules(data, schedules));
      });
    },
  });
};

/**
 * TanStack Query mutation hook for starting timers by room
 * Starts the judging timer for all sessions in a room at a specific time
 * @returns Mutation result for starting timers (returns array of schedules)
 */
export const useStartJudgingTimerByRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      room,
      timestamp,
    }: {
      room: string;
      timestamp: string;
    }) => {
      // Use mock data if enabled
      if (USE_MOCK_JUDGING_DATA) {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        // Find all schedules matching the room and timestamp
        const matchingSchedules = MOCK_JUDGING_SCHEDULES.filter((s) => {
          // Extract room from location if it's an object
          const location =
            typeof s.location === "string"
              ? s.location
              : s.location.location_name;
          return location.startsWith(room) && s.timestamp === timestamp;
        });

        if (matchingSchedules.length === 0) {
          throw new Error("No schedules found for this room and time");
        }

        // Return array of schedules with actual_timestamp set to now
        return matchingSchedules.map((schedule) => ({
          ...schedule,
          actual_timestamp: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
      }

      try {
        const data = await startJudgingTimerByRoom(room, timestamp);
        return data;
      } catch (error) {
        devError("Start judging timer by room error:", error);
        throw error;
      }
    },
    onSuccess: (schedules) => {
      // Update the cache for each schedule returned (all judges in the room)
      schedules.forEach((schedule) => {
        queryClient.setQueryData(
          ["judging-schedule", schedule.judging_schedule_id],
          schedule
        );
      });
      // Also invalidate the all schedules list to reflect the change
      queryClient.invalidateQueries({ queryKey: ["judging-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["judge-schedules"] });
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
      // Invalidate all schedule queries to refetch the new data
      await queryClient.invalidateQueries({ queryKey: ["judging-schedules"] });
      await queryClient.invalidateQueries({ queryKey: ["judge-schedules"] });
      // Force refetch
      await queryClient.refetchQueries({ queryKey: ["judging-schedules"] });
    },
  });
};

/**
 * TanStack Query hook for fetching judge's schedule data in calendar format
 * Transforms judging schedules into Schedule format for the calendar view
 * Note: selectedEventTypes is ignored for judges - all judging sessions are shown
 * @param selectedEventTypes - Not used, kept for API compatibility
 * @param enabled - Whether the query should be enabled (default: true)
 * @returns Query result with judge's schedules formatted as Schedule objects
 */
export const useJudgeScheduleData = (
  selectedEventTypes: ScheduleType[],
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["judge-calendar-schedules"], // Removed selectedEventTypes from key since we ignore it
    queryFn: async () => {
      try {
        // Get the current judge's ID
        const judgeId = await getJudgeId();
        if (!judgeId) {
          throw new Error("Judge ID not found");
        }

        // Fetch all judging schedules
        let allSchedules;
        if (USE_MOCK_JUDGING_DATA) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          allSchedules = MOCK_JUDGING_SCHEDULES;
        } else {
          allSchedules = await getAllJudgingSchedules();
        }

        // Filter to only this judge's schedules
        const judgeSchedules = allSchedules.filter(
          (s) => s.judge_id === judgeId
        );

        if (judgeSchedules.length === 0) {
          return [];
        }

        // Sort by timestamp
        const sortedSchedules = [...judgeSchedules].sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        // Group consecutive sessions into blocks
        const consolidatedBlocks: Schedule[] = [];
        let currentBlock: {
          start: Date;
          end: Date;
          sessions: JudgingScheduleItem[];
        } | null = null;

        sortedSchedules.forEach((session) => {
          const sessionStart = new Date(session.timestamp);
          const sessionEnd = new Date(
            sessionStart.getTime() + session.duration * 60000
          );

          if (!currentBlock) {
            // Start first block
            currentBlock = {
              start: sessionStart,
              end: sessionEnd,
              sessions: [session],
            };
          } else {
            // Check if this session is within 30 minutes of the last session's end
            const timeSinceLastEnd =
              sessionStart.getTime() - currentBlock.end.getTime();
            const thirtyMinutesInMs = 30 * 60 * 1000;

            if (timeSinceLastEnd <= thirtyMinutesInMs) {
              // Extend current block
              currentBlock.end = sessionEnd;
              currentBlock.sessions.push(session);
            } else {
              // Save current block and start new one
              consolidatedBlocks.push({
                id: `judging-block-${currentBlock.sessions[0].judging_schedule_id}`,
                title: `Judging Sessions (${currentBlock.sessions.length})`,
                description: `${currentBlock.sessions.length} projects to judge`,
                startTime: currentBlock.start.toISOString(),
                endTime: currentBlock.end.toISOString(),
                date: currentBlock.start,
                type: "activity" as ScheduleType,
                sponsorId: null,
                isShift: false,
                shiftType: null,
              });

              currentBlock = {
                start: sessionStart,
                end: sessionEnd,
                sessions: [session],
              };
            }
          }
        });

        // Don't forget the last block
        if (currentBlock !== null) {
          const block = currentBlock as {
            start: Date;
            end: Date;
            sessions: JudgingScheduleItem[];
          };
          consolidatedBlocks.push({
            id: `judging-block-${block.sessions[0].judging_schedule_id}`,
            title: `Judging Sessions (${block.sessions.length})`,
            description: `${block.sessions.length} projects to judge`,
            startTime: block.start.toISOString(),
            endTime: block.end.toISOString(),
            date: block.start,
            type: "activity" as ScheduleType,
            sponsorId: null,
            isShift: false,
            shiftType: null,
          });
        }
        return consolidatedBlocks;
      } catch (error) {
        devError("Judge schedule data fetch error:", error);
        throw error;
      }
    },
    enabled: enabled, // Removed the selectedEventTypes.length check
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
  });
};
