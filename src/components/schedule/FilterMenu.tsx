import { useTheme } from "@/context/themeContext";
import { ScheduleType } from "@/types/schedule";
import { cn, getScheduleThemeStyles } from "@/utils/theme";
import {
  Check,
  Columns3,
  Square,
  Target,
  Users,
  Utensils,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Animated, Modal, Pressable, Text, View } from "react-native";

interface FilterMenuProps {
  isVisible: boolean;
  onClose: () => void;
  daysToShow: number;
  setDaysToShow: (days: number) => void;
  selectedEventTypes: ScheduleType[];
  onToggleEventType: (type: ScheduleType) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
}

const FilterMenu = ({
  isVisible,
  onClose,
  daysToShow,
  setDaysToShow,
  selectedEventTypes,
  onToggleEventType,
  onClearFilters,
  onApplyFilters,
}: FilterMenuProps) => {
  const slideAnim = useRef(new Animated.Value(-320)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const [internalVisible, setInternalVisible] = useState(isVisible);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);
  const { isDark } = useTheme();
  const themeStyles = getScheduleThemeStyles(isDark);

  useEffect(() => {
    if (isVisible) {
      setInternalVisible(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(bgOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -320,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(bgOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setInternalVisible(false);
        onClose();
      });
    }
    return () => {
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
    };
  }, [isVisible, slideAnim, bgOpacity, onClose]);

  if (!internalVisible) return null;

  return (
    <Modal
      visible={internalVisible}
      animationType="none"
      onRequestClose={() => {
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: -320,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(bgOpacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setInternalVisible(false);
          onClose();
        });
      }}
      transparent
      presentationStyle="overFullScreen"
    >
      <View className="flex-1">
        {/* Animated Background Overlay */}
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: bgOpacity,
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
          pointerEvents={isVisible ? "auto" : "none"}
        >
          <Pressable
            style={{ flex: 1, width: "100%", height: "100%" }}
            onPress={() => {
              Animated.parallel([
                Animated.timing(slideAnim, {
                  toValue: -320,
                  duration: 400,
                  useNativeDriver: true,
                }),
                Animated.timing(bgOpacity, {
                  toValue: 0,
                  duration: 400,
                  useNativeDriver: true,
                }),
              ]).start(() => {
                setInternalVisible(false);
                onClose();
              });
            }}
          />
        </Animated.View>
        {/* Side Menu */}
        <Animated.View
          className={cn(`w-80 ${themeStyles.scheduleBackground}`)}
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              zIndex: 10,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          {/* <View className="px-6 pt-16 pb-6 bg-white border-b border-gray-100">
            <View className="flex-row items-center justify-between">
              <Text className="text-2xl font-semibold text-black">Filters</Text>
              <Pressable
                onPress={() => {
                  Animated.parallel([
                    Animated.timing(slideAnim, {
                      toValue: -320,
                      duration: 400,
                      useNativeDriver: true,
                    }),
                    Animated.timing(bgOpacity, {
                      toValue: 0,
                      duration: 400,
                      useNativeDriver: true,
                    }),
                  ]).start(() => {
                    setInternalVisible(false);
                    onClose();
                  });
                }}
                className="p-1"
              >
                <X size={20} color="#666" />
              </Pressable>
            </View>
          </View> */}

          {/* <ScrollView
            className="flex-1 px-6 py-6 mt-12"
            showsVerticalScrollIndicator={false}
          > */}
          <View className="flex-1 px-4 py-6 mt-12">
            <View className="flex-1">
              <View className="flex-col flex-wrap mb-8">
                {[
                  { value: 1, label: "1 day", icon: Square },
                  { value: 3, label: "3 days", icon: Columns3 },
                ].map((option) => {
                  const IconComponent = option.icon;
                  const isSelected = daysToShow === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => setDaysToShow(option.value)}
                      className={`mr-3 px-4 py-3 w-full rounded-md mb-2 ${
                        isSelected
                          ? (isDark ? "bg-[#262626]" : "bg-gray-100")
                          : "transparent"
                      }`}
                    >
                      <View className="flex-row items-center">
                        <IconComponent size={20} color={themeStyles.iconColor} />
                        <Text
                          className={`ml-2 text-sm font-medium ${themeStyles.primaryText}`}
                        >
                          {option.label}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
              <View className="mb-4">
                <Text
                  className={`text-lg font-semibold ${themeStyles.headerText} mb-4`}
                >
                  Event Types
                </Text>

                <View>
                  {[
                    {
                      type: "networking" as ScheduleType,
                      label: "Networking",
                      icon: Users,
                      color: "#2563EB",
                    },
                    {
                      type: "food" as ScheduleType,
                      label: "Food",
                      icon: Utensils,
                      color: "#EA580C",
                    },
                    {
                      type: "activity" as ScheduleType,
                      label: "Activities",
                      icon: Target,
                      color: "#F472B6",
                    },
                  ].map((option, index) => {
                    const isSelected = selectedEventTypes.includes(option.type);
                    const IconComponent = option.icon;
                    return (
                      <Pressable
                        key={option.type}
                        onPress={() => onToggleEventType(option.type)}
                        className={`p-2 py-3 rounded-md 
                          ${index > 0 ? "mt-3" : ""} ${
                          isSelected
                            ? (isDark ? "bg-[#262626]" : "bg-gray-100")
                            : "transparent"
                        }`}
                      >
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center">
                            <IconComponent size={16} color={option.color} />
                            <Text
                              className={`text-base ${themeStyles.primaryText} ml-4`}
                            >
                              {option.label}
                            </Text>
                          </View>
                          {isSelected && (
                            <Check size={16} color={themeStyles.iconColor} />
                          )}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            <View
              className={`px-6 py-6 ${themeStyles.headerBackground} border-t`}
              style={{ borderTopColor: themeStyles.lineColor }}
            >
              <View className="flex-row justify-center items-center">
                <Pressable onPress={onClearFilters} className="flex-1 mr-3">
                  <Text
                    className={`text-base ${themeStyles.secondaryText} underline`}
                  >
                    Clear all filters
                  </Text>
                </Pressable>
                {/* <Pressable
                onPress={onApplyFilters}
                className="flex-1 bg-black py-4 px-6 rounded-xl"
              >
                <Text className="text-center font-semibold text-white text-base">
                  Show events
                </Text>
              </Pressable> */}
              </View>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default FilterMenu;
