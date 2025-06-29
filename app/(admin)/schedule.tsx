import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toZonedTime } from "date-fns-tz";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import CurrentTimeIndicator from "../components/schedule/CurrentTimeIndicator";
import DayColumn from "../components/schedule/DayColumn";
import EventModal from "../components/schedule/EventModal";
import TimeSlot from "../components/schedule/TimeSlot";
import {
  deleteSchedule as apiDeleteSchedule,
  createSchedule,
  fetchAllSchedules,
  updateSchedule,
} from "../requests/schedule";
import { Schedule as ScheduleInterface, ScheduleType } from "../types/schedule";

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
  const isEditFeatureEnabled = true;

  const queryClient = useQueryClient();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleInterface | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [editInitialValues, setEditInitialValues] = useState<Omit<ScheduleInterface, "id"> | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // June 20, 21, 22 (to match API data), TEMP
  const dates = [
    new Date(2025, 5, 20),
    new Date(2025, 5, 21),
    new Date(2025, 5, 22),
  ];

  useEffect(() => {
    const updateTime = () => {
      // Get the current time in America/Toronto timezone
      const now = new Date();
      const estTime = toZonedTime(now, "America/Toronto");
      setCurrentTime(estTime);
    };

    updateTime();

    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  // Tanstack Query for schedules
  const { data: schedules = [], isLoading, error } = useQuery({
    queryKey: ['schedules'],
    queryFn: async () => {
      const data = await fetchAllSchedules();
      return data.map(mapApiToSchedule);
    },
  });

  // Mutations
  const updateScheduleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => updateSchedule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: (id: string) => apiDeleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
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
    if (editingId) {
      // Edit existing schedule
      try {
        await updateScheduleMutation.mutateAsync({ id: editingId, data: safeEvent });
        setEditingId(null);
      } catch (err) {
        console.error("Failed to update schedule:", err);
      }
    } else {
      // Add new schedule
      try {
        await createSchedule(safeEvent);
        queryClient.invalidateQueries({ queryKey: ['schedules'] });
      } catch (err) {
        console.error("Failed to create schedule:", err);
      }
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      await deleteScheduleMutation.mutateAsync(scheduleId);
    } catch (err) {
      console.error("Failed to delete schedule:", err);
    }
  };

  // Use device time to get the current hour and minute
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();

  return (
    <SafeAreaView className="flex-1 bg-uoft_white">
      <View className="flex-1 text-uoft_black">
        <View className="flex-row items-center mt-6 mb-6 px-6">
          <Pressable onPress={() => router.back()} className="mr-4">
            <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
          </Pressable>
          <Text className="text-2xl font-['PPObjectSans-Heavy']">Schedule</Text>
        </View>

        <View className="absolute bottom-5 right-5 z-10 bg-[#FF6F51] rounded-full p-2">
          <Pressable
            onPress={() => setIsModalVisible(true)}
            className="ml-auto"
          >
            <MaterialCommunityIcons name="plus" size={48} color="white" />
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
            <View className="flex-row h-[1358px]">
              {/* Time column */}
              <View className="w-12 border-r border-gray-200">
                {Array.from({ length: 24 }, (_, i) => (
                  <TimeSlot
                    key={i}
                    hour={i}
                    isCurrentHour={i === currentHour}
                    schedules={[]}
                    hourHeight={48}
                    onDeleteSchedule={() => {}}
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
                return (
                  <DayColumn
                    key={index}
                    date={date}
                    currentHour={currentHour}
                    schedules={filtered}
                    onDeleteSchedule={handleDeleteSchedule}
                    onSchedulePress={(schedule) => {
                      setSelectedSchedule(schedule);
                      setIsDetailModalVisible(true);
                    }}
                  />
                );
              })}
              <CurrentTimeIndicator
                currentHour={currentHour}
                currentMinute={currentMinute}
              />
            </View>
          </ScrollView>
        </View>

        <EventModal
          visible={isModalVisible}
          onClose={() => {
            setIsModalVisible(false);
            setEditInitialValues(null);
          }}
          onAddEvent={handleAddSchedule}
          dates={dates}
          initialValues={editInitialValues}
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
                <MaterialCommunityIcons name="close" size={24} color="#333" />
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
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={20}
                      color="#FF6F51"
                    />
                    <Text className="ml-2 text-base text-uoft_black font-pp">
                      {formatTimeTo12Hour(selectedSchedule.startTime)} -{" "}
                      {formatTimeTo12Hour(selectedSchedule.endTime)}
                    </Text>
                  </View>
                  <View className="flex-row items-center mb-2">
                    <MaterialCommunityIcons
                      name="tag-outline"
                      size={20}
                      color="#4A90E2"
                    />
                    <Text className="ml-2 text-base text-uoft_black font-pp capitalize">
                      {selectedSchedule.type}
                    </Text>
                  </View>
                  {selectedSchedule.sponsorId && (
                    <View className="flex-row items-center mb-2">
                      <MaterialCommunityIcons
                        name="account-tie-outline"
                        size={20}
                        color="#50E3C2"
                      />
                      <Text className="ml-2 text-base text-uoft_black font-pp">
                        Sponsor: {selectedSchedule.sponsorId}
                      </Text>
                    </View>
                  )}
                  {selectedSchedule.isShift && (
                    <View className="flex-row items-center mb-2">
                      <MaterialCommunityIcons
                        name="account-group-outline"
                        size={20}
                        color="#FF6F51"
                      />
                      <Text className="ml-2 text-base text-uoft_black font-pp">
                        Shift: {selectedSchedule.shiftType || "General"}
                      </Text>
                    </View>
                  )}
                  {isEditFeatureEnabled && (
                    <Button
                      title="Edit Event"
                      color="#4A90E2"
                      onPress={() => {
                        if (selectedSchedule) {
                          setEditInitialValues({
                            title: selectedSchedule.title,
                            startTime: selectedSchedule.startTime,
                            endTime: selectedSchedule.endTime,
                            date: selectedSchedule.date,
                            type: selectedSchedule.type,
                            description: selectedSchedule.description,
                            sponsorId: selectedSchedule.sponsorId,
                            isShift: selectedSchedule.isShift,
                            shiftType: selectedSchedule.shiftType,
                          });
                          setIsDetailModalVisible(false);
                          setIsModalVisible(true);
                          setEditingId(selectedSchedule.id);
                        }
                      }}
                    />
                  )}
                  <Button
                    title="Delete Event"
                    color="#FF6F51"
                    onPress={() => {
                      Alert.alert(
                        "Delete Event",
                        `Are you sure you want to delete "${selectedSchedule.title}"?`,
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Delete",
                            style: "destructive",
                            onPress: () => {
                              handleDeleteSchedule(selectedSchedule.id);
                              setIsDetailModalVisible(false);
                              setSelectedSchedule(null);
                            },
                          },
                        ]
                      );
                    }}
                  />
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
