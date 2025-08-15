import { ScheduleType } from '@/types/schedule';
import { devError } from '@/utils/logger';
import { getSecureToken, setSecureToken } from '@/utils/tokens/secureStorage';
import { useEffect, useState } from 'react';

const STORAGE_KEYS = {
  DAYS_TO_SHOW: 'schedule_days_to_show',
  SELECTED_EVENT_TYPES: 'schedule_selected_event_types',
  CURRENT_DAY_INDEX: 'schedule_current_day_index'
};

/**
 * Custom hook for managing schedule filter preferences with persistence
 * Handles days to show, selected event types, and current day index
 */
export const useScheduleFilters = () => {
  const [daysToShow, setDaysToShow] = useState(3);
  const [selectedEventTypes, setSelectedEventTypes] = useState<ScheduleType[]>([
    "networking", "food", "activity"
  ]);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  // Load saved preferences on mount
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
        devError('Error loading user preferences:', error);
      }
    };

    loadUserPreferences();
  }, []);

  const saveDaysPreference = async (days: number) => {
    try {
      await setSecureToken(STORAGE_KEYS.DAYS_TO_SHOW, days.toString());
      setDaysToShow(days);
    } catch (error) {
      devError('Error saving days preference:', error);
    }
  };

  const saveEventTypesPreference = async (eventTypes: ScheduleType[]) => {
    try {
      await setSecureToken(STORAGE_KEYS.SELECTED_EVENT_TYPES, JSON.stringify(eventTypes));
      setSelectedEventTypes(eventTypes);
    } catch (error) {
      devError('Error saving event types preference:', error);
    }
  };

  const saveDayIndexPreference = async (dayIndex: number) => {
    try {
      await setSecureToken(STORAGE_KEYS.CURRENT_DAY_INDEX, dayIndex.toString());
      setCurrentDayIndex(dayIndex);
    } catch (error) {
      devError('Error saving day index preference:', error);
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
      devError('Error clearing filters:', error);
    }
  };

  return {
    daysToShow,
    selectedEventTypes,
    currentDayIndex,
    saveDaysPreference,
    saveEventTypesPreference,
    saveDayIndexPreference,
    toggleEventType,
    clearFilters
  };
};
