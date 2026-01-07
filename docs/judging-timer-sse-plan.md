# Judging Timer Sync Plan — v1 (no pause, frontend-only)

## Goals

- Keep judge timers in lock-step with admin room timers using a single source of truth from the backend.
- Auto-submit scores at timer end; prevent moving to next project until its round starts.
- No backend changes: consume existing start endpoints/fields (`actual_timestamp`, `duration`) and refresh frequently on the frontend.

## Scope / Out of Scope

- In scope: start + end syncing, countdown display on judge screens, auto-submit at deadline, navigation gating to next round.
- Out of scope (phase 2): pause/resume propagation. We assume only `actual_timestamp` + `duration` for v1.

## Data Contract (minimal additions)

- Reuse existing schedule fields: `judging_schedule_id`, `timestamp` (scheduled), `actual_timestamp` (actual start), `duration`.
- Optional (recommended) for resilience: `status` (`not-started|running|ended`) so judges can lock UI explicitly; otherwise derive from `actual_timestamp` + duration.

## Backend Work

- None for v1. We rely solely on existing start endpoints that stamp `actual_timestamp` on schedules and include `duration` in responses. No new fields or streaming endpoints.

## Frontend (Admin)

- Keep existing start flows; no changes needed.

## Frontend (Judge)

1. **Connect**
   - On judge app mount (or when entering judging tab), fetch judge schedules to know `room` values; keep them cached.
   - On app foreground or screen focus, refetch schedules to pick up new `actual_timestamp` values when admin starts.

2. **State derivation**
   - Maintain a map keyed by room: `{ actualStart, durationSeconds }`.
   - When a fetch returns an `actual_timestamp`, set `actualStart` and `durationSeconds` for that room.
   - Local ticking: `remaining = durationSeconds - (now - actualStart)`, floor at 0.

3. **UI application**
   - `projectOverview`: show synced countdown; block “Ready” until timer started (`actualStart` set for that room).
   - `scorecard`: show countdown; when `remaining <= 0`, auto-submit if not submitted, then lock UI with “Scoring completed. Waiting for next round.”
   - Navigation gating: only allow “next project” if that project’s schedule has `actual_timestamp` (admin started that round). Otherwise show a blocked state.

4. **Auto-submit**
   - At deadline, call existing `submitScore` with current form values. If required fields are empty, decide policy:
     - Preferred: block auto-submit and show “Missing required scores” before deadline expires (warn at T-60s).
     - If forced auto-submit is required, set safe minimums (e.g., 1 for required fields) and note this in UX; confirm with stakeholders before implementing.
   - On failure: show error toast + retry affordance; keep UI locked to avoid late edits.

5. **Error/Offline handling**
   - If refetch fails or device is offline, show a banner “Live sync lost, retrying…” and keep local ticking; once back online, a refetch corrects drift.
   - If a user joins mid-round, the next fetch initializes from the existing `actual_timestamp`.

## Testing Plan

- Unit: time math (`remaining` calculation), state reducers, navigation gating logic, auto-submit trigger at `remaining<=0`.
- Integration (mock fetch): simulate schedule fetch updates for start and end; ensure countdown updates and auto-submit fires; test reconnection/foreground refetch.
- Manual: multi-judge same room; start mid-session (late joiner sees correct remaining); offline/online transitions; auto-submit failure path; last project and next-round gating.

## Rollout Steps

1. Frontend: add short polling/focus refetch + room timer map; wire countdown into judge screens; implement auto-submit and gating.
2. QA: run through manual scenarios above.
3. Training: brief admins/judges on new behavior (auto-submit and wait-for-admin for next round).

## Implementation Steps (detailed, frontend-only)

1. **Timer derivation utility**
   - Add a helper: `computeRemaining(actualTimestamp: string, durationMinutes: number, now = Date.now()) => secondsRemaining`.
   - Add guards for null `actual_timestamp` (returns null/undefined to indicate “not started”).
2. **State store/context**
   - Extend `timerContext` or add a new store keyed by room: `{ actualStart: string; durationSeconds: number }`.
   - Add actions to hydrate from fetched schedules and to tick locally (setInterval in the consumer screens).
3. **Data fetching cadence**
   - On judging tab focus and app foreground, refetch judge schedules (and admin schedules if needed).
   - While on `projectOverview`/`scorecard`, start a short polling loop (3–5s) that refetches judge schedules to catch newly started rounds.
   - Clear polling when leaving judging screens to save battery.
4. **UI integration**
   - `projectOverview`: show countdown from room map; disable “Ready” until the room has `actualStart`; display “Waiting for admin to start timer” state when null.
   - `scorecard`: show countdown; when remaining <= 0, trigger auto-submit if not already submitted, then freeze inputs and show “Scoring completed. Waiting for next round.”
   - Navigation: when submitting manually, allow move to next project only if its schedule has `actual_timestamp`; otherwise show a blocked/waiting message.
5. **Auto-submit behavior**
   - Before deadline (e.g., T-60s), if required fields are empty, show warning toast/banner.
   - At deadline, attempt submit; on failure, show retry CTA and keep UI locked.
6. **Resilience**
   - Handle offline/refetch errors with a banner and keep local ticking; on next successful refetch, resync `actualStart` and remaining time.
   - Late joiners: when first fetch returns an `actual_timestamp`, initialize the timer map accordingly.
7. **Testing**
   - Unit: helper math, context reducer, auto-submit trigger logic.
   - Integration: mock refetch results to simulate start mid-session and end-of-timer; verify UI gates and auto-submit; test foreground/background transitions.

## Future Improvements

- **Explicit status field** (`not-started|running|paused|ended`) on schedules to remove inference ambiguity and handle manual ends cleanly.
- **Pause/resume propagation**: add `pause_started_at` + `paused_total_seconds` (or equivalent) so judges freeze during admin pauses; emit SSE updates on pause/resume and adjust remaining-time math.
- **Presence/health**: optional WebSocket or SSE heartbeats + judge acks to show which judges are connected.

## Implementation Steps (v1 without pause, frontend-only)

1. **Fetch and derive timer**
   - Use existing queries to fetch judge schedules; read `actual_timestamp` + `duration` per room/schedule.
   - Derive `remaining = duration*60 - (now - actual_timestamp)` locally; floor at 0. If `actual_timestamp` is null, timer hasn’t started.
2. **Refresh strategy**
   - Add short polling (e.g., every 3–5s) while on judging screens and on app foreground to pick up new `actual_timestamp` values after admin starts the round.
   - Debounce/refetch when navigation focuses to avoid unnecessary calls.
3. **Timer state management**
   - Maintain a room → timer map in context/store: `{ actualStart, durationSeconds }` derived from the latest fetch.
   - Local ticking updates `remaining` between fetches; each refetch corrects drift.
4. **UI wiring (judge)**
   - `projectOverview`: show countdown; disable “Ready” until the room has an `actual_timestamp`.
   - `scorecard`: show countdown; when `remaining <= 0`, auto-submit if not submitted, then lock UI with “Waiting for next round.”
   - Navigation: allow next project only if its schedule has `actual_timestamp` (from refetch).
5. **Auto-submit flow**
   - Use current form values; if required fields empty, warn before deadline (e.g., toast at T-60s) and block auto-submit unless product wants minimum defaults.
   - On submit failure, show retry CTA; keep UI locked to avoid edits after deadline.
6. **Testing**
   - Unit test time math and reducers; ensure polling refresh updates timers and gating logic.
   - Manual: multi-judge same room, late joiner (joins mid-round), offline/online during countdown, auto-submit failure path, last project gating.
