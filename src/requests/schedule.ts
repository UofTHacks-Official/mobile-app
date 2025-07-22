import { Schedule } from '@/types/schedule';
import axios from './axios';

const scheduleEndpoints = {
  fetchAllSchedules:"/api/v13/hackers/schedules",
  fetchScheduleByID: "/api/v13/hackers/{id}"
}
// Fetch all scheduled events
export async function fetchAllSchedules(): Promise<Schedule[]> {
  const response = await axios.get(scheduleEndpoints.fetchAllSchedules);
  return response.data;
}

// (Optional) Fetch a scheduled event by ID
export async function fetchScheduleById(id: string): Promise<Schedule> {
  const response = await axios.get(scheduleEndpoints.fetchScheduleByID.replace('{id}', id));
  return response.data;
}