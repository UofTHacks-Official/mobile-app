import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, Plus, Tag, UserCog, Users, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View
} from "react-native";
import {
  createSchedule,
  fetchAllSchedules,
} from "../_requests/schedule";
import {
  Schedule as ScheduleInterface,
  ScheduleType,
} from "../_types/schedule";
import DayColumn from "../components/schedule/DayColumn";
import EventModal from "../components/schedule/EventModal";
import TimeSlot from "../components/schedule/TimeSlot";

// Map API schedule object to local Schedule type
function mapApiToSchedule(apiEvent: any): ScheduleInterface {
  const typeMap: Record<number, ScheduleType> = {
    1: "networking",
    2: "food",
    3: "activity",
  };
  return {
    id: apiEvent.schedule_id.toString(),
    title: apiEvent.schedule_name,
    description: apiEvent.schedule_description,
    startTime: apiEvent.schedule_start_time,
    endTime: apiEvent.schedule_end_time,
    date: new Date(apiEvent.schedule_start_time),
    type: typeMap[apiEvent.event_type] || "activity",
    sponsorId: apiEvent.sponsor_id,
    isShift: apiEvent.is_shift,
    shiftType: apiEvent.shift_type,
  };
}

function formatTimeTo12Hour(isoString: string) {
  const date = new Date(isoString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

const Schedule = () => {
  const queryClient = useQueryClient();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] =
    useState<ScheduleInterface | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  // June 20, 21, 22 (to match API data), TEMP
  const dates = [
    new Date(2025, 5, 20),
    new Date(2025, 5, 21),
    new Date(2025, 5, 22),
  ];

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date());
    };

    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  // Tanstack Query for schedules
  const {
    data: schedules = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["schedules"],
    queryFn: async () => {
      const data = await fetchAllSchedules();
      return data.map(mapApiToSchedule);
    },
  });

  const handleAddSchedule = async (event: {
    title: string;
    startTime: string;
    endTime: string;
    date: Date;
    type: ScheduleType;
    description?: string;
    sponsorId?: string | null;
    isShift?: boolean;
    shiftType?: string | null;
  }) => {
    const safeEvent = {
      ...event,
      description: event.description ?? "",
      sponsorId: event.sponsorId ?? null,
      isShift: event.isShift ?? false,
      shiftType: event.shiftType ?? null,
    };
    try {
      await createSchedule(safeEvent);
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    } catch (err) {
      console.error("Failed to create schedule:", err);
    }
  };

  // Use device time to get the current hour and minute
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();

  return (
    <SafeAreaView className="flex-1 bg-uoft_white">
      <View className="flex-1 text-uoft_black">
        <View className="absolute bottom-5 right-5 z-10 bg-[#FF6F51] rounded-full p-2">
          <Pressable
            onPress={() => setIsModalVisible(true)}
            className="ml-auto"
          >
            <Plus size={48} color="white" />
          </Pressable>
        </View>

        <View className="flex-row h-12 border-b border-gray-200 bg-gray-50">
          <View className="w-12 h-12 border-b border-gray-200 bg-gray-50" />
          {dates.map((date, index) => (
            <View
              key={index}
              className="flex-1 items-center justify-center px-6"
            >
              <Text className="font-semibold text-lg">
                {date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>
          ))}
        </View>

        <View className="flex-1">
          <ScrollView className="flex-1">
            <View className="flex-row">
              {/* Time column */}
              <View className="w-12 border-r border-gray-200">
                {Array.from({ length: 24 }, (_, i) => (
                  <TimeSlot
                    key={i}
                    hour={i}
                    isCurrentHour={i === currentHour}
                    schedules={[]}
                    hourHeight={48}
                    onSchedulePress={() => {}}
                    showTime={true}
                  />
                ))}
              </View>

              {/* Day columns */}
              {dates.map((date, index) => {
                const filtered = schedules.filter((schedule) => {
                  const scheduleDate = schedule.date;
                  return (
                    scheduleDate.getFullYear() === date.getFullYear() &&
                    scheduleDate.getMonth() === date.getMonth() &&
                    scheduleDate.getDate() === date.getDate()
                  );
                });
                // hardcoded date for testing
                const now = new Date(2025, 5, 21);
                const isToday =
                  date.getFullYear() === now.getFullYear() &&
                  date.getMonth() === now.getMonth() &&
                  date.getDate() === now.getDate();
                return (
                  <DayColumn
                    key={index}
                    date={date}
                    currentHour={currentHour}
                    schedules={filtered}
                    onSchedulePress={(schedule) => {
                      setSelectedSchedule(schedule);
                      setIsDetailModalVisible(true);
                    }}
                    showCurrentTimeIndicator={isToday}
                    currentMinute={currentMinute}
                  />
                );
              })}
            </View>
          </ScrollView>
        </View>

        <EventModal
          visible={isModalVisible}
          onClose={() => {
            setIsModalVisible(false);
          }}
          onAddEvent={handleAddSchedule}
          dates={dates}
        />

        <Modal
          visible={isDetailModalVisible}
          animationType="fade"
          onRequestClose={() => setIsDetailModalVisible(false)}
          transparent
        >
          <View className="flex-1 bg-black/40 justify-center items-center px-4">
            <View className="bg-uoft_white rounded-2xl shadow-lg w-full max-w-xl p-6 relative">
              <Pressable
                className="absolute top-4 right-4 z-10 bg-gray-200 rounded-full p-2"
                onPress={() => setIsDetailModalVisible(false)}
                accessibilityLabel="Close details"
                accessibilityRole="button"
              >
                <X size={24} color="#333" />
              </Pressable>
              {selectedSchedule && (
                <ScrollView
                  className="max-h-[70vh]"
                  showsVerticalScrollIndicator={false}
                >
                  <Text className="text-2xl font-['PPObjectSans-Heavy'] mb-2 text-uoft_black">
                    {selectedSchedule.title}
                  </Text>
                  <Text className="mb-4 text-base text-uoft_black/80">
                    {selectedSchedule.description || "No description provided."}
                  </Text>
                  <View className="flex-row items-center mb-2">
                    <Clock size={20} color="#FF6F51" />
                    <Text className="ml-2 text-base text-uoft_black font-pp">
                      {formatTimeTo12Hour(selectedSchedule.startTime)} -{" "}
                      {formatTimeTo12Hour(selectedSchedule.endTime)}
                    </Text>
                  </View>
                  <View className="flex-row items-center mb-2">
                    <Tag size={20} color="#4A90E2" />
                    <Text className="ml-2 text-base text-uoft_black font-pp capitalize">
                      {selectedSchedule.type}
                    </Text>
                  </View>
                  {selectedSchedule.sponsorId && (
                    <View className="flex-row items-center mb-2">
                      <UserCog size={20} color="#50E3C2" />
                      <Text className="ml-2 text-base text-uoft_black font-pp">
                        Sponsor: {selectedSchedule.sponsorId}
                      </Text>
                    </View>
                  )}
                  {selectedSchedule.isShift && (
                    <View className="flex-row items-center mb-2">
                      <Users size={20} color="#FF6F51" />
                      <Text className="ml-2 text-base text-uoft_black font-pp">
                        Shift: {selectedSchedule.shiftType || "General"}
                      </Text>
                    </View>
                  )}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default Schedule;
