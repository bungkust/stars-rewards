import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FaCheckCircle } from 'react-icons/fa';
import { PrimaryButton } from '../design-system/PrimaryButton';

interface VerificationSuccessModalProps {
  isOpen: boolean;
  type: 'approve' | 'reject';
  onClose: () => void;
}

const VerificationSuccessModal: React.FC<VerificationSuccessModalProps> = ({ isOpen, type, onClose }) => {
  const isApprove = type === 'approve';

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
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isApprove ? 'bg-green-100' : 'bg-red-100'}`}>
                    <FaCheckCircle className={`w-10 h-10 ${isApprove ? 'text-green-500' : 'text-red-500'}`} />
                  </div>
                </div>
                
                <Dialog.Title as="h2" className="text-2xl font-bold text-gray-800 mb-2">
                  {isApprove ? 'Mission Approved!' : 'Mission Rejected'}
                </Dialog.Title>
                <p className="text-gray-500 mb-6">
                  {isApprove 
                    ? 'Stars have been added to the child\'s balance.' 
                    : 'The child will see the reason in their dashboard.'}
                </p>
                
                <PrimaryButton onClick={onClose} className="rounded-xl text-lg">
                  Done
                </PrimaryButton>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default VerificationSuccessModal;

