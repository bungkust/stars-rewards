# Streak Freeze

## Goal

Protect kids from the demotivating feeling of losing all progress because of one missed day.

## Behavior

If a child misses a scheduled mission or daily goal, a Streak Freeze can preserve the streak once.

Rules:

- Freeze is consumed automatically when a missed day would reset a streak.
- Freeze preserves streak but does not award stars or XP for the missed mission.
- Parent can grant freezes manually.
- Weekly quest completion can grant 1 freeze.
- Freezes are capped.

## Suggested Limits

```text
Max stored freezes per child: 2
One freeze protects one local day
Freeze can protect missed-day FAILED cases
Freeze cannot protect rejected tasks
```

## User Experience

Child dashboard:

```text
Streak Freeze: 1/2
Protects your streak if you miss a day.
```

When consumed:

```text
Your Streak Freeze protected your streak today.
Try again tomorrow.
```

## Data Model Draft

```ts
interface StreakFreezeState {
  child_id: string;
  available: number;
  max: number;
  updated_at: string;
}

interface StreakFreezeUse {
  id: string;
  child_id: string;
  task_id?: string;
  used_for_date: string; // local YYYY-MM-DD
  created_at: string;
}
```

## Mission Log Recommendation

Do not add a new `FROZEN` status unless necessary.

Recommended:

```ts
interface ChildTaskLog {
  streak_protected?: boolean;
}
```

This keeps history honest: the mission was missed, but the streak was protected.

## Mission Logic Impact

This touches `src/services/missionLogicService.ts`.

When missed logic creates `FAILED`:

1. Check whether the child has a freeze.
2. If yes, consume freeze.
3. Mark failed log with `streak_protected: true`.
4. Do not reset streak for that task/child.
5. Do not award stars.
6. Do not create duplicate freeze usage for the same child/date/task.

## Parent Controls

Settings:

- enable/disable streak freeze
- max stored freezes
- grant freeze to child

## Backup And Restore

Include:

- freeze inventory
- freeze usage history
- `streak_protected` on logs

## Audit Points

- Prevent duplicate freeze use during app resume.
- Local date boundaries only.
- Restore preserves protected miss state.
- Streak reset logic respects `streak_protected`.

