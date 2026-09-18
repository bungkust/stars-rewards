import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
  getPersonalLeagueStatus,
  getUnlockedAchievements,
  LEAGUE_TIERS,
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
  const {
    activeChildId,
    childLogs,
    tasks,
    xpTransactions,
    transactions,
    getTasksByChildId,
    claimAchievementReward,
    claimDailyQuestReward,
    isLoading
  } = useAppStore();
  const childTasks = activeChildId ? getTasksByChildId(activeChildId) : tasks;
  const navigate = useNavigate();

  const [claimingQuestId, setClaimingQuestId] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<{ questTitle: string; xp: number } | null>(null);

  if (!activeChildId) return null;

  const quests = getDailyQuests(activeChildId, childLogs, childTasks, xpTransactions);
  const inventory = getInventoryUnlocks(activeChildId, childLogs, childTasks, xpTransactions)
    .sort((a, b) => getInventoryRank(b) - getInventoryRank(a));
  const achievements = getUnlockedAchievements(activeChildId, childLogs, childTasks, xpTransactions, transactions);
  const history = getHistoryWithLevelUps(activeChildId, xpTransactions);

  const handleClaimQuest = async (questId: string, questTitle: string, xpReward: number) => {
    if (!activeChildId || claimingQuestId) return;
    setClaimingQuestId(questId);
    try {
      const res = await claimDailyQuestReward(activeChildId, questId);
      if (!res.error) {
        setCelebration({ questTitle, xp: xpReward });
        setTimeout(() => {
          setCelebration(null);
        }, 3500);
      }
    } finally {
      setClaimingQuestId(null);
    }
  };

  if (section === 'quests') {
    const completedCount = quests.filter(q => q.isComplete).length;
    const claimableCount = quests.filter(q => q.isComplete && !q.isClaimed).length;

    return (
      <div className="flex flex-col gap-4 relative">
        <ProgressHeader title="Daily Quests" subtitle="Target harian untuk boost XP dan level-up lebih cepat." />

        {/* Floating Celebration Banner */}
        <AnimatePresence>
          {celebration && (
            <motion.div
              initial={{ opacity: 0, y: -24, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="sticky top-2 z-50 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-4 text-white shadow-xl flex items-center gap-3.5 border border-amber-300/40"
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/25 text-2xl shadow-inner select-none">
                🎉
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black">Daily Quest Berhasil Diklaim!</p>
                <p className="text-xs font-semibold text-white/95 mt-0.5">
                  +{celebration.xp} XP ditambahkan untuk &quot;{celebration.questTitle}&quot; 🌟
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Daily Progress Status Bar */}
        <div className="card bg-gradient-to-r from-primary/10 to-base-100 p-4 shadow-sm rounded-xl border border-primary/15">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-neutral/60">Progress Hari Ini</p>
              <p className="text-lg font-black text-neutral mt-0.5">{completedCount} dari {quests.length} Quest Selesai</p>
            </div>
            {claimableCount > 0 ? (
              <span className="badge badge-warning font-black text-xs px-3 py-2 animate-bounce shadow-xs">
                {claimableCount} Siap Diklaim! 🎁
              </span>
            ) : completedCount === quests.length ? (
              <span className="badge badge-success font-black text-xs px-3 py-2 text-white">
                Semua Selesai! ⭐
              </span>
            ) : (
              <span className="badge badge-ghost font-bold text-xs text-neutral/50">
                Reset tiap tengah malam
              </span>
            )}
          </div>
        </div>

        {/* Quests List */}
        <div className="flex flex-col gap-3">
          {quests.map(quest => {
            const canClaim = quest.isComplete && !quest.isClaimed;
            const progressPercent = Math.min(100, Math.round((quest.current / quest.target) * 100));

            return (
              <div
                key={quest.id}
                className={`card bg-base-100 p-4 shadow-sm rounded-2xl border transition-all ${
                  canClaim
                    ? 'border-warning/50 bg-gradient-to-br from-warning/10 via-base-100 to-base-100 shadow-md ring-1 ring-warning/30'
                    : quest.isClaimed
                    ? 'border-base-200/80 opacity-90'
                    : 'border-base-200/80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-neutral text-base">{quest.title}</h3>
                      {quest.isClaimed && (
                        <CheckCircle className="h-4 w-4 text-success shrink-0" weight="fill" />
                      )}
                    </div>
                    <p className="mt-1 text-xs font-medium text-neutral/60 leading-relaxed">{quest.description}</p>
                  </div>
                  <span className="badge badge-warning badge-outline shrink-0 font-black text-xs">
                    +{quest.xpReward} XP
                  </span>
                </div>

                {/* Progress Bar & Indicators */}
                <div className="mt-3.5">
                  <div className="flex items-center justify-between text-xs font-bold text-neutral/60 mb-1.5">
                    <span>Progress: {quest.current}/{quest.target}</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-base-200">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        quest.isComplete ? 'bg-success' : 'bg-primary'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Action / Claim Area */}
                <div className="mt-4 pt-3 border-t border-base-200/70 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-neutral/50">
                    Hadiah: <strong className="text-primary">+{quest.xpReward} XP</strong>
                  </span>

                  {quest.isClaimed ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-success bg-success/10 border border-success/20 px-3 py-1.5 rounded-xl">
                      <CheckCircle className="h-4 w-4" weight="fill" />
                      <span>Selesai & Diklaim</span>
                    </div>
                  ) : canClaim ? (
                    <button
                      type="button"
                      disabled={claimingQuestId === quest.id || isLoading}
                      onClick={() => handleClaimQuest(quest.id, quest.title, quest.xpReward)}
                      className="btn btn-sm btn-primary text-white font-black rounded-xl gap-1.5 shadow-md shadow-primary/25 hover:scale-105 active:scale-95 transition-all"
                    >
                      {claimingQuestId === quest.id ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : (
                        <Sparkle className="h-4 w-4" weight="fill" />
                      )}
                      Klaim +{quest.xpReward} XP
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral/40 bg-base-200/50 px-3 py-1.5 rounded-xl">
                      <span>{quest.target - quest.current} lagi untuk klaim</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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

  if (section === 'league') {
    const league = getPersonalLeagueStatus(activeChildId, xpTransactions);
    return (
      <div className="flex flex-col gap-4">
        <ProgressHeader title="Personal League" subtitle="Kompetisi mingguan melawan target diri sendiri." />

        {/* Current Tier Banner */}
        <div className="card bg-gradient-to-br from-primary/15 via-primary/5 to-base-100 border border-primary/20 p-5 shadow-sm rounded-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="badge badge-primary font-bold text-xs mb-1.5">Tier Minggu Ini</span>
              <h3 className="text-3xl font-black text-neutral flex items-center gap-2">
                {league.tier}
                <span>
                  {LEAGUE_TIERS.find(t => t.name === league.tier)?.icon || '🏆'}
                </span>
              </h3>
              <p className="text-sm font-semibold text-neutral/60 mt-1">
                {league.weeklyXp} XP terkumpul minggu ini
              </p>
            </div>
            <div className="text-right">
              <span className="badge badge-warning badge-outline font-bold text-xs">
                {league.nextTier ? `${league.xpToNextTier} XP lagi ke ${league.nextTier}` : 'Tier Tertinggi! 🌟'}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs font-bold text-neutral/60 mb-1.5">
              <span>Progress Tier</span>
              <span className="text-primary font-black">{league.progressPercent}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-base-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, league.progressPercent))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tier Roadmap */}
        <div className="card bg-base-100 p-4 shadow-sm rounded-xl border border-base-200/70">
          <h4 className="text-base font-bold text-neutral mb-3">Tingkatan League</h4>
          <div className="flex flex-col gap-2.5">
            {LEAGUE_TIERS.map(tier => {
              const isCurrentTier = league.tier === tier.name;
              const isAchieved = league.weeklyXp >= tier.minXp;
              return (
                <div
                  key={tier.name}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                    isCurrentTier
                      ? 'bg-primary/10 border-2 border-primary/40 shadow-xs'
                      : isAchieved
                      ? 'bg-base-200/60 border border-base-200'
                      : 'bg-base-100 border border-dashed border-base-300 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl select-none">{tier.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral">{tier.name}</span>
                        {isCurrentTier && (
                          <span className="badge badge-primary badge-xs font-black text-[10px]">Aktif</span>
                        )}
                      </div>
                      <p className="text-xs text-neutral/50 font-medium">{tier.desc}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-neutral/70">
                      {tier.minXp === 0 ? 'Mulai' : `Min. ${tier.minXp} XP`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Kid-Friendly League Explainer */}
        <div className="card bg-base-100 p-4 shadow-sm rounded-xl border border-base-200/70">
          <h4 className="text-sm font-bold text-neutral mb-1.5 flex items-center gap-2">
            <span>💡</span> Info Personal League
          </h4>
          <p className="text-xs text-neutral/60 font-medium leading-relaxed">
            Personal League melacak seberapa aktif kamu menyelesaikan misi setiap minggunya. XP League akan direset otomatis setiap hari Senin, jadi ayo kumpulkan XP sebanyak-banyaknya dan raih Diamond tier!
          </p>
        </div>
      </div>
    );
  }

  navigate('/child/progress', { replace: true });
  return null;
};

export default ChildProgressDetail;
