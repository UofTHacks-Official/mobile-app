// Judging schedule types based on API documentation

export interface JudgingScheduleItem {
  judging_schedule_id: number;
  team_id: number;
  judge_id: number;
  timestamp: string;
  actual_timestamp: string | null;
  duration: number;
  location: string;
  created_at: string;
  updated_at: string;
}

export type JudgingScheduleResponse = JudgingScheduleItem[];
