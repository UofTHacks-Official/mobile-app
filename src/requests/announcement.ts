import { Announcement } from "@/types/announcement";
import axios from "./axios";

const announcementEndpoints = {
  fetchAllAnnouncements: "/api/v13/admins/announcements/",
};

// Fetch all announcements (ordered by newest first)
export async function fetchAllAnnouncements(): Promise<Announcement[]> {
  const response = await axios.get(announcementEndpoints.fetchAllAnnouncements);
  return response.data;
}
