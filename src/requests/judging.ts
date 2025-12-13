import { JudgingScheduleItem } from "@/types/judging";
import { axiosInstance } from "./axiosConfig";

export const judgingEndpoints = {
  GET_ALL_JUDGING_SCHEDULES: "/api/v13/judges/schedules/all",
  GET_JUDGING_SCHEDULE_BY_ID: "/api/v13/judging/{judging_schedule_id}",
  START_JUDGING_TIMER: "/api/v13/judging/{judging_schedule_id}/start-timer",
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
 * Starts a judging timer for a specific schedule
 */
export const startJudgingTimer = async (
  judgingScheduleId: number
): Promise<JudgingScheduleItem> => {
  const response = await axiosInstance.post<JudgingScheduleItem>(
    judgingEndpoints.START_JUDGING_TIMER.replace(
      "{judging_schedule_id}",
      judgingScheduleId.toString()
    )
  );
  return response.data;
};

/**
 * Generates judging schedules from database (Admin only)
 */
export const generateJudgingSchedules = async (): Promise<any> => {
  const response = await axiosInstance.post<any>(
    judgingEndpoints.GENERATE_SCHEDULES
  );
  console.log("[DEBUG] Generate schedules response:", response.data);
  return response.data;
};
