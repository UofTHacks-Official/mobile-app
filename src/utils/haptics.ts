import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

// Platform-specific haptics adapter for web compatibility
export const haptics = {
  async impactAsync(
    style:
      | Haptics.ImpactFeedbackStyle
      | Haptics.ImpactFeedbackStyle.Light
      | Haptics.ImpactFeedbackStyle.Medium
      | Haptics.ImpactFeedbackStyle.Heavy
  ): Promise<void> {
    if (Platform.OS === "web") {
      // On web, use vibration API if available (no-op if not supported)
      if (navigator.vibrate) {
        const duration =
          style === Haptics.ImpactFeedbackStyle.Light
            ? 10
            : style === Haptics.ImpactFeedbackStyle.Heavy
              ? 50
              : 25;
        navigator.vibrate(duration);
      }
      return Promise.resolve();
    }
    return Haptics.impactAsync(style);
  },

  async notificationAsync(
    type:
      | Haptics.NotificationFeedbackType
      | Haptics.NotificationFeedbackType.Success
      | Haptics.NotificationFeedbackType.Warning
      | Haptics.NotificationFeedbackType.Error
  ): Promise<void> {
    if (Platform.OS === "web") {
      // Simple vibration patterns for different notification types
      if (navigator.vibrate) {
        const pattern =
          type === Haptics.NotificationFeedbackType.Success
            ? [10, 50, 10]
            : type === Haptics.NotificationFeedbackType.Error
              ? [10, 50, 10, 50, 10]
              : [10, 30, 10];
        navigator.vibrate(pattern);
      }
      return Promise.resolve();
    }
    return Haptics.notificationAsync(type);
  },

  async selectionAsync(): Promise<void> {
    if (Platform.OS === "web") {
      if (navigator.vibrate) {
        navigator.vibrate(5);
      }
      return Promise.resolve();
    }
    return Haptics.selectionAsync();
  },
};

// Export the original types for convenience
export { ImpactFeedbackStyle, NotificationFeedbackType } from "expo-haptics";
