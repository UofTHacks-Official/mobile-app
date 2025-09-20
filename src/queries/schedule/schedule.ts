import { fetchAllSchedules, fetchScheduleById } from "@/requests/schedule";
import { Schedule, ScheduleType } from "@/types/schedule";
import { devError, devLog } from "@/utils/logger";
import { useQuery } from "@tanstack/react-query";

function mapApiToSchedule(apiEvent: any): Schedule {
  const typeMap: Record<number, ScheduleType> = {
    1: "networking",
    2: "food",
    3: "activity",
  };
  return {
    id: apiEvent.schedule_id.toString(),
    title: apiEvent.schedule_name,
    description: apiEvent.schedule_description,
    startTime: apiEvent.schedule_start_time,
    endTime: apiEvent.schedule_end_time,
    date: new Date(apiEvent.schedule_start_time),
    type: typeMap[apiEvent.event_type] || "activity",
    sponsorId: apiEvent.sponsor_id,
    isShift: apiEvent.is_shift,
    shiftType: apiEvent.shift_type,
  };
}

/**
 * TanStack Query hook for fetching and filtering schedule data
 * @param selectedEventTypes - Array of event types to filter by
 * @param enabled - Whether the query should be enabled (default: true)
 * @returns Query result with filtered schedule data
 */
export const useScheduleData = (
  selectedEventTypes: ScheduleType[],
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["schedules", selectedEventTypes],
    queryFn: async () => {
      try {
        const data = await fetchAllSchedules();
        const mappedSchedules = data.map(mapApiToSchedule);

        return mappedSchedules.filter((schedule) =>
          selectedEventTypes.includes(schedule.type)
        );
      } catch (error) {
        devError("Schedule fetch error:", error);
        throw error;
      }
    },
    enabled: enabled && selectedEventTypes.length > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
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
 * TanStack Query hook for fetching a single schedule by ID
 * @param scheduleId - The schedule ID or Schedule object
 * @param enabled - Whether the query should be enabled (default: true)
 * @returns Query result with the specific schedule data
 */
export const useScheduleById = (scheduleId: number) => {
  return useQuery({
    queryKey: ["schedule", scheduleId],
    queryFn: async () => {
      try {
        const data = await fetchScheduleById(scheduleId);
        return mapApiToSchedule(data);
      } catch (error) {
        devLog("Schedule by ID fetch error:", error);
        throw error;
      }
    },
    enabled: !!scheduleId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (failureCount >= 3) return false;

      if (error instanceof Error && error.message.includes("404")) {
        return false;
      }

      return true;
    },
  });
};
