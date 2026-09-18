import {
  ArrowLeft,
  CheckCircle,
  ClockCounterClockwise,
  Crown,
  LockKey,
  Medal,
  ShieldCheck,
  Star,
  Sparkle,
  Trophy
} from '@phosphor-icons/react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import type { ChildTaskLog, Task, XpTransaction } from '../../types';
import {
  getDailyQuests,
  getInventoryUnlocks,
  getUnlockedAchievements,
  type InventoryUnlock
} from '../../utils/gamificationUtils';
import { calculateLevelProgress } from '../../utils/xpUtils';

const getXpSourceLabel = (transaction: XpTransaction, logs: ChildTaskLog[], tasks: Task[]) => {
  if (transaction.type === 'MISSION_APPROVED') {
    const log = logs.find(item => item.id === transaction.reference_id);
    const task = tasks.find(item => item.id === log?.task_id);
    return task ? task.name : 'Mission approved';
  }

  if (transaction.type === 'DAILY_QUEST') return 'Daily Quest';
  if (transaction.type === 'ACHIEVEMENT') return 'Achievement';
  if (transaction.type === 'STREAK_BONUS') return 'Streak Bonus';
  if (transaction.type === 'FAMILY_QUEST') return 'Family Quest';
  return 'XP Reward';
};

const getHistoryWithLevelUps = (childId: string, xpTransactions: XpTransaction[]) => {
  const childTransactions = xpTransactions
    .filter(transaction => transaction.child_id === childId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  let runningXp = 0;
  return childTransactions.map(transaction => {
    const beforeLevel = calculateLevelProgress(runningXp).level;
    runningXp += transaction.amount;
    const afterLevel = calculateLevelProgress(runningXp).level;

    return {
      ...transaction,
      reachedLevel: afterLevel > beforeLevel ? afterLevel : null
    };
  }).reverse();
};

const InventoryIcon = ({ item }: { item: InventoryUnlock }) => {
  const className = 'h-5 w-5';
  if (item.kind === 'title') return <Crown className={className} weight="fill" />;
  if (item.kind === 'frame') return <Sparkle className={className} weight="fill" />;
  if (item.kind === 'powerup') return <ShieldCheck className={className} weight="fill" />;
  if (item.kind === 'theme') return <Sparkle className={className} weight="fill" />;
  if (item.kind === 'achievement') return <Trophy className={className} weight="fill" />;
  return <Medal className={className} weight="fill" />;
};

const getInventoryRank = (item: InventoryUnlock) => {
  const match = item.source.match(/Level (\d+)/);
  if (match) return Number(match[1]);
  return 0;
};

const ProgressHeader = ({ title, subtitle }: { title: string; subtitle: string }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3 px-1">
      <button type="button" onClick={() => navigate('/child/progress')} className="btn btn-circle btn-ghost btn-sm">
        <ArrowLeft className="h-5 w-5" />
      </button>
      <div className="min-w-0">
        <h2 className="text-2xl font-bold text-neutral">{title}</h2>
        <p className="mt-0.5 text-sm font-medium text-neutral/60">{subtitle}</p>
      </div>
    </div>
  );
};

