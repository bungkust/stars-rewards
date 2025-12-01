import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { H1Header } from '../../components/design-system/H1Header';
import { PrimaryButton } from '../../components/design-system/PrimaryButton';

const Login = () => {
  const navigate = useNavigate();
  const { signInUser, isLoading, setOnboardingStep } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }

    const { error: authError } = await signInUser(email, password);

    if (authError) {
      setError(authError.message || 'Login failed. Please check your credentials.');
      return;
    }

    // Assuming if login is successful, onboarding is effectively "done" or we should check profile
    // For now, assume existing users are done with setup
    // But wait, useAppStore persists onboardingStep.
    // If they login on a new device, onboardingStep might be "family-setup" (default).
    // We should probably sync it or force it to completed.
    setOnboardingStep('completed');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center app-gradient p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <H1Header>Welcome Back</H1Header>
          <p className="text-gray-500">Sign in to manage your family.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold">Email</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered w-full rounded-xl"
              placeholder="parent@example.com"
              required
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold">Password</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered w-full rounded-xl"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-error text-sm mt-2">{error}</p>}

          <PrimaryButton 
            type="submit" 
            className={`rounded-xl mt-6 shadow-md text-lg font-bold ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </PrimaryButton>
          
          <button 
            type="button"
            className="btn btn-ghost btn-sm mt-2"
            onClick={() => navigate('/')} // Back to Welcome
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

