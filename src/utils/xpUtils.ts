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

export interface LevelReward {
    level: number;
    title: string;
    description: string;
}

const LEVEL_NAMES: Record<number, string> = {
    1: 'Rookie',
    2: 'Helper',
    3: 'Explorer',
    4: 'Star Builder',
    5: 'Champion',
    10: 'Legend',
    15: 'Trailblazer',
    20: 'Guardian',
    25: 'Hero',
    30: 'Master',
    40: 'Grandmaster',
    50: 'Mythic',
    75: 'Epic',
    100: 'Star Legend'
};

const LEVEL_REWARDS: Record<number, LevelReward[]> = {
    2: [{ level: 2, title: 'Helper Badge', description: 'A new badge for starting strong.' }],
    3: [{ level: 3, title: 'Explorer Avatar Frame', description: 'Unlock an Explorer frame for the profile card.' }],
    4: [{ level: 4, title: 'Star Builder Title', description: 'Unlock a title/name tag for the child profile.' }],
    5: [{ level: 5, title: 'Streak Freeze', description: 'Unlock 1 future Streak Freeze power-up.' }],
    10: [{ level: 10, title: 'Legend Theme', description: 'Unlock a special theme milestone.' }],
    15: [{ level: 15, title: 'Trailblazer Badge', description: 'A badge for staying consistent after the early levels.' }],
    20: [{ level: 20, title: 'Guardian Frame', description: 'Unlock a stronger profile frame for long-running habits.' }],
    25: [{ level: 25, title: 'Hero Title', description: 'Unlock a heroic name tag for the child profile.' }],
    30: [{ level: 30, title: 'Golden Badge', description: 'A premium badge for major habit progress.' }],
    35: [{ level: 35, title: 'Momentum Streak Freeze', description: 'Unlock another future Streak Freeze power-up.' }],
    40: [{ level: 40, title: 'Grandmaster Frame', description: 'A high-level frame for serious consistency.' }],
    45: [{ level: 45, title: 'Focus Badge', description: 'A badge for keeping momentum across many missions.' }],
    50: [{ level: 50, title: 'Mythic Theme', description: 'Unlock a special long-term progress theme.' }],
    60: [{ level: 60, title: 'Champion Crown', description: 'A rare cosmetic for a very strong habit journey.' }],
    75: [{ level: 75, title: 'Epic Hall Badge', description: 'A badge reserved for exceptional consistency.' }],
    100: [{ level: 100, title: 'Star Legend Theme', description: 'The top milestone theme for Star Habit legends.' }]
};

export const getMissionXpValue = (task?: Task): number => {
    if (!task) return 10;
    if (typeof task.xp_reward === 'number' && task.xp_reward >= 0) return task.xp_reward;
    return task.total_target_value && task.total_target_value > 1 ? 15 : 10;
};

export const getDefaultMissionXpValue = (isProgressTask: boolean): number => {
    return isProgressTask ? 15 : 10;
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
    if (level >= 100) return LEVEL_NAMES[100];
    if (level >= 75) return LEVEL_NAMES[75];
    if (level >= 50) return LEVEL_NAMES[50];
    if (level >= 40) return LEVEL_NAMES[40];
    if (level >= 30) return LEVEL_NAMES[30];
    if (level >= 25) return LEVEL_NAMES[25];
    if (level >= 20) return LEVEL_NAMES[20];
    if (level >= 15) return LEVEL_NAMES[15];
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

export const getLevelRewards = (level: number): LevelReward[] => {
    return LEVEL_REWARDS[level] || [];
};

export const getNextLevelReward = (currentLevel: number): LevelReward | null => {
    const nextRewardLevel = Object.keys(LEVEL_REWARDS)
        .map(Number)
        .filter(level => level > currentLevel)
        .sort((a, b) => a - b)[0];

    if (!nextRewardLevel) return null;
    return LEVEL_REWARDS[nextRewardLevel][0] || null;
};

export const getLevelRewardsBetween = (fromLevel: number, toLevel: number): LevelReward[] => {
    const rewards: LevelReward[] = [];
    for (let level = fromLevel + 1; level <= toLevel; level += 1) {
        rewards.push(...getLevelRewards(level));
    }
    return rewards;
};

export const getTotalXpForChild = (xpTransactions: XpTransaction[], childId: string): number => {
    return xpTransactions
        .filter(transaction => transaction.child_id === childId)
        .reduce((total, transaction) => total + transaction.amount, 0);
};
