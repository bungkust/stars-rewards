import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FaTrophy } from 'react-icons/fa';
import { PrimaryButton } from '../design-system/PrimaryButton';

interface RewardRedemptionSuccessModalProps {
  isOpen: boolean;
  rewardName: string;
  onClose: () => void;
}

const RewardRedemptionSuccessModal: React.FC<RewardRedemptionSuccessModalProps> = ({ isOpen, rewardName, onClose }) => {
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
              <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-8 text-center align-middle shadow-2xl transition-all">
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center animate-bounce">
                    <FaTrophy className="w-12 h-12 text-warning" />
                  </div>
                </div>
                
                <Dialog.Title as="h2" className="text-2xl font-bold text-gray-800 mb-2">
                  Congratulation!
                </Dialog.Title>
                <p className="text-lg text-gray-600 mb-4">
                  You bought <span className="font-bold text-primary">"{rewardName}"</span>
                </p>
                
                <div className="bg-base-100 p-4 rounded-xl mb-6 border-2 border-dashed border-primary/30">
                  <p className="text-sm text-gray-500 font-medium">
                    Show this screen to your parent to get your reward!
                  </p>
                </div>
                
                <PrimaryButton onClick={onClose} className="rounded-xl text-lg">
                  Yay! Done
                </PrimaryButton>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default RewardRedemptionSuccessModal;

