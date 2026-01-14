import { fetchAllSchedules } from "@/requests/schedule";
import { Schedule, ScheduleType } from "@/types/schedule";
import { devError, devLog } from "@/utils/logger";
import { useQuery } from "@tanstack/react-query";

function mapApiToSchedule(apiEvent: any): Schedule {
  const eventType: ScheduleType = apiEvent.event_type;

  return {
    id: apiEvent.schedule_id.toString(),
    title: apiEvent.schedule_name,
    description: apiEvent.schedule_description,
    startTime: apiEvent.schedule_start_time,
    endTime: apiEvent.schedule_end_time,
    date: new Date(apiEvent.schedule_start_time),
    // Directly assign the enum value
    type: eventType,
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
 * Since the backend doesn't have a get-by-id endpoint, we fetch all schedules
 * and filter client-side for the one we need
 * @param scheduleId - The schedule ID
 * @returns Query result with the specific schedule data
 */
export const useScheduleById = (scheduleId: number) => {
  return useQuery({
    queryKey: ["schedule", scheduleId],
    queryFn: async () => {
      try {
        // Fetch all schedules since there's no get-by-id endpoint
        const allSchedules = await fetchAllSchedules();

        // Find the schedule with matching ID
        const schedule = allSchedules.find(
          (s: any) => s.schedule_id === scheduleId
        );

        if (!schedule) {
          throw new Error(`Schedule with ID ${scheduleId} not found`);
        }

        return mapApiToSchedule(schedule);
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

      if (error instanceof Error && error.message.includes("not found")) {
        return false;
      }

      return true;
    },
  });
};
