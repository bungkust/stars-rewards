# Achievement Badges

## Goal

Reward meaningful milestones and identity moments. Badges should make children feel proud of progress, not pressured.

## Badge Examples

- First Mission Approved
- 5 Missions Approved
- 10 Missions Approved
- 7-Day Streak
- Morning Hero
- Health Champion
- First Reward Redeemed
- Saved 100 Stars
- Try Again Hero: completed a mission after a previous failure
- Family Helper: contributed to a family quest

## Badge Types

```ts
type AchievementType =
  | 'MISSION_COUNT'
  | 'STREAK'
  | 'CATEGORY'
  | 'REWARD'
  | 'BALANCE'
  | 'COMEBACK'
  | 'FAMILY_QUEST';
```

## User Experience

Child profile/stats:

- badge shelf
- locked badge preview
- unlocked date
- short badge description

Unlock moment:

- small modal after parent verification or reward redemption
- short celebration
- no long animation blocking parent workflow

## Reward Rules

- Badges can grant XP.
- Badges should not grant stars by default.
- Rare badges can unlock cosmetics in future.

## Data Model Draft

```ts
interface AchievementDefinition {
  id: string;
  type: AchievementType;
  title: string;
  description: string;
  icon: string;
  target: number;
  xp_reward?: number;
}

interface ChildAchievement {
  id: string;
  child_id: string;
  achievement_id: string;
  unlocked_at: string;
}
```

## Trigger Points

- `verifyTask`: mission count, category, streak, comeback badges.
- `redeemReward`: reward-related badges.
- `manualAdjustment` or balance update: saved-stars badges.
- `completeFamilyQuest`: family helper badge.

## Backfill For Existing Users

Existing users should be able to unlock historical badges from:

- verified logs
- transactions
- reward redemption history
- task streak fields

Backfill should be idempotent and should not spam multiple modals at once. Use a quiet badge unlock queue or show only the most important new badge.

## Backup And Restore

Include:

- child achievement unlocks
- achievement definitions only if custom/user-defined

Static built-in achievement definitions do not need backup if versioned in code.

## Audit Points

- Do not unlock the same badge twice.
- XP reward must be one-time.
- Restore should not duplicate achievement XP.
- Badge conditions must use local dates where date-based.