const ChildProgressDetail = () => {
  const { section } = useParams();
  const { activeChildId, childLogs, tasks, xpTransactions, transactions, getTasksByChildId, claimAchievementReward, isLoading } = useAppStore();
  const childTasks = activeChildId ? getTasksByChildId(activeChildId) : tasks;
  const navigate = useNavigate();

  if (!activeChildId) return null;

  const quests = getDailyQuests(activeChildId, childLogs, childTasks, xpTransactions);
  const inventory = getInventoryUnlocks(activeChildId, childLogs, childTasks, xpTransactions)
    .sort((a, b) => getInventoryRank(b) - getInventoryRank(a));
  const achievements = getUnlockedAchievements(activeChildId, childLogs, childTasks, xpTransactions, transactions);
  const history = getHistoryWithLevelUps(activeChildId, xpTransactions);

  if (section === 'quests') {
    return (
      <div className="flex flex-col gap-4">
        <ProgressHeader title="Daily Quests" subtitle="Small goals that add bonus XP today." />
        {quests.map(quest => (
          <div key={quest.id} className="card bg-base-100 p-4 shadow-sm rounded-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-bold text-neutral">{quest.title}</h3>
                <p className="mt-1 text-sm font-medium text-neutral/60">{quest.description}</p>
              </div>
              <span className="badge badge-warning badge-outline shrink-0 font-bold">+{quest.xpReward} XP</span>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-base-200">
                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round((quest.current / quest.target) * 100)}%` }} />
              </div>
              <span className="text-xs font-bold text-neutral/60">{quest.current}/{quest.target}</span>
              {quest.isClaimed && <CheckCircle className="h-5 w-5 text-success" weight="fill" />}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (section === 'unlocks') {
    return (
      <div className="flex flex-col gap-4">
        <ProgressHeader title="Rewards Shelf" subtitle="Badges, titles, frames, and special unlocks." />
        {inventory.length === 0 ? (
          <div className="card bg-base-100 p-4 shadow-sm rounded-xl text-sm font-medium text-neutral/60">Reach Level 2 to unlock the first badge.</div>
        ) : inventory.map(item => (
          <div key={item.id} className="card flex-row items-center gap-3 bg-base-100 p-4 shadow-sm rounded-xl">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <InventoryIcon item={item} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-bold text-neutral">{item.title}</h3>
              <p className="text-sm font-medium text-neutral/60">{item.description}</p>
              <p className="mt-1 text-xs font-bold text-primary">{item.source}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (section === 'achievements') {
    return (
      <div className="flex flex-col gap-4">
        <ProgressHeader title="Achievements" subtitle="Milestones that show long-term progress." />
        {achievements.map(achievement => {
          const canClaim = achievement.unlocked && !achievement.isStarClaimed && achievement.starReward > 0;

          return (
            <div key={achievement.id} className="card bg-base-100 p-4 shadow-sm rounded-xl">
              <div className="flex items-start gap-3">
                <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${achievement.unlocked ? 'bg-primary/10 text-primary' : 'bg-base-200 text-neutral/40'}`}>
                  {achievement.unlocked ? <Trophy className="h-5 w-5" weight="fill" /> : <LockKey className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="truncate font-bold text-neutral">{achievement.title}</h3>
                    <span className="shrink-0 text-xs font-bold text-primary">+{achievement.xpReward} XP</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-neutral/60">{achievement.description}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-base-200">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round((achievement.progress / achievement.target) * 100)}%` }} />
                    </div>
                    <span className="text-xs font-bold text-neutral/60">{achievement.progress}/{achievement.target}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-white p-3">
                <div className="flex items-center gap-2 text-sm font-bold text-neutral">
                  <Star className="h-4 w-4 text-warning" weight="fill" />
                  {achievement.starReward} Stars reward
                </div>
                {achievement.isStarClaimed ? (
                  <span className="badge badge-success badge-outline font-bold">Claimed</span>
                ) : (
                  <button
                    type="button"
                    disabled={!canClaim || isLoading}
                    onClick={() => claimAchievementReward(activeChildId, achievement.id)}
                    className={`btn btn-sm rounded-xl ${canClaim ? 'btn-primary text-white' : 'btn-disabled'}`}
                  >
                    {achievement.unlocked ? 'Claim Stars' : 'Locked'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (section === 'history') {
    return (
      <div className="flex flex-col gap-4">
        <ProgressHeader title="XP History" subtitle="Where XP came from and which action caused level-ups." />
        {history.length === 0 ? (
          <div className="card bg-base-100 p-4 shadow-sm rounded-xl text-sm font-medium text-neutral/60">XP history will appear after the first approval.</div>
        ) : history.map(transaction => (
          <div key={transaction.id} className="card bg-base-100 p-4 shadow-sm rounded-xl">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-info/20 text-gray-700">
                  <ClockCounterClockwise className="h-5 w-5" weight="fill" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-bold text-neutral">{getXpSourceLabel(transaction, childLogs, childTasks)}</h3>
                  <p className="text-xs font-medium text-neutral/50">{new Date(transaction.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <span className="badge badge-warning badge-outline shrink-0 font-bold">+{transaction.amount} XP</span>
            </div>
            {transaction.reachedLevel && (
              <p className="mt-3 rounded-xl bg-primary/10 px-3 py-2 text-xs font-bold text-primary">Reached Level {transaction.reachedLevel}</p>
            )}
          </div>
        ))}
      </div>
    );
  }

  navigate('/child/progress', { replace: true });
  return null;
};

export default ChildProgressDetail;
