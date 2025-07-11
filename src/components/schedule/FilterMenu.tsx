import { ScheduleType } from "@/types/schedule";
import { X, Calendar, Users, Utensils, Target } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  Animated,
  Dimensions,
} from "react-native";

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

  useEffect(() => {
    if (isVisible) {
      // Slide in from left
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      // Slide out to left
      Animated.timing(slideAnim, {
        toValue: -320,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, slideAnim]);

  return (
    <Modal
      visible={isVisible}
      animationType="none"
      onRequestClose={onClose}
      transparent
      presentationStyle="overFullScreen"
    >
      <View className="flex-1 flex-row">
        {/* Side Menu */}
        <Animated.View 
          className="w-80 bg-white h-full"
          style={[
            {
              transform: [{ translateX: slideAnim }],
            }
          ]}
        >
          {/* Header */}
          <View className="px-6 pt-16 pb-6 bg-white border-b border-gray-100">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-black">
                Filters
              </Text>
              <Pressable onPress={onClose} className="p-1">
                <X size={20} color="#666" />
              </Pressable>
            </View>
          </View>

          <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
            {/* Days Filter */}
            <View className="flex-row flex-wrap mb-8">
              {[
                { value: 1, label: "1 day" },
                { value: 2, label: "2 days" },
                { value: 3, label: "3 days" }
              ].map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => setDaysToShow(option.value)}
                  className={`mr-3 mb-3 px-4 py-3 rounded-full border ${
                    daysToShow === option.value
                      ? 'bg-black border-black'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <View className="flex-row items-center">
                    <Calendar size={16} color={daysToShow === option.value ? "white" : "#666"} />
                    <Text className={`ml-2 text-sm font-medium ${
                      daysToShow === option.value ? 'text-white' : 'text-gray-700'
                    }`}>
                      {option.label}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>

            {/* Event Types */}
            <View className="mb-8">
              <Text className="text-lg font-semibold text-black mb-4">
                Event Types
              </Text>
              
              <View>
                {[
                  { type: 'networking' as ScheduleType, label: 'Networking Events', icon: Users, color: "#2A398C" },
                  { type: 'food' as ScheduleType, label: 'Food & Dining', icon: Utensils, color: "#FF6F51" },
                  { type: 'activity' as ScheduleType, label: 'Activities & Sessions', icon: Target, color: "#E9B6F7" }
                ].map((option, index) => {
                  const isSelected = selectedEventTypes.includes(option.type);
                  const IconComponent = option.icon;
                  return (
                    <Pressable
                      key={option.type}
                      onPress={() => onToggleEventType(option.type)}
                      className={`p-4 rounded-xl border-2 ${index > 0 ? 'mt-3' : ''} ${
                        isSelected
                          ? 'bg-gray-50 border-black'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <View className="flex-row items-center">
                        <IconComponent size={24} color={option.color} />
                        <Text className="text-base font-semibold text-black ml-4">
                          {option.label}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View className="px-6 py-6 bg-white border-t border-gray-100">
            <View className="flex-row">
              <Pressable
                onPress={onClearFilters}
                className="flex-1 mr-3"
              >
                <Text className="text-base font-semibold text-gray-700 underline">
                  Clear all
                </Text>
              </Pressable>
              <Pressable
                onPress={onApplyFilters}
                className="flex-1 bg-black py-4 px-6 rounded-xl"
              >
                <Text className="text-center font-semibold text-white text-base">
                  Show events
                </Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
        
        {/* Background */}
        <Pressable 
          className="flex-1 bg-black/40"
          onPress={onClose}
        />
      </View>
    </Modal>
  );
};

export default FilterMenu;