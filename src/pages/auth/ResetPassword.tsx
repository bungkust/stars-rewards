import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { H1Header } from '../../components/design-system/H1Header';
import { PrimaryButton } from '../../components/design-system/PrimaryButton';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updatePassword, isLoading, session } = useAppStore();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null); // null = checking, true = valid, false = invalid

  // Check if we have a valid session (handled by onAuthStateChange listener)
  useEffect(() => {
    const checkAuthState = () => {
      // The onAuthStateChange listener handles token validation and session setup
      // We just need to check if we have a valid session
      if (session) {
        setIsValidToken(true);
      } else {
        // Check if we have recovery tokens in URL (but let the listener handle it)
        let accessToken = searchParams.get('access_token');
        let refreshToken = searchParams.get('refresh_token');
        let type = searchParams.get('type');

        // If not found in search params, try hash fragment (legacy support)
        if (!accessToken || !refreshToken) {
          const urlParams = new URLSearchParams(window.location.hash.substring(1));
          accessToken = accessToken || urlParams.get('access_token');
          refreshToken = refreshToken || urlParams.get('refresh_token');
          type = type || urlParams.get('type');
        }

        console.log('ResetPassword: URL params', { accessToken: !!accessToken, refreshToken: !!refreshToken, type });

        if (!accessToken || !refreshToken || type !== 'recovery') {
          setIsValidToken(false);
          setError('Invalid reset link. Please request a new password reset.');
        }
        // If we have tokens, the onAuthStateChange listener will handle setting the session
      }
    };

    checkAuthState();
  }, [searchParams, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    console.log('ResetPassword: Submitting form with password length:', password.length);

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

    try {
      console.log('ResetPassword: Calling updatePassword...');
      const { error: updateError } = await updatePassword(password);

      if (updateError) {
        console.error('ResetPassword: Update password error:', updateError);
        setError(updateError.message || 'Failed to update password. Please try again.');
        return;
      }

      console.log('ResetPassword: Password updated successfully');
      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        console.log('ResetPassword: Redirecting to login');
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('ResetPassword: Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    }
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

  // Show loading while validating token
  if (isValidToken === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center app-gradient p-6">
        <div className="w-full max-w-md text-center">
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <H1Header className="text-2xl">Validating Link</H1Header>
            <p className="text-gray-500">Please wait while we validate your reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
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
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
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
          <p className="text-gray-500 mb-4">Enter your new password below.</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-700 text-sm">
              🔐 <strong>Password Requirements:</strong><br/>
              • Minimum 6 characters<br/>
              • Both password fields must match
            </p>
          </div>
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
