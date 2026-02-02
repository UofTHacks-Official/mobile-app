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

// Fetch all scheduled events (public - doesn't require user type check)
export async function fetchAllSchedulesPublic(): Promise<Schedule[]> {
  // Use hacker endpoint as it's the public-facing one
  const response = await axios.get(scheduleEndpoints.hackers.fetchAllSchedules);
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

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error: any) {
    throw error;
  }
}
