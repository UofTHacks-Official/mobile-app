import { JudgingScheduleItem } from "@/types/judging";
import { axiosInstance } from "./axiosConfig";

export const judgingEndpoints = {
  GET_JUDGING_SCHEDULE_BY_ID:
    "/api/v13/judging-schedules/{judging_schedule_id}",
  GENERATE_JUDGING_SCHEDULE: "/api/v13/judging-schedules/generate",
  START_JUDGING_TIMER: "/api/v13/judging-schedules/{judging_schedule_id}/start",
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
 * Generates a new judging schedule
 */
export const generateJudgingSchedule = async (): Promise<
  JudgingScheduleItem[]
> => {
  const response = await axiosInstance.post<JudgingScheduleItem[]>(
    judgingEndpoints.GENERATE_JUDGING_SCHEDULE
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
