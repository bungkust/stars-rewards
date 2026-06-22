# Personal League

## Goal

Create a weekly tier system inspired by Duolingo Leagues, but without sibling competition.

## Product Rule

This is personal progress, not a leaderboard.

Avoid:

- ranking siblings against each other
- demotion shame
- pressure-heavy copy

## Tiers

```text
Bronze
Silver
Gold
Diamond
```

## Suggested Weekly XP Thresholds

```text
Bronze: 50 XP/week
Silver: 100 XP/week
Gold: 175 XP/week
Diamond: 275 XP/week
```

## User Experience

Child stats page:

```text
Weekly League
Gold
140 / 175 XP to complete Gold
```

Good copy:

```text
35 XP until Gold is complete.
```

Avoid:

```text
You will be demoted.
You are falling behind.
```

## Reward Rules

- Tier completion can grant badge progress or cosmetics.
- Avoid star rewards by default.
- Weekly tier should be based on XP transactions, not manually stored score only.

## Data Model Draft

Personal League can be computed from `XpTransaction`.

Optional cache:

```ts
interface WeeklyLeagueSnapshot {
  child_id: string;
  week_start: string; // local YYYY-MM-DD
  xp_total: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';
  updated_at: string;
}
```

## Trigger Points

- XP transaction created: recompute weekly tier.
- week rollover: create new weekly snapshot.
- stats page load: compute current tier from XP transactions.

## Backup And Restore

If computed from XP transactions:

- no separate backup required beyond XP transactions

If cached:

- include weekly snapshots
- verify cache can be rebuilt

## Audit Points

- Week boundaries use local date logic.
- Existing XP transactions can recompute tier.
- No shame states for low activity.
- Works with one child and multiple children.

