import React, { createContext, useContext, useState, ReactNode } from "react";

interface TimerContextType {
  activeTimerId: number | null;
  isTimerRunning: boolean;
  startTimer: (scheduleId: number) => void;
  stopTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  isPaused: boolean;
  totalPausedTime: number;
  pauseStartTime: number | null;
  setPauseStartTime: (time: number | null) => void;
  addPausedTime: (duration: number) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider = ({ children }: { children: ReactNode }) => {
  const [activeTimerId, setActiveTimerId] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [totalPausedTime, setTotalPausedTime] = useState(0);
  const [pauseStartTime, setPauseStartTime] = useState<number | null>(null);

  const startTimer = (scheduleId: number) => {
    console.log("[TimerContext] Starting timer for schedule:", scheduleId);
    setActiveTimerId(scheduleId);
    setIsTimerRunning(true);
    setIsPaused(false);
    setTotalPausedTime(0);
    setPauseStartTime(null);
  };

  const stopTimer = () => {
    console.log("[TimerContext] Stopping timer");
    setActiveTimerId(null);
    setIsTimerRunning(false);
    setIsPaused(false);
    setTotalPausedTime(0);
    setPauseStartTime(null);
  };

  const pauseTimer = () => {
    console.log("[TimerContext] Pausing timer");
    setIsPaused(true);
  };

  const resumeTimer = () => {
    console.log("[TimerContext] Resuming timer");
    setIsPaused(false);
  };

  const addPausedTime = (duration: number) => {
    console.log("[TimerContext] Adding paused time:", duration);
    setTotalPausedTime((prev) => prev + duration);
  };

  return (
    <TimerContext.Provider
      value={{
        activeTimerId,
        isTimerRunning,
        startTimer,
        stopTimer,
        pauseTimer,
        resumeTimer,
        isPaused,
        totalPausedTime,
        pauseStartTime,
        setPauseStartTime,
        addPausedTime,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
};
