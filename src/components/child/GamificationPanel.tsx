import {
  CaretRight,
  CheckCircle,
  ClockCounterClockwise,
  Lightning,
  Medal,
  Sparkle,
  Star,
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
    className="card w-full bg-base-100 p-4 text-left shadow-sm rounded-xl transition-transform active:scale-[0.99] border border-base-200/70"
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
  const claimableQuestsCount = quests.filter(quest => quest.isComplete && !quest.isClaimed).length;
  const unlockedAchievements = achievements.filter(achievement => achievement.unlocked).length;
  const claimableStars = claimableAchievementRewards.reduce((total, achievement) => total + achievement.starReward, 0);
  const latestXp = xpTransactions.filter(tx => tx.child_id === childId)[0];

  const activeStreaks = tasks
    .filter(t => (t.current_streak || 0) > 0)
    .sort((a, b) => (b.current_streak || 0) - (a.current_streak || 0));
  const bestStreakEver = tasks.reduce(
    (best, t) => Math.max(best, t.best_streak || t.current_streak || 0),
    0
  );

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Level Hero Card (MD3 Elevated Tonal Surface) */}
      <div className="card w-full bg-gradient-to-br from-primary/15 via-primary/5 to-base-100 border border-primary/20 p-5 shadow-sm rounded-2xl">
        {/* Top Row: Level Badge & Title */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-white shadow-md shadow-primary/25 font-black text-xl">
              {levelProgress.level}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-black text-neutral">Level {levelProgress.level}</h3>
                <span className="badge badge-primary font-bold text-xs">
                  {levelProgress.levelName}
                </span>
              </div>
              <p className="text-xs font-semibold text-neutral/60 mt-0.5">
                {totalXp.toLocaleString()} Total XP
              </p>
            </div>
          </div>
          {nextUnlock && (
            <button
              type="button"
              onClick={() => navigate('/child/progress/unlocks')}
              className="btn btn-xs btn-ghost gap-1 font-bold text-primary hover:bg-primary/10 rounded-lg shrink-0"
            >
              <Sparkle className="h-3.5 w-3.5" weight="fill" />
              Hadiah
              <CaretRight className="h-3 w-3" weight="bold" />
            </button>
          )}
        </div>

        {/* XP Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-bold text-neutral/70 mb-1.5">
            <span>Lv {levelProgress.level} ({levelProgress.xpIntoLevel} XP)</span>
            <span className="text-primary font-black">{levelProgress.progressPercent}%</span>
            <span>Lv {levelProgress.level + 1} ({levelProgress.xpNeededForNextLevel} XP)</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-base-200 p-0.5 border border-primary/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-secondary transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, levelProgress.progressPercent))}%` }}
            />
          </div>
        </div>

        {/* Next Unlock Preview Banner */}
        {nextUnlock && (
          <div
            onClick={() => navigate('/child/progress/unlocks')}
            className="mt-3.5 flex items-center justify-between gap-3 p-3 rounded-xl bg-base-100/90 border border-primary/15 hover:border-primary/30 transition-all cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-warning/15 text-warning">
                <Sparkle className="h-4 w-4" weight="fill" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-neutral truncate">
                  Unlock Berikutnya: <span className="text-primary">{nextUnlock.title}</span>
                </p>
                <p className="text-[11px] font-medium text-neutral/50">
                  {xpToNextUnlock} XP lagi menuju Level {nextUnlock.level}
                </p>
              </div>
            </div>
            <span className="badge badge-warning badge-outline font-bold text-[10px] shrink-0">
              Lv {nextUnlock.level}
            </span>
          </div>
        )}
      </div>

      {/* 2. Active Streaks Card */}
      <div className="card w-full bg-base-100 p-4 text-left shadow-sm rounded-xl border border-base-200/70">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-neutral">Active Streaks</h3>
              <span className="text-base select-none">🔥</span>
            </div>
            <p className="mt-0.5 text-sm font-medium text-neutral/60">Konsistensi misi harianmu</p>
          </div>
          <div className="badge badge-warning/20 border-warning/30 text-warning font-bold text-xs px-2.5 py-2 flex items-center gap-1 rounded-lg shrink-0">
            <span>🏆 Rekor:</span>
            <span className="font-black text-neutral">{bestStreakEver} hari</span>
          </div>
        </div>

        <div className="mt-3.5">
          {activeStreaks.length > 0 ? (
            <div className="flex flex-col gap-2">
              {activeStreaks.slice(0, 3).map(task => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-base-200/50 hover:bg-base-200/80 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg select-none">🔥</span>
                    <span className="text-sm font-bold text-neutral truncate">{task.name}</span>
                  </div>
                  <span className="badge badge-warning font-black text-xs px-2.5 py-1 shrink-0">
                    {task.current_streak} hari
                  </span>
                </div>
              ))}
              {activeStreaks.length > 3 && (
                <p className="text-xs font-semibold text-neutral/50 text-center mt-1">
                  +{activeStreaks.length - 3} misi streak aktif lainnya
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-base-200/40 border border-dashed border-base-300">
              <span className="text-2xl select-none">🔥</span>
              <p className="text-xs font-medium text-neutral/60 leading-relaxed">
                Belum ada streak aktif hari ini. Selesaikan misimu untuk menyalakan api konsistensi!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. Daily Quests Card */}
      <SummaryCard
        title="Daily Quests"
        subtitle="Finish small goals to reach unlocks faster"
        icon={<Lightning className="h-5 w-5" weight="fill" />}
        onClick={() => navigate('/child/progress/quests')}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-neutral">{completedQuests}/{quests.length}</p>
              {claimableQuestsCount > 0 && (
                <span className="badge badge-warning font-black text-[11px] animate-pulse">
                  {claimableQuestsCount} Siap Klaim!
                </span>
              )}
            </div>
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

      {/* 4. Personal League & Rewards Shelf Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SummaryCard
          title="Personal League"
          subtitle="A weekly target against your own progress"
          icon={<Trophy className="h-5 w-5" weight="fill" />}
          onClick={() => navigate('/child/progress/league')}
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

      {/* 5. Achievements Card */}
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

      {/* 6. XP History Card */}
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
