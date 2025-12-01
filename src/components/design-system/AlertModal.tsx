import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';

interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger' | 'success';
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const AlertModal: React.FC<AlertModalProps> = ({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Yes',
  cancelText = 'Cancel',
  type = 'warning',
  onClose, 
  onConfirm,
  isLoading 
}) => {
  const getColorClass = () => {
    switch (type) {
      case 'danger': return 'text-error';
      case 'success': return 'text-success';
      case 'info': return 'text-info';
      default: return 'text-warning';
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
              <Dialog.Panel className="w-full max-w-xs transform overflow-hidden rounded-2xl bg-white p-6 text-center align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className={`text-xl font-bold mb-2 ${getColorClass()}`}
                >
                  {title}
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-gray-600 mb-6">{message}</p>
                </div>

                <div className="flex flex-col gap-3">
                  <PrimaryButton 
                    onClick={onConfirm} 
                    disabled={isLoading} 
                    className={`rounded-xl text-lg ${type === 'danger' ? 'bg-error border-error hover:bg-error/90' : ''}`}
                  >
                    {isLoading ? 'Processing...' : confirmText}
                  </PrimaryButton>
                  <SecondaryButton onClick={onClose} disabled={isLoading} className="rounded-xl">
                    {cancelText}
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

export default AlertModal;

