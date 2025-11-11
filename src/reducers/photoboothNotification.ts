import { create } from "zustand";

interface PhotoboothNotificationState {
  notificationBody: string | null;
  notificationTimestamp: number | null;
  setNotificationBody: (body: string) => void;
  clearNotificationBody: () => void;
  isWithinActiveWindow: () => boolean;
  getTimeRemaining: () => number;
}

const ACTIVE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes in milliseconds

export const usePhotoboothNotificationStore =
  create<PhotoboothNotificationState>((set, get) => ({
    notificationBody: null,
    notificationTimestamp: null,

    setNotificationBody: (body) =>
      set({
        notificationBody: body,
        notificationTimestamp: Date.now(),
      }),

    clearNotificationBody: () =>
      set({
        notificationBody: null,
        notificationTimestamp: null,
      }),

    isWithinActiveWindow: () => {
      const { notificationTimestamp } = get();
      if (!notificationTimestamp) return false;

      const elapsed = Date.now() - notificationTimestamp;
      return elapsed <= ACTIVE_WINDOW_MS;
    },

    getTimeRemaining: () => {
      const { notificationTimestamp } = get();
      if (!notificationTimestamp) return 0;

      const elapsed = Date.now() - notificationTimestamp;
      const remaining = ACTIVE_WINDOW_MS - elapsed;
      return Math.max(0, Math.floor(remaining / 1000)); // Return seconds remaining
    },
  }));
