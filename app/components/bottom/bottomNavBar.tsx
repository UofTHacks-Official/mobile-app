// components/CustomTabBar.js
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import {
  BanknoteArrowUp,
  Calendar,
  Home,
  ScanLine,
  ScanQrCode,
  X,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CustomTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const actualNavigation = useNavigation();
  const [isExpanded, setIsExpanded] = useState(false);

  // Animation values for each tab
  const animatedValues = useRef(
    state.routes.map(() => new Animated.Value(0))
  ).current;

  // Animation for expansion
  const expandAnimation = useRef(new Animated.Value(0)).current;

  // Animate the selected tab
  useEffect(() => {
    state.routes.forEach((_, index) => {
      Animated.spring(animatedValues[index], {
        toValue: state.index === index ? 1 : 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    });
  }, [state.index]);

  const toggleExpansion = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const toValue = isExpanded ? 0 : 1;

    Animated.timing(expandAnimation, {
      toValue,
      duration: 150,
      useNativeDriver: false, // 'height' is not supported by the native driver
    }).start();

    setIsExpanded(!isExpanded);
  };

  const handleScanOption = (option: "qr" | "hackerbucks") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Collapse the expansion immediately
    setIsExpanded(false);
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
    outputRange: ["60%", "85%"], // Narrower default, wider when expanded
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
        }}
      >
        <Animated.View
          className="bg-navBar rounded-3xl h-full flex flex-col justify-center"
          style={{
            width: animatedWidth,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.34,
            shadowRadius: 6.27,
            elevation: 10,
          }}
        >
          {/* Expanded Scan Options */}
          <Animated.View
            className="absolute top-4 left-4 right-4 bottom-4 flex flex-col justify-between"
            style={{ opacity: scanOptionsOpacity }}
            pointerEvents={isExpanded ? "auto" : "none"}
          >
            <View className="space-y-2">
              <TouchableOpacity
                onPress={() => handleScanOption("qr")}
                className="rounded-xl p-2 flex-row items-center justify-between"
              >
                <Text className="text-white text-lg font-onest-extralight">
                  Event Check-in
                </Text>
                <ScanLine size={28} strokeWidth={1.5} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleScanOption("hackerbucks")}
                className=" rounded-xl p-2 flex-row text-lg items-center justify-between"
              >
                <Text className="text-white text-lg font-onest-extralight">
                  Send Hacker Bucks
                </Text>
                <BanknoteArrowUp size={28} strokeWidth={1.5} color="white" />
              </TouchableOpacity>
            </View>
            <View className="flex-row justify-end">
              <TouchableOpacity
                onPress={toggleExpansion}
                className="rounded-full p-2"
              >
                <X size={28} strokeWidth={1.5} color="white" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Tab Bar Icons */}
          <Animated.View
            className="flex-row justify-around items-center w-full"
            style={{
              padding: 10,
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
              const label =
                typeof options.tabBarLabel === "string"
                  ? options.tabBarLabel
                  : options.title !== undefined
                  ? options.title
                  : route.name;

              const isFocused = state.index === index;

              const iconComponent = () => {
                switch (label) {
                  case "Home":
                    return (
                      <Home
                        size={24}
                        strokeWidth={1.5}
                        color={isFocused ? "white" : "#BFBDBE"}
                      />
                    );
                  case "Schedule":
                    return (
                      <Calendar
                        size={24}
                        strokeWidth={1.5}
                        color={isFocused ? "white" : "#BFBDBE"}
                      />
                    );
                  case "Scan":
                    return (
                      <ScanQrCode
                        size={24}
                        strokeWidth={1.5}
                        color={isFocused ? "white" : "#BFBDBE"}
                      />
                    );
                  // case "Send":
                  //   return (
                  //     <BanknoteArrowUp
                  //       size={24}
                  //       strokeWidth={1.5}
                  //       color={isFocused ? "white" : "#BFBDBE"}
                  //     />
                  //   );
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

                if (!isFocused && !event.defaultPrevented) {
                  if (route.name === "qr") {
                    toggleExpansion();
                  } else {
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
                    className={`flex-row items-center justify-center rounded-xl ${
                      isFocused ? "bg-navBar1 px-4 py-2" : "p-2"
                    }`}
                  >
                    {iconComponent()}
                    {isFocused && label && (
                      <Animated.Text
                        className="ml-2 text-white font-semibold font-onest-extralight"
                        style={{
                          opacity: animatedValues[index],
                          transform: [
                            {
                              translateX: animatedValues[index].interpolate({
                                inputRange: [0, 1],
                                outputRange: [-10, 0],
                              }),
                            },
                          ],
                        }}
                      >
                        {label}
                      </Animated.Text>
                    )}
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
