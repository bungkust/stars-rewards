import { useNavigate } from 'react-router-dom';
import { FaPlus, FaGift, FaMinusCircle } from 'react-icons/fa';
import { WarningCTAButton } from '../../components/design-system/WarningCTAButton';
import { AppCard } from '../../components/design-system/AppCard';
import { H1Header } from '../../components/design-system/H1Header';
import { IconWrapper } from '../../components/design-system/IconWrapper';
import { useAppStore } from '../../store/useAppStore';

const AdminRewards = () => {
  const navigate = useNavigate();
  const { rewards } = useAppStore();

  return (
    <div className="relative min-h-full pb-20 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <H1Header>Manage Rewards</H1Header>
      </div>

      {/* Manual Redemption Card */}
      <AppCard className="bg-gradient-to-r from-primary/10 to-base-100 border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-primary">Manual Redemption</h3>
            <p className="text-xs text-gray-500">Deduct stars manually</p>
          </div>
          <button className="btn btn-sm btn-outline btn-primary gap-2">
            <FaMinusCircle />
            Redeem
          </button>
        </div>
      </AppCard>

      <div className="grid grid-cols-2 gap-4">
        {rewards.length === 0 ? (
           <div className="col-span-2 text-center py-10 text-gray-500">
             No rewards created yet. Click below to add one!
           </div>
        ) : (
          rewards.map((reward) => (
            <AppCard key={reward.id} className="flex flex-col items-center text-center gap-2 !p-4">
              <div className="p-4 bg-purple-50 text-purple-500 rounded-full mb-2">
                <IconWrapper icon={FaGift} className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="font-bold text-gray-700 text-sm line-clamp-2 h-10 flex items-center justify-center">
                {reward.name}
              </h3>
              <p className="text-sm font-bold text-primary">{reward.cost_value} Stars</p>
            </AppCard>
          ))
        )}
      </div>

      <WarningCTAButton onClick={() => navigate('/admin/rewards/new')}>
        <FaPlus className="w-6 h-6" />
        <span className="ml-2 hidden sm:inline">Add Reward</span>
      </WarningCTAButton>
    </div>
  );
};

export default AdminRewards;
