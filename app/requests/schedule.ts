import { Schedule } from '@/types/schedule';
import axios from 'axios';

const typeToEventType = {
  networking: 1,
  food: 2,
  activity: 3,
};

function toApiPayload(schedule: Partial<Schedule>) {
  return {
    schedule_name: schedule.title,
    schedule_start_time: schedule.startTime,
    schedule_end_time: schedule.endTime,
    schedule_description: schedule.description ?? '',
    event_type: typeof schedule.type === 'number' ? schedule.type : typeToEventType[schedule.type as keyof typeof typeToEventType] ?? 3,
    sponsor_id: schedule.sponsorId ?? 0,
    is_shift: schedule.isShift ?? false,
    shift_type: schedule.shiftType ?? 0,
    schedule_id: schedule.id ? Number(schedule.id) : undefined,
  };
}

// Fetch all scheduled events
export async function fetchAllSchedules(): Promise<Schedule[]> {
  const response = await axios.get('/api/v13/hackers/schedules');
  return response.data;
}

// (Optional) Fetch a scheduled event by ID
export async function fetchScheduleById(id: string): Promise<Schedule> {
  const response = await axios.get(`/api/v13/hackers/schedules/${id}`);
  return response.data;
}

// Create a new schedule (admin)
export async function createSchedule(data: Omit<Schedule, 'id' | 'date'> & { date: Date }): Promise<Schedule> {
  const payload = toApiPayload(data);
  return (await axios.post('/api/v13/admins/schedules/', payload)).data;
}

// Update a schedule (admin)
export async function updateSchedule(scheduleId: string, data: Partial<Schedule>): Promise<Schedule> {
  const payload = toApiPayload({ ...data, id: scheduleId });
  console.log("Payload for update:", payload);
  return (await axios.put(`/api/v13/admins/schedules/${scheduleId}`, payload)).data;
}
// Delete a schedule (admin)
export async function deleteSchedule(scheduleId: string): Promise<void> {
  await axios.delete(`/api/v13/admins/schedules/${scheduleId}`);
} 