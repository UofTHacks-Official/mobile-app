import { useTheme } from "@/context/themeContext";
import { ScheduleType } from "@/types/schedule";
import { cn, getScheduleThemeStyles } from "@/utils/theme";
import {
  Award,
  BookOpen,
  Briefcase,
  Check,
  Clock,
  Columns3,
  Sparkles,
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
}

const FilterMenu = ({
  isVisible,
  onClose,
  daysToShow,
  setDaysToShow,
  selectedEventTypes,
  onToggleEventType,
  onClearFilters,
}: FilterMenuProps) => {
  const slideAnim = useRef(new Animated.Value(-320)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const [internalVisible, setInternalVisible] = useState(isVisible);
  const { isDark } = useTheme();
  const themeStyles = getScheduleThemeStyles(isDark);
  const scheduleBackgroundColor = isDark ? "#1A1A1A" : "#F9FAFB";

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
              backgroundColor: scheduleBackgroundColor,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <View className="flex-1 px-4 py-6 mt-12">
            <View className="flex-1">
              <View className="mb-4">
                <Text
                  className={`text-lg font-semibold ${themeStyles.headerText} mb-4`}
                >
                  View Mode
                </Text>
                <View className="flex-row mb-8">
                  <Pressable
                    onPress={() => setDaysToShow(1)}
                    className={`flex-1 p-3 rounded-l-md items-center justify-center border-y border-l ${
                      daysToShow === 1
                        ? "bg-blue-600 border-blue-600"
                        : `${isDark ? "bg-[#262626] border-[#404040]" : "bg-white border-gray-300"}`
                    }`}
                  >
                    <Text
                      className={`font-semibold ${
                        daysToShow === 1
                          ? "text-white"
                          : themeStyles.primaryText
                      }`}
                    >
                      Single Day
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setDaysToShow(3)}
                    className={`flex-1 p-3 rounded-r-md items-center justify-center border ${
                      daysToShow === 3
                        ? "bg-blue-600 border-blue-600"
                        : `${isDark ? "bg-[#262626] border-[#404040]" : "bg-white border-gray-300"}`
                    }`}
                  >
                    <Text
                      className={`font-semibold ${
                        daysToShow === 3
                          ? "text-white"
                          : themeStyles.primaryText
                      }`}
                    >
                      Full Event
                    </Text>
                  </Pressable>
                </View>

                <Text
                  className={`text-lg font-semibold ${themeStyles.headerText} mb-4`}
                >
                  Event Types
                </Text>

                <View>
                  {[
                    {
                      type: ScheduleType.CEREMONIES,
                      label: "Ceremonies",
                      icon: Award,
                      color: "#9333EA",
                    },
                    {
                      type: ScheduleType.SPONSOR,
                      label: "Sponsor Events",
                      icon: Briefcase,
                      color: "#2563EB",
                    },
                    {
                      type: ScheduleType.MINI,
                      label: "Mini Events",
                      icon: Target,
                      color: "#F472B6",
                    },
                    {
                      type: ScheduleType.FOOD,
                      label: "Food",
                      icon: Utensils,
                      color: "#EA580C",
                    },
                    {
                      type: ScheduleType.SHIFTS,
                      label: "Shifts",
                      icon: Clock,
                      color: "#4B5563",
                    },
                    {
                      type: ScheduleType.WORKSHOP,
                      label: "Workshops",
                      icon: BookOpen,
                      color: "#16A34A",
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
                              ? isDark
                                ? "bg-[#262626]"
                                : "bg-gray-100"
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
              </View>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default FilterMenu;
