# XP & Level

## Goal

Create a safe game progression layer that rewards effort without disrupting the real reward economy.

## Product Rule

- **Stars** buy real rewards.
- **XP** unlocks game progress, levels, badges, and cosmetics.

Do not let XP affect reward affordability.

## XP Sources

- Parent approves mission.
- Daily quest claimed.
- Streak milestone reached.
- Family quest completed.
- Achievement unlocked.

## Suggested XP Values

```text
Simple approved mission: 10 XP
Progress mission completed: 15 XP
Daily quest: 5-20 XP
7-day streak milestone: 50 XP
Family quest contribution: 20 XP
Achievement unlock: 10-50 XP
```

## Level Curve

Start simple:

```text
Level 1: 0 XP
Level 2: 50 XP
Level 3: 125 XP
Level 4: 225 XP
Level 5: 350 XP
Then +150 XP per level
```

## Level Names

```text
Level 1: Rookie
Level 2: Helper
Level 3: Explorer
Level 4: Star Builder
Level 5: Champion
Level 10: Legend
```

## User Experience

Child dashboard:

```text
Level 4 Explorer
80 / 125 XP to Level 5
```

Show:

- level name
- XP progress bar
- remaining XP to next level
- small celebration when leveling up

## Data Model Draft

```ts
interface ChildProgress {
  child_id: string;
  total_xp: number;
  level: number;
  updated_at: string;
}

interface XpTransaction {
  id: string;
  child_id: string;
  amount: number;
  type: 'MISSION_APPROVED' | 'DAILY_QUEST' | 'STREAK_BONUS' | 'FAMILY_QUEST' | 'ACHIEVEMENT';
  reference_id?: string;
  created_at: string;
}
```

## Trigger Points

- `verifyTask`: award mission XP once per verified log.
- `claimDailyQuest`: award daily quest XP.
- `unlockAchievement`: award achievement XP if configured.
- `completeFamilyQuest`: award family quest XP.

## Idempotency Rules

- One XP transaction per source/reference.
- Mission approval XP should reference child task log id.
- Daily quest XP should reference quest id.
- Achievement XP should reference child achievement id.

## Backup And Restore

Include:

- child XP totals
- XP transactions
- any level metadata if stored

If totals and transactions diverge, transactions should be treated as audit source.

## Audit Points

- XP does not change `current_balance`.
- Duplicate approval cannot duplicate XP.
- Restore cannot duplicate XP transactions.
- Existing users can have XP backfilled from verified logs if desired.

