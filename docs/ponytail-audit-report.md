# Ponytail Audit Report

Repo-wide scan over-engineering and complexity. Correctness/security/performance out of scope.

Generated: 2026-09-18

---

## Findings (ranked by cut size)

### 1. delete: dataService.ts — full pass-through layer, zero logic

**What:** `src/services/dataService.ts` (271 lines) exports an object whose every method is a synchronous call to `localStorageService` with `_parentId` args it ignores. No auth, no transforms, no error handling beyond forwarding.

**Why it's dead:** The app is offline-only (localStorage). Supabase schema exists but is unused. Every caller already imports `localStorageService` directly or goes through `dataService` for no reason. The `_parentId` params confirm it was stubbed for a backend that never materialized.

**Replacement:** Delete the file. Update callers to use `localStorageService` directly. This collapses the service layer from 2 files to 1.

**Lines saved:** ~271

---

### 2. delete: test_analytics.ts — orphan test file, not wired to any runner

**What:** `test_analytics.ts` (132 lines) duplicates `getCategoryPerformance` logic from `src/utils/analytics.ts` and logs to console. No `vitest`/`jest` import, no `describe/it`, no reference in `package.json` scripts.

**Replacement:** Delete. If testing is desired, wire it to the existing test runner with proper `describe/it` blocks importing the real function.

**Lines saved:** ~132

---

### 3. delete: StreakCelebrationModal — feature disabled, dead modal

**What:** `src/components/modals/StreakCelebrationModal.tsx` (88 lines). Rendered in `App.tsx` as `{false && <StreakCelebrationModal .../>}`. Feature flag `ENABLE_STREAK_CELEBRATION` is `false` in `featureFlags.ts` and never checked in the component itself.

**Replacement:** Delete the file, remove the `false &&` line from `App.tsx`. If the feature ships later, restore from git.

**Lines saved:** ~88

---

### 4. delete: Animations.tsx unused exports (StaggerContainer, StaggerItem, ScaleButton)

**What:** `src/components/design-system/Animations.tsx` (64 lines) exports 4 components. Only `PageTransition` is used outside Playground. `StaggerContainer`, `StaggerItem`, `ScaleButton` are only imported by `Playground.tsx` (dev page).

**Replacement:** Move `StaggerContainer`/`StaggerItem`/`ScaleButton` to `Playground.tsx` or a `dev/` directory. Keep `PageTransition` in place.

**Lines saved:** ~48 (3 of 4 exports)

---

### 5. delete: MobileLayout.tsx — never imported

**What:** `src/components/layout/MobileLayout.tsx` (39 lines). A layout shell with Header + BottomNav + AdminPinModal. Zero imports across the entire `src/` tree. `Layout.tsx` is the actual shell used by `App.tsx`.

**Replacement:** Delete. If mobile-specific layout was planned, it was never wired.

**Lines saved:** ~39

---

### 6. delete: PlaceholderPage.tsx — never imported

**What:** `src/components/layout/PlaceholderPage.tsx` (18 lines). Shows "Page under construction" based on route. No route in `App.tsx` references it.

**Replacement:** Delete. If needed later, create on-demand.

**Lines saved:** ~18

---

### 7. [RESOLVED] ForceUpdateModal.tsx & versionCheckService.ts

**Status:** Integrated. `ForceUpdateModal.tsx` has been created, wired into `App.tsx`, and connected to `versionCheckService.ts` and `featureFlags.ts` (`ENABLE_VERSION_CHECK`).

---

### 8. featureFlags.ts — active configuration

**Status:** `featureFlags.ts` has been created as the centralized feature toggle module (`src/config/featureFlags.ts`).
- `ENABLE_VERSION_CHECK` controls update popups.
- `ENABLE_REVIEW_PROMPT` controls rating prompt popups.


### 9. delete: AlertModal.tsx — redundant with Modal.tsx

**What:** `src/components/design-system/AlertModal.tsx` (91 lines). Wraps `@headlessui/react` `Dialog` + `Transition` with `PrimaryButton`/`SecondaryButton`. `Modal.tsx` (71 lines) does the same thing with identical API shape (`isOpen`, `onClose`, `title`, `children`). Both are exported from the same `index.ts`.

**Replacement:** Delete `AlertModal.tsx`. Migrate its 7 callers (`AdminTaskForm`, `AdminRewards`, `AdminTasks`, `CategoryManagement`, `Settings`, `Playground`, `index.ts`) to use `Modal` instead.

**Lines saved:** ~91

---

