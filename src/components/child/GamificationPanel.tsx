import {
  CaretRight,
  CheckCircle,
  ClockCounterClockwise,
  Lightning,
  Medal,
  Star,
  Sparkle,
  Trophy
} from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ChildTaskLog, CoinTransaction, Task, XpTransaction } from '../../types';
import {
  getClaimableAchievementStarRewards,
  getDailyQuests,
  getInventoryUnlocks,
  getPersonalLeagueStatus,
  getUnlockedAchievements
} from '../../utils/gamificationUtils';
import { calculateLevelProgress, getNextLevelReward, getTotalXpForChild, getXpRequiredForLevel } from '../../utils/xpUtils';

interface GamificationPanelProps {
  childId: string;
  logs: ChildTaskLog[];
  tasks: Task[];
  xpTransactions: XpTransaction[];
  transactions: CoinTransaction[];
}

const SummaryCard = ({
  title,
  subtitle,
  icon,
  children,
  onClick
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  children: ReactNode;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="card w-full bg-base-100 p-4 text-left shadow-sm rounded-xl transition-transform active:scale-[0.99]"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="text-lg font-bold text-neutral">{title}</h3>
        <p className="mt-0.5 text-sm font-medium text-neutral/60">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
        {onClick && <CaretRight className="h-5 w-5 text-neutral/30" weight="bold" />}
      </div>
    </div>
    <div className="mt-4">{children}</div>
  </button>
);

const ProgressBar = ({ value }: { value: number }) => (
  <div className="h-2.5 w-full overflow-hidden rounded-full bg-base-200">
    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
  </div>
);

const GamificationPanel = ({ childId, logs, tasks, xpTransactions, transactions }: GamificationPanelProps) => {
  const navigate = useNavigate();
  const quests = getDailyQuests(childId, logs, tasks, xpTransactions);
  const inventory = getInventoryUnlocks(childId, logs, tasks, xpTransactions);
  const achievements = getUnlockedAchievements(childId, logs, tasks, xpTransactions, transactions);
  const claimableAchievementRewards = getClaimableAchievementStarRewards(childId, logs, tasks, xpTransactions, transactions);
  const league = getPersonalLeagueStatus(childId, xpTransactions);
  const totalXp = getTotalXpForChild(xpTransactions, childId);
  const levelProgress = calculateLevelProgress(totalXp);
  const nextUnlock = getNextLevelReward(levelProgress.level);
  const xpToNextUnlock = nextUnlock ? Math.max(0, getXpRequiredForLevel(nextUnlock.level) - totalXp) : 0;
  const completedQuests = quests.filter(quest => quest.isComplete).length;
  const unlockedAchievements = achievements.filter(achievement => achievement.unlocked).length;
  const claimableStars = claimableAchievementRewards.reduce((total, achievement) => total + achievement.starReward, 0);
  const latestXp = xpTransactions.filter(tx => tx.child_id === childId)[0];

  return (
    <div className="flex flex-col gap-4">
      {nextUnlock && (
        <SummaryCard
          title="Next Unlock"
          subtitle="Keep going to open a new reward"
          icon={<Sparkle className="h-5 w-5" weight="fill" />}
          onClick={() => navigate('/child/progress/unlocks')}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
            <p className="truncate text-base font-bold text-neutral">{nextUnlock.title}</p>
            <p className="text-xs font-bold text-neutral/50">Level {nextUnlock.level} - {xpToNextUnlock} XP left</p>
          </div>
          <span className="badge badge-warning badge-outline font-bold">Lv {nextUnlock.level}</span>
        </div>
      </SummaryCard>
      )}

      <SummaryCard
        title="Daily Quests"
        subtitle="Finish small goals to reach unlocks faster"
        icon={<Lightning className="h-5 w-5" weight="fill" />}
        onClick={() => navigate('/child/progress/quests')}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-2xl font-bold text-neutral">{completedQuests}/{quests.length}</p>
            <p className="text-xs font-bold text-neutral/50">completed today</p>
          </div>
          <div className="flex -space-x-1">
            {quests.slice(0, 3).map(quest => (
              <div
                key={quest.id}
                className={`grid h-8 w-8 place-items-center rounded-full border-2 border-white ${quest.isComplete ? 'bg-success text-white' : 'bg-base-200 text-neutral/40'}`}
              >
                {quest.isComplete ? <CheckCircle className="h-4 w-4" weight="fill" /> : <Lightning className="h-4 w-4" />}
              </div>
            ))}
          </div>
        </div>
      </SummaryCard>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SummaryCard
          title="Personal League"
          subtitle="A weekly target against your own progress"
          icon={<Trophy className="h-5 w-5" weight="fill" />}
        >
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-2xl font-bold text-neutral">{league.tier}</p>
              <p className="text-xs font-bold text-neutral/50">{league.weeklyXp} XP this week</p>
            </div>
            <p className="text-xs font-bold text-primary">
              {league.nextTier ? `${league.xpToNextTier} XP to ${league.nextTier}` : 'Top tier'}
            </p>
          </div>
          <div className="mt-3">
            <ProgressBar value={league.progressPercent} />
          </div>
        </SummaryCard>

        <SummaryCard
          title="Rewards Shelf"
          subtitle="Unlocked badges, frames, and titles"
          icon={<Medal className="h-5 w-5" weight="fill" />}
          onClick={() => navigate('/child/progress/unlocks')}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-2xl font-bold text-neutral">{inventory.length}</p>
              <p className="text-xs font-bold text-neutral/50">unlocked items</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral">{unlockedAchievements}</p>
              <p className="text-xs font-bold text-neutral/50">achievements</p>
            </div>
          </div>
        </SummaryCard>
      </div>

      <SummaryCard
        title="Achievements"
        subtitle="Milestones can be claimed for Stars"
        icon={<Trophy className="h-5 w-5" weight="fill" />}
        onClick={() => navigate('/child/progress/achievements')}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-2xl font-bold text-neutral">{unlockedAchievements}/{achievements.length}</p>
            <p className="text-xs font-bold text-neutral/50">earned so far</p>
          </div>
          <span className={`badge gap-1 font-bold ${claimableStars > 0 ? 'badge-warning badge-outline' : 'badge-primary badge-outline'}`}>
            <Star className="h-3.5 w-3.5" weight="fill" />
            {claimableStars > 0 ? `Claim ${claimableStars}` : 'View shelf'}
          </span>
        </div>
      </SummaryCard>

      <SummaryCard
        title="XP History"
        subtitle="Know which actions moved the level"
        icon={<ClockCounterClockwise className="h-5 w-5" weight="fill" />}
        onClick={() => navigate('/child/progress/history')}
      >
        {latestXp ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-neutral">Latest XP gain</p>
            <span className="badge badge-warning badge-outline font-bold">+{latestXp.amount} XP</span>
          </div>
        ) : (
          <p className="text-sm font-medium text-neutral/60">XP history will appear after the first approval.</p>
        )}
      </SummaryCard>
    </div>
  );
};

export default GamificationPanel;
