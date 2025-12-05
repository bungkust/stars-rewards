import React from 'react';
import { Dialog } from '@headlessui/react';
import { AnimatePresence, motion } from 'framer-motion';
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

  const handleSave = () => {
    onSave(selectedAvatar);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          static
          open={true}
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="relative z-50"
          onClose={onClose}
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Dialog.Panel
                as={motion.div}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  transition: { type: 'spring', damping: 25, stiffness: 300 }
                }}
                className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl"
              >
                <Dialog.Title
                  as="h3"
                  className="text-xl font-bold text-center mb-6 text-gray-800"
                >
                  Choose New Look
                </Dialog.Title>

                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  {AVATAR_OPTIONS.map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`relative w-16 h-16 rounded-full overflow-hidden border-4 transition-all ${selectedAvatar === avatar
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
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default AvatarSelectionModal;

