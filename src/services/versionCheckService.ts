import { Capacitor } from '@capacitor/core';
import { getReviewUrl } from '../utils/reviewPromptUtils';

export interface VersionConfig {
  minVersion: string;      // Below this version = Force Update
  latestVersion: string;   // Below this version but >= minVersion = Optional Update
  releaseNotes?: string;
  storeUrl?: string;
}

export interface VersionCheckResult {
  isForceUpdate: boolean;
  isOptionalUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  minVersion: string;
  releaseNotes?: string;
  storeUrl: string;
}

// Current App Version (matches package.json & android build)
export const CURRENT_APP_VERSION = '1.3.7';

/**
 * Compares two semver strings (e.g. "1.3.7" vs "1.4.0").
 * Returns:
 *   1 if v1 > v2
 *  -1 if v1 < v2
 *   0 if v1 === v2
 */
export const compareVersions = (v1: string, v2: string): number => {
  const parts1 = v1.split('.').map(n => parseInt(n, 10) || 0);
  const parts2 = v2.split('.').map(n => parseInt(n, 10) || 0);

  const maxLength = Math.max(parts1.length, parts2.length);

  for (let i = 0; i < maxLength; i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
};

import { FEATURE_FLAGS } from '../config/featureFlags';

/**
 * Check if current app version requires a force or optional update.
 */
export const checkVersionStatus = async (
  remoteConfigFetcher?: () => Promise<VersionConfig | null>
): Promise<VersionCheckResult> => {
  if (!FEATURE_FLAGS.ENABLE_VERSION_CHECK) {
    return {
      isForceUpdate: false,
      isOptionalUpdate: false,
      currentVersion: CURRENT_APP_VERSION,
      latestVersion: CURRENT_APP_VERSION,
      minVersion: CURRENT_APP_VERSION,
      storeUrl: getReviewUrl(),
    };
  }
  let config: VersionConfig | null = null;

  if (remoteConfigFetcher) {
    try {
      config = await remoteConfigFetcher();
    } catch (err) {
      console.warn('Failed to fetch remote version config:', err);
    }
  }

  // Fallback / default version config if no remote fetcher is provided
  if (!config) {
    config = {
      minVersion: '1.3.7',
      latestVersion: '1.3.7',
      releaseNotes: 'Includes security updates, target API 36 updates, performance enhancements, and bug fixes.',
      storeUrl: getReviewUrl(),
    };
  }

  const current = CURRENT_APP_VERSION;
  const isForceUpdate = compareVersions(current, config.minVersion) < 0;
  const isOptionalUpdate = !isForceUpdate && compareVersions(current, config.latestVersion) < 0;

  return {
    isForceUpdate,
    isOptionalUpdate,
    currentVersion: current,
    latestVersion: config.latestVersion,
    minVersion: config.minVersion,
    releaseNotes: config.releaseNotes,
    storeUrl: config.storeUrl || getReviewUrl(),
  };
};

export const redirectToStore = (customUrl?: string) => {
  const url = customUrl || getReviewUrl();
  if (Capacitor.isNativePlatform()) {
    window.location.href = url;
  } else {
    window.open(url, '_blank');
  }
};
