import { useJudgeTimerWebSocket } from "@/hooks/useJudgeTimerWebSocket";

/**
 * Headless component to keep the judge WebSocket connection alive
 * and feed timer events into TimerContext.
 */
export const JudgeTimerSocketListener = () => {
  useJudgeTimerWebSocket();
  return null;
};
