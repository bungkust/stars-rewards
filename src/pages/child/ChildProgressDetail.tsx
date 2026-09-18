import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle,
  ClockCounterClockwise,
  Crown,
  FrameCorners,
  LockKey,
  Medal,
  Palette,
  ShieldCheck,
  Star,
  Sparkle,
  Trophy,
  Lightning
} from '@phosphor-icons/react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import type { ChildTaskLog, Task, XpTransaction } from '../../types';
import {
  getDailyQuests,
  getInventoryUnlocks,
  getPastWeeksHistory,
  getPersonalLeagueStatus,
  getUnlockedAchievements,
  getWeeklyDailyBreakdown,
  LEAGUE_TIERS,
  type InventoryUnlock
} from '../../utils/gamificationUtils';
import { calculateLevelProgress, getTotalXpForChild, getUpcomingMilestoneRewards } from '../../utils/xpUtils';

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

// ---- Shared design primitives (mirrors GamificationPanel) ----

const ProgressBar = ({ value, className = '' }: { value: number; className?: string }) => (
  <div className={`h-2.5 w-full overflow-hidden rounded-full bg-base-200 ${className}`}>
    <div
      className="h-full rounded-full bg-primary transition-all duration-500"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => navigate('/child/progress')}
        className="btn btn-circle btn-ghost btn-sm shrink-0"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <div className="min-w-0">
        <h2 className="text-xl font-bold text-neutral leading-tight">{title}</h2>
        <p className="text-sm font-medium text-neutral/60 mt-0.5 leading-snug">{subtitle}</p>
      </div>
    </div>
  );
};

// Card used for individual list items — same look as other app cards
const ItemCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`card bg-base-100 shadow-sm rounded-xl border border-base-200/70 ${className}`}>
    {children}
  </div>
);

const InventoryIcon = ({ item }: { item: InventoryUnlock }) => {
  const cls = 'h-5 w-5';
  if (item.kind === 'title') return <Crown className={cls} weight="fill" />;
  if (item.kind === 'frame') return <FrameCorners className={cls} weight="fill" />;
  if (item.kind === 'powerup') return <ShieldCheck className={cls} weight="fill" />;
  if (item.kind === 'theme') return <Palette className={cls} weight="fill" />;
  if (item.kind === 'achievement') return <Trophy className={cls} weight="fill" />;
  return <Medal className={cls} weight="fill" />;
};

const getUpcomingIcon = (title: string) => {
  const l = title.toLowerCase();
  const cls = 'h-5 w-5';
  if (l.includes('title') || l.includes('gelar')) return <Crown className={cls} />;
  if (l.includes('frame') || l.includes('bingkai')) return <FrameCorners className={cls} />;
  if (l.includes('freeze') || l.includes('power')) return <ShieldCheck className={cls} />;
  if (l.includes('theme') || l.includes('tema')) return <Palette className={cls} />;
  return <Medal className={cls} />;
};

const getInventoryRank = (item: InventoryUnlock) => {
  const m = item.source.match(/Level (\d+)/);
  return m ? Number(m[1]) : 0;
};

// Toast banner for celebration feedback
const CelebrationBanner = ({
  show,
  emoji,
  title,
  subtitle
}: {
  show: boolean;
  emoji: string;
  title: string;
  subtitle: string;
}) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="sticky top-2 z-50 card bg-primary text-primary-content p-4 shadow-lg rounded-xl flex-row items-center gap-3 border border-primary/30"
      >
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20 text-xl select-none">
          {emoji}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold leading-tight">{title}</p>
          <p className="text-xs text-primary-content/80 mt-0.5">{subtitle}</p>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Filter chip — matches ToggleButton style from design-system
const FilterChip = ({
  label,
  active,
  onClick
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`btn btn-sm rounded-full normal-case transition-all shrink-0 ${
      active
        ? 'btn-primary text-white shadow-sm'
        : 'bg-white border border-base-300 text-neutral/60 hover:bg-base-100 hover:text-neutral'
    }`}
  >
    {label}
  </button>
);

