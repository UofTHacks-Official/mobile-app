import { JudgingScheduleItem } from "@/types/judging";

/**
 * Extract room name from location string, removing table numbers
 * Example: "MY150 H13" -> "MY150"
 * Example: "Main Hall Table 5" -> "Main Hall"
 */
export const extractRoomName = (locationName: string): string => {
  // Split by space and take only the first part (room name)
  // This assumes format like "MY150 H13" where room is first
  const parts = locationName.trim().split(/\s+/);
  return parts[0] || locationName;
};

/**
 * Format location for display - extracts room name only (ignoring table)
 */
export const formatLocationForDisplay = (
  location: JudgingScheduleItem["location"]
): string => {
  const locationName =
    typeof location === "string" ? location : location.location_name;
  return extractRoomName(locationName);
};

/**
 * Get full location name (including table) - used for API calls
 */
export const getFullLocationName = (
  location: JudgingScheduleItem["location"]
): string => {
  return typeof location === "string" ? location : location.location_name;
};

/**
 * Grouped judging schedule by room
 */
export interface RoomGroup {
  roomName: string;
  schedules: JudgingScheduleItem[];
  // Use the earliest timestamp from all schedules in this room
  timestamp: string;
}

/**
 * Group judging schedules by room name
 * All sessions in the same room (different tables) will be grouped together
 */
export const groupSchedulesByRoom = (
  schedules: JudgingScheduleItem[]
): RoomGroup[] => {
  const roomMap = new Map<string, JudgingScheduleItem[]>();

  // Group schedules by room name
  schedules.forEach((schedule) => {
    const roomName = formatLocationForDisplay(schedule.location);
    const existing = roomMap.get(roomName) || [];
    existing.push(schedule);
    roomMap.set(roomName, existing);
  });

  // Convert to array of room groups
  const roomGroups: RoomGroup[] = [];
  roomMap.forEach((schedules, roomName) => {
    // Sort schedules by timestamp and take the earliest
    const sortedSchedules = [...schedules].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    roomGroups.push({
      roomName,
      schedules: sortedSchedules,
      timestamp: sortedSchedules[0].timestamp,
    });
  });

  // Sort room groups by timestamp
  return roomGroups.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
};
