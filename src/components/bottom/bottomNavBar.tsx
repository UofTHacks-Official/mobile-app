// components/CustomTabBar.js
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import { useTheme } from "@/context/themeContext";
import { useBottomNavBarStore } from "@/reducers/bottomNavBar";
import { cn, getThemeStyles } from "@/utils/theme";
import { FEATURE_FLAGS } from "@/config/featureFlags";
import * as Haptics from "expo-haptics";
import { usePathname } from "expo-router";
import {
  BanknoteArrowUp,
  Calendar,
  Camera,
  Gavel,
  Home,
  ScanLine,
  ScanQrCode,
  User,
  X,
} from "lucide-react-native";
import { useEffect, useRef, useMemo } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";

const CustomTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);

  // Use Zustand store for nav bar state
  const isExpanded = useBottomNavBarStore((s) => s.isExpanded);
  const isVisible = useBottomNavBarStore((s) => s.isVisible);
  const photoboothViewMode = useBottomNavBarStore((s) => s.photoboothViewMode);
  const setIsExpanded = useBottomNavBarStore((s) => s.setIsExpanded);
  const setPhotoboothViewMode = useBottomNavBarStore(
    (s) => s.setPhotoboothViewMode
  );
  const closeNavBar = useBottomNavBarStore((s) => s.closeNavBar);

  // Animation values for each tab
  // Use useMemo to recreate when routes change (e.g., feature flags)
  const animatedValues = useMemo(
    () => state.routes.map(() => new Animated.Value(0)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.routes.length]
  );

  // Animation for expansion
  const expandAnimation = useRef(new Animated.Value(0)).current;

  // Animation for visibility
  const visibilityAnimation = useRef(new Animated.Value(1)).current;

  // Sync animation with isExpanded state
  useEffect(() => {
    Animated.timing(expandAnimation, {
      toValue: isExpanded ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [isExpanded, expandAnimation]);

  // Sync animation with isVisible state
  useEffect(() => {
    Animated.timing(visibilityAnimation, {
      toValue: isVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isVisible, visibilityAnimation]);

  // Check if we're on a hackerbucks route
  const isOnHackerBucksRoute = pathname.includes("/hackerbucks");

  // Check if we're on the photobooth route
  const isOnPhotoboothRoute = pathname.includes("/photobooth");

  // Animate the selected tab
  useEffect(() => {
    state.routes.forEach((route, index) => {
      const isSelected =
        state.index === index ||
        (route.name === "qr" && isOnHackerBucksRoute) ||
        (route.name === "photobooth" && isOnPhotoboothRoute);

      Animated.spring(animatedValues[index], {
        toValue: isSelected ? 1 : 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    });

    // Reset photobooth view mode when not on photobooth tab
    const currentRoute = state.routes[state.index];
    if (currentRoute && currentRoute.name !== "photobooth") {
      setPhotoboothViewMode("camera");
    }
  }, [
    state.index,
    animatedValues,
    state.routes,
    isOnHackerBucksRoute,
    isOnPhotoboothRoute,
    setPhotoboothViewMode,
  ]);

  const toggleExpansion = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setIsExpanded(!isExpanded);
  };

  const handleScanOption = (option: "qr" | "hackerbucks") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Collapse the expansion immediately
    closeNavBar();
    Animated.timing(expandAnimation, {
      toValue: 0,
      duration: 50,
      useNativeDriver: false,
    }).start();

    // Navigate to the appropriate screen
    if (option === "qr") {
      navigation.navigate("qr");
    } else if (option === "hackerbucks") {
      navigation.navigate("hackerbucks");
    }
  };

  // Animate the height of the container
  const animatedHeight = expandAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [60, 155], // Collapsed and expanded heights
  });

  // Animate the width of the container
  const animatedWidth = expandAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["60%", "85%"], // Narrower default without labels, wider when expanded
  });

  // Fade in the scan options
  const scanOptionsOpacity = expandAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  // Hide the tab bar icons when expanded
  const tabBarOpacity = expandAnimation.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [1, 0.5, 0],
  });

  return (
    <>
      {/* Transparent overlay to catch taps and close the component */}
      {isExpanded && (
        <View
          className="absolute inset-0"
          onTouchEnd={toggleExpansion}
          style={{ zIndex: 1 }}
        />
      )}

      {/* A single animated container for the entire component */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: insets.bottom,
          left: 0,
          right: 0,
          height: animatedHeight,
          alignItems: "center",
          zIndex: 2, // Higher zIndex than the overlay
          transform: [
            {
              translateY: visibilityAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0], // Slide down when hidden, slide up when visible
              }),
            },
          ],
          opacity: visibilityAnimation,
        }}
      >
        <Animated.View
          className="rounded-3xl h-full flex flex-col justify-center overflow-hidden"
          style={{
            width: animatedWidth,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.34,
            shadowRadius: 6.27,
            elevation: 10,
          }}
        >
          <BlurView
            intensity={80}
            tint={isDark ? "dark" : "light"}
            className="absolute inset-0"
          />
          {/* Expanded Scan Options */}
          <Animated.View
            className="absolute top-4 left-4 right-4 bottom-4 flex flex-col justify-between"
            style={{ opacity: scanOptionsOpacity }}
            pointerEvents={isExpanded ? "auto" : "none"}
          >
            <View className="space-y-2">
              {(FEATURE_FLAGS.ENABLE_QR_SCANNER ||
                FEATURE_FLAGS.ENABLE_EVENT_CHECKIN) && (
                <TouchableOpacity
                  onPress={() => handleScanOption("qr")}
                  className="rounded-xl p-2 flex-row items-center justify-between"
                >
                  <Text
                    className={cn(
                      "text-lg font-onest-extralight",
                      themeStyles.navBarText
                    )}
                  >
                    Event Check-in
                  </Text>
                  <ScanLine
                    size={28}
                    strokeWidth={1.5}
                    color={themeStyles.navBarIconActive}
                  />
                </TouchableOpacity>
              )}
              {(FEATURE_FLAGS.ENABLE_QR_SCANNER ||
                FEATURE_FLAGS.ENABLE_HACKERBUCKS) && (
                <TouchableOpacity
                  onPress={() => handleScanOption("hackerbucks")}
                  className="rounded-xl p-2 flex-row items-center justify-between"
                >
                  <Text
                    className={cn(
                      "text-lg font-onest-extralight",
                      themeStyles.navBarText
                    )}
                  >
                    Send Hacker Bucks
                  </Text>
                  <BanknoteArrowUp
                    size={28}
                    strokeWidth={1.5}
                    color={themeStyles.navBarIconActive}
                  />
                </TouchableOpacity>
              )}
              {!FEATURE_FLAGS.ENABLE_QR_SCANNER &&
                !FEATURE_FLAGS.ENABLE_EVENT_CHECKIN &&
                !FEATURE_FLAGS.ENABLE_HACKERBUCKS && (
                  <Text
                    className={cn(
                      "text-center text-sm py-4",
                      themeStyles.navBarText
                    )}
                  >
                    Scanner features coming soon!
                  </Text>
                )}
            </View>
            <View className="flex-row justify-end">
              <TouchableOpacity
                onPress={toggleExpansion}
                className="rounded-full p-2"
              >
                <X
                  size={28}
                  strokeWidth={1.5}
                  color={themeStyles.navBarIconActive}
                />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Tab Bar Icons */}
          <Animated.View
            className="flex-row justify-around items-center w-full"
            style={{
              padding: 15,
              opacity: tabBarOpacity,
              transform: [
                {
                  translateY: expandAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 65], // Move icons down when expanded
                  }),
                },
              ],
            }}
          >
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              let label =
                typeof options.tabBarLabel === "string"
                  ? options.tabBarLabel
                  : options.title !== undefined
                    ? options.title
                    : route.name;

              // Override label for Photo tab based on photobooth view mode
              if (label === "Photo") {
                label = photoboothViewMode === "gallery" ? "Gallery" : "Photo";
              }

              const isFocused =
                state.index === index ||
                (route.name === "qr" && isOnHackerBucksRoute) ||
                (route.name === "photobooth" && isOnPhotoboothRoute);

              const iconComponent = () => {
                switch (route.name) {
                  case "index":
                    return (
                      <Home
                        size={24}
                        strokeWidth={1.5}
                        color={
                          isFocused
                            ? themeStyles.navBarIconActive
                            : themeStyles.navBarIconInactive
                        }
                      />
                    );
                  case "schedule":
                    return (
                      <Calendar
                        size={24}
                        strokeWidth={1.5}
                        color={
                          isFocused
                            ? themeStyles.navBarIconActive
                            : themeStyles.navBarIconInactive
                        }
                      />
                    );
                  case "judging":
                    return (
                      <Gavel
                        size={24}
                        strokeWidth={1.5}
                        color={
                          isFocused
                            ? themeStyles.navBarIconActive
                            : themeStyles.navBarIconInactive
                        }
                      />
                    );
                  case "qr":
                    return (
                      <ScanQrCode
                        size={24}
                        strokeWidth={1.5}
                        color={
                          isFocused
                            ? themeStyles.navBarIconActive
                            : themeStyles.navBarIconInactive
                        }
                      />
                    );
                  case "photobooth":
                    return (
                      <Camera
                        size={24}
                        strokeWidth={1.5}
                        color={
                          isFocused
                            ? themeStyles.navBarIconActive
                            : themeStyles.navBarIconInactive
                        }
                      />
                    );
                  case "profile":
                    return (
                      <User
                        size={24}
                        strokeWidth={1.5}
                        color={
                          isFocused
                            ? themeStyles.navBarIconActive
                            : themeStyles.navBarIconInactive
                        }
                      />
                    );

                  default:
                    return null;
                }
              };

              const onPress = () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                if (route.name === "qr") {
                  if (isFocused) {
                    toggleExpansion();
                  } else if (!event.defaultPrevented) {
                    toggleExpansion();
                  }
                } else if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              const onLongPress = () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.emit({
                  type: "tabLongPress",
                  target: route.key,
                });
              };

              return (
                <Animated.View
                  key={route.key}
                  style={{
                    transform: [
                      {
                        scale: animatedValues[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.1],
                        }),
                      },
                    ],
                  }}
                >
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityState={isFocused ? { selected: true } : {}}
                    accessibilityLabel={options.tabBarAccessibilityLabel}
                    onPress={onPress}
                    onLongPress={onLongPress}
                    className="flex-row items-center justify-center p-3"
                  >
                    {iconComponent()}
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </>
  );
};

export default CustomTabBar;

export { useBottomNavBarStore };
