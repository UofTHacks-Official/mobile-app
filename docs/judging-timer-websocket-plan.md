# Judging Timer Sync Plan — WebSocket Upgrade

## Goals

- Replace judge timer polling with a persistent WebSocket feed from the backend (already implemented) to keep countdowns in sync with admin controls.
- React to room-scoped timer events (`start_timer`, `pause_timer`, `stop_timer`) for specific `judging_schedule_id` values and update the UI immediately.
- Preserve existing timer UI/logic (countdown display, gating, auto-submit) but drive it from live events instead of repeated fetches.

## Event Contract (given)

- Connection: `ws://<domain>/ws/v13/connect-judge?judge_id=<judge_id>`
- Message envelope: `type: "judge"` with `data.action` in `{start_timer, pause_timer, stop_timer}`.
- Payload fields: `room`, `judging_schedule_id`, `team_id`, `timestamp` (server time for action).
- Routing: Admin timer routes broadcast only to judges in the same room with active sessions.
- Additional broadcasts: Announcements share the same socket; handle them alongside timer events.

## Frontend Architecture

1. **Connection lifecycle**
   - Create a WebSocket client when the judge session is established (e.g., on auth + role == judge) and keep it scoped to the judging tab/root.
   - Add auto-reconnect with backoff (e.g., 0s, 2s, 5s, max 30s) and a heartbeat/timeout guard to detect stale sockets.
   - On app background → foreground, re-validate the socket (reconnect if closed); on logout/unmount, close cleanly.
2. **Message handling**
   - Validate `type === "judge"`; route other message types to existing announcement handling.
   - Switch on `data.action`:
     - `start_timer`: set/override timer state for `judging_schedule_id` using `timestamp` as the authoritative start (or start-from-now if provided as start-at).
     - `pause_timer`: freeze the countdown and store `paused_at` for drift calculation; ignore repeats.
     - `stop_timer`: set remaining to 0, trigger auto-submit/lock UI for that schedule.
   - Ignore messages missing required fields; log to Sentry/console in dev.
3. **State store**
   - Extend the timer store/context keyed by `judging_schedule_id` (or room → schedule map) with fields: `{ status: "running"|"paused"|"stopped", startedAt, pausedAt?, durationSeconds, remainingSeconds }`.
   - Add reducers/actions for `startTimer`, `pauseTimer`, `stopTimer`, and `tick` (local interval).
   - Seed `durationSeconds` from existing schedule fetch on screen entry; WebSocket events only mutate status/timestamps.
4. **Local ticking + drift correction**
   - Keep a `setInterval` (1s) to recompute `remainingSeconds` from `startedAt`, `pausedAt`, and `durationSeconds`; floor at 0.
   - On each timer event, reset the derived fields to avoid drift; late joiners initialize from the first `start_timer` event they receive.
   - If the socket is down, optionally fall back to a slow refetch on focus to avoid permanent desync.
5. **UI integration (judge)**
   - `projectOverview`: drive countdown and “Ready” gating from timer store; show “Waiting for admin to start timer” when no `start_timer` seen.
   - `scorecard`: reflect live remaining time; on `stop_timer` or `remainingSeconds <= 0`, auto-submit and lock fields; on `pause_timer`, freeze countdown and inputs.
   - Announcement handling: continue to surface broadcast announcements from the same connection.
6. **Error + reconnect UX**
   - Show a lightweight banner/toast when the socket disconnects or retries; hide once reconnected.
   - Debounce duplicate events; handle out-of-order messages by trusting the latest `timestamp`.

## Implementation Steps

1. **Socket client**
   - Add a WebSocket hook/service (`useJudgeSocket` or similar) that accepts `judge_id` and exposes connection state + event dispatch.
   - Wire it to the judge shell/screen provider so all judge screens share one connection.
2. **Timer reducers**
   - Implement timer actions to handle `start_timer`, `pause_timer`, `stop_timer`, plus ticking.
   - Ensure room filtering: only update timers when `room` matches the judge’s current room (if tracked) or when `judging_schedule_id` exists in local schedules.
3. **Screen wiring**
   - Replace polling-based updates in judging screens with store updates from WebSocket events; keep optional fetch-on-focus to hydrate `durationSeconds`.
   - Ensure auto-submit and navigation gating consume the new timer store.
4. **Resilience**
   - Add reconnect/backoff + heartbeat; add a slow fallback fetch on focus if socket is down.
   - Log malformed messages and swallow safely.
5. **Testing**
   - Unit: reducers for each action, remaining-time math with pause/resume, reconnection flags.
   - Integration: mocked WebSocket provider sending start/pause/stop for the same/different rooms; late-join scenario; announcement handling coexistence.
   - Manual: multi-judge same room receiving start/pause/stop in real time; background/foreground reconnection; forced disconnect mid-round.

## Rollout

- Ship behind a feature flag (e.g., `enableJudgeWebSocketTimers`); keep polling as a fallback during QA.
- Monitor error/reconnect rates and timer consistency during pilot; remove polling once stable.
