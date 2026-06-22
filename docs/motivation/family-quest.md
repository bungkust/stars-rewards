# Family Quest

## Goal

Create a cooperative weekly goal for the family, inspired by Duolingo Friends Quests but adapted for siblings and parent-child routines.

## Why Not Sibling Leaderboard

Sibling leaderboards can make younger children feel behind. Family Quest should make everyone feel like they are contributing.

## Quest Examples

- Complete 20 approved missions as a family this week.
- Every child completes 3 missions this week.
- Complete 5 Health missions this week.
- No missed bedtime routine for 3 days.
- Redeem one family reward.

## User Experience

Child dashboard:

```text
Family Quest
12 / 20 missions approved this week
Everyone is helping!
```

Parent dashboard:

```text
Family Quest
12 / 20 approved missions
Reward: Movie night
```

## Reward Rules

- Default reward: family badge, celebration, XP.
- Optional parent-controlled reward: movie night, picnic, game night.
- Avoid star rewards by default.
- Avoid quests where one child can carry everything if the goal is family participation.

## Data Model Draft

```ts
interface FamilyQuest {
  id: string;
  week_start: string; // local YYYY-MM-DD
  type: 'APPROVED_MISSIONS' | 'CATEGORY_MISSIONS' | 'EVERY_CHILD_ACTIVE' | 'NO_MISSED_ROUTINE';
  target: number;
  progress: number;
  reward_label?: string;
  completed_at?: string;
}
```

## Trigger Points

- `verifyTask`: approved mission progress.
- `checkMissedMissions`: no-missed-routine eligibility.
- `redeemReward`: family reward quest if used.
- weekly refresh: create or rotate quest.

## Parent Controls

Settings:

- enable/disable Family Quest
- choose suggested quest
- set weekly reward label
- reset current quest

## Week Boundary

Use local week boundaries. Pick one product rule:

- Monday-start week
- or locale/device week start

Recommendation: Monday-start for consistency.

## Backup And Restore

Include:

- active family quest
- completed family quest history if shown in feed/stats

Restore must not grant rewards twice for a completed quest.

## Audit Points

- Works for one-child and multi-child families.
- Does not punish children with fewer assigned missions.
- Local date/week logic only.
- Completed rewards are idempotent.

