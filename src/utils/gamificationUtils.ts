import type { ChildTaskLog, CoinTransaction, Task, XpTransaction } from '../types';
import { getLocalDateString } from './timeUtils';
import { calculateLevelProgress, getLevelRewards, getTotalXpForChild, type LevelReward } from './xpUtils';

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  current: number;
  target: number;
  isComplete: boolean;
  isClaimed: boolean;
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  starReward: number;
}

export interface UnlockedAchievement extends AchievementDefinition {
  unlocked: boolean;
  progress: number;
  target: number;
  isStarClaimed?: boolean;
}

export interface InventoryUnlock {
  id: string;
  title: string;
  description: string;
  kind: 'badge' | 'title' | 'frame' | 'theme' | 'powerup' | 'achievement';
  source: string;
  icon: string;
}

export interface PersonalLeagueStatus {
  tier: string;
  weeklyXp: number;
  nextTier: string | null;
  xpToNextTier: number;
  progressPercent: number;
}

const ACHIEVEMENTS: AchievementDefinition[] = [
  { id: 'first-approved', title: 'First Star', description: 'Get your first approved mission.', icon: '⭐', xpReward: 5, starReward: 1 },
  { id: 'five-approved', title: 'Mission Starter', description: 'Finish 5 approved missions.', icon: '🚀', xpReward: 10, starReward: 2 },
  { id: 'ten-approved', title: 'Habit Builder', description: 'Finish 10 approved missions.', icon: '🏅', xpReward: 15, starReward: 3 },
  { id: 'twenty-five-approved', title: 'Mission Pro', description: 'Finish 25 approved missions.', icon: '🎯', xpReward: 25, starReward: 5 },
  { id: 'fifty-approved', title: 'Routine Master', description: 'Finish 50 approved missions.', icon: '🏆', xpReward: 40, starReward: 8 },
  { id: 'hundred-approved', title: 'Hundred Club', description: 'Finish 100 approved missions.', icon: '💯', xpReward: 75, starReward: 12 },
  { id: 'three-day-streak', title: 'Three Day Spark', description: 'Reach a 3 day streak on a mission.', icon: '🔥', xpReward: 10, starReward: 2 },
  { id: 'seven-day-streak', title: 'Week Warrior', description: 'Reach a 7 day streak on a mission.', icon: '🔥', xpReward: 25, starReward: 5 },
  { id: 'fourteen-day-streak', title: 'Two Week Flame', description: 'Reach a 14 day streak on a mission.', icon: '🔥', xpReward: 40, starReward: 8 },
  { id: 'thirty-day-streak', title: 'Monthly Legend', description: 'Reach a 30 day streak on a mission.', icon: '🔥', xpReward: 100, starReward: 15 },
  { id: 'level-five', title: 'Champion Path', description: 'Reach Level 5.', icon: '🏆', xpReward: 25, starReward: 5 },
  { id: 'level-ten', title: 'Legend Path', description: 'Reach Level 10.', icon: '🏆', xpReward: 50, starReward: 10 },
  { id: 'level-twenty-five', title: 'Hero Path', description: 'Reach Level 25.', icon: '🏆', xpReward: 100, starReward: 20 },
  { id: 'level-fifty', title: 'Mythic Path', description: 'Reach Level 50.', icon: '🏆', xpReward: 150, starReward: 30 },
  { id: 'xp-500', title: '500 XP Journey', description: 'Earn 500 total XP.', icon: '⚡', xpReward: 20, starReward: 4 },
  { id: 'xp-1000', title: '1000 XP Journey', description: 'Earn 1000 total XP.', icon: '⚡', xpReward: 40, starReward: 8 },
  { id: 'xp-2500', title: '2500 XP Journey', description: 'Earn 2500 total XP.', icon: '⚡', xpReward: 80, starReward: 15 },
  { id: 'progress-five', title: 'Progress Builder', description: 'Finish 5 progress missions.', icon: '📈', xpReward: 25, starReward: 5 }
];

export const LEAGUE_TIERS = [
  { name: 'Bronze', minXp: 0, icon: '🥉', desc: 'Pemula semangat baru' },
  { name: 'Silver', minXp: 75, icon: '🥈', desc: 'Konsistensi mulai terbentuk' },
  { name: 'Gold', minXp: 175, icon: '🥇', desc: 'Kebiasaan makin mantap' },
  { name: 'Diamond', minXp: 350, icon: '💎', desc: 'Bintang kebiasaan sejati' }
];

