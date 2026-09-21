import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaGift, FaGamepad, FaIceCream, FaTicketAlt } from 'react-icons/fa';
import { WarningCTAButton } from '../../components/design-system/WarningCTAButton';
import { H1Header } from '../../components/design-system/H1Header';
import { IconWrapper } from '../../components/design-system/IconWrapper';
import { useAppStore } from '../../store/useAppStore';
import { AlertModal, AdminEntityCard } from '../../components/design-system';
import RewardConfirmationModal from '../../components/modals/RewardConfirmationModal';
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

const AdminRewards = () => {
  const navigate = useNavigate();
  const { rewards, deleteReward, activeChildId } = useAppStore();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [rewardToDelete, setRewardToDelete] = useState<string | null>(null);
  const [selectedRewardDetails, setSelectedRewardDetails] = useState<any>(null);

  const filteredRewards = rewards.filter(reward => {
    // Filter by Active Child
    if (activeChildId && reward.assigned_to && reward.assigned_to.length > 0 && !reward.assigned_to.includes(activeChildId)) {
      return false;
    }
    return true;
  });

  const handleEditClick = (rewardId: string) => {
    navigate(`/admin/rewards/${rewardId}/edit`);
  };

  const handleDeleteClick = (rewardId: string) => {
    setRewardToDelete(rewardId);
    setIsDeleteModalOpen(true);
  };

  const handleRewardClick = (reward: any) => {
    setSelectedRewardDetails(reward);
  };

  const handleDeleteConfirm = async () => {
    if (rewardToDelete) {
      await deleteReward(rewardToDelete);
    }
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="relative min-h-full pb-24 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <H1Header>Manage Rewards</H1Header>
      </div>

      <div className="flex flex-col gap-3">
        {filteredRewards.length === 0 ? (
          <div className="card bg-base-100 border border-base-200 rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-3 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <FaGift className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral">No Rewards Created</h3>
              <p className="text-xs text-neutral/50 max-w-xs mt-1">
                No rewards created yet. Tap the button below to add your first reward!
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/rewards/new')}
              className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-none rounded-xl text-xs font-bold mt-2"
            >
              + Add Reward
            </button>
          </div>
        ) : (
          filteredRewards.map((reward) => {
            const IconComponent = getIconComponent(reward.category);
            return (
              <AdminEntityCard
                key={reward.id}
                badge={
                  reward.image_url ? (
                    <img src={reward.image_url} alt={reward.name} className="w-full h-full object-cover" />
                  ) : reward.icon ? (
                    (() => {
                      const CustomIcon = getRewardIconComponent(reward.icon);
                      return <CustomIcon className="w-6 h-6 text-emerald-700" />;
                    })()
                  ) : (
                    <IconWrapper icon={IconComponent} className="text-emerald-700 text-xl" />
                  )
                }
                title={reward.name}
                stars={reward.cost_value}
                description={reward.description}
                onClick={() => handleRewardClick(reward)}
                onEdit={() => handleEditClick(reward.id)}
                onDelete={() => handleDeleteClick(reward.id)}
              />
            );
          })
        )}
      </div>

      <WarningCTAButton onClick={() => navigate('/admin/rewards/new')}>
        <FaPlus className="w-6 h-6" />
        <span className="ml-2 hidden sm:inline">Add Reward</span>
      </WarningCTAButton>

      <AlertModal
        isOpen={isDeleteModalOpen}
        title="Delete Reward"
        message="Are you sure you want to delete this reward?"
        confirmText="Delete"
        type="danger"
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      <RewardConfirmationModal
        isOpen={!!selectedRewardDetails}
        rewardName={selectedRewardDetails?.name || ''}
        description={selectedRewardDetails?.description}
        cost={selectedRewardDetails?.cost_value || 0}
        onClose={() => setSelectedRewardDetails(null)}
        onConfirm={() => setSelectedRewardDetails(null)}
        canAfford={false}
      />
    </div>
  );
};

export default AdminRewards;
