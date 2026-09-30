import { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { Trophy, Check, Sparkle, ClipboardText, Gift } from '@phosphor-icons/react';
import { useAppStore } from '../../store/useAppStore';
import { getChildStreak, isMilestoneClaimed, DEFAULT_STREAK_MILESTONES } from '../../utils/loyaltyTierUtils';
import type { StreakMilestone } from '../../types';

const LoyaltyStreakMilestones = () => {
  const {
    activeChildId,
    children,
    streakMilestones,
    transactions,
    tasks,
    rewards,
    claimStreakMilestone,
  } = useAppStore();

  const effectiveMilestones = streakMilestones?.length ? streakMilestones : DEFAULT_STREAK_MILESTONES;

  const child = children.find((c) => c.id === activeChildId);
  const childStreak = getChildStreak(child, tasks);
  const bestRecordStreak = child?.best_streak ?? Math.max(childStreak, 0);

  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimedSuccessMilestone, setClaimedSuccessMilestone] = useState<StreakMilestone | null>(null);

  const handleClaim = async (milestone: StreakMilestone) => {
    if (!child) return;
    setClaimingId(milestone.id);
    try {
      const { error } = await claimStreakMilestone(child.id, milestone);
      if (!error) {
        setClaimedSuccessMilestone(milestone);
      }
    } catch (err) {
      console.error('Failed to claim streak milestone', err);
    } finally {
      setClaimingId(null);
    }
  };

  const claimedLinkedReward = claimedSuccessMilestone?.linked_reward_id
    ? rewards.find((r) => r.id === claimedSuccessMilestone.linked_reward_id)
    : null;

  return (
    <div className="flex flex-col gap-3">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-lg font-bold text-neutral">
            Champ Streak Milestones
          </h3>
          <p className="text-xs text-neutral/60 font-medium mt-0.5">
            Best Record: <span className="font-bold text-primary">{bestRecordStreak} Days</span> in a row 🔥
          </p>
        </div>
      </div>

      {/* List of Milestone Cards */}
      <div className="flex flex-col gap-3">
        {effectiveMilestones.map((milestone) => {
          const current = getChildStreak(child, tasks, milestone.linked_task_id);
          const target = milestone.days;
          const isReached = current >= target;
          const remaining = Math.max(0, target - current);
          const isApproved = isMilestoneClaimed(child, transactions, milestone);

          const linkedTask = milestone.linked_task_id
            ? tasks.find((t) => t.id === milestone.linked_task_id)
            : null;
          const linkedReward = milestone.linked_reward_id
            ? rewards.find((r) => r.id === milestone.linked_reward_id)
            : null;

          return (
            <div
              key={milestone.id || milestone.days}
              className={`card bg-base-100 shadow-sm rounded-2xl p-3.5 sm:p-4 border border-base-200 border-l-4 transition-all ${
                isApproved ? 'border-l-success' : 'border-l-primary'
              }`}
            >
              {/* Top Row: Icon, Info, and Action */}
              <div className="flex items-start justify-between gap-2.5 sm:gap-3">
                {/* Left: Circular Icon */}
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex-shrink-0 flex items-center justify-center mt-0.5 ${
                    isApproved
                      ? 'bg-success/10 text-success'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {isApproved ? (
                    <Check size={20} weight="bold" />
                  ) : (
                    <Trophy size={20} weight="fill" />
                  )}
                </div>

                {/* Middle: Title & Badges */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-neutral text-sm sm:text-base leading-snug break-words">
                    {milestone.title}
                  </h4>

                  {/* Relational & Value Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <span className="inline-flex items-center gap-1 text-warning font-extrabold text-[11px] sm:text-xs bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shadow-2xs whitespace-nowrap flex-shrink-0">
                      <FaStar className="w-3 h-3 text-warning fill-current" />
                      <span>+{milestone.bonusStars} Stars</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold border border-primary/40 text-primary bg-primary/5 whitespace-nowrap flex-shrink-0">
                      {milestone.days} Days
                    </span>

                    {/* Linked Task Badge */}
                    {linkedTask && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border border-sky-300 text-sky-700 bg-sky-50 max-w-[140px] sm:max-w-[200px]">
                        <ClipboardText size={12} weight="bold" className="flex-shrink-0" />
                        <span className="truncate">Mission: {linkedTask.name}</span>
                      </span>
                    )}

                    {/* Linked Reward Badge */}
                    {linkedReward && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold border border-amber-300 text-amber-900 bg-amber-100 shadow-2xs max-w-[140px] sm:max-w-[200px]">
                        <Gift size={12} weight="bold" className="flex-shrink-0" />
                        <span className="truncate">Reward: {linkedReward.name}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Action Button or Approved Badge */}
                <div className="flex-shrink-0">
                  {isApproved ? (
                    <span className="badge badge-success text-white font-bold px-2.5 py-1 h-6 min-h-0 rounded-full text-xs shadow-2xs whitespace-nowrap">
                      Done
                    </span>
                  ) : isReached ? (
                    <button
                      onClick={() => handleClaim(milestone)}
                      disabled={claimingId === milestone.id}
                      className="btn btn-xs sm:btn-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black rounded-full px-3 shadow-md active:scale-95 transition-transform inline-flex items-center gap-1 text-[11px] sm:text-xs whitespace-nowrap"
                    >
                      <Sparkle size={13} weight="fill" />
                      <span>
                        {claimingId === milestone.id
                          ? 'Claiming...'
                          : linkedReward
                          ? 'Claim Reward'
                          : 'Claim ⭐'}
                      </span>
                    </button>
                  ) : (
                    <span className="badge badge-outline border-base-300 text-neutral/70 font-bold px-2 py-1 h-6 min-h-0 rounded-full text-[11px] whitespace-nowrap">
                      {current}/{target}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Row: Description & Progress Bar */}
              <div className="mt-2.5 pt-2 border-t border-base-200/60">
                <p className="text-xs text-neutral/60 leading-relaxed">
                  {milestone.description}
                </p>
                <div className="mt-2 w-full bg-base-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isApproved ? 'bg-success' : 'bg-primary'
                    }`}
                    style={{
                      width: `${Math.min(Math.round((current / target) * 100), 100)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] text-neutral/50 mt-1 font-semibold">
                  <span>
                    {current} / {target} days
                  </span>
                  <span>
                    {remaining > 0
                      ? `${remaining} ${remaining === 1 ? 'day' : 'days'} left`
                      : isApproved
                      ? 'Claimed'
                      : 'Mission Ready to Claim! 🎉'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Celebration Modal on Successful Claim */}
      {claimedSuccessMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-base-100 w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center flex flex-col items-center gap-4 animate-scale-in relative border border-base-200 overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shadow-md ring-4 ring-amber-50 mt-2">
              <Trophy size={36} weight="fill" />
            </div>

            <div>
              <h3 className="text-xl font-black text-neutral">
                Awesome! Streak Achieved! 🎉
              </h3>
              <p className="text-xs text-neutral/60 mt-1 font-medium">
                You have completed the consistency milestone{' '}
                <span className="font-bold text-neutral">
                  {claimedSuccessMilestone.title}
                </span>
              </p>
            </div>

            {/* Awarded Items */}
            <div className="flex flex-col gap-2 w-full bg-base-200/60 p-3 rounded-2xl border border-base-200">
              <div className="flex items-center justify-between text-xs font-bold text-neutral px-2">
                <span className="flex items-center gap-1.5 text-amber-600">
                  <FaStar className="w-3.5 h-3.5 fill-current" />
                  <span>Star Bonus</span>
                </span>
                <span className="text-sm font-extrabold text-amber-600">
                  +{claimedSuccessMilestone.bonusStars} ⭐
                </span>
              </div>

              {claimedLinkedReward && (
                <div className="flex items-center justify-between text-xs font-bold text-neutral px-2 pt-2 border-t border-base-200">
                  <span className="flex items-center gap-1.5 text-sky-600">
                    <Gift size={16} weight="bold" />
                    <span>Special Reward</span>
                  </span>
                  <span className="text-xs font-extrabold text-sky-700 truncate max-w-[150px]">
                    {claimedLinkedReward.name}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => setClaimedSuccessMilestone(null)}
              className="btn btn-primary text-white rounded-2xl w-full font-bold shadow-md text-sm mt-1"
            >
              Cool, Thanks! 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyStreakMilestones;
