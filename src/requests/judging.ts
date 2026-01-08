import { JudgingScheduleItem } from "@/types/judging";
import { axiosInstance } from "./axiosConfig";

export const judgingEndpoints = {
  GET_ALL_JUDGING_SCHEDULES: "/api/v13/judges/schedules/all",
  GET_JUDGING_SCHEDULE_BY_ID: "/api/v13/judging/{judging_schedule_id}",
  START_JUDGING_TIMER:
    "/api/v13/admins/judging/{judging_schedule_id}/start-timer",
  START_TIMER_BY_ROOM: "/api/v13/admins/judging/start-timer-by-room",
  GENERATE_SCHEDULES: "/api/v13/judging/generate-from-db",
};

/**
 * Fetches all judging schedules
 */
export const getAllJudgingSchedules = async (): Promise<
  JudgingScheduleItem[]
> => {
  const response = await axiosInstance.get<{
    schedules: JudgingScheduleItem[];
  }>(judgingEndpoints.GET_ALL_JUDGING_SCHEDULES);
  // Backend returns { schedules: [...] }, so unwrap it
  return response.data.schedules;
};

/**
 * Fetches a judging schedule by ID
 */
export const getJudgingScheduleById = async (
  judgingScheduleId: number
): Promise<JudgingScheduleItem> => {
  const response = await axiosInstance.get<JudgingScheduleItem>(
    judgingEndpoints.GET_JUDGING_SCHEDULE_BY_ID.replace(
      "{judging_schedule_id}",
      judgingScheduleId.toString()
    )
  );
  return response.data;
};

/**
 * Starts a judging timer for a specific schedule (session)
 * Note: This now starts the timer for ALL judges in the session
 * @param judgingScheduleId - The session ID (shared by all judges in the session)
 * @returns Array of all updated judging schedule entries (one per judge in the session)
 */
export const startJudgingTimer = async (
  judgingScheduleId: number
): Promise<JudgingScheduleItem[]> => {
  console.log("[DEBUG] Starting timer for schedule ID:", judgingScheduleId);
  const response = await axiosInstance.post<{
    schedules: JudgingScheduleItem[];
  }>(
    judgingEndpoints.START_JUDGING_TIMER.replace(
      "{judging_schedule_id}",
      judgingScheduleId.toString()
    )
  );
  console.log("[DEBUG] Start timer response:", response.data);
  return response.data.schedules;
};

/**
 * Starts judging timers for all sessions in a room at a specific time
 * @param room - Room prefix (e.g., "MY150", "MY330")
 * @param timestamp - Scheduled timestamp in ISO 8601 format
 * @returns Array of all updated judging schedule entries
 */
export const startJudgingTimerByRoom = async (
  room: string,
  timestamp: string
): Promise<JudgingScheduleItem[]> => {
  const response = await axiosInstance.post<{
    schedules: JudgingScheduleItem[];
  }>(judgingEndpoints.START_TIMER_BY_ROOM, {
    room,
    timestamp,
  });
  return response.data.schedules;
};

/**
 * Generates judging schedules from database (Admin only)
 */
export const generateJudgingSchedules = async (): Promise<any> => {
  const response = await axiosInstance.post<any>(
    judgingEndpoints.GENERATE_SCHEDULES
  );
  return response.data;
};
