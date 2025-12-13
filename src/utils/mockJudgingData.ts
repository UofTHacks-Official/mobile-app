import { JudgingScheduleItem } from "@/types/judging";

/**
 * Mock judging schedule data for testing the timer functionality
 * TODO: Remove this file once backend schedule generation is working
 */

// Helper to generate timestamps for today
const getTimestamp = (hoursFromNow: number): string => {
  const date = new Date();
  date.setHours(date.getHours() + hoursFromNow);
  return date.toISOString();
};

export const MOCK_JUDGING_SCHEDULES: JudgingScheduleItem[] = [
  {
    judging_schedule_id: 1,
    team_id: 101,
    judge_id: 1,
    timestamp: getTimestamp(-1), // 1 hour ago (overdue)
    actual_timestamp: null,
    duration: 10,
    location: "Demo Room A",
    created_at: getTimestamp(-24),
    updated_at: getTimestamp(-24),
  },
  {
    judging_schedule_id: 2,
    team_id: 102,
    judge_id: 1,
    timestamp: getTimestamp(-0.5), // 30 minutes ago (overdue)
    actual_timestamp: null,
    duration: 10,
    location: "Demo Room A",
    created_at: getTimestamp(-24),
    updated_at: getTimestamp(-24),
  },
  {
    judging_schedule_id: 3,
    team_id: 103,
    judge_id: 1,
    timestamp: getTimestamp(-0.25), // 15 minutes ago (can start timer)
    actual_timestamp: getTimestamp(-0.1), // Started 6 minutes ago (in progress)
    duration: 10,
    location: "Demo Room B",
    created_at: getTimestamp(-24),
    updated_at: getTimestamp(-0.1),
  },
  {
    judging_schedule_id: 4,
    team_id: 104,
    judge_id: 1,
    timestamp: getTimestamp(0.5), // 30 minutes from now (upcoming)
    actual_timestamp: null,
    duration: 10,
    location: "Main Hall - Station 1",
    created_at: getTimestamp(-24),
    updated_at: getTimestamp(-24),
  },
  {
    judging_schedule_id: 5,
    team_id: 105,
    judge_id: 1,
    timestamp: getTimestamp(1), // 1 hour from now (upcoming)
    actual_timestamp: null,
    duration: 10,
    location: "Main Hall - Station 2",
    created_at: getTimestamp(-24),
    updated_at: getTimestamp(-24),
  },
  {
    judging_schedule_id: 6,
    team_id: 106,
    judge_id: 2,
    timestamp: getTimestamp(1.5), // 1.5 hours from now
    actual_timestamp: null,
    duration: 10,
    location: "Demo Room C",
    created_at: getTimestamp(-24),
    updated_at: getTimestamp(-24),
  },
  {
    judging_schedule_id: 7,
    team_id: 107,
    judge_id: 2,
    timestamp: getTimestamp(-2), // 2 hours ago
    actual_timestamp: getTimestamp(-2),
    duration: 10,
    location: "Demo Room C",
    created_at: getTimestamp(-24),
    updated_at: getTimestamp(-2),
  },
];

/**
 * Feature flag to enable/disable mock data
 * Set to false once backend is working
 */
export const USE_MOCK_JUDGING_DATA = false;