// ---- Main Component ----

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
  const [questToast, setQuestToast] = useState<{ title: string; xp: number } | null>(null);
  const [achievementFilter, setAchievementFilter] = useState<'all' | 'mission' | 'streak' | 'milestone'>('all');
  const [claimingAchievementId, setClaimingAchievementId] = useState<string | null>(null);
  const [starToast, setStarToast] = useState<{ title: string; stars: number } | null>(null);
  const [historyLimit, setHistoryLimit] = useState(15);

  if (!activeChildId) return null;

  const quests = getDailyQuests(activeChildId, childLogs, childTasks, xpTransactions);
  const inventory = getInventoryUnlocks(activeChildId, childLogs, childTasks, xpTransactions)
    .sort((a, b) => getInventoryRank(b) - getInventoryRank(a));
  const achievements = getUnlockedAchievements(activeChildId, childLogs, childTasks, xpTransactions, transactions);
  const history = getHistoryWithLevelUps(activeChildId, xpTransactions);

  const handleClaimQuest = async (questId: string, questTitle: string, xpReward: number) => {
    if (claimingQuestId) return;
    setClaimingQuestId(questId);
    try {
      const res = await claimDailyQuestReward(activeChildId, questId);
      if (!res.error) {
        setQuestToast({ title: questTitle, xp: xpReward });
        setTimeout(() => setQuestToast(null), 3200);
      }
    } finally {
      setClaimingQuestId(null);
    }
  };

  const handleClaimStars = async (achievementId: string, title: string, starReward: number) => {
    if (claimingAchievementId) return;
    setClaimingAchievementId(achievementId);
    try {
      const res = await claimAchievementReward(activeChildId, achievementId);
      if (!res.error) {
        setStarToast({ title, stars: starReward });
        setTimeout(() => setStarToast(null), 3200);
      }
    } finally {
      setClaimingAchievementId(null);
    }
  };

  // ── QUESTS ──────────────────────────────────────────────────────────
  if (section === 'quests') {
    const completedCount = quests.filter(q => q.isComplete).length;
    const claimableCount = quests.filter(q => q.isComplete && !q.isClaimed).length;

    return (
      <div className="flex flex-col gap-4">
        <SectionHeader
          title="Daily Quests"
          subtitle="Target harian untuk boost XP lebih cepat"
        />

        <CelebrationBanner
          show={!!questToast}
          emoji="🎉"
          title={`+${questToast?.xp} XP berhasil diklaim!`}
          subtitle={questToast?.title ?? ''}
        />

        {/* Summary bar — matches SummaryCard stat row */}
        <ItemCard className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-2xl font-bold text-neutral">{completedCount}/{quests.length}</p>
              <p className="text-xs font-bold text-neutral/50 mt-0.5">quest selesai hari ini</p>
            </div>
            {claimableCount > 0 ? (
              <span className="badge badge-warning font-bold gap-1">
                <Lightning className="h-3 w-3" weight="fill" />
                {claimableCount} Siap Diklaim
              </span>
            ) : completedCount === quests.length ? (
              <span className="badge badge-success font-bold text-white">Semua Selesai ⭐</span>
            ) : (
              <span className="badge badge-ghost text-neutral/50 font-medium">Reset tiap tengah malam</span>
            )}
          </div>
          <ProgressBar value={Math.round((completedCount / Math.max(1, quests.length)) * 100)} className="mt-3" />
        </ItemCard>

        {/* Quest list */}
        <div className="flex flex-col gap-3">
          {quests.map(quest => {
            const canClaim = quest.isComplete && !quest.isClaimed;
            const pct = Math.min(100, Math.round((quest.current / quest.target) * 100));

            return (
              <ItemCard
                key={quest.id}
                className={`p-4 transition-all ${canClaim ? 'border-warning/50 ring-1 ring-warning/20' : ''}`}
              >
                {/* Title row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-neutral">{quest.title}</h3>
                      {quest.isClaimed && (
                        <CheckCircle className="h-4 w-4 text-success shrink-0" weight="fill" />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs font-medium text-neutral/60">{quest.description}</p>
                  </div>
                  <span className="badge badge-warning badge-outline font-bold shrink-0">+{quest.xpReward} XP</span>
                </div>

                {/* Progress */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs font-medium text-neutral/50 mb-1">
                    <span>{quest.current}/{quest.target}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-base-200">
                    <div
                      className={`h-full rounded-full transition-all ${quest.isComplete ? 'bg-success' : 'bg-primary'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Action row */}
                <div className="mt-3 pt-3 border-t border-base-200/60 flex items-center justify-end">
                  {quest.isClaimed ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-success">
                      <CheckCircle className="h-4 w-4" weight="fill" />
                      Diklaim
                    </div>
                  ) : canClaim ? (
                    <button
                      type="button"
                      disabled={claimingQuestId === quest.id || isLoading}
                      onClick={() => handleClaimQuest(quest.id, quest.title, quest.xpReward)}
                      className="btn btn-primary btn-sm text-white gap-1.5"
                    >
                      {claimingQuestId === quest.id
                        ? <span className="loading loading-spinner loading-xs" />
                        : <Sparkle className="h-4 w-4" weight="fill" />}
                      Klaim +{quest.xpReward} XP
                    </button>
                  ) : (
                    <span className="text-xs font-medium text-neutral/40">
                      {quest.target - quest.current} lagi untuk klaim
                    </span>
                  )}
                </div>
              </ItemCard>
            );
          })}
        </div>
      </div>
    );
  }

  // ── UNLOCKS ─────────────────────────────────────────────────────────
  if (section === 'unlocks') {
    const totalXp = getTotalXpForChild(xpTransactions, activeChildId);
    const { level: currentLevel } = calculateLevelProgress(totalXp);
    const upcomingRewards = getUpcomingMilestoneRewards(currentLevel, 3);

    return (
      <div className="flex flex-col gap-4">
        <SectionHeader
          title="Rewards Shelf"
          subtitle="Badge, gelar, frame, dan hadiah level-up kamu"
        />

        {/* Stats card — mirrors SummaryCard layout */}
        <ItemCard className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-2xl font-bold text-neutral">{inventory.length}</p>
              <p className="text-xs font-bold text-neutral/50 mt-0.5">item terbuka</p>
            </div>
            <div className="text-right">
              <span className="badge badge-primary font-bold">Level {currentLevel}</span>
              <p className="text-xs text-neutral/50 font-medium mt-1">
                {upcomingRewards.length > 0
                  ? `${Math.max(0, upcomingRewards[0].xpRequired - totalXp)} XP ke reward berikutnya`
                  : 'Semua reward terbuka 🌟'}
              </p>
            </div>
          </div>
        </ItemCard>

        {/* Unlocked items */}
        {inventory.length === 0 ? (
          <ItemCard className="p-6 text-center">
            <p className="text-2xl mb-2 select-none">🎁</p>
            <h5 className="font-bold text-neutral">Belum Ada Reward Terbuka</h5>
            <p className="text-xs text-neutral/60 font-medium mt-1 leading-relaxed max-w-xs mx-auto">
              Capai Level 2 untuk membuka badge pertamamu!
            </p>
          </ItemCard>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold text-neutral/50 px-1">Koleksi Terbuka</p>
            {inventory.map(item => (
              <ItemCard key={item.id} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    {item.kind === 'achievement' && item.icon
                      ? <span className="text-lg select-none">{item.icon}</span>
                      : <InventoryIcon item={item} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-neutral truncate">{item.title}</h3>
                      <CheckCircle className="h-4 w-4 text-success shrink-0" weight="fill" />
                    </div>
                    <p className="text-xs font-medium text-neutral/60 mt-0.5 truncate">{item.description}</p>
                    <p className="text-xs font-bold text-primary mt-0.5">{item.source}</p>
                  </div>
                </div>
              </ItemCard>
            ))}
          </div>
        )}

        {/* Upcoming / locked rewards */}
        {upcomingRewards.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold text-neutral/50 px-1 flex items-center gap-1.5">
              <LockKey className="h-3.5 w-3.5" />
              Akan Terbuka Berikutnya
            </p>
            {upcomingRewards.map((reward, idx) => {
              const xpLeft = Math.max(0, reward.xpRequired - totalXp);
              const pct = Math.min(100, Math.round((totalXp / Math.max(1, reward.xpRequired)) * 100));
              return (
                <ItemCard key={`${reward.level}-${idx}`} className="p-4 opacity-75">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-base-200 text-neutral/40">
                      {getUpcomingIcon(reward.title)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-neutral truncate">{reward.title}</h3>
                        <span className="badge badge-ghost font-bold text-neutral/60 shrink-0">Lv {reward.level}</span>
                      </div>
                      <p className="text-xs font-medium text-neutral/50 mt-0.5">{xpLeft} XP lagi</p>
                    </div>
                  </div>
                  <ProgressBar value={pct} className="mt-3 h-1.5" />
                </ItemCard>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── ACHIEVEMENTS ────────────────────────────────────────────────────
  if (section === 'achievements') {
    const getCategory = (id: string): 'mission' | 'streak' | 'milestone' => {
      if (id.includes('streak')) return 'streak';
      if (id.startsWith('level-') || id.startsWith('xp-')) return 'milestone';
      return 'mission';
    };

    const counts = {
      all: achievements.length,
      mission: achievements.filter(a => getCategory(a.id) === 'mission').length,
      streak: achievements.filter(a => getCategory(a.id) === 'streak').length,
      milestone: achievements.filter(a => getCategory(a.id) === 'milestone').length
    };

    const filtered = achievements.filter(a =>
      achievementFilter === 'all' || getCategory(a.id) === achievementFilter
    );

    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const claimableCount = achievements.filter(a => a.unlocked && !a.isStarClaimed && a.starReward > 0).length;

    return (
      <div className="flex flex-col gap-4">
        <SectionHeader
          title="Achievements"
          subtitle="Milestone jangka panjang yang bisa di-claim untuk Bintang"
        />

        <CelebrationBanner
          show={!!starToast}
          emoji="⭐"
          title={`+${starToast?.stars} Bintang berhasil diklaim!`}
          subtitle={starToast?.title ?? ''}
        />

        {/* Stats bar */}
        <ItemCard className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-2xl font-bold text-neutral">{unlockedCount}/{achievements.length}</p>
              <p className="text-xs font-bold text-neutral/50 mt-0.5">achievement terbuka</p>
            </div>
            {claimableCount > 0 ? (
              <span className="badge badge-warning font-bold gap-1">
                <Star className="h-3 w-3" weight="fill" />
                {claimableCount} Siap Diklaim
              </span>
            ) : (
              <span className="badge badge-ghost text-neutral/50 font-medium">
                {Math.round((unlockedCount / Math.max(1, achievements.length)) * 100)}% Selesai
              </span>
            )}
          </div>
          <ProgressBar value={Math.round((unlockedCount / Math.max(1, achievements.length)) * 100)} className="mt-3" />
        </ItemCard>

        {/* Filter chips — matches ToggleButton pattern */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
          <FilterChip label={`Semua (${counts.all})`} active={achievementFilter === 'all'} onClick={() => setAchievementFilter('all')} />
          <FilterChip label={`Misi 🎯 (${counts.mission})`} active={achievementFilter === 'mission'} onClick={() => setAchievementFilter('mission')} />
          <FilterChip label={`Streak 🔥 (${counts.streak})`} active={achievementFilter === 'streak'} onClick={() => setAchievementFilter('streak')} />
          <FilterChip label={`Level ⚡ (${counts.milestone})`} active={achievementFilter === 'milestone'} onClick={() => setAchievementFilter('milestone')} />
        </div>

        {/* Achievement list */}
        <div className="flex flex-col gap-3">
          {filtered.map(ach => {
            const canClaim = ach.unlocked && !ach.isStarClaimed && ach.starReward > 0;
            const pct = Math.min(100, Math.round((ach.progress / Math.max(1, ach.target)) * 100));

            return (
              <ItemCard
                key={ach.id}
                className={`p-4 transition-all ${canClaim ? 'border-warning/50 ring-1 ring-warning/20' : !ach.unlocked ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-2xl select-none ${ach.unlocked ? 'bg-primary/10' : 'bg-base-200 grayscale'}`}>
                    {ach.unlocked ? ach.icon : '🔒'}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-neutral truncate">{ach.title}</h3>
                          {ach.unlocked && <CheckCircle className="h-3.5 w-3.5 text-success shrink-0" weight="fill" />}
                        </div>
                        <p className="mt-0.5 text-xs font-medium text-neutral/60">{ach.description}</p>
                      </div>
                      <span className="badge badge-warning badge-outline font-bold text-xs shrink-0">+{ach.xpReward} XP</span>
                    </div>

                    {/* Progress */}
                    <div className="mt-2.5">
                      <div className="flex justify-between text-xs text-neutral/50 mb-1">
                        <span>{ach.progress}/{ach.target}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-base-200">
                        <div
                          className={`h-full rounded-full transition-all ${ach.unlocked ? 'bg-success' : 'bg-primary'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stars claim row */}
                <div className="mt-3 pt-3 border-t border-base-200/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-neutral/60">
                    <Star className="h-3.5 w-3.5 text-warning" weight="fill" />
                    {ach.starReward} Bintang
                  </div>

                  {ach.isStarClaimed ? (
                    <div className="flex items-center gap-1 text-xs font-bold text-success">
                      <CheckCircle className="h-3.5 w-3.5" weight="fill" />
                      Diklaim
                    </div>
                  ) : canClaim ? (
                    <button
                      type="button"
                      disabled={claimingAchievementId === ach.id || isLoading}
                      onClick={() => handleClaimStars(ach.id, ach.title, ach.starReward)}
                      className="btn btn-warning btn-sm text-neutral font-bold gap-1.5"
                    >
                      {claimingAchievementId === ach.id
                        ? <span className="loading loading-spinner loading-xs" />
                        : <Star className="h-3.5 w-3.5" weight="fill" />}
                      Klaim {ach.starReward} Bintang
                    </button>
                  ) : (
                    <span className="text-xs text-neutral/40 font-medium">
                      {Math.max(0, ach.target - ach.progress)} lagi
                    </span>
                  )}
                </div>
              </ItemCard>
            );
          })}
        </div>
      </div>
    );
  }

  // ── XP HISTORY ──────────────────────────────────────────────────────
  if (section === 'history') {
    const totalXp = getTotalXpForChild(xpTransactions, activeChildId);
    const levelUps = history.filter(h => h.reachedLevel).length;
    const paged = history.slice(0, historyLimit);

    return (
      <div className="flex flex-col gap-4">
        <SectionHeader
          title="XP History"
          subtitle="Semua aksi yang menggerakkan levelmu"
        />

        {/* Stats */}
        <ItemCard className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-2xl font-bold text-neutral">{totalXp.toLocaleString()} XP</p>
              <p className="text-xs font-bold text-neutral/50 mt-0.5">total XP diperoleh</p>
            </div>
            <div className="text-right">
              <span className="badge badge-primary font-bold">{levelUps}× Naik Level</span>
              <p className="text-xs text-neutral/50 mt-1">{history.length} catatan</p>
            </div>
          </div>
        </ItemCard>

        {/* List */}
        {history.length === 0 ? (
          <ItemCard className="p-6 text-center">
            <p className="text-2xl mb-2 select-none">📜</p>
            <h5 className="font-bold text-neutral">Belum Ada Riwayat XP</h5>
            <p className="text-xs text-neutral/60 font-medium mt-1 max-w-xs mx-auto leading-relaxed">
              Selesaikan misi untuk melihat riwayat XP-mu di sini!
            </p>
          </ItemCard>
        ) : (
          <div className="flex flex-col gap-2">
            {paged.map(tx => {
              const date = new Date(tx.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              });

              const isLevelUp = !!tx.reachedLevel;
              const iconBg = isLevelUp
                ? 'bg-warning/20 text-warning'
                : tx.type === 'DAILY_QUEST'
                ? 'bg-primary/10 text-primary'
                : tx.type === 'ACHIEVEMENT'
                ? 'bg-success/10 text-success'
                : 'bg-base-200 text-neutral/60';

              return (
                <ItemCard key={tx.id} className={`p-4 ${isLevelUp ? 'border-warning/40' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${iconBg}`}>
                      {isLevelUp
                        ? <Trophy className="h-5 w-5" weight="fill" />
                        : tx.type === 'DAILY_QUEST'
                        ? <Sparkle className="h-5 w-5" weight="fill" />
                        : tx.type === 'ACHIEVEMENT'
                        ? <Medal className="h-5 w-5" weight="fill" />
                        : <ClockCounterClockwise className="h-5 w-5" weight="fill" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-neutral truncate text-sm">
                        {getXpSourceLabel(tx, childLogs, childTasks)}
                      </h3>
                      <p className="text-xs text-neutral/50 mt-0.5">{date}</p>
                    </div>
                    <span className="badge badge-warning badge-outline font-bold shrink-0">+{tx.amount} XP</span>
                  </div>

                  {isLevelUp && (
                    <div className="mt-2.5 flex items-center gap-2 text-xs font-bold text-warning bg-warning/10 rounded-lg px-3 py-1.5 border border-warning/20">
                      <span>🎉</span>
                      <span>Mencapai Level {tx.reachedLevel}!</span>
                    </div>
                  )}
                </ItemCard>
              );
            })}

            {history.length > historyLimit && (
              <button
                type="button"
                onClick={() => setHistoryLimit(n => n + 15)}
                className="btn btn-outline btn-primary w-full"
              >
                Tampilkan Lebih Banyak ({history.length - historyLimit} tersisa)
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── PERSONAL LEAGUE ─────────────────────────────────────────────────
  if (section === 'league') {
    const league = getPersonalLeagueStatus(activeChildId, xpTransactions);
    const dailyBreakdown = getWeeklyDailyBreakdown(activeChildId, xpTransactions);
    const pastWeeks = getPastWeeksHistory(activeChildId, xpTransactions, 3);
    const maxDailyXp = Math.max(20, ...dailyBreakdown.map(d => d.xp));
    const daysUntilMonday = 7 - ((new Date().getDay() + 6) % 7);

    return (
      <div className="flex flex-col gap-4">
        <SectionHeader
          title="Personal League"
          subtitle="Kompetisi mingguan melawan target diri sendiri"
        />

        {/* Current tier — matches Level Hero Card tonal surface */}
        <div className="card w-full bg-gradient-to-br from-primary/15 via-primary/5 to-base-100 border border-primary/20 p-5 shadow-sm rounded-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="badge badge-primary font-bold text-xs mb-2">Tier Minggu Ini</span>
              <h3 className="text-3xl font-black text-neutral flex items-center gap-2">
                {league.tier}
                <span className="select-none">{LEAGUE_TIERS.find(t => t.name === league.tier)?.icon ?? '🏆'}</span>
              </h3>
              <p className="text-sm font-semibold text-neutral/60 mt-1">{league.weeklyXp} XP minggu ini</p>
            </div>
            <div className="text-right">
              <span className="badge badge-warning badge-outline font-bold">
                {league.nextTier ? `${league.xpToNextTier} XP → ${league.nextTier}` : 'Tier Tertinggi 🌟'}
              </span>
              <p className="text-xs text-neutral/50 font-medium mt-1">Reset dalam {daysUntilMonday} hari</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs font-bold text-neutral/60 mb-1.5">
              <span>Progress ke {league.nextTier ?? 'Puncak'}</span>
              <span className="text-primary">{league.progressPercent}%</span>
            </div>
            <ProgressBar value={league.progressPercent} />
          </div>
        </div>

        {/* Weekly bar chart */}
        <ItemCard className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-bold text-neutral">Aktivitas Minggu Ini</h4>
              <p className="text-xs text-neutral/50 font-medium">XP harian Sen–Min</p>
            </div>
            <span className="badge badge-ghost font-bold text-neutral/70">{league.weeklyXp} XP</span>
          </div>
          <div className="grid grid-cols-7 gap-1.5 items-end h-28 pt-4">
            {dailyBreakdown.map((item, idx) => {
              const h = item.xp > 0 ? Math.max(15, Math.round((item.xp / maxDailyXp) * 100)) : 6;
              return (
                <div key={idx} className="flex flex-col items-center h-full justify-end gap-1">
                  <span className={`text-[10px] font-bold ${item.xp > 0 ? 'text-primary' : 'text-transparent'}`}>
                    {item.xp > 0 ? `+${item.xp}` : ' '}
                  </span>
                  <div className="w-full max-w-[28px] h-full bg-base-200/60 rounded flex items-end overflow-hidden">
                    <div
                      className={`w-full rounded transition-all duration-500 ${
                        item.isToday
                          ? 'bg-primary'
                          : item.xp > 0
                          ? 'bg-primary/50'
                          : item.isFuture
                          ? 'bg-base-200/30'
                          : 'bg-base-200'
                      }`}
                      style={{ height: `${h}%` }}
                    />
                  </div>
                  <span className={`text-[11px] font-bold ${item.isToday ? 'text-primary' : 'text-neutral/50'}`}>
                    {item.label}
                  </span>
                  {item.isToday && <span className="h-1 w-1 rounded-full bg-primary" />}
                </div>
              );
            })}
          </div>
        </ItemCard>

        {/* Tier roadmap */}
        <ItemCard className="p-4">
          <h4 className="font-bold text-neutral mb-0.5">Tingkatan League</h4>
          <p className="text-xs text-neutral/50 font-medium mb-3">Kumpulkan XP setiap minggu untuk naik tier</p>
          <div className="flex flex-col gap-2">
            {LEAGUE_TIERS.map(tier => {
              const isCurrent = league.tier === tier.name;
              const isAchieved = league.weeklyXp >= tier.minXp;
              return (
                <div
                  key={tier.name}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                    isCurrent
                      ? 'bg-primary/10 border-2 border-primary/40'
                      : isAchieved
                      ? 'bg-base-200/50 border border-base-200'
                      : 'bg-base-100 border border-dashed border-base-300 opacity-55'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl select-none">{tier.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral text-sm">{tier.name}</span>
                        {isCurrent && <span className="badge badge-primary badge-xs font-bold">Aktif</span>}
                      </div>
                      <p className="text-xs text-neutral/50">{tier.desc}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-neutral/60">
                    {tier.minXp === 0 ? 'Mulai' : `≥${tier.minXp} XP`}
                  </span>
                </div>
              );
            })}
          </div>
        </ItemCard>

        {/* Past weeks */}
        {pastWeeks.length > 0 && (
          <ItemCard className="p-4">
            <h4 className="font-bold text-neutral mb-0.5">Minggu Sebelumnya</h4>
            <p className="text-xs text-neutral/50 font-medium mb-3">Pencapaian tier minggu lalu</p>
            <div className="flex flex-col gap-2">
              {pastWeeks.map((week, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-base-200/50">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg select-none">{week.tierIcon}</span>
                    <div>
                      <p className="text-xs font-bold text-neutral">{week.label}</p>
                      <p className="text-[11px] text-neutral/50">Tier {week.tier}</p>
                    </div>
                  </div>
                  <span className="badge badge-warning badge-outline font-bold">{week.weeklyXp} XP</span>
                </div>
              ))}
            </div>
          </ItemCard>
        )}

        {/* Explainer */}
        <ItemCard className="p-4 bg-base-200/40">
          <h4 className="text-sm font-bold text-neutral mb-1 flex items-center gap-2">
            💡 Cara Kerja Personal League
          </h4>
          <p className="text-xs text-neutral/60 font-medium leading-relaxed">
            Personal League melacak konsistensi mingguanmu tanpa harus bersaing dengan orang lain.
            XP League direset otomatis setiap Senin — selesaikan misi tiap hari untuk naik tier!
          </p>
        </ItemCard>
      </div>
    );
  }

  navigate('/child/progress', { replace: true });
  return null;
};

export default ChildProgressDetail;
