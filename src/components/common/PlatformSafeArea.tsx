import { Platform, View, ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Cross-platform SafeAreaView
 * - On native: Uses react-native-safe-area-context
 * - On web: Uses regular View (safe areas not needed on web)
 */
export const PlatformSafeArea = ({ children, ...props }: ViewProps) => {
  if (Platform.OS === "web") {
    return <View {...props}>{children}</View>;
  }

  return <SafeAreaView {...props}>{children}</SafeAreaView>;
};
