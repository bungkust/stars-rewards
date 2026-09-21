import { useState } from 'react';
import { FaGift, FaCheckCircle, FaLock, FaGamepad, FaIceCream, FaTicketAlt } from 'react-icons/fa';
import { useAppStore } from '../../store/useAppStore';
import RewardConfirmationModal from '../../components/modals/RewardConfirmationModal';
import RewardRedemptionSuccessModal from '../../components/modals/RewardRedemptionSuccessModal';
import { ToggleButton, AdminEntityCard } from '../../components/design-system';
import { getRewardIconComponent } from '../../utils/icons';

// Helper function to get icon component
const getIconComponent = (iconId: string | undefined) => {
  switch (iconId) {
    case 'game': return FaGamepad;
    case 'treat': return FaIceCream;
    case 'event': return FaTicketAlt;
    case 'gift':
    default: return FaGift;
  }
};

const ChildRewards = () => {
  const { rewards, activeChildId, children, redeemReward, isLoading, transactions, childLogs, tasks, redeemedHistory } = useAppStore();
  const child = children.find(c => c.id === activeChildId);

  const [selectedReward, setSelectedReward] = useState<{ id: string, name: string, description?: string, cost: number } | null>(null);
  const [successRewardName, setSuccessRewardName] = useState<string | null>(null);
  const [filter, setFilter] = useState<'available' | 'all'>('all');
  const [visibleCount, setVisibleCount] = useState(20);

  const handleFilterChange = (newFilter: 'available' | 'all') => {
    setFilter(newFilter);
    setVisibleCount(20);
  };

  // Helper to check if a one-time reward has been redeemed
  const hasRedeemed = (rewardId: string) => {
    if (!activeChildId) return false;

    // Check against the full redemption history first (more reliable)
    if (redeemedHistory?.some(h => h.child_id === activeChildId && h.reward_id === rewardId)) {
      return true;
    }

    // Fallback to transactions if history not yet populated (though it should be)
    return transactions.some(t =>
      t.child_id === activeChildId &&
      t.type === 'REWARD_REDEEMED' &&
      t.reference_id === rewardId
    );
  };

  // Helper to check progress of accumulative rewards
  const getAccumulativeProgress = (reward: typeof rewards[0]) => {
    if (reward.type !== 'ACCUMULATIVE' || !reward.required_task_id) return null;

    const completedCount = childLogs.filter(log =>
      log.child_id === activeChildId &&
      log.task_id === reward.required_task_id &&
      log.status === 'VERIFIED'
    ).length;

    const pendingCount = childLogs.filter(log =>
      log.child_id === activeChildId &&
      log.task_id === reward.required_task_id &&
      (log.status === 'PENDING' || log.status === 'PENDING_EXCUSE')
    ).length;

    return {
      current: completedCount,
      pending: pendingCount,
      required: reward.required_task_count || 1,
      isUnlocked: completedCount >= (reward.required_task_count || 1),
      taskName: tasks.find(t => t.id === reward.required_task_id)?.name || 'Unknown Task'
    };
  };

  // Helper to determine sorting weight
  const getRewardSortWeight = (reward: typeof rewards[0]) => {
    const isOneTime = reward.type === 'ONE_TIME';
    // Milestone rewards (accumulative + cost 0) should be treated as one-time claimable
    const isMilestone = reward.type === 'ACCUMULATIVE' && reward.cost_value === 0;
    const redeemed = (isOneTime || isMilestone) && hasRedeemed(reward.id);

    const progress = getAccumulativeProgress(reward);
    const isLocked = progress && !progress.isUnlocked;
    const canAfford = (child?.current_balance || 0) >= reward.cost_value;

    // 0: Available (Not Redeemed, Not Locked, Affordable)
    if (!redeemed && !isLocked && canAfford) return 0;
    // 1: Visible Goal (Not Redeemed, Not Locked, Too Expensive)
    if (!redeemed && !isLocked && !canAfford) return 1;
    // 2: Locked
    if (isLocked) return 2;
    // 3: Redeemed (Bottom)
    if (redeemed) return 3;

    return 4; // Fallback
  };

  const filteredRewards = rewards.filter(reward => {
    // DEBUG LOG
    // console.log(`[ChildRewards] Checking ${reward.name}. Assigned: ${JSON.stringify(reward.assigned_to)}`);

    // 1. Filter by Assignment (MUST BE FIRST)
    if (reward.assigned_to && activeChildId && !reward.assigned_to.includes(activeChildId)) {
      // console.log(`[ChildRewards] Hiding ${reward.name} (Not assigned to ${activeChildId})`);
      return false;
    }

    if (filter === 'all') return true;

    const isOneTime = reward.type === 'ONE_TIME';
    const isMilestone = reward.type === 'ACCUMULATIVE' && reward.cost_value === 0;
    const redeemed = (isOneTime || isMilestone) && hasRedeemed(reward.id);
    const progress = getAccumulativeProgress(reward);
    const isLocked = progress && !progress.isUnlocked;
    const canAfford = (child?.current_balance || 0) >= reward.cost_value;

    // Available = Not Redeemed AND Not Locked AND Affordable
    return !redeemed && !isLocked && canAfford;
  });

  const sortedRewards = [...filteredRewards].sort((a, b) => {
    return getRewardSortWeight(a) - getRewardSortWeight(b);
  });

  const visibleRewards = sortedRewards.slice(0, visibleCount);
  const hasMore = visibleRewards.length < sortedRewards.length;

  const handleBuyClick = (rewardId: string, cost: number, rewardName: string, description?: string) => {
    if (!activeChildId || !child) return;
    setSelectedReward({ id: rewardId, name: rewardName, description, cost });
  };

  const handleConfirmRedeem = async () => {
    if (!selectedReward || !activeChildId) return;

    const { error } = await redeemReward(activeChildId, selectedReward.cost, selectedReward.id);
    if (!error) {
      setSuccessRewardName(selectedReward.name);
      setSelectedReward(null);
    } else {
      alert('Failed to redeem. Please try again.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-neutral">Rewards Shop</h2>
        {child && (
          <div className="badge badge-lg badge-primary font-bold text-white">
            {child.current_balance} Stars
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <ToggleButton
          label="Available"
          isActive={filter === 'available'}
          onClick={() => handleFilterChange('available')}
        />
        <ToggleButton
          label="All"
          isActive={filter === 'all'}
          onClick={() => handleFilterChange('all')}
        />
      </div>

      <RewardConfirmationModal
        isOpen={!!selectedReward}
        rewardName={selectedReward?.name || ''}
        description={selectedReward?.description}
        cost={selectedReward?.cost || 0}
        onClose={() => setSelectedReward(null)}
        onConfirm={handleConfirmRedeem}
        isLoading={isLoading}
        canAfford={(child?.current_balance || 0) >= (selectedReward?.cost || 0)}
      />

      <RewardRedemptionSuccessModal
        isOpen={!!successRewardName}
        rewardName={successRewardName || ''}
        onClose={() => setSuccessRewardName(null)}
      />

      {visibleRewards.length === 0 ? (
        <div className="text-center p-12 bg-base-100 rounded-xl border-2 border-dashed border-base-300">
          <p className="text-neutral/60">No rewards available yet.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {visibleRewards.map((reward) => {
              const isOneTime = reward.type === 'ONE_TIME';
              const isMilestone = reward.type === 'ACCUMULATIVE' && reward.cost_value === 0;
              const isRedeemed = (isOneTime || isMilestone) && hasRedeemed(reward.id);
              const canAfford = (child?.current_balance || 0) >= reward.cost_value;

              const progress = getAccumulativeProgress(reward);
              const isLocked = progress && !progress.isUnlocked;

              const IconComponent = getIconComponent(reward.category);

              return (
                <AdminEntityCard
                  key={reward.id}
                  variant="child"
                  className={isRedeemed ? 'opacity-60' : ''}
                  badge={
                    reward.image_url ? (
                      <div className="w-full h-full relative">
                        <img src={reward.image_url} alt={reward.name} className="w-full h-full object-cover" />
                        {isLocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <FaLock className="text-white w-4 h-4" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative flex items-center justify-center">
                        {reward.icon ? (
                          (() => {
                            const CustomIcon = getRewardIconComponent(reward.icon);
                            return <CustomIcon className="w-6 h-6 text-sky-600" />;
                          })()
                        ) : (
                          <IconComponent className="w-6 h-6 text-sky-600" />
                        )}
                        {isLocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-full">
                            <FaLock className="text-neutral/60 w-3 h-3" />
                          </div>
                        )}
                      </div>
                    )
                  }
                  title={reward.name}
                  stars={reward.cost_value}
                  description={reward.description}
                  tags={
                    <>
                      {isOneTime && !isRedeemed && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/60">
                          One-time
                        </span>
                      )}
                      {progress && progress.isUnlocked && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          Unlocked!
                        </span>
                      )}
                      {isLocked && (
                        <div className="w-full mt-1">
                          <div className="text-[10px] text-neutral/60 leading-tight font-bold">
                            Complete "{progress?.taskName}" {Math.max(0, progress?.required! - progress?.current!)} more times
                            {progress?.pending! > 0 && (
                              <span className="text-warning font-bold ml-1">
                                (+{progress?.pending} pending)
                              </span>
                            )}
                          </div>
                          <progress
                            className="progress progress-primary w-full h-1.5 mt-1"
                            value={progress?.current}
                            max={progress?.required}
                          ></progress>
                        </div>
                      )}
                    </>
                  }
                  onClick={() => {
                    if (!isRedeemed && !isLocked) {
                      handleBuyClick(reward.id, reward.cost_value, reward.name, reward.description);
                    }
                  }}
                  customActions={
                    isRedeemed ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-base-200 text-neutral/40">
                        <FaCheckCircle className="text-xs" /> Claimed
                      </span>
                    ) : isLocked ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-base-200 text-neutral/40">
                        <FaLock className="text-[10px]" /> Locked
                      </span>
                    ) : (
                      <button
                        className={`btn btn-sm rounded-xl px-4 font-bold border-none shadow-xs ${
                          reward.cost_value === 0
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                            : 'bg-sky-500 hover:bg-sky-600 text-white'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuyClick(reward.id, reward.cost_value, reward.name, reward.description);
                        }}
                        disabled={isLoading || !canAfford}
                      >
                        {reward.cost_value === 0 ? 'Claim' : 'Redeem'}
                      </button>
                    )
                  }
                />
              );
            })}
          </div>

          {hasMore && (
            <button
              className="btn btn-ghost btn-sm w-full text-neutral/70 mt-4"
              onClick={() => setVisibleCount(prev => prev + 20)}
            >
              Load More
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default ChildRewards;
