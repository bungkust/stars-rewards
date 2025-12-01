import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FaStar } from 'react-icons/fa';
import { PrimaryButton } from '../design-system/PrimaryButton';

interface TaskCompletionModalProps {
  isOpen: boolean;
  taskName: string;
  rewardValue: number;
  onClose: () => void;
}

const TaskCompletionModal: React.FC<TaskCompletionModalProps> = ({ isOpen, taskName, rewardValue, onClose }) => {
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
                  <div className="relative">
                    <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center animate-pulse">
                      <FaStar className="w-12 h-12 text-warning" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                      +{rewardValue}
                    </div>
                  </div>
                </div>
                
                <Dialog.Title as="h2" className="text-2xl font-bold text-gray-800 mb-2">
                  Good Job!
                </Dialog.Title>
                <p className="text-gray-500 mb-6">
                  You finished <span className="font-bold text-primary">"{taskName}"</span>.
                  <br/>
                  Ask your parent to approve it to get your stars!
                </p>
                
                <PrimaryButton onClick={onClose} className="rounded-xl text-lg">
                  Okay, Got it!
                </PrimaryButton>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default TaskCompletionModal;

