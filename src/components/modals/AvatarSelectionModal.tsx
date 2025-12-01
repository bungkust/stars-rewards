import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
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
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
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
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AvatarSelectionModal;

