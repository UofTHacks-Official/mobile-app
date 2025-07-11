import DayColumn from "@/components/schedule/DayColumn";
import TimeSlot from "@/components/schedule/TimeSlot";
import FilterMenu from "@/components/schedule/FilterMenu";
import { fetchAllSchedules } from "@/requests/schedule";
import { Schedule as ScheduleInterface, ScheduleType } from "@/types/schedule";
import { useQuery } from "@tanstack/react-query";
import { Clock, Tag, UserCog, Users, X, Filter } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
  Dimensions,
} from "react-native";
import { getSecureToken, setSecureToken } from "@/utils/tokens/secureStorage";

const STORAGE_KEYS = {
  DAYS_TO_SHOW: 'schedule_days_to_show',
  SELECTED_EVENT_TYPES: 'schedule_selected_event_types',
  CURRENT_DAY_INDEX: 'schedule_current_day_index'
};

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
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleInterface | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const [daysToShow, setDaysToShow] = useState(3);
  const [selectedEventTypes, setSelectedEventTypes] = useState<ScheduleType[]>([
    "networking", "food", "activity"
  ]);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  const hourHeight = 100;

  const allDates = [
    new Date(2025, 5, 20),
    new Date(2025, 5, 21),
    new Date(2025, 5, 22),
  ];

  const getDatesToShow = () => {
    if (daysToShow === 1) {
      return [allDates[currentDayIndex]];
    } else if (daysToShow === 2) {
      return allDates.slice(currentDayIndex, currentDayIndex + 2);
    } else {
      return allDates.slice(0, daysToShow);
    }
  };

  const dates = getDatesToShow();

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

        const savedDayIndex = await getSecureToken(STORAGE_KEYS.CURRENT_DAY_INDEX);
        if (savedDayIndex) {
          setCurrentDayIndex(parseInt(savedDayIndex));
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    };

    loadUserPreferences();
  }, []);

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date());
    };

    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

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
        
        return mappedSchedules.filter(schedule => 
          selectedEventTypes.includes(schedule.type)
        );
      } catch (error) {
        console.error("Schedule fetch error:", error);
        throw error;
      }
    },
    enabled: selectedEventTypes.length > 0,
  });

  const schedules = allSchedules;

  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentDate = new Date(2025, 5, 21);

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

  const saveDayIndexPreference = async (dayIndex: number) => {
    try {
      await setSecureToken(STORAGE_KEYS.CURRENT_DAY_INDEX, dayIndex.toString());
      setCurrentDayIndex(dayIndex);
    } catch (error) {
      console.error('Error saving day index preference:', error);
    }
  };

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
      await saveDayIndexPreference(0);
    } catch (error) {
      console.error('Error clearing filters:', error);
    }
  };

  const applyFilters = () => {
    setIsFilterModalVisible(false);
    if (daysToShow === 1) {
      setCurrentDayIndex(0);
    }
  };

  const renderDaySchedules = (date: Date, index: number) => {
    const filtered = schedules.flatMap((schedule) => {
      const start = new Date(schedule.startTime);
      const end = new Date(schedule.endTime);
      const crossesMidnight =
        start.getDate() !== end.getDate() ||
        start.getMonth() !== end.getMonth() ||
        start.getFullYear() !== end.getFullYear();
      
      if (crossesMidnight) {
        const results = [];
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
  };

  return (
    <SafeAreaView className="flex-1 bg-uoft_white">
      <View className="flex-1 mb-20 text-uoft_black">
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
            {daysToShow === 1 ? (
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                  const screenWidth = Dimensions.get('window').width;
                  const newIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
                  if (newIndex >= 0 && newIndex < allDates.length) {
                    saveDayIndexPreference(newIndex);
                  }
                }}
                contentOffset={{ x: currentDayIndex * Dimensions.get('window').width, y: 0 }}
              >
                {allDates.map((date, dayIndex) => (
                  <View key={dayIndex} style={{ width: Dimensions.get('window').width }}>
                    <View className="flex-row bg-uoft_white">
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
                      {renderDaySchedules(date, dayIndex)}
                    </View>
                  </View>
                ))}
              </ScrollView>
            ) : daysToShow === 2 ? (
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                  const screenWidth = Dimensions.get('window').width;
                  const newIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
                  const maxIndex = allDates.length - 2;
                  if (newIndex >= 0 && newIndex <= maxIndex) {
                    saveDayIndexPreference(newIndex);
                  }
                }}
                contentOffset={{ x: currentDayIndex * Dimensions.get('window').width, y: 0 }}
              >
                {Array.from({ length: allDates.length - 1 }, (_, pageIndex) => (
                  <View key={pageIndex} style={{ width: Dimensions.get('window').width }}>
                    <View className="flex-row bg-uoft_white">
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
                      {allDates.slice(pageIndex, pageIndex + 2).map((date, index) => 
                        renderDaySchedules(date, pageIndex + index)
                      )}
                    </View>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View className="flex-row bg-uoft_white">
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
                {dates.map((date, index) => renderDaySchedules(date, index))}
              </View>
            )}
          </ScrollView>
        </View>

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