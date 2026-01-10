import { Announcement, UserType } from "@/types/announcement";
import axios from "./axios";

const announcementEndpoints = {
  fetchAllAnnouncements: "/api/v13/admins/announcements/",
  broadcastNotification: "/api/v13/push-tokens/broadcast",
};

export interface BroadcastNotificationRequest {
  title: string;
  body: string;
  user_types: UserType[];
}

// Fetch all announcements (ordered by newest first)
export async function fetchAllAnnouncements(): Promise<Announcement[]> {
  const response = await axios.get(announcementEndpoints.fetchAllAnnouncements);
  return response.data;
}

// Broadcast a push notification to users
export async function broadcastNotification(
  data: BroadcastNotificationRequest
): Promise<void> {
  const response = await axios.post(
    announcementEndpoints.broadcastNotification,
    data
  );
  return response.data;
}
