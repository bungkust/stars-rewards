import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaGift, FaPencilAlt, FaTrash, FaGamepad, FaIceCream, FaTicketAlt } from 'react-icons/fa';
import { WarningCTAButton } from '../../components/design-system/WarningCTAButton';
import { AppCard } from '../../components/design-system/AppCard';
import { H1Header } from '../../components/design-system/H1Header';
import { IconWrapper } from '../../components/design-system/IconWrapper';
import { useAppStore } from '../../store/useAppStore';
import { AlertModal } from '../../components/design-system';

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
  const { rewards, deleteReward } = useAppStore();
  const [selectedReward, setSelectedReward] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [rewardToDelete, setRewardToDelete] = useState<string | null>(null);

  const handleEditClick = (rewardId: string) => {
    setSelectedReward(rewardId);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (rewardId: string) => {
    setRewardToDelete(rewardId);
    setIsDeleteModalOpen(true);
  };

  const handleEditConfirm = () => {
    if (selectedReward) {
      navigate(`/admin/rewards/${selectedReward}/edit`);
    }
    setIsEditModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (rewardToDelete) {
      await deleteReward(rewardToDelete);
    }
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="relative min-h-full pb-20 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <H1Header>Manage Rewards</H1Header>
      </div>

      <div className="grid gap-4">
        {rewards.length === 0 ? (
           <div className="text-center py-10 text-gray-500">
             No rewards created yet. Click below to add one!
           </div>
        ) : (
          rewards.map((reward) => {
            const IconComponent = getIconComponent(reward.category);
            return (
            <AppCard key={reward.id} className="flex flex-row items-center gap-4 !p-4">
              <div className="p-3 bg-blue-50 text-blue-500 rounded-lg">
                <IconWrapper icon={IconComponent} className="text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-700">{reward.name}</h3>
                <p className="text-sm text-gray-500">{reward.cost_value} Stars</p>
              </div>
              <div className="flex gap-2">
                <button 
                  className="btn btn-ghost btn-sm btn-circle text-gray-400"
                  onClick={() => handleEditClick(reward.id)}
                >
                  <FaPencilAlt />
                </button>
                <button 
                  className="btn btn-ghost btn-sm btn-circle text-error"
                  onClick={() => handleDeleteClick(reward.id)}
                >
                  <FaTrash />
                </button>
              </div>
            </AppCard>
          )})
        )}
      </div>

      <WarningCTAButton onClick={() => navigate('/admin/rewards/new')}>
        <FaPlus className="w-6 h-6" />
        <span className="ml-2 hidden sm:inline">Add Reward</span>
      </WarningCTAButton>

      <AlertModal
        isOpen={isEditModalOpen}
        title="Edit Reward"
        message="Do you want to edit this reward?"
        confirmText="Edit"
        onClose={() => setIsEditModalOpen(false)}
        onConfirm={handleEditConfirm}
      />

      <AlertModal
        isOpen={isDeleteModalOpen}
        title="Delete Reward"
        message="Are you sure you want to delete this reward?"
        confirmText="Delete"
        type="danger"
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default AdminRewards;
