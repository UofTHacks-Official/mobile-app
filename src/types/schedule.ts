// Schedule type definition based on API documentation
export enum ScheduleType {
  CEREMONIES, // 0
  SPONSOR, // 1
  MINI, // 2
  FOOD, // 3
  SHIFTS, // 4
  WORKSHOP, // 5
}
export interface Schedule {
  id: number | string; // Can be number from API or string for split events
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  date: Date;
  type: ScheduleType;
  sponsorId: string | null;
  isShift: boolean;
  shiftType: string | null;
}
export const ScheduleTypeLabels: Record<ScheduleType, string> = {
  [ScheduleType.CEREMONIES]: "Ceremony",
  [ScheduleType.SPONSOR]: "Sponsor Event",
  [ScheduleType.MINI]: "Mini Event",
  [ScheduleType.FOOD]: "Food",
  [ScheduleType.SHIFTS]: "Shift",
  [ScheduleType.WORKSHOP]: "Workshop",
};

export const getScheduleTypeLabel = (type: ScheduleType): string => {
  return ScheduleTypeLabels[type] || "Event";
};
