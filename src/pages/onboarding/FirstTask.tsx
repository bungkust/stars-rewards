import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { PrimaryButton } from '../../components/design-system/PrimaryButton';

const FirstTask = () => {
  const navigate = useNavigate();
  const { addTask, children, setOnboardingStep, isLoading } = useAppStore();
  
  // Default to the first child added for simplicity in onboarding
  const child = children[0];
  
  const [title, setTitle] = useState('');
  const [reward, setReward] = useState(10);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Correct mapping to DB Schema (tasks table)
    // Note: 'childId' is not stored on the task template (tasks table).
    // Task templates are parent-owned. When a child "does" a task, we create a 'child_tasks_log' entry.
    // For Onboarding, we are just creating the Template.
    
    const { error: dbError } = await addTask({
      name: title.trim(),
      reward_value: Number(reward),
      type: 'ONE_TIME', // Simple default for first task
      recurrence_rule: 'Once', // Friendly string or leave empty
      is_active: true
    });

    if (dbError) {
      setError('Failed to create task. Please try again.');
      return;
    }
    
    setOnboardingStep('first-reward');
    navigate('/onboarding/first-reward');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 p-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-primary text-center mb-2">Create First Mission</h1>
        <p className="text-gray-500 text-center mb-8">Set a simple mission for {child?.name || 'your child'} to get started.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold">Mission Title</span>
            </label>
            <input 
              type="text" 
              placeholder="e.g. Make your bed" 
              className="input input-bordered w-full rounded-xl" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold">Reward (Stars)</span>
            </label>
            <input 
              type="number" 
              className="input input-bordered w-full rounded-xl" 
              value={reward}
              onChange={(e) => setReward(Number(e.target.value))}
              min={1}
              required
            />
          </div>

          {error && <p className="text-error text-sm text-center">{error}</p>}

          <PrimaryButton 
            type="submit" 
            className="rounded-xl mt-4 text-white font-bold text-lg shadow-md"
            disabled={!title.trim() || isLoading}
          >
            {isLoading ? 'Saving...' : 'Next: Create First Reward'}
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
};

export default FirstTask;
