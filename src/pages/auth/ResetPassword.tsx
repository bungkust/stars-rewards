import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { H1Header } from '../../components/design-system/H1Header';
import { PrimaryButton } from '../../components/design-system/PrimaryButton';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updatePassword, isLoading } = useAppStore();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { setAuthFromUrl } = useAppStore();

  // Check if we have the required tokens from URL and set auth
  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const type = searchParams.get('type');

    if (accessToken && refreshToken && type === 'recovery') {
      // Set auth session from URL parameters
      setAuthFromUrl();
    } else {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [searchParams, setAuthFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter a new password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const { error: updateError } = await updatePassword(password);

    if (updateError) {
      setError(updateError.message || 'Failed to update password. Please try again.');
      return;
    }

    setSuccess(true);

    // Redirect to login after 3 seconds
    setTimeout(() => {
      navigate('/login');
    }, 3000);
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
            <H1Header className="text-3xl">Password Updated!</H1Header>
            <p className="text-gray-500">
              Your password has been successfully updated. You can now log in with your new password.
            </p>
          </div>

          <div className="mt-6">
            <p className="text-sm text-gray-600 mb-4">
              Redirecting to login page in 3 seconds...
            </p>
            <PrimaryButton onClick={() => navigate('/login')} className="rounded-xl">
              Go to Login Now
            </PrimaryButton>
          </div>
        </div>
      </div>
    );
  }

  const hasValidToken = searchParams.get('access_token') && searchParams.get('refresh_token') && searchParams.get('type') === 'recovery';

  if (!hasValidToken) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center app-gradient p-6">
        <div className="w-full max-w-md text-center">
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <H1Header className="text-3xl">Invalid Reset Link</H1Header>
            <p className="text-gray-500">
              This password reset link is invalid or has expired. Please request a new password reset.
            </p>
          </div>

          <div className="space-y-4 mt-6">
            <PrimaryButton onClick={() => navigate('/forgot-password')} className="rounded-xl">
              Request New Reset Link
            </PrimaryButton>
            <button
              onClick={() => navigate('/login')}
              className="w-full text-gray-600 hover:text-gray-800 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center app-gradient p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <H1Header>Reset Password</H1Header>
          <p className="text-gray-500">Enter your new password below.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold">New Password</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-bordered w-full rounded-xl pr-12"
                placeholder="••••••••"
                required
                disabled={isLoading}
                minLength={6}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold">Confirm New Password</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input input-bordered w-full rounded-xl pr-12"
                placeholder="••••••••"
                required
                disabled={isLoading}
                minLength={6}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {error && <p className="text-error text-sm mt-2">{error}</p>}

          <PrimaryButton
            type="submit"
            className={`rounded-xl mt-6 shadow-md text-lg font-bold ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Password'}
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

export default ResetPassword;