const getVerifiedLogsForChild = (logs: ChildTaskLog[], childId: string) =>
  logs.filter(log => log.child_id === childId && log.status === 'VERIFIED');

export const getDailyQuests = (
  childId: string,
  logs: ChildTaskLog[],
  tasks: Task[],
  xpTransactions: XpTransaction[],
  dateString = getLocalDateString()
): DailyQuest[] => {
  const todaysVerifiedLogs = getVerifiedLogsForChild(logs, childId).filter(log =>
    getLocalDateString(new Date(log.verified_at || log.completed_at)) === dateString
  );
  const approvedCount = todaysVerifiedLogs.length;
  const progressApprovedCount = todaysVerifiedLogs.filter(log => {
    const task = tasks.find(t => t.id === log.task_id);
    return !!task?.total_target_value && task.total_target_value > 1;
  }).length;

  const buildQuest = (id: string, title: string, description: string, xpReward: number, current: number, target: number): DailyQuest => ({
    id,
    title,
    description,
    xpReward,
    current: Math.min(current, target),
    target,
    isComplete: current >= target,
    isClaimed: xpTransactions.some(tx =>
      tx.child_id === childId &&
      tx.type === 'DAILY_QUEST' &&
      tx.reference_id === `${dateString}:${id}`
    )
  });

  return [
    buildQuest('first-mission', 'First Win', 'Get 1 mission approved today.', 5, approvedCount, 1),
    buildQuest('three-missions', 'Three Mission Day', 'Get 3 missions approved today.', 10, approvedCount, 3),
    buildQuest('progress-maker', 'Progress Maker', 'Finish 1 progress mission today.', 10, progressApprovedCount, 1)
  ];
};

export const getClaimableDailyQuests = (
  childId: string,
  logs: ChildTaskLog[],
  tasks: Task[],
  xpTransactions: XpTransaction[],
  dateString = getLocalDateString()
) => getDailyQuests(childId, logs, tasks, xpTransactions, dateString).filter(quest => quest.isComplete && !quest.isClaimed);

export const getUnlockedAchievements = (
  childId: string,
  logs: ChildTaskLog[],
  tasks: Task[],
  xpTransactions: XpTransaction[],
  transactions: CoinTransaction[] = []
): UnlockedAchievement[] => {
  const verifiedLogs = getVerifiedLogsForChild(logs, childId);
  const totalXp = getTotalXpForChild(xpTransactions, childId);
  const level = calculateLevelProgress(totalXp).level;
  const progressMissionCount = verifiedLogs.filter(log => {
    const task = tasks.find(t => t.id === log.task_id);
    return !!task?.total_target_value && task.total_target_value > 1;
  }).length;
  const maxStreak = tasks
    .filter(task => task.assigned_to.includes(childId))
    .reduce((best, task) => Math.max(best, task.best_streak || task.current_streak || 0), 0);

  const progressById: Record<string, { progress: number; target: number }> = {
    'first-approved': { progress: verifiedLogs.length, target: 1 },
    'five-approved': { progress: verifiedLogs.length, target: 5 },
    'ten-approved': { progress: verifiedLogs.length, target: 10 },
    'twenty-five-approved': { progress: verifiedLogs.length, target: 25 },
    'fifty-approved': { progress: verifiedLogs.length, target: 50 },
    'hundred-approved': { progress: verifiedLogs.length, target: 100 },
    'three-day-streak': { progress: maxStreak, target: 3 },
    'seven-day-streak': { progress: maxStreak, target: 7 },
    'fourteen-day-streak': { progress: maxStreak, target: 14 },
    'thirty-day-streak': { progress: maxStreak, target: 30 },
    'level-five': { progress: level, target: 5 },
    'level-ten': { progress: level, target: 10 },
    'level-twenty-five': { progress: level, target: 25 },
    'level-fifty': { progress: level, target: 50 },
    'xp-500': { progress: totalXp, target: 500 },
    'xp-1000': { progress: totalXp, target: 1000 },
    'xp-2500': { progress: totalXp, target: 2500 },
    'progress-five': { progress: progressMissionCount, target: 5 }
  };

  return ACHIEVEMENTS.map(achievement => {
    const criteria = progressById[achievement.id] || { progress: 0, target: 1 };
    const isStarClaimed = transactions.some(transaction =>
      transaction.child_id === childId &&
      transaction.type === 'MANUAL_ADJ' &&
      transaction.reference_id === `achievement:${achievement.id}`
    );

    return {
      ...achievement,
      progress: Math.min(criteria.progress, criteria.target),
      target: criteria.target,
      unlocked: criteria.progress >= criteria.target,
      isStarClaimed
    };
  });
};

