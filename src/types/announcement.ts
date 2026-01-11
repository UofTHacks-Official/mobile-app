export type UserType = "admin" | "hacker" | "judge" | "volunteer";

export interface Announcement {
  announcement_id: number;
  admin_id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_types?: UserType[]; // Optional to maintain backwards compatibility
}
