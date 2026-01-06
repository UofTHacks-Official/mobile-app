import {
  generateJudgingSchedules,
  getAllJudgingSchedules,
  getJudgingScheduleById,
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
      console.log("[DEBUG] Fetching judge schedules...");

      // Get judgeId if not provided
      const id = judgeId ?? (await getJudgeId());
      if (!id) {
        throw new Error("Judge ID not found");
      }

      // Use mock data if enabled
      if (USE_MOCK_JUDGING_DATA) {
        console.log("[DEBUG] Using mock data for judge", id);
        await new Promise((resolve) => setTimeout(resolve, 500));
        const judgeSchedules = MOCK_JUDGING_SCHEDULES.filter(
          (s) => s.judge_id === id
        );
        return judgeSchedules;
      }

      try {
        console.log("[DEBUG] Calling GET /api/v13/judges/{judge_id}/schedules");
        const response = await getJudgeSchedules(id);
        console.log("[DEBUG] Received judge schedules:", response.schedules);
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
 * Note: This now starts timers for ALL judges in a session
 * @returns Mutation result for starting the judging timer (returns array of schedules)
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
    onSuccess: (schedules) => {
      // Update the cache for each schedule returned (all judges in the session)
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
        console.log("[DEBUG] Fetching judge's calendar schedules...");

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

        console.log(
          "[DEBUG] Consolidated blocks count:",
          consolidatedBlocks.length
        );
        console.log("[DEBUG] First block:", consolidatedBlocks[0]);
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
