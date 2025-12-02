import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FaExclamationTriangle, FaTrash } from 'react-icons/fa';
import { PrimaryButton } from '../design-system/PrimaryButton';
import { SecondaryButton } from '../design-system/SecondaryButton';

interface AccountDeletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const AccountDeletionModal: React.FC<AccountDeletionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading
}) => {
  const [confirmationText, setConfirmationText] = useState('');
  const requiredText = 'DELETE MY ACCOUNT';

  const canDelete = confirmationText === requiredText;

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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-center align-middle shadow-2xl transition-all">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                    <FaExclamationTriangle className="w-10 h-10 text-red-500" />
                  </div>
                </div>

                <Dialog.Title as="h2" className="text-xl font-bold text-gray-800 mb-4">
                  Delete Account
                </Dialog.Title>

                <div className="text-left mb-6">
                  <p className="text-gray-600 mb-4">
                    This action <strong>cannot be undone</strong>. This will permanently delete your account and remove all associated data including:
                  </p>

                  <ul className="text-sm text-gray-600 space-y-1 mb-4">
                    <li>• Family information and settings</li>
                    <li>• All children profiles</li>
                    <li>• Task history and rewards</li>
                    <li>• Transaction records</li>
                    <li>• Account preferences</li>
                  </ul>

                  <p className="text-gray-600 mb-4">
                    To confirm deletion, type <strong>"{requiredText}"</strong> below:
                  </p>

                  <input
                    type="text"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    className="input input-bordered w-full text-center font-mono"
                    placeholder={requiredText}
                    disabled={isLoading}
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <PrimaryButton
                    onClick={onConfirm}
                    disabled={!canDelete || isLoading}
                    className="rounded-xl text-lg bg-red-500 hover:bg-red-600 border-red-500"
                  >
                    <FaTrash className="w-4 h-4 mr-2" />
                    {isLoading ? 'Deleting...' : 'Delete Account Permanently'}
                  </PrimaryButton>
                  <SecondaryButton onClick={onClose} disabled={isLoading} className="rounded-xl">
                    Cancel
                  </SecondaryButton>
                </div>

                <p className="text-xs text-gray-400 mt-4">
                  This action will log you out immediately after completion.
                </p>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AccountDeletionModal;
