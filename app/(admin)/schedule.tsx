import TimeSlot, { DayColumn } from "@/components/schedule/TimeSlot";
import FilterMenu from "@/components/schedule/FilterMenu";
import ScheduleHeader from "@/components/schedule/ScheduleHeader";
import CurrentTimeIndicator from "@/components/schedule/CurrentTimeIndicator";
import EventDetails from "@/components/schedule/EventDetails";
import { Schedule as ScheduleInterface } from "@/types/schedule";
import { useScheduleData } from "@/queries/schedule/schedule";
import { useScheduleFilters } from "@/queries/schedule/scheduleFilters";
import { useCurrentTime } from "@/queries/schedule/currentTime";
import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Dimensions,
} from "react-native";

const Schedule = () => {
  const currentTime = useCurrentTime();
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleInterface | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const {
    daysToShow,
    selectedEventTypes,
    currentDayIndex,
    saveDaysPreference,
    saveEventTypesPreference,
    saveDayIndexPreference,
    toggleEventType,
    clearFilters
  } = useScheduleFilters();

  const { data: schedules = [], isLoading, error } = useScheduleData(selectedEventTypes);

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

  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentDate = new Date(2025, 5, 21);

  const applyFilters = () => {
    setIsFilterModalVisible(false);
    if (daysToShow === 1) {
      saveDayIndexPreference(0);
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
        <ScheduleHeader
          dates={dates}
          currentDate={currentDate}
          onFilterPress={() => setIsFilterModalVisible(true)}
        />

        <View className="flex-1">
          <ScrollView className="flex-1 pb-8 bg-uoft_white">
            <View className="relative">
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
              
              <CurrentTimeIndicator
                currentTime={currentTime}
                currentHour={currentHour}
                currentMinute={currentMinute}
                hourHeight={hourHeight}
              />
            </View>
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

        <EventDetails
          visible={isDetailModalVisible}
          schedule={selectedSchedule}
          onClose={() => setIsDetailModalVisible(false)}
        />
      </View>
    </SafeAreaView>
  );
};

export default Schedule;