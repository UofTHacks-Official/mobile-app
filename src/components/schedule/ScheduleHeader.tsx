import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Filter } from 'lucide-react-native';

interface ScheduleHeaderProps {
  dates: Date[];
  currentDate: Date;
  onFilterPress: () => void;
}

export const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({ 
  dates, 
  currentDate, 
  onFilterPress 
}) => {
  return (
    <>
      {/* Main Header */}
      <View className="px-4 py-3 bg-gray-50 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Pressable
            onPress={onFilterPress}
            className="p-2 bg-white rounded-lg border border-gray-200 mr-4"
          >
            <Filter size={20} color="#333" />
          </Pressable>
          <Text className="text-3xl font-bold text-uoft_black">
            {dates[0].toLocaleDateString("en-US", { month: "long" })}
          </Text>
        </View>
      </View>
      
      {/* Date Tabs */}
      <View className="flex-row h-16 border-b border-gray-200 bg-gray-50">
        <View className="w-12 h-16 border-b border-gray-200 bg-gray-50" />
        {dates.map((date, index) => {
          const isCurrentDate = 
            date.getFullYear() === currentDate.getFullYear() &&
            date.getMonth() === currentDate.getMonth() &&
            date.getDate() === currentDate.getDate();

          const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
          const dayNumber = date.getDate();

          return (
            <View
              key={index}
              className="flex-1 items-center justify-center px-6"
            >
              <Text className="text-sm text-gray-600 mb-1">
                {dayName}
              </Text>
              <View className={`w-8 h-8 rounded items-center justify-center ${
                isCurrentDate ? 'bg-uoft_secondary_orange' : ''
              }`}>
                <Text className={`text-lg font-semibold ${
                  isCurrentDate ? 'text-white' : 'text-black'
                }`}>
                  {dayNumber}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </>
  );
};

export default ScheduleHeader;