import { Platform } from "react-native";
import * as ExpoHaptics from "expo-haptics";

/**
 * Cross-platform haptics utility
 * - On native: Uses expo-haptics
 * - On web: No-op (web doesn't support haptics in most browsers)
 */

export const impactAsync = (style: ExpoHaptics.ImpactFeedbackStyle) => {
  if (Platform.OS === "web") {
    return Promise.resolve();
  }
  return ExpoHaptics.impactAsync(style);
};

export const notificationAsync = (
  type: ExpoHaptics.NotificationFeedbackType
) => {
  if (Platform.OS === "web") {
    return Promise.resolve();
  }
  return ExpoHaptics.notificationAsync(type);
};

export const selectionAsync = () => {
  if (Platform.OS === "web") {
    return Promise.resolve();
  }
  return ExpoHaptics.selectionAsync();
};

// Re-export types and constants
export const ImpactFeedbackStyle = ExpoHaptics.ImpactFeedbackStyle;
export const NotificationFeedbackType = ExpoHaptics.NotificationFeedbackType;
