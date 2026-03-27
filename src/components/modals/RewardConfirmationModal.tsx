import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FaGift, FaStar } from 'react-icons/fa';
import { PrimaryButton } from '../design-system/PrimaryButton';
import { SecondaryButton } from '../design-system/SecondaryButton';

interface RewardConfirmationModalProps {
  isOpen: boolean;
  rewardName: string;
  description?: string;
  cost: number;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  canAfford?: boolean;
}

const RewardConfirmationModal: React.FC<RewardConfirmationModalProps> = ({ 
  isOpen, 
  rewardName, 
  description,
  cost, 
  onClose, 
  onConfirm,
  isLoading,
  canAfford = true
}) => {
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
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center animate-bounce-subtle">
                    <FaGift className="w-10 h-10 text-purple-500" />
                  </div>
                </div>
                
                <Dialog.Title as="h2" className="text-xl font-bold text-gray-800 mb-2">
                  {canAfford ? 'Buy this reward?' : 'Reward Details'}
                </Dialog.Title>
                <p className="text-lg font-bold text-primary mb-1">{rewardName}</p>
                
                {description && (
                  <p className="text-sm text-gray-500 mb-4 px-4">{description}</p>
                )}
                
                <div className="flex justify-center items-center gap-2 text-warning font-bold text-xl mb-8">
                  <FaStar /> {cost} Stars
                </div>
                
                {!canAfford && (
                  <div className="bg-orange-50 text-orange-600 p-3 rounded-xl mb-6 text-sm font-medium">
                    You need {cost} stars to buy this. Keep going!
                  </div>
                )}
                
                <div className="flex flex-col gap-3">
                  {canAfford ? (
                    <PrimaryButton onClick={onConfirm} disabled={isLoading} className="rounded-xl text-lg">
                      {isLoading ? 'Buying...' : 'Yes, I want it!'}
                    </PrimaryButton>
                  ) : (
                    <PrimaryButton onClick={onClose} className="rounded-xl text-lg bg-gray-400 border-none">
                      Back to Shop
                    </PrimaryButton>
                  )}
                  {canAfford && (
                    <SecondaryButton onClick={onClose} disabled={isLoading} className="rounded-xl">
                      Maybe later
                    </SecondaryButton>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default RewardConfirmationModal;

