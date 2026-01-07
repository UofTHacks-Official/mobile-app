import React, { createContext, useContext, useState, ReactNode } from "react";

export interface RoomTimer {
  actualStart: string;
  durationSeconds: number;
}

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
  roomTimers: Record<string, RoomTimer>;
  setRoomTimers: (timers: Record<string, RoomTimer>) => void;
  upsertRoomTimer: (room: string, timer: RoomTimer) => void;
  clearRoomTimer: (room: string) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider = ({ children }: { children: ReactNode }) => {
  const [activeTimerId, setActiveTimerId] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [totalPausedTime, setTotalPausedTime] = useState(0);
  const [pauseStartTime, setPauseStartTime] = useState<number | null>(null);
  const [roomTimers, setRoomTimers] = useState<Record<string, RoomTimer>>({});

  const startTimer = (scheduleId: number) => {
    // No-op if the same timer is already running
    if (activeTimerId === scheduleId && isTimerRunning) {
      setIsPaused(false);
      setTotalPausedTime(0);
      setPauseStartTime(null);
      return;
    }

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

  const upsertRoomTimer = (room: string, timer: RoomTimer) => {
    setRoomTimers((prev) => {
      const existing = prev[room];
      // Avoid unnecessary updates if nothing changed
      if (
        existing &&
        existing.actualStart === timer.actualStart &&
        existing.durationSeconds === timer.durationSeconds
      ) {
        return prev;
      }
      return { ...prev, [room]: timer };
    });
  };

  const clearRoomTimer = (room: string) => {
    setRoomTimers((prev) => {
      if (!prev[room]) return prev;
      const updated = { ...prev };
      delete updated[room];
      return updated;
    });
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
        roomTimers,
        setRoomTimers,
        upsertRoomTimer,
        clearRoomTimer,
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

/**
 * Helper to compute remaining seconds given an actual start timestamp and duration.
 * Falls back to 0 when start is invalid.
 */
export const computeRemainingSeconds = (
  actualTimestamp: string,
  durationSeconds: number,
  nowMs: number = Date.now()
) => {
  if (!actualTimestamp) return 0;
  const timestampStr = actualTimestamp.endsWith("Z")
    ? actualTimestamp
    : actualTimestamp + "Z";
  const startMs = new Date(timestampStr).getTime();
  if (Number.isNaN(startMs)) return 0;
  const elapsedSeconds = Math.floor((nowMs - startMs) / 1000);
  return Math.max(durationSeconds - elapsedSeconds, 0);
};
