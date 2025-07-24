// src/components/schedule/EventDetails.tsx
import React from 'react';
import { Modal, View, Text, Pressable, ScrollView } from 'react-native';
import { Clock, Tag, UserCog, Users, X, Info, Globe } from 'lucide-react-native';
import { Schedule } from '@/types/schedule';
import { useTheme } from '@/context/themeContext';
import { getThemeStyles } from '@/utils/theme';

interface EventDetailsProps {
  visible: boolean;
  schedule: Schedule | null;
  onClose: () => void;
}

function formatTimeTo12Hour(isoString: string) {
  const date = new Date(isoString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export const EventDetails: React.FC<EventDetailsProps> = ({
  visible,
  schedule,
  onClose
}) => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  
  if (!schedule) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent
    >
      <View className="flex-1 bg-black/40 justify-end">
        <View className="bg-white rounded-t-3xl w-full" style={{ height: 500 }}>
          {/* Bottom modal handle bar */}
          <View className="w-12 h-1 bg-gray-300 rounded-full self-center mt-3 mb-4" />
          
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 mb-6">
            <View className="flex-row items-center">
              <Text className="text-lg font-medium text-gray-600 mr-2">Event</Text>
            </View>
            <Pressable onPress={onClose}>
              <X size={24} color="#666" />
            </Pressable>
          </View>
          
          {/* Event Title */}
          <View className="px-6 mb-6">
            <Text className="text-2xl font-bold text-black mb-4">
              {schedule?.title}
            </Text>
            <View className="h-px bg-gray-200 w-full" />
          </View>
          
          {/* Time Section */}
          <View className="px-6 mb-6">
            <View className="flex-row">
              <View className="w-6 mr-4">
                <Clock size={20} color="#666" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text className="text-lg font-semibold text-black mr-4">
                    {formatTimeTo12Hour(schedule.startTime)}
                  </Text>
                  <Text className="text-gray-400 mr-4">→</Text>
                  <Text className="text-lg font-semibold text-black">
                    {formatTimeTo12Hour(schedule.endTime)}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Globe size={14} color="#999" />
                  <Text className="text-sm text-gray-500 ml-1">EST Toronto</Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* Type Section */}
          <View className="px-6 mb-6">
            <View className="flex-row">
              <View className="w-6 mr-4">
                <Tag size={20} color="#666" />
              </View>
              <Text className="text-lg text-black capitalize">
                {schedule?.type}
              </Text>
            </View>
          </View>
          
          {/* Description Section */}
          {schedule?.description && (
            <View className="px-6 mb-6">
              <View className="flex-row">
                <View className="w-6 mr-4 mt-1">
                  <Info size={20} color="#666" />
                </View>
                <Text className="text-base text-gray-700 flex-1 leading-6">
                  {schedule.description}
                </Text>
              </View>
            </View>
          )}
          
          {/* Sponsor Section */}
          {schedule?.sponsorId && (
            <View className="px-6 mb-6">
              <View className="flex-row">
                <View className="w-6 mr-4">
                  <UserCog size={20} color="#666" />
                </View>
                <Text className="text-base text-gray-700">
                  Sponsored by {schedule.sponsorId}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default EventDetails;