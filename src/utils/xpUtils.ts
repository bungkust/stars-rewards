import type { Task, XpTransaction } from '../types';

export interface LevelProgress {
    totalXp: number;
    level: number;
    levelName: string;
    currentLevelXp: number;
    nextLevelXp: number;
    xpIntoLevel: number;
    xpNeededForNextLevel: number;
    progressPercent: number;
}

const LEVEL_NAMES: Record<number, string> = {
    1: 'Rookie',
    2: 'Helper',
    3: 'Explorer',
    4: 'Star Builder',
    5: 'Champion',
    10: 'Legend'
};

export const getMissionXpValue = (task?: Task): number => {
    if (!task) return 10;
    return task.total_target_value && task.total_target_value > 1 ? 15 : 10;
};

export const getXpRequiredForLevel = (level: number): number => {
    if (level <= 1) return 0;
    const fixedCurve: Record<number, number> = {
        2: 50,
        3: 125,
        4: 225,
        5: 350
    };

    if (fixedCurve[level] !== undefined) {
        return fixedCurve[level];
    }

    return 350 + ((level - 5) * 150);
};

export const getLevelName = (level: number): string => {
    if (LEVEL_NAMES[level]) return LEVEL_NAMES[level];
    if (level >= 10) return LEVEL_NAMES[10];
    return 'Champion';
};

export const calculateLevelProgress = (totalXp: number): LevelProgress => {
    let level = 1;
    while (totalXp >= getXpRequiredForLevel(level + 1)) {
        level += 1;
    }

    const currentLevelXp = getXpRequiredForLevel(level);
    const nextLevelXp = getXpRequiredForLevel(level + 1);
    const xpIntoLevel = Math.max(0, totalXp - currentLevelXp);
    const xpNeededForNextLevel = Math.max(0, nextLevelXp - totalXp);
    const levelSpan = Math.max(1, nextLevelXp - currentLevelXp);

    return {
        totalXp,
        level,
        levelName: getLevelName(level),
        currentLevelXp,
        nextLevelXp,
        xpIntoLevel,
        xpNeededForNextLevel,
        progressPercent: Math.min(100, Math.round((xpIntoLevel / levelSpan) * 100))
    };
};

export const getTotalXpForChild = (xpTransactions: XpTransaction[], childId: string): number => {
    return xpTransactions
        .filter(transaction => transaction.child_id === childId)
        .reduce((total, transaction) => total + transaction.amount, 0);
};
