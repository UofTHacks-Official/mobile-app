// Judging schedule types based on API documentation

import { Project } from "./project";

export type SessionStatus =
  | "upcoming"
  | "in-progress"
  | "completed"
  | "overdue";

export interface JudgingLocationObject {
  judging_location_id: number;
  sponsor_id: number;
  location_name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export type JudgingLocation = string | JudgingLocationObject;

export interface JudgingScheduleTeam {
  team_id: number;
  team_name?: string;
  project?: Project;
}

export interface JudgingScheduleJudge {
  judge_id: number;
  judge_name?: string;
  company_id?: number;
  judging_location_id?: number;
}

export interface JudgingScheduleItem {
  judging_schedule_id: number;
  team_id: number;
  judge_id: number;
  judging_type?: string; // Optional until backend is fully updated
  timestamp: string;
  actual_timestamp: string | null;
  duration: number;
  location: JudgingLocation;
  created_at: string;
  updated_at: string;
  team?: JudgingScheduleTeam;
  judge?: JudgingScheduleJudge;
}

export interface JudgingScheduleItemWithStatus extends JudgingScheduleItem {
  status: SessionStatus;
  timeUntilStart?: number; // minutes until scheduled start
  elapsedTime?: number; // minutes since actual start
}

export type JudgingScheduleResponse = JudgingScheduleItem[];

export interface StartTimerByRoomRequest {
  room: string;
  timestamp: string;
}
