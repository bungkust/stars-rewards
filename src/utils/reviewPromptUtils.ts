import { Capacitor } from '@capacitor/core';
import type { AppState } from '../store/useAppStore';
import { getLocalDateString } from './timeUtils';

export type ReviewPromptTrigger = 'mission_approved' | 'reward_redeemed' | 'streak_milestone' | 'manual' | 'app_launch';
export type ReviewPromptChoice = 'rated' | 'later' | 'dismissed';

const REVIEW_COOLDOWN_DAYS = 14;
const MIN_FAMILY_AGE_DAYS = 3;
const MIN_VERIFIED_MISSIONS = 5;

const daysBetween = (from: Date, to: Date): number => {
    const start = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
    const end = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
    return Math.floor((end - start) / 86_400_000);
};

const getFamilyAgeDays = (state: AppState): number => {
    const createdAt = state.userProfile?.created_at;
    if (!createdAt) return 0;
    return Math.max(0, daysBetween(new Date(createdAt), new Date()));
};

export const getReviewUrl = (): string => {
    if (import.meta.env.VITE_APP_REVIEW_URL) {
        return import.meta.env.VITE_APP_REVIEW_URL;
    }
    // Direct link to Play Store app on Android
    if (Capacitor.getPlatform() === 'android') {
        return 'market://details?id=com.kulinotech.starhabit';
    }
    return 'https://play.google.com/store/apps/details?id=com.kulinotech.starhabit';
};

export const getVerifiedMissionCount = (state: AppState): number => {
    return state.transactions.filter(transaction => transaction.type === 'TASK_VERIFIED').length;
};

import { FEATURE_FLAGS } from '../config/featureFlags';

export const shouldShowReviewPrompt = (state: AppState, trigger: ReviewPromptTrigger): boolean => {
    if (!FEATURE_FLAGS.ENABLE_REVIEW_PROMPT && trigger !== 'manual') return false;
    if (trigger === 'manual') return true;
    if (state.reviewPromptRated || state.reviewPromptDismissed) return false;
    if (state.reviewPromptVisible) return false;
    if (state.levelUpMilestone || state.streakMilestone || state.updateModalState?.isOpen) return false;
    if (state.onboardingStep !== 'completed') return false;
    if (getFamilyAgeDays(state) < MIN_FAMILY_AGE_DAYS) return false;

    // Daily Cap Check: Max 2 displays per day (except manual trigger)
    if (state.reviewPromptLastShownAt) {
        const todayStr = getLocalDateString();
        const lastShownDateStr = getLocalDateString(new Date(state.reviewPromptLastShownAt));
        if (lastShownDateStr === todayStr) {
            const todayCount = state.reviewPromptShownTodayCount || 0;
            if (todayCount >= 2) {
                return false;
            }
        }
    }

    if (trigger === 'app_launch') {
        return true;
    }

    if (state.reviewPromptLastShownAt) {
        const lastShownDate = new Date(state.reviewPromptLastShownAt);
        if (daysBetween(lastShownDate, new Date()) < REVIEW_COOLDOWN_DAYS) {
            return false;
        }
    }

    if (trigger === 'mission_approved') {
        return getVerifiedMissionCount(state) >= MIN_VERIFIED_MISSIONS;
    }

    if (trigger === 'reward_redeemed') {
        return state.transactions.some(transaction => transaction.type === 'REWARD_REDEEMED');
    }

    if (trigger === 'streak_milestone') {
        return true;
    }

    return false;
};

export const getReviewPromptSnoozeDate = (): string => {
    return getLocalDateString();
};
