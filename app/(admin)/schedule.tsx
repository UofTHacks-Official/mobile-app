import CurrentTimeIndicator from "@/components/schedule/CurrentTimeIndicator";
import EventDetails from "@/components/schedule/EventDetails";
import FilterMenu from "@/components/schedule/FilterMenu";
import ScheduleHeader from "@/components/schedule/ScheduleHeader";
import TimeSlot, { DayColumn } from "@/components/schedule/TimeSlot";
import { useTheme } from "@/context/themeContext";
import { getScheduleThemeStyles, cn } from "@/utils/theme";
import { useCurrentTime } from "@/queries/schedule/currentTime";
import { useScheduleData } from "@/queries/schedule/schedule";
import { useScheduleFilters } from "@/queries/schedule/scheduleFilters";
import { Schedule as ScheduleInterface } from "@/types/schedule";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Dimensions, SafeAreaView, ScrollView, View } from "react-native";

const Schedule = () => {
  const { isDark } = useTheme();
  const scheduleTheme = getScheduleThemeStyles(isDark);
  const currentTime = useCurrentTime();
  const [selectedSchedule, setSelectedSchedule] =
    useState<ScheduleInterface | null>(null);
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
    clearFilters,
  } = useScheduleFilters();

  const {
    data: schedules = [],
    isLoading,
    error,
  } = useScheduleData(selectedEventTypes);

  const hourHeight = 100;

  const allDates = [
    new Date(2025, 5, 20),
    new Date(2025, 5, 21),
    new Date(2025, 5, 22),
  ];

  const getDatesToShow = () => {
    if (daysToShow === 1) {
      return [allDates[currentDayIndex]];
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
    <SafeAreaView className={cn("flex-1", scheduleTheme.scheduleBackground)}>
      <View className={cn("flex-1 mb-20", scheduleTheme.primaryText)}>
        <ScheduleHeader
          dates={dates}
          currentDate={currentDate}
          onFilterPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setIsFilterModalVisible(true);
          }}
        />

        <View className="flex-1">
          <ScrollView className={cn("flex-1 pb-8", scheduleTheme.scheduleBackground)}>
            <View className="relative">
              {daysToShow === 1 ? (
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={(event) => {
                    const screenWidth = Dimensions.get("window").width;
                    const newIndex = Math.round(
                      event.nativeEvent.contentOffset.x / screenWidth
                    );
                    if (newIndex >= 0 && newIndex < allDates.length) {
                      saveDayIndexPreference(newIndex);
                    }
                  }}
                  contentOffset={{
                    x: currentDayIndex * Dimensions.get("window").width,
                    y: 0,
                  }}
                >
                  {allDates.map((date, dayIndex) => (
                    <View
                      key={dayIndex}
                      style={{ width: Dimensions.get("window").width }}
                    >
                      <View className={cn("flex-row", scheduleTheme.scheduleBackground)}>
                        <View 
                          className={cn("w-12", scheduleTheme.scheduleBackground)}
                          style={{ borderRightWidth: 1, borderRightColor: scheduleTheme.lineColor }}
                        >
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
              ) : (
                <View className={cn("flex-row", scheduleTheme.scheduleBackground)}>
                  <View 
                    className={cn("w-12", scheduleTheme.scheduleBackground)}
                    style={{ borderRightWidth: 1, borderRightColor: scheduleTheme.lineColor }}
                  >
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
