import { Schedule } from '@/types/schedule';
import { devLog } from '@/utils/logger';
import axios from './axios';

const scheduleEndpoints = {
  fetchAllSchedules:"/api/v13/hackers/schedules",
  fetchScheduleByID: "/api/v13/hackers/schedules/{id}"
}
// Fetch all scheduled events
export async function fetchAllSchedules(): Promise<Schedule[]> {
  const response = await axios.get(scheduleEndpoints.fetchAllSchedules);
  return response.data;
}

// Fetch a scheduled event by ID
export async function fetchScheduleById(schedule: number): Promise<Schedule> {
  const url = scheduleEndpoints.fetchScheduleByID.replace('{id}', schedule.toString());
  devLog('Fetching schedule by ID:', url);
  const response = await axios.get(url);
  return response.data;
}