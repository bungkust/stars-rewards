import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { downloadAvatarAsDataUri } from '../../utils/avatarUtils';
import { FaPlus } from 'react-icons/fa';
import { PrimaryButton } from '../../components/design-system/PrimaryButton';
import { SecondaryButton } from '../../components/design-system/SecondaryButton';

const AVATAR_OPTIONS = [
  'https://api.dicebear.com/9.x/adventurer/svg?seed=Felix',
  'https://api.dicebear.com/9.x/adventurer/svg?seed=Aneka',
  'https://api.dicebear.com/9.x/adventurer/svg?seed=Oliver',
  'https://api.dicebear.com/9.x/adventurer/svg?seed=Bella',
  'https://api.dicebear.com/9.x/adventurer/svg?seed=Milo',
  'https://api.dicebear.com/9.x/adventurer/svg?seed=Sofia',
  'https://api.dicebear.com/9.x/adventurer/svg?seed=Leo',
  'https://api.dicebear.com/9.x/adventurer/svg?seed=Zoe',
  'https://api.dicebear.com/9.x/adventurer/svg?seed=Ryan',
  'https://api.dicebear.com/9.x/adventurer/svg?seed=Luna',
];

const AddChild = () => {
  const navigate = useNavigate();
  const { addChild, setOnboardingStep, children, isLoading } = useAppStore();

  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const saveChild = async () => {
    setErrorMsg('');

    if (dob > today) {
      setErrorMsg('Date of birth cannot be in the future');
      return false;
    }

    const { error } = await addChild({
      name,
      birth_date: dob,
      avatar_url: await downloadAvatarAsDataUri(selectedAvatar),
    });

    if (error) {
      setErrorMsg('Failed to add child. Please try again.');
      return false;
    }
    return true;
  };

  const handleAddAnother = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    if (children.length >= 4) {
      setErrorMsg('Maximum 4 children allowed.');
      return;
    }

    const success = await saveChild();
    if (success) {
      setSuccessMsg(`Added ${name}! You can add another child below.`);
      // Reset form
      setName('');
      setDob('');
      setSelectedAvatar(AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)]);
    }
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();

    // If form is filled, save current child first
    if (name) {
      const success = await saveChild();
      if (!success) return;
    } else if (children.length === 0) {
      // Prevent continuing if NO children exist at all and form is empty
      setErrorMsg('Please add at least one child.');
      return;
    }

    setOnboardingStep('first-task');
    navigate('/onboarding/first-task');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center app-gradient p-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-primary text-center mb-2">Add Your Child</h1>
        <p className="text-gray-500 text-center mb-8">Let's create a profile for your little star.</p>

        {successMsg && (
          <div className="alert alert-success mb-6 shadow-sm">
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="alert alert-error mb-6 shadow-sm">
            <span>{errorMsg}</span>
          </div>
        )}

        <form className="flex flex-col gap-6">

          {/* Avatar Selection */}
          <div className="flex flex-col items-center gap-4">
            <div className="avatar">
              <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img src={selectedAvatar} alt="Selected Avatar" />
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto py-4 px-4 w-full justify-start md:justify-center">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`w-10 h-10 flex-shrink-0 rounded-full overflow-hidden border-2 transition-all ${selectedAvatar === avatar ? 'border-primary scale-110' : 'border-transparent'}`}
                >
                  <img src={avatar} alt="avatar option" />
                </button>
              ))}
            </div>
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold">Child's Name</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSuccessMsg('');
                setErrorMsg('');
              }}
              className="input input-bordered w-full rounded-xl"
              placeholder="e.g. Alice"
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold">Date of Birth</span>
            </label>
            <input
              type="date"
              value={dob}
              max={today}
              onChange={(e) => setDob(e.target.value)}
              className="input input-bordered w-full rounded-xl text-neutral"
            />
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <SecondaryButton
              onClick={handleAddAnother}
              className="rounded-xl"
              disabled={!name || isLoading}
            >
              <FaPlus className="mr-2" /> {isLoading ? 'Saving...' : 'Save & Add Another Child'}
            </SecondaryButton>

            <PrimaryButton
              onClick={handleContinue}
              className="rounded-xl shadow-md text-lg font-bold"
              disabled={isLoading || (!name && children.length === 0)}
            >
              {isLoading ? 'Saving...' : (children.length > 0 && !name ? 'Continue' : 'Save & Continue')}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddChild;
