# Motivation Features

Duolingo-inspired motivation specs for Star Habit.

These features adapt Duolingo patterns to a private, offline-first family habit app. The goal is to make children excited to return without turning real-life routines into stressful competition.

## Product Principle

- **Stars** are family currency for real-world rewards.
- **XP** is game progress for levels, badges, quests, and cosmetics.
- Keep parent verification as the trusted source for mission-based rewards.
- Prefer family encouragement over public or sibling competition.
- Avoid shame, harsh streak loss, and pressure-heavy copy.

## Feature Specs

Recommended build order:

1. [Daily Quests](daily-quests.md)
2. [XP & Level](xp-and-level.md)
3. [Streak Freeze](streak-freeze.md)
4. [Achievement Badges](achievement-badges.md)
5. [Family Quest](family-quest.md)
6. [Praise Feed](praise-feed.md)
7. [Personal League](personal-league.md)

MVP recommendation: build **Daily Quests + XP & Level + Streak Freeze** first.

## Cross-Feature Requirements

When implementing any motivation feature, update:

- `src/types/index.ts`
- `src/services/localStorageService.ts`
- `src/services/dataService.ts`
- `src/store/useAppStore.ts`
- `src/schemas/backupSchema.ts`
- `src/utils/backupUtils.ts`
- restore mapper in `localStorageService.restoreBackup`

All date keys must use local date helpers from `src/utils/timeUtils.ts`.

