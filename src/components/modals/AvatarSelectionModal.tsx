import React from 'react';
import { PrimaryButton } from '../design-system/PrimaryButton';
import { SecondaryButton } from '../design-system/SecondaryButton';

const AVATAR_OPTIONS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Baby',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Ginger',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella',
];

interface AvatarSelectionModalProps {
  isOpen: boolean;
  currentAvatar: string;
  onClose: () => void;
  onSave: (newAvatarUrl: string) => void;
}

const AvatarSelectionModal: React.FC<AvatarSelectionModalProps> = ({ isOpen, currentAvatar, onClose, onSave }) => {
  const [selectedAvatar, setSelectedAvatar] = React.useState(currentAvatar);

  React.useEffect(() => {
    setSelectedAvatar(currentAvatar);
  }, [currentAvatar, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(selectedAvatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm transform scale-100 transition-transform">
        <h2 className="text-xl font-bold text-center mb-6 text-gray-800">Choose New Look</h2>
        
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {AVATAR_OPTIONS.map((avatar) => (
            <button
              key={avatar}
              onClick={() => setSelectedAvatar(avatar)}
              className={`relative w-16 h-16 rounded-full overflow-hidden border-4 transition-all ${
                selectedAvatar === avatar 
                  ? 'border-primary scale-110 shadow-lg' 
                  : 'border-transparent hover:scale-105'
              }`}
            >
              <img src={avatar} alt="Avatar option" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <PrimaryButton onClick={handleSave}>
            Save New Look
          </PrimaryButton>
          <SecondaryButton onClick={onClose}>
            Cancel
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
};

export default AvatarSelectionModal;

