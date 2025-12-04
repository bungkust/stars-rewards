import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { PrimaryButton } from '../../components/design-system/PrimaryButton';

const FirstReward = () => {
  const navigate = useNavigate();
  const { addReward, setOnboardingStep, isLoading } = useAppStore();
  const [rewardName, setRewardName] = useState('');
  const [costValue, setCostValue] = useState(50);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardName.trim()) {
      setError('Please enter a reward name');
      return;
    }

    const { error: rewardError } = await addReward({
      name: rewardName,
      cost_value: costValue,
      type: 'ONE_TIME', // Default
    });

    if (rewardError) {
      setError('Failed to create reward');
      return;
    }

    setOnboardingStep('completed');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center app-gradient p-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-primary text-center mb-2">Create First Reward</h1>
        <p className="text-gray-500 text-center mb-8">What can they redeem their stars for?</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold">Reward Name</span>
            </label>
            <input
              type="text"
              value={rewardName}
              onChange={(e) => setRewardName(e.target.value)}
              className="input input-bordered w-full rounded-xl"
              placeholder="e.g. Extra Screen Time, Ice Cream"
              autoFocus
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold">Star Cost</span>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={costValue}
                onChange={(e) => setCostValue(parseInt(e.target.value))}
                className="range range-secondary flex-1"
              />
              <span className="text-2xl font-bold text-secondary w-16 text-center">{costValue}</span>
            </div>
          </div>

          {error && <p className="text-error text-sm text-center">{error}</p>}

          <PrimaryButton
            type="submit"
            className="rounded-xl mt-4 shadow-md text-lg font-bold"
            disabled={!rewardName.trim() || isLoading}
          >
            {isLoading ? 'Finishing...' : 'Finish Setup'}
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
};

export default FirstReward;
