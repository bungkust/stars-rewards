import { useState } from 'react';
import { PrimaryButton } from '../design-system/PrimaryButton';
import { downloadAvatarAsDataUri } from '../../utils/avatarUtils';

interface AvatarSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  onSelect: (newAvatarUrl: string) => void;
  childName: string;
}

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

const AvatarSelectionModal = ({ isOpen, onClose, currentAvatar, onSelect, childName }: AvatarSelectionModalProps) => {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || AVATAR_OPTIONS[0]);
  const [isLoading, setIsLoading] = useState(false);

  // Sync selected avatar when modal opens or currentAvatar changes
  // useEffect(() => {
  //   if (currentAvatar) setSelectedAvatar(currentAvatar);
  // }, [currentAvatar, isOpen]); 
  // Simplified: just initialize state. If prop changes, we might want to reset, 
  // but for a modal, usually re-mounting handles it or we can use a key.
  // Actually, better to reset on open.

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Logic to save happens in parent, here we just prepare the data URL
      // Actually, standardizing on Data URI for consistency with AddChild
      const dataUri = await downloadAvatarAsDataUri(selectedAvatar);
      onSelect(dataUri);
      onClose();
    } catch (error) {
      console.error("Failed to process avatar", error);
      alert("Failed to save avatar");
    } finally {
      setIsLoading(false);
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

        <div className="p-6 text-center">
          <h3 className="text-xl font-bold text-neutral mb-2">Change Avatar</h3>
          <p className="text-sm text-neutral/60 mb-6">Pick a new look for {childName}</p>

          <div className="flex flex-col items-center gap-6">
            {/* Preview */}
            <div className="avatar">
              <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img src={selectedAvatar} alt="Selected Avatar" />
              </div>
            </div>

            {/* Grid of Options */}
            <div className="grid grid-cols-5 gap-3 w-full justify-items-center max-h-48 overflow-y-auto p-2">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${selectedAvatar === avatar ? 'border-primary scale-110 shadow-md' : 'border-transparent hover:border-base-300'}`}
                >
                  <img src={avatar} alt="avatar option" loading="lazy" />
                </button>
              ))}
            </div>

            <PrimaryButton
              onClick={handleSave}
              disabled={isLoading}
              className="w-full rounded-xl"
            >
              {isLoading ? 'Saving...' : 'Save New Avatar'}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarSelectionModal;
