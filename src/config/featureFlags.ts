/**
 * Feature Flags Configuration
 * Centralized toggles to enable or disable features across Star Habit.
 */
export const FEATURE_FLAGS = {
  /** Enable Version Update Checking & Force/Optional Update Popups */
  ENABLE_VERSION_CHECK: false,

  /** Enable In-App Review & Rating Prompt Modal */
  ENABLE_REVIEW_PROMPT: true,

  /** Enable Level Up Celebration Modal when child earns XP milestones */
  ENABLE_LEVEL_UP_MODAL: true,

  /** Enable Streak Milestone Celebration Modal */
  ENABLE_STREAK_CELEBRATION: false,

  /** Enable Biometric Authentication (Fingerprint / Face ID) */
  ENABLE_BIOMETRIC_AUTH: true,

  /** Enable Design System Playground Page (Dev mode only) */
  ENABLE_PLAYGROUND_PAGE: import.meta.env.DEV,

  /**
   * Enable Gamification Progress Menu (Daily Quests, Achievements, XP History,
   * Personal League, Rewards Shelf). Set to true when the revamp is ready to ship.
   */
  ENABLE_PROGRESS_MENU: true,
} as const;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;

/**
 * Check if a specific feature flag is currently enabled.
 */
export const isFeatureEnabled = (flag: FeatureFlagKey): boolean => {
  return FEATURE_FLAGS[flag] ?? false;
};
