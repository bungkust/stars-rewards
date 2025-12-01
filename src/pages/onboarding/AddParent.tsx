import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { H1Header } from '../../components/design-system/H1Header';
import { PrimaryButton } from '../../components/design-system/PrimaryButton';

const AddParent = () => {
  const navigate = useNavigate();
  const { updateParentName, setOnboardingStep, isLoading } = useAppStore();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const { error: updateError } = await updateParentName(name.trim());

      if (updateError) {
        setError('Failed to save name. Please try again.');
        return;
      }
      
      // Move to next step
      setOnboardingStep('add-child');
      navigate('/onboarding/add-child');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center app-gradient p-6">
      <div className="w-full max-w-md text-center">
        <H1Header className="mb-2">Add Parent Profile</H1Header>
        <p className="text-gray-500 mb-8">What should we call you?</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold">Parent Name / Nickname</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input input-bordered w-full rounded-xl text-center text-xl"
              placeholder="e.g. Mom, Dad, John"
              autoFocus
              required
            />
          </div>

          {error && <p className="text-error text-sm">{error}</p>}

          <PrimaryButton 
            type="submit" 
            className="rounded-xl mt-4 shadow-md text-lg font-bold"
            disabled={!name.trim() || isLoading}
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
};

export default AddParent;
