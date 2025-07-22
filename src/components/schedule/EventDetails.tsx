// src/components/schedule/EventDetails.tsx
import React from 'react';
import { Modal, View, Text, Pressable, ScrollView } from 'react-native';
import { Clock, Tag, UserCog, Users, X } from 'lucide-react-native';
import { Schedule } from '@/types/schedule';

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
  if (!schedule) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      transparent
    >
      <View className="flex-1 bg-black/40 justify-center items-center px-4">
        <View className="bg-uoft_white rounded-2xl shadow-lg w-full max-w-xl p-6 relative">
          <Pressable
            className="absolute top-4 right-4 z-10 bg-gray-200 rounded-full p-2"
            onPress={onClose}
            accessibilityLabel="Close details"
            accessibilityRole="button"
          >
            <X size={24} color="#333" />
          </Pressable>
          
          <ScrollView
            className="max-h-[70vh]"
            showsVerticalScrollIndicator={false}
          >
            <Text className="text-2xl font-['PPObjectSans-Heavy'] mb-2 text-uoft_black">
              {schedule.title}
            </Text>
            <Text className="mb-4 text-base text-uoft_black/80">
              {schedule.description || "No description provided."}
            </Text>
            
            <View className="flex-row items-center mb-2">
              <Clock size={20} color="#FF6F51" />
              <Text className="ml-2 text-base text-uoft_black font-pp">
                {formatTimeTo12Hour(schedule.startTime)} -{" "}
                {formatTimeTo12Hour(schedule.endTime)}
              </Text>
            </View>
            
            <View className="flex-row items-center mb-2">
              <Tag size={20} color="#4A90E2" />
              <Text className="ml-2 text-base text-uoft_black font-pp capitalize">
                {schedule.type}
              </Text>
            </View>
            
            {schedule.sponsorId && (
              <View className="flex-row items-center mb-2">
                <UserCog size={20} color="#50E3C2" />
                <Text className="ml-2 text-base text-uoft_black font-pp">
                  Sponsor: {schedule.sponsorId}
                </Text>
              </View>
            )}
            
            {schedule.isShift && (
              <View className="flex-row items-center mb-2">
                <Users size={20} color="#FF6F51" />
                <Text className="ml-2 text-base text-uoft_black font-pp">
                  Shift: {schedule.shiftType || "General"}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default EventDetails;