// Judging schedule types based on API documentation

export type SessionStatus =
  | "upcoming"
  | "in-progress"
  | "completed"
  | "overdue";

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

export interface JudgingScheduleItemWithStatus extends JudgingScheduleItem {
  status: SessionStatus;
  timeUntilStart?: number; // minutes until scheduled start
  elapsedTime?: number; // minutes since actual start
}

export type JudgingScheduleResponse = JudgingScheduleItem[];
