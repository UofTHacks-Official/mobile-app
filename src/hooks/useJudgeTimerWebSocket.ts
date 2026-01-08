import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  RoomTimer,
  computeRemainingSecondsFromStart,
  computeRemainingSecondsFromTimer,
  useTimer,
} from "@/context/timerContext";
import { useJudgeSchedules } from "@/queries/judging";
import { getJudgeId } from "@/utils/tokens/secureStorage";
import { devError, devLog, devWarn } from "@/utils/logger";
import { isFeatureEnabled } from "@/config/featureFlags";
import { JudgingScheduleItem } from "@/types/judging";

type ConnectionState = "idle" | "connecting" | "open" | "closed" | "error";

interface JudgeSocketMessage {
  type?: string;
  data?: {
    action?: "start_timer" | "pause_timer" | "stop_timer";
    room?: string;
    judging_schedule_id?: number;
    team_id?: number;
    timestamp?: string;
  };
}

const MAX_BACKOFF_MS = 30000;

const getRoomName = (location: JudgingScheduleItem["location"]) =>
  typeof location === "string" ? location : location.location_name;

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
  const featureEnabled = isFeatureEnabled("ENABLE_JUDGE_WEBSOCKET_TIMERS");
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
        room: getRoomName(schedule.location),
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
      connect();
    }, delay);
  }, [featureEnabled, judgeId]);

  const handleTimerAction = useCallback(
    (data: JudgeSocketMessage["data"]) => {
      if (!data?.action) return;
      const nowMs = Date.now();
      const scheduleId = data.judging_schedule_id;
      const durationMeta = scheduleId
        ? durationByScheduleRef.current.get(scheduleId)
        : undefined;
      const room =
        data.room || durationMeta?.room || data.team_id?.toString() || "";

      if (!room) {
        devWarn(
          "[JudgeTimerWebSocket] Received timer event without room",
          data
        );
        return;
      }

      if (!durationMeta?.durationSeconds) {
        devWarn(
          "[JudgeTimerWebSocket] Missing duration for schedule; refetching schedules"
        );
        refetchJudgeSchedules?.();
        return;
      }

      const existing = roomTimersRef.current[room];
      const baseTimer: RoomTimer = {
        actualStart: data.timestamp ?? existing?.actualStart ?? null,
        durationSeconds:
          existing?.durationSeconds ?? durationMeta?.durationSeconds,
        remainingSeconds: existing?.remainingSeconds ?? 0,
        lastSyncedAt: nowMs,
        status: existing?.status ?? "stopped",
        judgingScheduleId: scheduleId ?? existing?.judgingScheduleId,
        teamId: data.team_id ?? existing?.teamId,
      };

      switch (data.action) {
        case "start_timer": {
          const remainingSeconds =
            existing?.status === "paused"
              ? existing.remainingSeconds
              : deriveRemainingFromStartOrDuration(
                  data.timestamp ?? existing?.actualStart,
                  baseTimer.durationSeconds,
                  nowMs
                );
          upsertRoomTimer(room, {
            ...baseTimer,
            actualStart: data.timestamp ?? baseTimer.actualStart,
            remainingSeconds,
            lastSyncedAt: nowMs,
            status: "running",
          });
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

          upsertRoomTimer(room, {
            ...baseTimer,
            remainingSeconds,
            lastSyncedAt: nowMs,
            status: "paused",
          });
          break;
        }
        case "stop_timer": {
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

        if (parsed?.type === "judge") {
          handleTimerAction(parsed.data);
          return;
        }

        // Allow announcements or other types to be added later
        devLog("[JudgeTimerWebSocket] Ignoring non-judge message", parsed);
      } catch (error) {
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
