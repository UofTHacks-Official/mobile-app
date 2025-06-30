// Schedule type definition based on API documentation
export type ScheduleType = "networking" | "food" | "activity";

export interface Schedule {
  id: string;
  title: string;
  description: string;
  startTime: string; 
  endTime: string;   
  date: Date;       
  type: ScheduleType;
  sponsorId: string | null;
  isShift: boolean;
  shiftType: string | null;

 // rawApi?: any;
} 