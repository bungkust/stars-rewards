import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { PrimaryButton } from '../../components/design-system/PrimaryButton';

const FirstTask = () => {
  const navigate = useNavigate();
  const { addTask, setOnboardingStep, isLoading } = useAppStore();
  const [taskName, setTaskName] = useState('');
  const [rewardValue, setRewardValue] = useState(10);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) {
      setError('Please enter a task name');
      return;
    }

    const { error: taskError } = await addTask({
      name: taskName,
      reward_value: rewardValue,
      type: 'RECURRING', // Default to recurring for simplicity
      is_active: true,
      assigned_to: [],
    });

    if (taskError) {
      setError('Failed to create task');
      return;
    }

    setOnboardingStep('first-reward');
    navigate('/onboarding/first-reward');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center app-gradient p-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-primary text-center mb-2">Create First Task</h1>
        <p className="text-gray-500 text-center mb-8">What is a daily habit you want to encourage?</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold">Task Name</span>
            </label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="input input-bordered w-full rounded-xl"
              placeholder="e.g. Brush Teeth, Make Bed"
              autoFocus
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold">Star Reward</span>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="50"
                value={rewardValue}
                onChange={(e) => setRewardValue(parseInt(e.target.value))}
                className="range range-primary flex-1"
              />
              <span className="text-2xl font-bold text-primary w-12 text-center">{rewardValue}</span>
            </div>
          </div>

          {error && <p className="text-error text-sm text-center">{error}</p>}

          <PrimaryButton
            type="submit"
            className="rounded-xl mt-4 shadow-md text-lg font-bold"
            disabled={!taskName.trim() || isLoading}
          >
            {isLoading ? 'Saving...' : 'Save & Continue'}
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
};

export default FirstTask;
