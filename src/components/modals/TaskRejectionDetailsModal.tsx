import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { PrimaryButton } from '../design-system/PrimaryButton';

interface TaskRejectionDetailsModalProps {
  isOpen: boolean;
  taskName: string;
  reason: string;
  onClose: () => void;
}

const TaskRejectionDetailsModal: React.FC<TaskRejectionDetailsModalProps> = ({ isOpen, taskName, reason, onClose }) => {
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
                <Dialog.Title as="h2" className="text-2xl font-bold text-gray-800 mb-4">
                  Mission Not Approved
                </Dialog.Title>
                
                <div className="bg-base-100 p-4 rounded-xl mb-6 text-left">
                  <p className="text-sm text-gray-500 mb-1">Mission:</p>
                  <p className="font-bold text-gray-800 mb-3">{taskName}</p>
                  
                  <div className="divider my-2"></div>
                  
                  <p className="text-sm text-gray-500 mb-1">Parent's Note:</p>
                  <p className="text-error font-medium italic">"{reason || 'Try again!'}"</p>
                </div>
                
                <PrimaryButton onClick={onClose} className="rounded-xl text-lg">
                  I'll Try Again
                </PrimaryButton>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default TaskRejectionDetailsModal;

