import EventDetails from "@/components/schedule/EventDetails";
import { useScheduleData } from "@/queries/schedule/schedule";
import { useScheduleFilters } from "@/queries/schedule/scheduleFilters";
import { Schedule as ScheduleInterface } from "@/types/schedule";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { View, SafeAreaView } from "react-native";

export default function ScheduleModal() {
  const { scheduleID } = useLocalSearchParams<{ scheduleID: string }>();
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleInterface | null>(null);
  
  const { selectedEventTypes } = useScheduleFilters();
  const { data: schedules = [] } = useScheduleData(selectedEventTypes);

  useEffect(() => {
    if (scheduleID && schedules.length > 0) {
      const schedule = schedules.find(s => s.id === scheduleID);
      if (schedule) {
        setSelectedSchedule(schedule);
      } else {
        // If schedule not found, go back to schedule list
        router.replace("/(admin)/schedule");
      }
    }
  }, [scheduleID, schedules]);

  const handleClose = () => {
    router.replace("/(admin)/schedule");
  };

  if (!selectedSchedule) {
    return (
      <SafeAreaView className="flex-1 bg-black/40">
        <View className="flex-1" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black/40">
      <EventDetails
        visible={true}
        schedule={selectedSchedule}
        onClose={handleClose}
      />
    </SafeAreaView>
  );
}