import { useState } from 'react';
import { FaGift, FaCheckCircle, FaLock, FaGamepad, FaIceCream, FaTicketAlt } from 'react-icons/fa';
import { useAppStore } from '../../store/useAppStore';
import RewardConfirmationModal from '../../components/modals/RewardConfirmationModal';
import RewardRedemptionSuccessModal from '../../components/modals/RewardRedemptionSuccessModal';
import { ToggleButton } from '../../components/design-system';

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

  const [selectedReward, setSelectedReward] = useState<{ id: string, name: string, cost: number } | null>(null);
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

    return {
      current: completedCount,
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

  const handleBuyClick = (rewardId: string, cost: number, rewardName: string) => {
    if (!activeChildId || !child) return;
    if (child.current_balance < cost) {
      alert('Not enough stars!');
      return;
    }
    setSelectedReward({ id: rewardId, name: rewardName, cost });
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
        <h2 className="text-2xl font-bold text-gray-800">Rewards Shop</h2>
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
        cost={selectedReward?.cost || 0}
        onClose={() => setSelectedReward(null)}
        onConfirm={handleConfirmRedeem}
        isLoading={isLoading}
      />

      <RewardRedemptionSuccessModal
        isOpen={!!successRewardName}
        rewardName={successRewardName || ''}
        onClose={() => setSuccessRewardName(null)}
      />

      {visibleRewards.length === 0 ? (
        <div className="text-center p-12 bg-base-100 rounded-xl border-2 border-dashed border-gray-300">
          <p className="text-gray-400">No rewards available yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            {visibleRewards.map((reward) => {
              const isOneTime = reward.type === 'ONE_TIME';
              const isMilestone = reward.type === 'ACCUMULATIVE' && reward.cost_value === 0;
              const isRedeemed = (isOneTime || isMilestone) && hasRedeemed(reward.id);
              const canAfford = (child?.current_balance || 0) >= reward.cost_value;

              const progress = getAccumulativeProgress(reward);
              const isLocked = progress && !progress.isUnlocked;

              const IconComponent = getIconComponent(reward.category);

              return (
                <div key={reward.id} className={`card bg-white shadow-sm rounded-xl p-4 flex flex-col items-center text-center gap-2 ${isRedeemed ? 'opacity-60' : ''}`}>
                  <div className={`p-4 rounded-full mb-2 relative ${isRedeemed ? 'bg-gray-100 text-gray-400' : isLocked ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-500'}`}>
                    <IconComponent className="w-8 h-8" />
                    {isLocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-full">
                        <FaLock className="text-gray-600" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-700 text-sm line-clamp-2 min-h-[2.5rem] flex items-center justify-center">
                    {reward.name}
                  </h3>

                  {isRedeemed ? (
                    <button className="btn btn-sm btn-disabled w-full rounded-full bg-gray-100 text-gray-400 border-none">
                      <FaCheckCircle className="mr-1" /> Redeemed
                    </button>
                  ) : isLocked ? (
                    <div className="w-full flex flex-col gap-1">
                      <button className="btn btn-sm btn-disabled w-full rounded-full bg-gray-200 text-gray-500 border-none text-xs">
                        <FaLock className="mr-1 text-[10px]" /> Locked
                      </button>
                      <div className="text-[10px] text-gray-500 leading-tight px-1">
                        Complete "{progress?.taskName}" {progress?.required! - progress?.current!} more times
                      </div>
                      <progress
                        className="progress progress-primary w-full h-1.5 mt-1"
                        value={progress?.current}
                        max={progress?.required}
                      ></progress>
                    </div>
                  ) : (
                    <button
                      className={`btn btn-sm w-full rounded-full ${reward.cost_value === 0 ? 'btn-success text-white' : 'btn-primary'}`}
                      onClick={() => handleBuyClick(reward.id, reward.cost_value, reward.name)}
                      disabled={isLoading || !canAfford}
                    >
                      {reward.cost_value === 0 ? (
                        <>Claim Reward</>
                      ) : (
                        <>Buy for {reward.cost_value}</>
                      )}
                    </button>
                  )}

                  {isOneTime && !isRedeemed && (
                    <span className="text-[10px] text-warning font-bold uppercase tracking-wide">One-time only</span>
                  )}

                  {progress && progress.isUnlocked && (
                    <span className="text-[10px] text-success font-bold uppercase tracking-wide">Unlocked!</span>
                  )}
                </div>
              )
            })}
          </div>

          {hasMore && (
            <button
              className="btn btn-ghost btn-sm w-full text-gray-500 mt-4"
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
