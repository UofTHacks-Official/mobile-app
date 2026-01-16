import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  RoomTimer,
  TimerStatus,
  computeRemainingSecondsFromStart,
  computeRemainingSecondsFromTimer,
  useTimer,
} from "@/context/timerContext";
import { useJudgeSchedules } from "@/queries/judging";
import { getJudgeId } from "@/utils/tokens/secureStorage";
import { devError, devLog, devWarn } from "@/utils/logger";
import { isFeatureEnabled } from "@/config/featureFlags";
import { JudgingScheduleItem } from "@/types/judging";
import { formatLocationForDisplay } from "@/utils/judging";

type ConnectionState = "idle" | "connecting" | "open" | "closed" | "error";

interface JudgeSocketMessage {
  type?: string;
  data?: {
    action?: "start_timer" | "pause_timer" | "resume_timer" | "stop_timer";
    room?: string;
    judging_schedule_id?: number;
    team_id?: number;
    timestamp?: string;
  };
}

const MAX_BACKOFF_MS = 30000;

const getRoomPrefix = (location: JudgingScheduleItem["location"]) =>
  formatLocationForDisplay(location);

const deriveRemainingFromStartOrDuration = (
  timestamp: string | null | undefined,
  durationSeconds: number,
  nowMs: number
) => {
  if (!durationSeconds) return 0;
  if (!timestamp) return durationSeconds;
  return computeRemainingSecondsFromStart(timestamp, durationSeconds, nowMs);
};

