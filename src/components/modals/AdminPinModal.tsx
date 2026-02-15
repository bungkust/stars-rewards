import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NativeBiometric } from 'capacitor-native-biometric';
import { Device } from '@capacitor/device';
import { useAppStore } from '../../store/useAppStore';
import { BiFingerprint } from 'react-icons/bi';
import { PatternLock } from '../common/PatternLock';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AdminPinModal = ({ isOpen, onClose, onSuccess }: AdminPinModalProps) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [path, setPath] = useState<number[]>([]);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const { verifyPin, verifyPattern, toggleAdminMode, biometricEnabled, parentPattern, preferredAuthMethod } = useAppStore();

  // 'pin' | 'pattern' | 'biometric'. Logic: if pattern is set, check preference.
  // If preference is 'biometric', defaults to PIN under the hood for the UI state if auth fails, 
  // but triggers biometric immediately.
  const [authMode, setAuthMode] = useState<'pin' | 'pattern'>(() => {
    if (parentPattern && preferredAuthMethod === 'pattern') return 'pattern';
    return 'pin';
  });

  const navigate = useNavigate();

  // Check for Biometric Availability on Mount
  useEffect(() => {
    const checkBiometric = async () => {
      try {
        const info = await Device.getInfo();
        if (info.platform === 'web') return; // Skip on web

        const result = await NativeBiometric.isAvailable();
        if (result.isAvailable) {
          setIsBiometricAvailable(true);
          // Auto-prompt ONLY if enabled AND it is the preferred method
          if (isOpen && biometricEnabled && preferredAuthMethod === 'biometric') {
            performBiometricAuth();
          }
        }
      } catch (e) {
        console.log('Biometric not available:', e);
      }
    };

    if (isOpen) {
      checkBiometric();
    }
  }, [isOpen, biometricEnabled, preferredAuthMethod]);

  // Update authMode when modal opens or preference changes
  // This ensures if user changes settings and comes back, it reflects immediately
  useEffect(() => {
    if (isOpen) {
      if (parentPattern && preferredAuthMethod === 'pattern') {
        setAuthMode('pattern');
      } else {
        setAuthMode('pin');
      }
      setError(false);
      setPin('');
      setPath([]);
    }
  }, [isOpen, parentPattern, preferredAuthMethod]);


  const performBiometricAuth = async () => {
    try {
      await NativeBiometric.verifyIdentity({
        reason: "Access Parent Features",
        title: "Fingerprint Authentication",
        subtitle: "Log in to access parent features",
        description: "Use your fingerprint to authenticate",
      });

      handleSuccess();
    } catch (error) {
      console.log("Biometric authentication failed or cancelled", error);
      // Don't show error state, just let them use PIN
    }
  };

  const handleSuccess = () => {
    setPin('');
    setError(false);
    toggleAdminMode(true); // Enable Admin Mode
    onClose();
    if (onSuccess) {
      onSuccess();
    } else {
      navigate('/parent');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyPin(pin)) {
      handleSuccess();
    } else {
      setError(true);
      setPin('');
    }
  };

  const handlePatternFinish = (pattern: string) => {
    if (verifyPattern(pattern)) {
      handleSuccess();
    } else {
      setError(true);
      // Path is reset by the onFinish handler in the JSX
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-base-100 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-scale-in relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 btn btn-circle btn-sm btn-ghost z-10"
        >
          ✕
        </button>

        <div className="p-8 pt-10">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-neutral mb-2">Parent Access</h3>
            <p className="text-neutral/60">
              {authMode === 'pin' ? 'Enter PIN to continue' : 'Draw Pattern to continue'}
            </p>
          </div>

          {authMode === 'pin' ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setPin(val);
                  setError(false);
                  // Auto-submit on 4th digit
                  if (val.length === 4) {
                    // Small delay to let React update state
                    setTimeout(() => {
                      if (verifyPin(val)) {
                        handleSuccess();
                      } else {
                        setError(true);
                        setPin('');
                      }
                    }, 100);
                  }
                }}
                className={`input input-lg text-center text-3xl font-bold w-full bg-base-200 focus:bg-white transition-all tracking-widest ${error ? 'input-error animate-shake' : 'input-primary'}`}
                placeholder="••••"
                autoFocus={!isBiometricAvailable || preferredAuthMethod !== 'biometric'}
              />

              {error && (
                <p className="text-error text-sm text-center">Incorrect PIN. Try again.</p>
              )}
            </form>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className={`p-4 rounded-3xl bg-base-200/50 ${error ? 'animate-shake border border-error' : ''}`}>
                <PatternLock
                  width={240}
                  path={path}
                  onChange={(val) => {
                    setPath(val);
                    setError(false);
                  }}
                  onFinish={() => {
                    handlePatternFinish(path.join('-'));
                    setPath([]);
                  }}
                  error={error}
                />
              </div>
              {error && (
                <p className="text-error text-sm text-center">Incorrect Pattern. Try again.</p>
              )}
            </div>
          )}

          {isBiometricAvailable && biometricEnabled && (
            <div className="flex justify-center w-full mt-6">
              <button
                type="button"
                onClick={performBiometricAuth}
                className="btn btn-circle btn-lg btn-ghost border-2 border-base-200 text-primary"
                title="Use Biometric Authentication"
              >
                <BiFingerprint size={32} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPinModal;