export const getClaimableAchievementStarRewards = (
  childId: string,
  logs: ChildTaskLog[],
  tasks: Task[],
  xpTransactions: XpTransaction[],
  transactions: CoinTransaction[]
) => getUnlockedAchievements(childId, logs, tasks, xpTransactions, transactions)
  .filter(achievement => achievement.unlocked && !achievement.isStarClaimed && achievement.starReward > 0);

export const getClaimableAchievements = (
  childId: string,
  logs: ChildTaskLog[],
  tasks: Task[],
  xpTransactions: XpTransaction[]
) => getUnlockedAchievements(childId, logs, tasks, xpTransactions).filter(achievement =>
  achievement.unlocked &&
  !xpTransactions.some(tx =>
    tx.child_id === childId &&
    tx.type === 'ACHIEVEMENT' &&
    tx.reference_id === achievement.id
  )
);

const levelRewardToInventory = (reward: LevelReward): InventoryUnlock => {
  const normalized = reward.title.toLowerCase();
  const kind: InventoryUnlock['kind'] =
    normalized.includes('title') ? 'title' :
    normalized.includes('glow') ? 'frame' :
    normalized.includes('theme') ? 'theme' :
    normalized.includes('freeze') ? 'powerup' :
    'badge';

  return {
    id: `level-${reward.level}-${reward.title}`,
    title: reward.title,
    description: reward.description,
    kind,
    source: `Level ${reward.level}`,
    icon: kind === 'title' ? '🏷️' : kind === 'frame' ? '✨' : kind === 'theme' ? '🎨' : kind === 'powerup' ? '🧊' : '🏅'
  };
};

export const getInventoryUnlocks = (
  childId: string,
  logs: ChildTaskLog[],
  tasks: Task[],
  xpTransactions: XpTransaction[]
): InventoryUnlock[] => {
  const level = calculateLevelProgress(getTotalXpForChild(xpTransactions, childId)).level;
  const levelUnlocks: InventoryUnlock[] = [];

  for (let currentLevel = 2; currentLevel <= level; currentLevel += 1) {
    levelUnlocks.push(...getLevelRewards(currentLevel).map(levelRewardToInventory));
  }

  const achievementUnlocks = getUnlockedAchievements(childId, logs, tasks, xpTransactions)
    .filter(achievement => achievement.unlocked)
    .map(achievement => ({
      id: `achievement-${achievement.id}`,
      title: achievement.title,
      description: achievement.description,
      kind: 'achievement' as const,
      source: 'Achievement',
      icon: achievement.icon
    }));

  return [...levelUnlocks, ...achievementUnlocks];
};

export const getPersonalLeagueStatus = (
  childId: string,
  xpTransactions: XpTransaction[],
  date = new Date()
): PersonalLeagueStatus => {
  const day = date.getDay();
  const diffToMonday = (day + 6) % 7;
  const weekStart = new Date(date);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - diffToMonday);

  const weeklyXp = xpTransactions
    .filter(tx => tx.child_id === childId && new Date(tx.created_at) >= weekStart)
    .reduce((total, tx) => total + tx.amount, 0);

  const currentTierIndex = LEAGUE_TIERS.reduce((bestIndex, tier, index) =>
    weeklyXp >= tier.minXp ? index : bestIndex, 0);
  const tier = LEAGUE_TIERS[currentTierIndex];
  const nextTier = LEAGUE_TIERS[currentTierIndex + 1] || null;
  const xpToNextTier = nextTier ? Math.max(0, nextTier.minXp - weeklyXp) : 0;
  const currentFloor = tier.minXp;
  const nextFloor = nextTier?.minXp || Math.max(currentFloor + 1, weeklyXp);
  const progressPercent = nextTier
    ? Math.min(100, Math.round(((weeklyXp - currentFloor) / (nextFloor - currentFloor)) * 100))
    : 100;

  return {
    tier: tier.name,
    weeklyXp,
    nextTier: nextTier?.name || null,
    xpToNextTier,
    progressPercent
  };
};
