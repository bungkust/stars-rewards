import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { PrimaryButton } from '../../components/design-system/PrimaryButton';

const REPETITION_OPTIONS = ['Once', 'Daily', 'Weekly', 'Monthly'];

const DIFFICULTY_PRESETS = [
  { label: 'MILESTONE', value: 0, desc: 'No Star Reward (Trigger for Milestone)', color: 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-600 border-gray-200' },
  { label: 'EASY', value: 5, desc: 'Quick daily win (e.g., Brush teeth)', color: 'bg-gradient-to-br from-green-50 to-green-100 text-green-600 border-green-200' },
  { label: 'MEDIUM', value: 10, desc: 'Daily responsibility (e.g., Make bed)', color: 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 border-blue-200' },
  { label: 'HARD', value: 15, desc: 'Habit formation (e.g., Practice music)', color: 'bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600 border-purple-200' },
  { label: 'SPECIAL', value: 25, desc: 'One-off project (e.g., Wash car)', color: 'bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600 border-amber-200' },
];

const FirstTask = () => {
  const navigate = useNavigate();
  const { addTask, children, setOnboardingStep, isLoading } = useAppStore();
  
  // Default to the first child added for simplicity in onboarding
  const child = children[0];
  
  const [title, setTitle] = useState('');
  const [reward, setReward] = useState(10);
  const [duration, setDuration] = useState(0);
  const [repetition, setRepetition] = useState('Once');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const { error: dbError } = await addTask({
      name: title.trim(),
      reward_value: Number(reward),
      type: (repetition === 'Once' ? 'ONE_TIME' : 'RECURRING') as "ONE_TIME" | "RECURRING",
      recurrence_rule: repetition,
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
    <div className="min-h-screen flex flex-col items-center justify-center app-gradient p-6">
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
              <span className="label-text font-bold">Difficulty & Reward Guide</span>
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {DIFFICULTY_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setReward(preset.value)}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${preset.color} ${reward === preset.value ? 'ring-2 ring-offset-1 ring-primary' : 'hover:brightness-95'}`}
                >
                  <span className="font-bold text-xs">{preset.label}</span>
                  <span className="text-lg font-extrabold">{preset.value} Stars</span>
                  <span className="text-[10px] opacity-80 leading-tight mt-1">{preset.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-bold">Reward (Stars)</span>
              </label>
              <input 
                type="number" 
                className="input input-bordered w-full rounded-xl" 
                value={reward}
                onChange={(e) => setReward(Number(e.target.value))}
                min={0}
                required
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-bold">Duration (Min)</span>
                <span className="label-text-alt text-gray-400">(Optional)</span>
              </label>
              <input 
                type="number" 
                className="input input-bordered w-full rounded-xl" 
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min={0}
                step={5}
                placeholder="0"
              />
            </div>
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold">Repetition</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {REPETITION_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setRepetition(opt)}
                  className={`btn btn-sm rounded-full normal-case ${repetition === opt ? 'btn-primary text-white' : 'btn-outline border-gray-300 text-gray-600'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
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
