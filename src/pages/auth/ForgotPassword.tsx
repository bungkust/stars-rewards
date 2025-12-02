import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { H1Header } from '../../components/design-system/H1Header';
import { PrimaryButton } from '../../components/design-system/PrimaryButton';
import { SecondaryButton } from '../../components/design-system/SecondaryButton';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { resetPassword, isLoading } = useAppStore();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    const { error: resetError } = await resetPassword(email);

    if (resetError) {
      setError(resetError.message || 'Failed to send reset email. Please try again.');
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center app-gradient p-6">
        <div className="w-full max-w-md text-center">
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <H1Header className="text-3xl">Check Your Email</H1Header>
            <p className="text-gray-500">
              We've sent password reset instructions to <strong>{email}</strong>
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Didn't receive the email? Check your spam folder or try again.
            </p>

            <div className="flex flex-col gap-3">
              <PrimaryButton onClick={() => navigate('/login')} className="rounded-xl">
                Back to Login
              </PrimaryButton>
              <SecondaryButton onClick={() => setSuccess(false)} className="rounded-xl">
                Send Again
              </SecondaryButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center app-gradient p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <H1Header>Forgot Password</H1Header>
          <p className="text-gray-500">Enter your email address and we'll send you a link to reset your password.</p>
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
              disabled={isLoading}
            />
          </div>

          {error && <p className="text-error text-sm mt-2">{error}</p>}

          <PrimaryButton
            type="submit"
            className={`rounded-xl mt-6 shadow-md text-lg font-bold ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </PrimaryButton>

          <button
            type="button"
            className="btn btn-ghost btn-sm mt-2"
            onClick={() => navigate('/login')}
            disabled={isLoading}
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
