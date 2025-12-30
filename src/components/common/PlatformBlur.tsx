import { Platform, View, ViewProps } from "react-native";
import { BlurView, BlurViewProps } from "expo-blur";

type PlatformBlurProps = BlurViewProps & {
  children?: React.ReactNode;
};

/**
 * Cross-platform blur component
 * - On native: Uses expo-blur's BlurView
 * - On web: Uses CSS backdrop-filter
 */
export const PlatformBlur = ({
  children,
  intensity = 80,
  tint = "default",
  style,
  ...props
}: PlatformBlurProps) => {
  if (Platform.OS === "web") {
    // Use CSS backdrop-filter on web
    const backgroundColor =
      tint === "dark"
        ? "rgba(0, 0, 0, 0.7)"
        : tint === "light"
          ? "rgba(255, 255, 255, 0.7)"
          : "rgba(128, 128, 128, 0.7)";

    return (
      <View
        {...(props as ViewProps)}
        style={[
          style,
          {
            backgroundColor,
            // @ts-ignore - web-specific CSS properties
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          },
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <BlurView intensity={intensity} tint={tint} style={style} {...props}>
      {children}
    </BlurView>
  );
};
