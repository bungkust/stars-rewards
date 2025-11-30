import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

const ParentSetup = () => {
  const navigate = useNavigate();
  const { signUpUser, setOnboardingStep, isLoading } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!email || !password) {
      setError('Please provide email and password.');
      return;
    }

    // Signup without PIN first (family name assumed empty)
    const { error: authError } = await signUpUser(email, password, '', '');
    
    if (authError) {
      setError(authError.message || 'Signup failed. Please try again.');
      return;
    }

    // Navigate to Family Setup where user will set Family Name (if logic kept) and PIN
    setOnboardingStep('family-setup');
    navigate('/onboarding/family-setup');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 p-6">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">Create Account</h1>
        <p className="text-gray-500 mb-8">Secure your family's Stars Rewards.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Email & Password */}
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
              minLength={6}
            />
          </div>
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold">Confirm Password</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input input-bordered w-full rounded-xl"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && <p className="text-error text-sm mt-2">{error}</p>}

          <button 
            type="submit" 
            className={`btn btn-primary rounded-xl w-full mt-6 shadow-md text-lg font-bold ${isLoading ? 'loading' : ''}`}
            disabled={isLoading || !email || !password || !confirmPassword}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ParentSetup;
