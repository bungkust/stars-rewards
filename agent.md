# Star Habit Agent Rules

This repository is a React/Vite/TypeScript offline-first mobile app wrapped with Capacitor. Follow these rules when making changes.

## Language Policy

- All UI copy, labels, notifications, modal text, and string constants visible to users must be in **English only**. Never use Indonesian (or any other language) in user-facing strings.

## Stack

- App: React 19, Vite 7, TypeScript strict mode.
- Routing: `react-router-dom` v7.
- State: Zustand with `persist`, centered in `src/store/useAppStore.ts`.
- Data: offline local database in `src/services/localStorageService.ts`, exposed through `src/services/dataService.ts`.
- Styling: Tailwind CSS 3, DaisyUI 4, custom `childTheme` and `parentTheme`.
- UI/motion: Headless UI, Framer Motion, React Icons, Phosphor Icons.
- Native: Capacitor 7 for Android/iOS, including App, Browser, Device, Filesystem, Local Notifications, Status Bar, Share, Splash Screen, and native biometric auth.
- Validation/analytics: Zod backup schema, Recharts, local analytics utilities.

## Product Model

- Star Habit is an offline-first family habit and reward app.
- The core loop is: child completes mission -> parent verifies -> child earns stars -> child redeems rewards.
- Parent mode is protected by PIN, pattern, or biometric authentication.
- Child mode should remain simple, fast, and forgiving.
- Preserve the privacy promise: no account requirement and no server dependency unless explicitly requested.

## Architecture Rules

- Keep app-wide state changes in `useAppStore`; do not create competing global state systems.
- Use `dataService` from UI/store code, and keep storage details inside `localStorageService`.
- Treat `localStorageService` as the source of truth for persisted app data.
- Keep domain logic for recurrence, missed missions, streaks, and exemptions in service or utility modules, not inside page JSX.
- When adding a field to `Task`, `Reward`, `Child`, `Profile`, `ChildTaskLog`, or `CoinTransaction`, update all relevant places:
  - `src/types/index.ts`
  - create/update methods in `useAppStore`
  - persistence in `localStorageService`
  - backup/restore schema and migration paths
  - UI forms and detail/history displays
- Be careful with the two persisted stores: `stars-rewards-db` for app data and `stars-rewards-storage` for Zustand state. Restore/reset flows must keep them in sync.

## React And TypeScript Rules

- Keep TypeScript strict-clean. Avoid `any` unless interacting with legacy data or third-party APIs where narrowing is impractical.
- Prefer typed helpers over repeated inline object-shaping in components.
- Use React hooks only at the top level of components or custom hooks.
- Keep derived lists in `useMemo` when filtering/sorting tasks, rewards, logs, or transactions.
- Avoid large new components inside page files when the UI is reusable or behavior-heavy.
- Do not bypass existing modals, design-system components, and layout conventions unless there is a clear reason.

## Offline Data Rules

- Never assume network access for core product flows.
- All mission completion, verification, balance, reward redemption, history, backup, and restore features must work offline.
- Do not add remote sync, analytics upload, or cloud storage without explicit product approval.
- Preserve referential integrity between children, tasks, rewards, logs, and transactions.
- When deleting a child, task, reward, category, transaction, or log, account for dependent state and history.
- For balance-changing operations, update both child balance and transaction history together.
- Prevent double-crediting verified tasks and double-spending reward redemptions.

## Mission Rules

- Mission statuses are meaningful. Preserve these semantics:
  - `PENDING`: child submitted, waiting for parent.
  - `VERIFIED`: parent approved, stars awarded.
  - `REJECTED`: parent rejected, child may retry.
  - `FAILED`: missed deadline or missed day.
  - `PENDING_EXCUSE`: child requested skip/exemption.
  - `EXCUSED`: parent approved skip, no stars, streak preserved.
  - `IN_PROGRESS`: progress mission has partial completion.
- Recurrence must use local date boundaries from `src/utils/timeUtils.ts`.
- Avoid `toISOString().split('T')[0]` for user-facing day logic when local-date helpers are available.
- Changing recurrence logic requires checking:
  - today's mission list
  - yesterday catch-up
  - missed mission checks
  - expiry time handling
  - backup import behavior

