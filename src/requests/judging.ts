import { JudgingScheduleItem } from "@/types/judging";
import { axiosInstance } from "./axiosConfig";

export const judgingEndpoints = {
  GET_ALL_JUDGING_SCHEDULES: "/api/v13/judging",
  GET_JUDGING_SCHEDULE_BY_ID: "/api/v13/judging/{judging_schedule_id}",
  START_JUDGING_TIMER: "/api/v13/judging/{judging_schedule_id}/start-timer",
};

/**
 * Fetches all judging schedules
 */
export const getAllJudgingSchedules = async (): Promise<
  JudgingScheduleItem[]
> => {
  const response = await axiosInstance.get<JudgingScheduleItem[]>(
    judgingEndpoints.GET_ALL_JUDGING_SCHEDULES
  );
  return response.data;
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
