import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { PrimaryButton } from '../design-system/PrimaryButton';
import { SecondaryButton } from '../design-system/SecondaryButton';
import { H1Header } from '../design-system/H1Header';

interface RejectionReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
}

const RejectionReasonModal: React.FC<RejectionReasonModalProps> = ({ isOpen, onClose, onConfirm, isLoading }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onConfirm(reason.trim());
      setReason(''); // Reset after submit
    }
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
                <H1Header className="text-center mb-2 !text-xl">Reject Task?</H1Header>
                <p className="text-gray-500 text-center mb-6 text-sm">
                  Help your child understand why this task wasn't approved so they can try again.
                </p>
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <textarea
                    className="textarea textarea-bordered h-24 w-full rounded-xl"
                    placeholder="e.g. You forgot to put the toys in the bin..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    autoFocus
                    required
                  />

                  <div className="flex flex-col gap-2 mt-2">
                    <PrimaryButton 
                      type="submit"
                      disabled={!reason.trim() || isLoading}
                      className="bg-error border-error hover:bg-red-600 hover:border-red-600 text-white"
                    >
                      {isLoading ? 'Rejecting...' : 'Reject Task'}
                    </PrimaryButton>
                    <SecondaryButton type="button" onClick={onClose} disabled={isLoading}>
                      Cancel
                    </SecondaryButton>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default RejectionReasonModal;

