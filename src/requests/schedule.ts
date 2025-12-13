import { Schedule } from "@/types/schedule";
import { getUserType } from "@/utils/tokens/secureStorage";
import axios from "./axios";

const scheduleEndpoints = {
  hackers: {
    fetchAllSchedules: "/api/v13/hackers/schedules/",
    fetchScheduleByID: "/api/v13/hackers/schedules/{id}/",
  },
  admins: {
    fetchAllSchedules: "/api/v13/admins/schedules/",
    fetchScheduleByID: "/api/v13/admins/schedules/{id}/",
  },
};

// Fetch all scheduled events
export async function fetchAllSchedules(): Promise<Schedule[]> {
  const userType = await getUserType();
  const endpoint =
    userType === "admin"
      ? scheduleEndpoints.admins.fetchAllSchedules
      : scheduleEndpoints.hackers.fetchAllSchedules;

  const response = await axios.get(endpoint);
  return response.data;
}

// Fetch a scheduled event by ID
export async function fetchScheduleById(schedule: number): Promise<Schedule> {
  const userType = await getUserType();
  const baseEndpoint =
    userType === "admin"
      ? scheduleEndpoints.admins.fetchScheduleByID
      : scheduleEndpoints.hackers.fetchScheduleByID;

  const url = baseEndpoint.replace("{id}", schedule.toString());
  console.log("[DEBUG] fetchScheduleById - URL:", url);
  console.log("[DEBUG] fetchScheduleById - schedule ID:", schedule);
  console.log("[DEBUG] fetchScheduleById - userType:", userType);

  try {
    const response = await axios.get(url);
    console.log(
      "[DEBUG] fetchScheduleById - response status:",
      response.status
    );
    console.log("[DEBUG] fetchScheduleById - response data:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "[DEBUG] fetchScheduleById - Full error object:",
      JSON.stringify(error, null, 2)
    );
    console.error("[DEBUG] fetchScheduleById - error.message:", error?.message);
    console.error("[DEBUG] fetchScheduleById - error.code:", error?.code);
    console.error("[DEBUG] fetchScheduleById - error.config:", error?.config);
    console.error(
      "[DEBUG] fetchScheduleById - error response:",
      error?.response
    );
    console.error(
      "[DEBUG] fetchScheduleById - error status:",
      error?.response?.status
    );
    console.error(
      "[DEBUG] fetchScheduleById - error data:",
      error?.response?.data
    );
    throw error;
  }
}
