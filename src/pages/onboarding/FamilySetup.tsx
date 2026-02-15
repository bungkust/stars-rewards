import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { PrimaryButton } from '../../components/design-system/PrimaryButton';

const FamilySetup = () => {
  const navigate = useNavigate();
  const { createFamily, setOnboardingStep } = useAppStore();
  const [familyName, setFamilyNameInput] = useState('');
  const [parentName, setParentNameInput] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  const handlePinChange = (val: string) => {
    if (/^\d*$/.test(val) && val.length <= 4) {
      setPin(val);
    }
  };

  const handleConfirmChange = (val: string) => {
    if (/^\d*$/.test(val) && val.length <= 4) {
      setConfirmPin(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!familyName.trim()) {
      setError('Please enter a family name.');
      return;
    }
    if (!parentName.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (pin.length !== 4) {
      setError('PIN must be 4 digits.');
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match.');
      return;
    }

    // Create Family (Local Storage)
    const { error: createError } = await createFamily(familyName.trim(), pin, parentName.trim());

    if (createError) {
      setError('Failed to create family. Please try again.');
      return;
    }

    setOnboardingStep('add-child');
    navigate('/onboarding/add-child');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center app-gradient p-6">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">Setup Family Profile</h1>
        <p className="text-gray-500 mb-8">Create your family identity and security PIN.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold">Family Name</span>
            </label>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyNameInput(e.target.value)}
              className="input input-bordered w-full rounded-xl text-center text-xl"
              placeholder="e.g. The Smiths"
              autoFocus
              required
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold">Your Name</span>
            </label>
            <input
              type="text"
              value={parentName}
              onChange={(e) => setParentNameInput(e.target.value)}
              className="input input-bordered w-full rounded-xl text-center text-xl"
              placeholder="e.g. Mom or Dad"
              required
            />
          </div>

          <div className="flex gap-4">
            <div className="form-control w-1/2">
              <label className="label">
                <span className="label-text font-bold">Create PIN</span>
              </label>
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => handlePinChange(e.target.value)}
                className="input input-bordered text-center text-xl tracking-widest w-full rounded-xl"
                placeholder="####"
                required
              />
            </div>
            <div className="form-control w-1/2">
              <label className="label">
                <span className="label-text font-bold">Confirm PIN</span>
              </label>
              <input
                type="password"
                inputMode="numeric"
                value={confirmPin}
                onChange={(e) => handleConfirmChange(e.target.value)}
                className="input input-bordered text-center text-xl tracking-widest w-full rounded-xl"
                placeholder="####"
                required
              />
            </div>
          </div>

          <div className="text-center -mt-2">
            <p className="text-xs text-neutral/50">
              You can switch to <strong>Pattern</strong> or <strong>Biometric</strong> authentication later in <br />
              <span className="font-bold">Settings &gt; Security</span>
            </p>
          </div>

          {error && <p className="text-error text-sm">{error}</p>}

          <PrimaryButton
            type="submit"
            className="rounded-xl mt-4 shadow-md text-lg font-bold"
            disabled={!familyName.trim() || !parentName.trim() || pin.length < 4 || confirmPin.length < 4}
          >
            Save & Continue
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
};

export default FamilySetup;