export const useJudgeTimerWebSocket = () => {
  const featureEnabled = isFeatureEnabled("ENABLE_JUDGE_TIMERS");
  const { roomTimers, upsertRoomTimer } = useTimer();
  const roomTimersRef = useRef<Record<string, RoomTimer>>({});
  const durationByScheduleRef = useRef<
    Map<number, { durationSeconds: number; room: string }>
  >(new Map());
  const [judgeId, setJudgeId] = useState<number | null>(null);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("idle");
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const reconnectAttemptRef = useRef(0);
  const connectRef = useRef<() => void>(() => {});

  useEffect(() => {
    roomTimersRef.current = roomTimers;
  }, [roomTimers]);

  useEffect(() => {
    const loadJudgeId = async () => {
      const id = await getJudgeId();
      setJudgeId(id);
    };
    loadJudgeId();
  }, []);

  const {
    data: judgeSchedules,
    refetch: refetchJudgeSchedules,
    isFetching: isFetchingSchedules,
  } = useJudgeSchedules(judgeId, featureEnabled && !!judgeId);

  useEffect(() => {
    const map = new Map<number, { durationSeconds: number; room: string }>();
    (judgeSchedules || []).forEach((schedule) => {
      map.set(schedule.judging_schedule_id, {
        durationSeconds: schedule.duration * 60,
        room: getRoomPrefix(schedule.location),
      });
    });
    durationByScheduleRef.current = map;
  }, [judgeSchedules]);

  const buildSocketUrl = useMemo(() => {
    const baseUrl = process.env.EXPO_PUBLIC_UOFT_STAGING;
    if (!baseUrl) {
      devWarn(
        "[JudgeTimerWebSocket] Missing EXPO_PUBLIC_UOFT_STAGING env for socket base URL"
      );
      return null;
    }

    try {
      const parsed = new URL(baseUrl);
      const protocol = parsed.protocol === "https:" ? "wss:" : "ws:";
      return `${protocol}//${parsed.host}/api/v13/websockets/connect-judge`;
    } catch (error) {
      devError(
        "[JudgeTimerWebSocket] Failed to parse base URL for socket:",
        baseUrl,
        error
      );
      return null;
    }
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (!featureEnabled || !judgeId) return;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    const delay = Math.min(
      MAX_BACKOFF_MS,
      (reconnectAttemptRef.current + 1) * 2000
    );
    reconnectAttemptRef.current += 1;
    devLog(`[JudgeTimerWebSocket] Reconnecting in ${delay}ms`);
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectTimeoutRef.current = null;
      connectRef.current();
    }, delay);
  }, [featureEnabled, judgeId]);

  const handleTimerAction = useCallback(
    (data: JudgeSocketMessage["data"]) => {
      console.log("[DEBUG] handleTimerAction called with data:", data);
      if (!data?.action) {
        console.log("[DEBUG] No action in data, returning");
        return;
      }
      const nowMs = Date.now();
      const scheduleId = data.judging_schedule_id;
      const durationMeta = scheduleId
        ? durationByScheduleRef.current.get(scheduleId)
        : undefined;
      // Prefer explicit room from payload; otherwise derive a stable room prefix
      const room =
        data.room ||
        durationMeta?.room ||
        (data.team_id ? data.team_id.toString() : "");

      console.log(
        "[DEBUG] Determined room:",
        room,
        "scheduleId:",
        scheduleId,
        "durationMeta:",
        durationMeta
      );

      if (!room) {
        console.warn("[DEBUG] No room found, returning");
        devWarn(
          "[JudgeTimerWebSocket] Received timer event without room",
          data
        );
        return;
      }

      const existing = roomTimersRef.current[room];

      // If we don't have duration metadata yet, trigger a refetch but still process the event
      if (!durationMeta?.durationSeconds && !existing?.durationSeconds) {
        devWarn(
          "[JudgeTimerWebSocket] Missing duration for schedule; refetching schedules"
        );
        refetchJudgeSchedules?.();
      }

      const baseTimer: RoomTimer = {
        actualStart: data.timestamp ?? existing?.actualStart ?? null,
        durationSeconds:
          existing?.durationSeconds ?? durationMeta?.durationSeconds ?? 300, // 5 min fallback
        remainingSeconds: existing?.remainingSeconds ?? 0,
        lastSyncedAt: nowMs,
        status: existing?.status ?? "stopped",
        judgingScheduleId: scheduleId ?? existing?.judgingScheduleId,
        teamId: data.team_id ?? existing?.teamId,
      };

      switch (data.action) {
        case "start_timer": {
          // Starting fresh - use full duration
          const remainingSeconds = baseTimer.durationSeconds;
          const timerData = {
            ...baseTimer,
            actualStart: data.timestamp ?? baseTimer.actualStart,
            remainingSeconds,
            lastSyncedAt: nowMs,
            status: "running" as TimerStatus,
          };
          console.log(
            `[DEBUG] ✅ STARTING TIMER for room "${room}":`,
            timerData
          );
          devLog(`[JudgeTimerWebSocket] Starting timer for room ${room}:`, {
            scheduleId,
            timestamp: data.timestamp,
            durationSeconds: baseTimer.durationSeconds,
            remainingSeconds,
          });
          upsertRoomTimer(room, timerData);
          break;
        }
        case "resume_timer": {
          // Resuming from pause - keep the remaining time
          const remainingSeconds =
            existing?.remainingSeconds ?? baseTimer.durationSeconds;
          const timerData = {
            ...baseTimer,
            actualStart: existing?.actualStart ?? data.timestamp ?? null,
            remainingSeconds,
            lastSyncedAt: nowMs,
            status: "running" as TimerStatus,
          };
          console.log(
            `[DEBUG] ✅ RESUMING TIMER for room "${room}":`,
            timerData
          );
          devLog(`[JudgeTimerWebSocket] Resuming timer for room ${room}:`, {
            scheduleId,
            remainingSeconds,
          });
          upsertRoomTimer(room, timerData);
          break;
        }
        case "pause_timer": {
          const remainingSeconds =
            computeRemainingSecondsFromTimer(existing, nowMs) ??
            deriveRemainingFromStartOrDuration(
              data.timestamp ?? existing?.actualStart,
              baseTimer.durationSeconds,
              nowMs
            );

          console.log(
            `[DEBUG] ⏸️ PAUSING TIMER for room "${room}":`,
            remainingSeconds,
            "seconds remaining"
          );
          upsertRoomTimer(room, {
            ...baseTimer,
            remainingSeconds,
            lastSyncedAt: nowMs,
            status: "paused",
          });
          break;
        }
        case "stop_timer": {
          console.log(`[DEBUG] ⏹️ STOPPING TIMER for room "${room}"`);
          upsertRoomTimer(room, {
            ...baseTimer,
            remainingSeconds: 0,
            lastSyncedAt: nowMs,
            status: "stopped",
          });
          break;
        }
        default:
          devWarn(
            "[JudgeTimerWebSocket] Ignoring unknown timer action",
            data.action
          );
      }
    },
    [refetchJudgeSchedules, upsertRoomTimer]
  );

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const parsed: JudgeSocketMessage =
          typeof event.data === "string"
            ? JSON.parse(event.data)
            : (event.data as any);

        console.log(
          "[DEBUG] WebSocket message received:",
          JSON.stringify(parsed, null, 2)
        );
        devLog("[JudgeTimerWebSocket] Received message:", parsed);

        if (parsed?.type === "judge") {
          console.log(
            "[DEBUG] Processing judge message with action:",
            parsed.data?.action
          );
          handleTimerAction(parsed.data);
          return;
        }

        // Allow announcements or other types to be added later
        console.log("[DEBUG] Ignoring non-judge message type:", parsed?.type);
        devLog("[JudgeTimerWebSocket] Ignoring non-judge message", parsed);
      } catch (error) {
        console.error("[DEBUG] Failed to parse WebSocket message:", error);
        devError("[JudgeTimerWebSocket] Failed to parse message", error);
      }
    },
    [handleTimerAction]
  );

  const connect = useCallback(() => {
    if (!featureEnabled || !judgeId) return;
    if (!buildSocketUrl) return;

    if (wsRef.current) {
      wsRef.current.close();
    }

    const url = `${buildSocketUrl}?judge_id=${judgeId}`;
    devLog("[JudgeTimerWebSocket] Connecting to", url);
    const socket = new WebSocket(url);
    wsRef.current = socket;
    setConnectionState("connecting");

    socket.onopen = () => {
      console.log("[DEBUG] WebSocket CONNECTED successfully to:", url);
      devLog("[JudgeTimerWebSocket] Connected");
      setConnectionState("open");
      reconnectAttemptRef.current = 0;
    };

    socket.onclose = () => {
      devWarn("[JudgeTimerWebSocket] Socket closed");
      setConnectionState("closed");
      scheduleReconnect();
    };

    socket.onerror = (event) => {
      devError("[JudgeTimerWebSocket] Socket error", event);
      setConnectionState("error");
      socket.close();
    };

    socket.onmessage = handleMessage;
  }, [
    buildSocketUrl,
    featureEnabled,
    handleMessage,
    judgeId,
    scheduleReconnect,
  ]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    console.log(
      "[DEBUG] WebSocket setup - featureEnabled:",
      featureEnabled,
      "judgeId:",
      judgeId
    );
    if (!featureEnabled || !judgeId) return;
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.onmessage = null;
        wsRef.current.onerror = null;
        wsRef.current.onclose = null;
        wsRef.current.onopen = null;
        wsRef.current.close();
      }
    };
  }, [connect, featureEnabled, judgeId]);

  return {
    connectionState,
    isFetchingSchedules,
  };
};
