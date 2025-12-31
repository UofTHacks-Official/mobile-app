import { CurrentTimeIndicator } from "@/components/schedule/CurrentTimeIndicator";

import FilterMenu from "@/components/schedule/FilterMenu";
import { ScheduleHeader } from "@/components/schedule/ScheduleHeader";
import TimeSlot, { DayColumn } from "@/components/schedule/TimeSlot";
import { useTheme } from "@/context/themeContext";
import { useCurrentTime } from "@/queries/schedule/currentTime";
import { useScheduleData } from "@/queries/schedule/schedule";
import { useScheduleFilters } from "@/queries/schedule/scheduleFilters";
import { useJudgeScheduleData } from "@/queries/judging";
import { Schedule as ScheduleInterface } from "@/types/schedule";
import { useScrollNavBar } from "@/utils/navigation";
import { cn, getScheduleThemeStyles } from "@/utils/theme";
import { getUserType } from "@/utils/tokens/secureStorage";
import { haptics, ImpactFeedbackStyle } from "@/utils/haptics";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { Dimensions, ScrollView, View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Schedule = () => {
  const { isDark } = useTheme();
  const scheduleTheme = getScheduleThemeStyles(isDark);
  const currentTime = useCurrentTime();
  const insets = useSafeAreaInsets();

  const [isJudge, setIsJudge] = useState(false);
  const [isVolunteer, setIsVolunteer] = useState(false);
  const [userTypeChecked, setUserTypeChecked] = useState(false);

  // Check user type
  useEffect(() => {
    const checkUserType = async () => {
      const userType = await getUserType();
      setIsJudge(userType === "judge");
      setIsVolunteer(userType === "volunteer");
      setUserTypeChecked(true);
    };
    checkUserType();
  }, []);

  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  // Bottom nav bar scroll control
  const { handleScroll } = useScrollNavBar();

  const {
    daysToShow,
    selectedEventTypes,
    currentDayIndex,
    saveDaysPreference,
    saveDayIndexPreference,
    toggleEventType,
    clearFilters,
  } = useScheduleFilters();

  // Conditionally fetch schedule data based on user type (skip for judges and volunteers)
  const { data: hackerSchedules = [] } = useScheduleData(
    selectedEventTypes,
    !isJudge && !isVolunteer && userTypeChecked
  );

  // For judges, fetch all their judging schedules (no event type filtering)
  const { data: judgeSchedules = [] } = useJudgeScheduleData(
    ["activity"], // Pass a default type to satisfy the hook, but it won't be used for filtering
    isJudge && userTypeChecked
  );

  // Use the appropriate schedule data based on user type
  const schedules = isJudge ? judgeSchedules : hackerSchedules;

  const hourHeight = 100;

  // Use different dates based on user type
  // Judges: January 1, 2025 (single day - matching their schedule data from DB)
  // Hackers/Admins: January 16-18, 2026 (hackathon dates)
  const allDates = isJudge
    ? [
        new Date(2025, 0, 1), // January 1, 2025 - judging day (matches DB timestamp)
      ]
    : [
        new Date(2026, 0, 16), // January 16, 2026
        new Date(2026, 0, 17), // January 17, 2026
        new Date(2026, 0, 18), // January 18, 2026
      ];

  const getDatesToShow = () => {
    // Judges always see single day view
    if (isJudge) {
      return [allDates[0]];
    }

    if (daysToShow === 1) {
      return [allDates[currentDayIndex]];
    } else {
      return allDates.slice(0, daysToShow);
    }
  };

  const dates = getDatesToShow();

  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  // Use current date based on user type
  const currentDate = isJudge
    ? allDates[0]
    : daysToShow === 1
      ? allDates[currentDayIndex]
      : new Date(2026, 0, 17); // January 17, 2026 for hackers/admins

  const handleDayScroll = (event: any) => {
    handleScroll(event);

    if (Platform.OS !== "web") {
      return;
    }

    const screenWidth = Dimensions.get("window").width;
    const newIndex = Math.round(
      event.nativeEvent.contentOffset.x / screenWidth
    );
    if (newIndex >= 0 && newIndex < allDates.length) {
      saveDayIndexPreference(newIndex);
    }
  };

  const handleSchedulePress = (schedule: ScheduleInterface) => {
    haptics.impactAsync(ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/schedule-detail/[scheduleID]" as any,
      params: {
        scheduleID: schedule.id,
      },
    });
  };

  // Define time range based on user type
  const timeRange = isJudge
    ? { start: 7, end: 17 } // 7 AM to 5 PM for judges
    : { start: 0, end: 24 }; // Full day for hackers/admins

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
            id: `${schedule.id}-part1`, // Unique ID for first part
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
            id: `${schedule.id}-part2`, // Unique ID for second part
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

    // Use current date based on user type for "today" indicator
    const now = isJudge
      ? new Date(2025, 0, 1) // January 1, 2025 for judges (matches DB timestamp)
      : new Date(2026, 0, 17); // January 17, 2026 for hackers/admins
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
        onSchedulePress={handleSchedulePress}
        showCurrentTimeIndicator={isToday}
        currentMinute={currentMinute}
        hourHeight={hourHeight}
        startHour={timeRange.start}
        endHour={timeRange.end}
      />
    );
  };

  return (
    <View
      className={cn("flex-1", scheduleTheme.scheduleBackground)}
      style={{ paddingTop: insets.top }}
    >
      <View className={cn("flex-1", scheduleTheme.primaryText)}>
        <ScheduleHeader
          dates={dates}
          currentDate={currentDate}
          onFilterPress={
            isJudge
              ? undefined
              : () => {
                  haptics.impactAsync(ImpactFeedbackStyle.Medium);
                  setIsFilterModalVisible(true);
                }
          }
        />

        <View className="flex-1">
          <ScrollView
            className={cn("flex-1 pb-8", scheduleTheme.scheduleBackground)}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <View className="relative">
              {daysToShow === 1 ? (
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={(event) => {
                    if (Platform.OS === "web") {
                      return;
                    }
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
                  onScroll={handleDayScroll}
                  scrollEventThrottle={16}
                >
                  {allDates.map((date, dayIndex) => (
                    <View
                      key={dayIndex}
                      style={{ width: Dimensions.get("window").width }}
                    >
                      <View
                        className={cn(
                          "flex-row",
                          scheduleTheme.scheduleBackground
                        )}
                      >
                        <View
                          className={cn(
                            "w-12",
                            scheduleTheme.scheduleBackground
                          )}
                          style={{
                            borderRightWidth: 1,
                            borderRightColor: scheduleTheme.lineColor,
                          }}
                        >
                          {Array.from(
                            { length: timeRange.end - timeRange.start },
                            (_, i) => {
                              const hour = timeRange.start + i;
                              return (
                                <TimeSlot
                                  key={hour}
                                  hour={hour}
                                  isCurrentHour={hour === currentHour}
                                  schedules={[]}
                                  hourHeight={hourHeight}
                                  onSchedulePress={() => {}}
                                  showTime={true}
                                  startHour={timeRange.start}
                                  endHour={timeRange.end}
                                />
                              );
                            }
                          )}
                        </View>
                        {renderDaySchedules(date, dayIndex)}
                      </View>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <View
                  className={cn("flex-row", scheduleTheme.scheduleBackground)}
                >
                  <View
                    className={cn("w-12", scheduleTheme.scheduleBackground)}
                    style={{
                      borderRightWidth: 1,
                      borderRightColor: scheduleTheme.lineColor,
                    }}
                  >
                    {Array.from(
                      { length: timeRange.end - timeRange.start },
                      (_, i) => {
                        const hour = timeRange.start + i;
                        return (
                          <TimeSlot
                            key={hour}
                            hour={hour}
                            isCurrentHour={hour === currentHour}
                            schedules={[]}
                            hourHeight={hourHeight}
                            onSchedulePress={() => {}}
                            showTime={true}
                            startHour={timeRange.start}
                            endHour={timeRange.end}
                          />
                        );
                      }
                    )}
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

        {!isJudge && (
          <FilterMenu
            isVisible={isFilterModalVisible}
            onClose={() => setIsFilterModalVisible(false)}
            daysToShow={daysToShow}
            setDaysToShow={saveDaysPreference}
            selectedEventTypes={selectedEventTypes}
            onToggleEventType={toggleEventType}
            onClearFilters={clearFilters}
          />
        )}
      </View>
    </View>
  );
};

export default Schedule;