### 10. delete: design-system/Modal.tsx — single caller, could inline headlessui

**What:** `src/components/design-system/Modal.tsx` (71 lines). Only used by `ExemptionModal.tsx`. Wraps `@headlessui/react` with `FaTimes` icon and preset sizing.

**Replacement:** Inline the headlessui `Dialog` + `Transition` directly in `ExemptionModal.tsx`, or keep `Modal.tsx` if the design-system abstraction is valued. Low priority; included because `AlertModal` deletion makes this the last wrapper.

**Lines saved:** ~71 (optional)

---

### 11. delete: error.ts — AppError thrown once, never caught meaningfully

**What:** `src/types/error.ts` (18 lines). Defines `ErrorCode` union and `AppError` class. Used exactly once: `localStorageService.restoreBackup` throws it on validation failure. The caller (`importData` in store) catches generically and returns `{ error }`. No user-facing error display uses the `code` field.

**Replacement:** Replace with plain `Error` with message, or drop the throw and return `{ success: false, error: string }`. If zod validation is the only source of errors, zod's own errors suffice.

**Lines saved:** ~18

---

### 12. yagni: browserService.ts — single caller, wrapper over Capacitor

**What:** `src/services/browserService.ts` (36 lines). `openUrl` wraps `Capacitor.isNativePlatform()` branching + `@capacitor/browser`. Called once in `App.tsx` (`handleRateNow`).

**Replacement:** Inline the branching in `App.tsx`. The abstraction is justified only if more URLs are opened; currently there's one call site.

**Lines saved:** ~36 (optional, low impact)

---

### 13. yagni: backupUtils.ts BackupData interface — duplicates zod schema

**What:** `src/utils/backupUtils.ts` defines `BackupData` interface (11 lines) that mirrors `backupSchema.ts` zod schema. `validateBackupData` is only called in `Settings.tsx` and just checks `version` + array presence — zod's `safeParse` already does this.

**Replacement:** Remove `BackupData` and `validateBackupData`. Use `backupSchema.safeParse` directly in `Settings.tsx`.

**Lines saved:** ~25

---

### 14. stdlib: daysBetween in reviewPromptUtils.ts — hand-rolled date diff

**What:** `src/utils/reviewPromptUtils.ts` defines `daysBetween` (5 lines) computing diff in milliseconds / 86400000. No timezone handling, no edge cases.

**Replacement:** `Math.ceil((to.getTime() - from.getTime()) / 86_400_000)` inline, or `date-fns` `differenceInDays` if that dep is added.

**Lines saved:** ~5

---

### 15. native: @capacitor/splash-screen — in deps, never imported

**What:** `@capacitor/splash-screen` in `package.json` (dep version `^7.0.3`). Zero imports across `src/`. Splash screen is platform-default; the app doesn't customize it.

**Replacement:** Remove from `package.json`. If a custom splash screen is needed later, re-add.

**Deps saved:** 1

---

### 16. shrink: analytics.ts — duplicated filter/reduce patterns

**What:** `src/utils/analytics.ts` (553 lines). `calculateCoinMetrics` and `getRedemptionRatio` both filter `amount > 0` / `amount < 0` and reduce. `getSuccessRatio` has 250+ lines with repeated log-filtering loops. `getRecommendations` iterates logs 4 separate times.

**Replacement:** Extract a `filterLogsByStatus` helper, combine coin metrics into one pass, dedupe the daily-quest/achievement claim checks. Estimated cut: ~60-80 lines without losing behavior.

**Lines saved:** ~60-80 (refactor, not delete)

---

## Summary

| Tag | Count | Lines saved |
|-----|-------|-------------|
| delete | 11 findings | ~660+ |
| yagni | 2 findings | ~60 (optional) |
| stdlib | 1 finding | ~5 |
| native | 1 finding | 1 dep |
| shrink | 1 finding | ~60-80 |

**net: -660+ lines, -1 dep possible.**

---

## Recommended order

1. Delete `dataService.ts` + wire callers → biggest structural win, removes the phantom Supabase layer.
2. Delete `test_analytics.ts` + `StreakCelebrationModal.tsx` → pure dead code.
3. Delete `MobileLayout.tsx`, `PlaceholderPage.tsx`, `ForceUpdateModal.tsx` → untracked/unused.
4. Clean up `featureFlags.ts` dead flags.
5. Merge `AlertModal` into `Modal` → design-system consolidation.
6. Inline `browserService` → yagni removal.
7. Refactor `analytics.ts` → shrink, lowest priority.
