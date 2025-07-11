import DayColumn from "@/components/schedule/DayColumn";
import TimeSlot from "@/components/schedule/TimeSlot";
import FilterMenu from "@/components/schedule/FilterMenu";
import { fetchAllSchedules } from "@/requests/schedule";
import { Schedule as ScheduleInterface, ScheduleType } from "@/types/schedule";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, Tag, UserCog, Users, X, Filter } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";

import { getSecureToken, setSecureToken } from "@/utils/tokens/secureStorage";


const STORAGE_KEYS = {
  DAYS_TO_SHOW: 'schedule_days_to_show',
  SELECTED_EVENT_TYPES: 'schedule_selected_event_types'
};

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
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleInterface | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  // Filter states with defaults
  const [daysToShow, setDaysToShow] = useState(3);
  const [selectedEventTypes, setSelectedEventTypes] = useState<ScheduleType[]>([
    "networking", "food", "activity"
  ]);

  // Load user preferences from secure storage on mount
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {

        const savedDays = await getSecureToken(STORAGE_KEYS.DAYS_TO_SHOW);
        if (savedDays) {
          setDaysToShow(parseInt(savedDays));
        }

        const savedEventTypes = await getSecureToken(STORAGE_KEYS.SELECTED_EVENT_TYPES);
        if (savedEventTypes) {
          setSelectedEventTypes(JSON.parse(savedEventTypes));
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    };

    loadUserPreferences();
  }, []);

  // Save preferences to secure storage when they change
  const saveDaysPreference = async (days: number) => {
    try {
      await setSecureToken(STORAGE_KEYS.DAYS_TO_SHOW, days.toString());
      setDaysToShow(days);
    } catch (error) {
      console.error('Error saving days preference:', error);
    }
  };

  const saveEventTypesPreference = async (eventTypes: ScheduleType[]) => {
    try {
      await setSecureToken(STORAGE_KEYS.SELECTED_EVENT_TYPES, JSON.stringify(eventTypes));
      setSelectedEventTypes(eventTypes);
    } catch (error) {
      console.error('Error saving event types preference:', error);
    }
  };

  const hourHeight = 100;

  // June 20, 21, 22 (to match API data), TEMP
  const allDates = [
    new Date(2025, 5, 20),
    new Date(2025, 5, 21),
    new Date(2025, 5, 22),
  ];

  const dates = allDates.slice(0, daysToShow);

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date());
    };

    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  // Updated Tanstack Query with filtering
  const {
    data: allSchedules = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["schedules", selectedEventTypes],
    queryFn: async () => {
      try {
        const data = await fetchAllSchedules();
        const mappedSchedules = data.map(mapApiToSchedule);
        
        // Filter schedules based on selected event types
        return mappedSchedules.filter(schedule => 
          selectedEventTypes.includes(schedule.type)
        );
      } catch (error) {
        console.error("Schedule fetch error:", error);
        throw error;
      }
    },
    // Refetch when selectedEventTypes changes
    enabled: selectedEventTypes.length > 0,
  });

  // Use filtered schedules
  const schedules = allSchedules;

  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentDate = new Date(2025, 5, 21);

  const toggleEventType = (type: ScheduleType) => {
    const newEventTypes = selectedEventTypes.includes(type) 
      ? selectedEventTypes.filter(t => t !== type)
      : [...selectedEventTypes, type];
    
    saveEventTypesPreference(newEventTypes);
  };

  const clearFilters = async () => {
    try {
      await saveDaysPreference(3);
      await saveEventTypesPreference(["networking", "food", "activity"]);
    } catch (error) {
      console.error('Error clearing filters:', error);
    }
  };

  const applyFilters = () => {
    setIsFilterModalVisible(false);
    queryClient.invalidateQueries({ queryKey: ["schedules"] });
  };


  return (
    <SafeAreaView className="flex-1 bg-uoft_white">
      <View className="flex-1 mb-20 text-uoft_black">
        {/* Month Header with Filter Button */}
        <View className="px-4 py-3 bg-gray-50 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Pressable
              onPress={() => setIsFilterModalVisible(true)}
              className="p-2 bg-white rounded-lg border border-gray-200 mr-4"
            >
              <Filter size={20} color="#333" />
            </Pressable>
            <Text className="text-3xl font-bold text-uoft_black">
              {dates[0].toLocaleDateString("en-US", { month: "long" })}
            </Text>
          </View>
        </View>
        
        {/* Day Headers */}
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

        <View className="flex-1">
          <ScrollView className="flex-1 pb-8 bg-uoft_white">
            <View className="flex-row bg-uoft_white">
              {/* Time column */}
              <View className="w-12 border-r border-gray-200 bg-uoft_white">
                {Array.from({ length: 24 }, (_, i) => (
                  <TimeSlot
                    key={i}
                    hour={i}
                    isCurrentHour={i === currentHour}
                    schedules={[]}
                    hourHeight={hourHeight}
                    onSchedulePress={() => {}}
                    showTime={true}
                  />
                ))}
              </View>

              {/* Day columns*/}
              {dates.map((date, index) => {
                // Split overnight events so they appear in both days
                const filtered = schedules.flatMap((schedule) => {

                  const start = new Date(schedule.startTime);
                  const end = new Date(schedule.endTime);

                  // Check if event crosses midnight (end time is on a different day than start time)
                  const crossesMidnight =
                    start.getDate() !== end.getDate() ||
                    start.getMonth() !== end.getMonth() ||
                    start.getFullYear() !== end.getFullYear();
                  
                  if (crossesMidnight) {
                    const results = [];
                    // First part: ends at 11:59:59 PM on the start day
                    const startDate = new Date(
                      start.getFullYear(),
                      start.getMonth(),
                      start.getDate()
                    );
                    const isStartDay = date.getTime() === startDate.getTime();
                    if (isStartDay) {
                      const firstPart = {
                        ...schedule,
                        endTime: new Date(
                          start.getFullYear(),
                          start.getMonth(),
                          start.getDate(),
                          23,
                          59,
                          59,
                          999
                        ).toISOString(),
                      };
                      results.push(firstPart);
                    }
                    // Second part: starts at 12:00:00 AM on the end day
                    const endDate = new Date(
                      end.getFullYear(),
                      end.getMonth(),
                      end.getDate()
                    );
                    const isEndDay = date.getTime() === endDate.getTime();
                    if (isEndDay) {
                      const secondPart = {
                        ...schedule,
                        id: schedule.id + "-part2",
                        startTime: new Date(
                          end.getFullYear(),
                          end.getMonth(),
                          end.getDate(),
                          0,
                          0,
                          0,
                          0
                        ).toISOString(),
                        endTime: schedule.endTime,
                        date: endDate,
                      };
                      results.push(secondPart);
                    }
                    return results;
                  } else {
                    const eventDate = new Date(
                      start.getFullYear(),
                      start.getMonth(),
                      start.getDate()
                    );
                    const isCurrentDay = date.getTime() === eventDate.getTime();
                    if (isCurrentDay) {
                      return [schedule];
                    }
                    return [];
                  }
                });
                
                // Temp current date
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
                    hourHeight={hourHeight}
                  />
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Filter Menu Component */}
        <FilterMenu
          isVisible={isFilterModalVisible}
          onClose={() => setIsFilterModalVisible(false)}
          daysToShow={daysToShow}
          setDaysToShow={saveDaysPreference}
          selectedEventTypes={selectedEventTypes}
          onToggleEventType={toggleEventType}
          onClearFilters={clearFilters}
          onApplyFilters={applyFilters}
        />

        {/* Event Detail Modal*/}
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