# Changelog

All notable changes to the Star Habit project will be documented in this file.

## [Unreleased] - Post 1.3.4

### Added
- **Multi-Factor Authentication**: Parents can now choose between three admin unlock methods — **PIN**, **Pattern Lock** (gesture grid), and **Biometric** (fingerprint/face). Preferred method is persisted per device.
- **Pattern Lock (`PatternLock.tsx`)**: New gesture-based pattern input screen as an alternative to numeric PIN for entering Parent Mode.
- **Biometric Authentication**: Opt-in biometric unlock via device hardware (fingerprint/face ID), toggled in Security Settings with an explicit consent flow.
- **Security Settings Page** (`/settings/security`): Dedicated screen to manage PIN change, Pattern Lock setup, and Biometric toggle — accessible from the main Settings page.
- **Push Notifications**: Parent receives local push notifications when a child submits a task for verification or requests an exemption. Notification badge shows total pending count. Toggleable in Settings.
- **Backup & Restore**: Parents can export all family data to a timestamped JSON file (`StarsRewards_Family_Children_Date_Time.json`) and restore it on any device. Restore flow includes a validation step and confirmation modal.
- **Category Management** (`/admin/categories`): Parents can create, rename, and delete task categories. Each category has a name and icon. Default seeded categories: Hygiene, Time, Responsibility, Skill, Family, Social, Dressing, Emotion.
- **Child Avatar & Name Editing**: Parents can edit a child's name and avatar directly from Settings via `EditChildModal`. Avatar selection modal (`AvatarSelectionModal.tsx`) replaced simple URL input.
- **Multi-Child Task Assignment**: Tasks can now be assigned to specific children via `assigned_to` field. Tasks without an assignment are shown to all children (backward-compatible).
- **Manual Star Adjustment** (`StarAdjustmentModal`): Parents can manually add or deduct stars from any child's balance with a required reason — supports bulk adjustment across all children simultaneously.
- **Exemption / Excuse Request Workflow**: Children can submit an exemption request for a task with an optional reason. Parent can **Approve** (counts for streak, awards 0 stars) or **Reject** from the Verification Center on the Dashboard.
- **Auto-Approve Logic**: Tasks pending verification for more than 24 hours are automatically approved to prevent permanent backlog.
- **App Resume Data Refresh**: App listens to foreground/background state via Capacitor. On resume, data is refreshed automatically to catch missed daily missions.
- **Task Progress Tracking** (`updateTaskProgress`): Tasks with multi-completion targets (e.g., "Read 3 chapters") now track incremental progress per day. Status transitions: `IN_PROGRESS` → `PENDING` on full completion.
- **Compliment on Missed Day** (`completeTaskOnDate`): Parents can retroactively log a task as completed for a specific past date.
- **Mark Verified Task as Failed**: Admins can retroactively mark an already-verified task as failed, reversing the star award.
- **Data Import/Export API** (`importData`): Full app state can be imported programmatically, used internally by the Restore flow.
- **App Version Display**: Settings page dynamically reads and displays the current app version from Capacitor's native layer on Android/iOS.

### Changed
- **Settings Page Restructured**: Now organized into dedicated sections: Family Information, Notifications, Security (new), Customization, Data Management, Legal & Policy, and Danger Zone.
- **Admin Dashboard Unified**: The "Verification Center" now shows both pending task approvals and pending exemption requests in a single merged queue, each with contextual action buttons.
- **Child Profile Delete**: Moved to the "Danger Zone" section within Settings with a confirmation modal.

## [1.3.6] - 2026-04-15

### Fixed
- **Backup Persistence**: Resolved a data loss issue where task and reward `description` fields were being stripped during export/import cycles.
- **Streak Data Stability**: Fixed a critical timing bug in the import process that caused streaks to reset to 0 immediately when restoring ancient backups. Streaks are now "frozen" on the day of import to ensure they survive restoration for testing.
- **Universal Descriptions**: Mission descriptions are now visible in **Yesterday's Unfinished** and **Rewards Shop** list views for better context.
- **Consolidated Celebrations**: Streak milestone popups (3, 7, 14 days, etc.) now trigger globally, including when tasks are completed via the "My Missions" menu.

### Changed
- **Feature Suppression**: Hid the Streak UI (Fire badges, streak counters, and celebration popups) across the entire application (both child and admin interfaces) per user request. The logic and data remain in place for future re-activation.

## [1.3.5] - 2026-04-15

### Fixed
- **Admin Details Popups**: Refactored management lists to solve event bubbling issues. Mission and Reward cards in the parent view are now correctly clickable to open details popups without conflicting with Edit/Delete actions.
- **Build stability**: Resolved several TypeScript lint errors to ensure successful Android builds.

## [1.3.4] - 2026-03-27

### Added
- **Mission & Reward Descriptions**: Parents can now add detailed descriptions to missions and rewards.
- **Universal Details Popups**:
    - Mission cards (Admin, Child Dashboard, Child Today/Yesterday tasks) are now fully clickable to view descriptions and details in a popup.
    - Reward cards (Admin & Child Shop) are now clickable to view descriptions.
- **Improved Reward Experience**:
    - Children can see reward descriptions even with insufficient stars.
    - Motivational "Not enough stars" message instead of a blocking alert.

### Changed
- **Unified Minimalist UI**: Descriptions are hidden from all list views (both Admin and Child) to maintain a sleek and consistent aesthetic.
- **Refinement**: Descriptions are now exclusively surfaced via beautiful, centered popups.

## [1.3.1] - 2026-03-25

### Fixed
- **Yesterday's Missions**: Resolved a bug where completion/progress buttons disappeared for tasks with multiple daily targets in the "Yesterday's Unfinished Missions" section.
- **Progress Tracking**: Improved consistency of progress bars for multi-completion tasks across different statuses.

## [1.3.0] - 2025-03-24

### Added
- **UX Overhaul**: Significant improvements to layout, transitions, and overall visual polish.
- **English Localization**: Comprehensive update to ensure a professional and consistent English user experience.
- **Enhanced Navigation**: Smoother transitions between Admin and Child modes.

### Changed
- **Version Release**: Consolidated several features and fixes into a stable 1.3.0 release.
