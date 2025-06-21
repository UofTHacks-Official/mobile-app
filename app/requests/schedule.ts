import { Schedule } from '../types/schedule';
import axios from './axios';

// Fetch all scheduled events
export async function fetchAllSchedules(): Promise<Schedule[]> {
  const response = await axios.get('/api/v13/hackers/schedules');
  return response.data;
}

// Fetch a scheduled event by ID
export async function fetchScheduleById(id: string): Promise<Schedule> {
  const response = await axios.get(`/api/v13/hackers/schedules/${id}`);
  return response.data;
} 