## Reward Rules

- Reward types are:
  - `UNLIMITED`: can be redeemed repeatedly.
  - `ONE_TIME`: can be redeemed once per child.
  - `ACCUMULATIVE`: unlocks through verified completions of a required mission.
- Reward redemption must verify child assignment, affordability, locked/unlocked status, and one-time redemption history.
- If reward cost is `0`, treat it as claimable but still record redemption history when appropriate.

## UI And Design Rules

- Strictly respect the mode color split:
  - Child mode (`/child/*`): uses `childTheme` (Sky Blue `#38BDF8`, Deep Navy `#013576`, Warm Gold `#FFD580`, White `#FFFFFF`).
  - Parent mode (`/parent/*`, `/settings/*`, parent modals): uses `parentTheme` (Sage Green `#ABC270`, Dark Brown `#463C33`, Off-white `#F9FAFB`). Never use child's bright sky blue in parent mode.
- Keep child UI playful and clear; keep parent UI operational and scannable.
- Bottom Navigation has 5 tabs for child mode: `Home`, `Missions`, `Champ` (`/child/loyalty`), `Rewards`, `Stats`.
- Child Champ page (`/child/loyalty`):
  - Uses child theme tokens (Deep Navy text, Sky Blue progress/buttons, Gold star badges).
  - Swipable 5-tier cosmic membership card (Bulan → Galaksi).
  - Vertical list of streak challenge cards matching the reference layout (coin badge, title, description, dashed divider, progress numbers, bar, claim CTA).
- Parent Mode Streak Settings:
  - Parents can manually adjust child streak (`current_streak` and `best_streak`) inside `EditChildModal` using parent theme styling (sage green accents, dark brown labels).
- Use existing shared components from `src/components/design-system` where possible.
- Use the existing page structure:
  - shared wrappers: `Dashboard.tsx`, `Tasks.tsx`, `Rewards.tsx`, `Stats.tsx`
  - parent pages under `src/pages/admin`
  - child pages under `src/pages/child`
  - settings under `src/pages/settings`
- Preserve safe-area handling for mobile layouts.
- Avoid adding text-heavy instructional UI unless the flow truly needs it.
- Use existing icon utilities in `src/utils/icons.ts` for task and reward icon mapping.


## Capacitor Rules

- Guard native APIs with `Capacitor.isNativePlatform()` or device/platform checks.
- Web fallback must remain usable for development.
- After changing native-facing behavior, consider Android/iOS impact and run the relevant Capacitor sync/build when dependencies are available.
- Local notification scheduling must respect the settings toggles in `useAppStore`.
- Filesystem backup must keep working on web and native.

## Backup And Restore Rules

- Backup files must contain enough data to fully restore family state offline.
- Restore must validate data before replacing local state.
- Restore should preserve or migrate legacy backup fields where possible.
- Importing backup data must avoid immediately creating false missed-mission failures.
- If changing backup shape, update versioning/migration logic and document it.

## Security Rules

- Parent-only pages and settings should remain protected by `AdminPinModal`.
- Do not expose parent actions from child mode without authentication.
- PIN, pattern, and biometric preference flows must stay interchangeable.
- If improving credential storage, prefer native secure storage/keychain patterns while preserving offline operation.

## Verification Commands

- Install dependencies first if `node_modules` is missing: `npm install`.
- Typecheck/build: `npm run build`.
- Lint: `npm run lint`.
- Dev server: `npm run dev`.
- Android debug build: `npm run build:android`.

## Known Watch Points

- Newly added task/reward fields must be persisted in `localStorageService`, not only stored in React form state.
- Local date handling is easy to break; prefer `getLocalDateString`, `getTodayLocalStart`, and `getLocalStartOfDay`.
- Transaction deletion reverts balances and may reset task logs; check history and balance after changes.
- Auto-approve of pending tasks after 24 hours exists in `checkPendingAutoApprove`; confirm product intent before changing it.
- Streak celebration UI is currently disabled in routes; do not assume milestone modals are visible.
