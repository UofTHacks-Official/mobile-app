// components/CustomTabBar.js
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation
import * as Haptics from "expo-haptics"; // Add this import
import { BanknoteArrowUp, Calendar, Home, QrCode } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CustomTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  const insets = useSafeAreaInsets(); // For safe area handling
  const actualNavigation = useNavigation(); // Get the actual navigation object if props.navigation isn't sufficient for specific actions

  // Animation values for each tab
  const animatedValues = useRef(
    state.routes.map(() => new Animated.Value(0))
  ).current;

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

  return (
    <View
      className="flex-row justify-around items-center bg-navBar rounded-3xl mx-12 py-3"
      style={{
        position: "absolute",
        bottom: insets.bottom, // Adjust this value to control distance from bottom
        left: 0,
        right: 0,
        alignSelf: "center",
        // Optional: Add shadow for a raised effect
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 10,
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
          // Map your route names to the appropriate Lucide icons
          switch (label) {
            case "Home":
              return <Home size={24} color={isFocused ? "white" : "#BFBDBE"} />;
            case "Schedule":
              return (
                <Calendar size={24} color={isFocused ? "white" : "#BFBDBE"} />
              );
            case "Scan":
              return (
                <QrCode size={24} color={isFocused ? "white" : "#BFBDBE"} />
              );
            case "Send":
              return (
                <BanknoteArrowUp
                  size={24}
                  color={isFocused ? "white" : "#BFBDBE"}
                />
              );
            // case "Profile":
            //   return (
            //     <User
            //       size={24}
            //       color={isFocused ? "black" : "white"}
            //     />
            //   );
            default:
              return null;
          }
        };

        const onPress = () => {
          // Add haptic feedback
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            // Special handling for the 'Add' button if it's not a regular screen navigation
            if (route.name === "Add") {
              // Example: Open a modal or perform an action instead of navigating to a screen
              // You might need a context or Redux to trigger a global modal, or pass a function down
              console.log("Add button pressed!");
              // Example: actualNavigation.navigate('ModalScreen'); // If you have a modal screen
            } else {
              navigation.navigate(route.name);
            }
          }
        };

        const onLongPress = () => {
          // Add haptic feedback for long press
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
                  className="ml-2 text-white font-semibold"
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
    </View>
  );
};

export default CustomTabBar;
