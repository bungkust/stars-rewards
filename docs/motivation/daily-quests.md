# Daily Quests

## Goal

Give each child 2-3 small daily objectives beyond the normal mission list. This creates a clear "what should I do today?" loop, similar to Duolingo Daily Quests.

## Why This Fits Star Habit

Daily missions can feel like a list of chores. Daily Quests turn the day into a small game with visible progress and a finish line.

This supports:

- showing up daily
- completing at least one meaningful action
- trying varied mission categories
- building confidence through small wins

## Examples

- Complete 1 mission today.
- Submit a mission before 7 PM.
- Complete a Health mission.
- Complete any progress mission.
- Keep your streak alive.
- Earn 10 XP today.
- Finish one bonus mission.

## MVP Scope

Start deterministic, not random:

1. Complete 1 mission.
2. Earn any stars today.
3. Keep your streak alive.

Avoid random quest generation in v1. Deterministic quests are easier to test, explain, and restore.

## User Experience

Child dashboard should show a compact module near the top:

```text
Daily Quests
[1/1] Complete 1 mission        Claim +10 XP
[0/1] Earn stars today          +10 XP
[2/3] Keep your streak alive    +15 XP
```

Quest states:

- `locked`: not started
- `in_progress`: partial progress
- `claimable`: completed but XP not claimed
- `claimed`: reward already collected

## Reward Rules

- Quest rewards should usually be XP, not stars.
- Stars can be used rarely for parent-controlled special quests.
- Quest rewards are claimable once per local day.
- Quest progress tied to mission completion should count after parent verification.
- Rejected missions should not count.
- Excused missions may count only for streak-preservation quests, not completion quests.

## Data Model Draft

```ts
interface DailyQuest {
  id: string;
  child_id: string;
  date: string; // local YYYY-MM-DD
  type: 'COMPLETE_MISSION' | 'EARN_STARS' | 'KEEP_STREAK';
  target: number;
  progress: number;
  xp_reward: number;
  claimed_at?: string;
}
```

## Trigger Points

- On app refresh: ensure today's quests exist.
- On parent verification: update completion and earned-stars quest progress.
- On missed mission check: update streak-related quest state.
- On claim button: write XP transaction.

## UI Placement

Child dashboard:

1. child profile and stars
2. XP/level progress
3. Daily Quests
4. today's missions

## Backup And Restore

Include:

- today's quest state
- previous claimed quests if needed for history
- XP transactions created by claims

Restore must avoid generating duplicate quests for the same child/date/type.

## Audit Points

- Uses local date helpers.
- Does not double-claim after reload.
- Works offline.
- Does not create progress from rejected missions.
- Existing users can start receiving quests after first refresh.

