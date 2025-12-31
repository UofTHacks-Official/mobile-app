// components/CustomTabBar.js
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import { useTheme } from "@/context/themeContext";
import { useBottomNavBarStore } from "@/reducers/bottomNavBar";
import { cn, getThemeStyles } from "@/utils/theme";
import { FEATURE_FLAGS } from "@/config/featureFlags";
import { getUserType } from "@/utils/tokens/secureStorage";
import * as Haptics from "@/utils/haptics";
import { usePathname } from "expo-router";
import {
  BanknoteArrowUp,
  BanknoteArrowDown,
  Calendar,
  Camera,
  Gavel,
  Home,
  ScanLine,
  ScanQrCode,
  User,
  UserCheck,
  X,
} from "lucide-react-native";
import { useEffect, useRef, useMemo, useState } from "react";
import { Animated, Text, TouchableOpacity, View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PlatformBlur } from "@/components/common/PlatformBlur";

const CustomTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const [isVolunteer, setIsVolunteer] = useState(false);

  // Use Zustand store for nav bar state
  const isExpanded = useBottomNavBarStore((s) => s.isExpanded);
  const isVisible = useBottomNavBarStore((s) => s.isVisible);
  const photoboothViewMode = useBottomNavBarStore((s) => s.photoboothViewMode);
  const setIsExpanded = useBottomNavBarStore((s) => s.setIsExpanded);
  const setPhotoboothViewMode = useBottomNavBarStore(
    (s) => s.setPhotoboothViewMode
  );
  const closeNavBar = useBottomNavBarStore((s) => s.closeNavBar);

  // Check if user is a volunteer
  useEffect(() => {
    const checkUserType = async () => {
      const userType = await getUserType();
      setIsVolunteer(userType === "volunteer");
    };
    checkUserType();
  }, []);

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
      // When on hackerbucks or photobooth routes, override the selection to those tabs
      const isSelected = isOnHackerBucksRoute
        ? route.name === "qr"
        : isOnPhotoboothRoute
          ? route.name === "photobooth"
          : state.index === index;

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
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsExpanded(!isExpanded);
  };

  const handleScanOption = (
    option: "checkin" | "add" | "deduct" | "qr" | "hackerbucks"
  ) => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

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
    } else if (option === "checkin") {
      navigation.navigate("hackerbucks", {
        screen: "scan",
        params: { mode: "checkin" },
      });
    } else if (option === "add") {
      navigation.navigate("hackerbucks", {
        screen: "scan",
        params: { mode: "add" },
      });
    } else if (option === "deduct") {
      navigation.navigate("hackerbucks", {
        screen: "scan",
        params: { mode: "deduct" },
      });
    }
  };

  const isWeb = Platform.OS === "web";

  // Animate the height of the container
  // Volunteers only see 1 option (checkin), admins see 3 options (checkin, add, deduct)
  const expandedHeight = isVolunteer ? 140 : 220;
  const animatedHeight = expandAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [60, expandedHeight], // Collapsed and expanded heights
  });

  // Dynamically adjust width based on number of tabs
  // 4 tabs (hacker/judge) = 70%, 5 tabs = 85%, 6 tabs (admin with judgeSchedule) = 95%
  const numTabs = state.routes.length;
  const baseWidth = numTabs <= 4 ? "70%" : numTabs === 5 ? "85%" : "95%";
  const expandedWidth = numTabs <= 4 ? "85%" : numTabs === 5 ? "90%" : "95%";

  // Animate the width of the container
  const animatedWidth = expandAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [baseWidth, expandedWidth],
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

  if (isWeb) {
    return (
      <>
        {isExpanded && (
          <View
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9998,
            }}
            onTouchEnd={toggleExpansion}
          />
        )}
        {isExpanded && (
          <View
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 88,
              alignItems: "center",
              zIndex: 9999,
              pointerEvents: "box-none",
            }}
          >
            <View
              style={{
                width: baseWidth,
                maxWidth: 560,
                minWidth: 280,
                backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF",
                borderRadius: 20,
                paddingVertical: 10,
                paddingHorizontal: 14,
                boxShadow: "0px 8px 18px rgba(0, 0, 0, 0.25)",
              }}
            >
              {FEATURE_FLAGS.ENABLE_HACKERBUCKS ? (
                <>
                  <TouchableOpacity
                    onPress={() => handleScanOption("checkin")}
                    className="flex-row items-center justify-between py-2"
                  >
                    <Text
                      className={cn(
                        "text-base font-onest-extralight",
                        isDark ? "text-white" : "text-black"
                      )}
                    >
                      Check In Hacker
                    </Text>
                    <UserCheck
                      size={22}
                      strokeWidth={1.5}
                      color={isDark ? "#FFFFFF" : "#000000"}
                    />
                  </TouchableOpacity>
                  {!isVolunteer && (
                    <>
                      <TouchableOpacity
                        onPress={() => handleScanOption("add")}
                        className="flex-row items-center justify-between py-2"
                      >
                        <Text
                          className={cn(
                            "text-base font-onest-extralight",
                            isDark ? "text-white" : "text-black"
                          )}
                        >
                          Add HackerBux
                        </Text>
                        <BanknoteArrowUp
                          size={22}
                          strokeWidth={1.5}
                          color={isDark ? "#FFFFFF" : "#000000"}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleScanOption("deduct")}
                        className="flex-row items-center justify-between py-2"
                      >
                        <Text
                          className={cn(
                            "text-base font-onest-extralight",
                            isDark ? "text-white" : "text-black"
                          )}
                        >
                          Deduct HackerBux
                        </Text>
                        <BanknoteArrowDown
                          size={22}
                          strokeWidth={1.5}
                          color={isDark ? "#FFFFFF" : "#000000"}
                        />
                      </TouchableOpacity>
                    </>
                  )}
                </>
              ) : (
                <Text
                  className={cn(
                    "text-center text-sm py-2",
                    isDark ? "text-white" : "text-black"
                  )}
                >
                  Scanner features coming soon!
                </Text>
              )}
              <View className="flex-row justify-end">
                <TouchableOpacity onPress={toggleExpansion} className="p-2">
                  <X
                    size={22}
                    strokeWidth={1.5}
                    color={themeStyles.navBarIconActive}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        <View
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 16,
            alignItems: "center",
            zIndex: 9999,
            pointerEvents: "box-none",
          }}
        >
          <View
            style={{
              width: baseWidth,
              maxWidth: 560,
              minWidth: 280,
              backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF",
              borderRadius: 24,
              paddingVertical: 10,
              paddingHorizontal: 16,
              flexDirection: "row",
              justifyContent: "space-around",
              alignItems: "center",
              boxShadow: "0px 8px 18px rgba(0, 0, 0, 0.25)",
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

              if (label === "Photo") {
                label = photoboothViewMode === "gallery" ? "Gallery" : "Photo";
              }

              const isFocused = isOnHackerBucksRoute
                ? route.name === "qr"
                : isOnPhotoboothRoute
                  ? route.name === "photobooth"
                  : state.index === index;

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
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                if (route.name === "qr") {
                  if (!event.defaultPrevented) {
                    toggleExpansion();
                  }
                  return;
                }

                if (!event.defaultPrevented) {
                  if (isExpanded) {
                    closeNavBar();
                  }
                  navigation.navigate(route.name);
                }
              };

              const onLongPress = () => {
                navigation.emit({
                  type: "tabLongPress",
                  target: route.key,
                });
              };

              return (
                <TouchableOpacity
                  key={route.key}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  className="flex-row items-center justify-center"
                  style={{ padding: 10 }}
                >
                  {iconComponent()}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </>
    );
  }

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
          <PlatformBlur
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
              {FEATURE_FLAGS.ENABLE_HACKERBUCKS && (
                <>
                  <TouchableOpacity
                    onPress={() => handleScanOption("checkin")}
                    className="rounded-xl p-2 flex-row items-center justify-between"
                  >
                    <Text
                      className={cn(
                        "text-lg font-onest-extralight",
                        isDark ? "text-white" : "text-black"
                      )}
                    >
                      Check In Hacker
                    </Text>
                    <UserCheck
                      size={28}
                      strokeWidth={1.5}
                      color={isDark ? "#FFFFFF" : "#000000"}
                    />
                  </TouchableOpacity>
                  {!isVolunteer && (
                    <>
                      <TouchableOpacity
                        onPress={() => handleScanOption("add")}
                        className="rounded-xl p-2 flex-row items-center justify-between"
                      >
                        <Text
                          className={cn(
                            "text-lg font-onest-extralight",
                            isDark ? "text-white" : "text-black"
                          )}
                        >
                          Add HackerBux
                        </Text>
                        <BanknoteArrowUp
                          size={28}
                          strokeWidth={1.5}
                          color={isDark ? "#FFFFFF" : "#000000"}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleScanOption("deduct")}
                        className="rounded-xl p-2 flex-row items-center justify-between"
                      >
                        <Text
                          className={cn(
                            "text-lg font-onest-extralight",
                            isDark ? "text-white" : "text-black"
                          )}
                        >
                          Deduct HackerBux
                        </Text>
                        <BanknoteArrowDown
                          size={28}
                          strokeWidth={1.5}
                          color={isDark ? "#FFFFFF" : "#000000"}
                        />
                      </TouchableOpacity>
                    </>
                  )}
                </>
              )}
              {!FEATURE_FLAGS.ENABLE_HACKERBUCKS && (
                <Text
                  className={cn(
                    "text-center text-sm py-4",
                    isDark ? "text-white" : "text-black"
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
            className="flex-row items-center justify-around w-full"
            style={{
              paddingHorizontal: 16,
              paddingVertical: 15,
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

              // When on hackerbucks or photobooth routes, override the focus to those tabs
              const isFocused = isOnHackerBucksRoute
                ? route.name === "qr"
                : isOnPhotoboothRoute
                  ? route.name === "photobooth"
                  : state.index === index;

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

                // Check if this tab is actually selected (not just visually focused)
                const isActuallySelected = state.index === index;

                if (route.name === "qr") {
                  if (isActuallySelected || isOnHackerBucksRoute) {
                    toggleExpansion();
                  } else if (!event.defaultPrevented) {
                    toggleExpansion();
                  }
                } else {
                  // Allow navigation if not actually selected OR if we're on hackerbucks/photobooth and clicking home
                  const shouldNavigate =
                    !isActuallySelected ||
                    (isOnHackerBucksRoute && route.name === "index") ||
                    (isOnPhotoboothRoute && route.name === "index");

                  if (shouldNavigate && !event.defaultPrevented) {
                    // Close expansion when navigating to other tabs
                    if (isExpanded) {
                      closeNavBar();
                    }
                    navigation.navigate(route.name);
                  }
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
