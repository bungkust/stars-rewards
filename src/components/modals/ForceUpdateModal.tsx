import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FaRocket, FaExclamationTriangle, FaDownload, FaArrowRight } from 'react-icons/fa';
import { PrimaryButton } from '../design-system/PrimaryButton';
import { SecondaryButton } from '../design-system/SecondaryButton';
import { redirectToStore } from '../../services/versionCheckService';

interface ForceUpdateModalProps {
  isOpen: boolean;
  isForce: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseNotes?: string;
  storeUrl?: string;
  onClose?: () => void;
}

export const ForceUpdateModal: React.FC<ForceUpdateModalProps> = ({
  isOpen,
  isForce,
  currentVersion,
  latestVersion,
  releaseNotes,
  storeUrl,
  onClose,
}) => {
  const handleUpdateClick = () => {
    redirectToStore(storeUrl);
  };

  const handleBackdropClose = () => {
    if (!isForce && onClose) {
      onClose();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[9999]" onClose={handleBackdropClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-90 translate-y-4"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-90 translate-y-4"
            >
              <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-3xl bg-white p-6 text-center align-middle shadow-2xl transition-all border border-gray-100">
                {/* Icon Header */}
                <div className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-primary/20 to-secondary/20 p-1">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-tr from-primary to-secondary text-white shadow-lg shadow-primary/30 animate-pulse">
                    {isForce ? (
                      <FaExclamationTriangle className="h-10 w-10" />
                    ) : (
                      <FaRocket className="h-10 w-10" />
                    )}
                  </div>
                  {isForce && (
                    <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-md">
                      !
                    </span>
                  )}
                </div>

                {/* Badge & Title */}
                <div className="mb-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 ${
                    isForce ? 'bg-red-100 text-red-700' : 'bg-primary/10 text-primary'
                  }`}>
                    {isForce ? 'Mandatory Update' : 'New Update Available'}
                  </span>
                  <Dialog.Title as="h2" className="text-2xl font-extrabold text-gray-900 tracking-tight">
                    {isForce ? 'Update Required' : 'Upgrade Star Habit'}
                  </Dialog.Title>
                </div>

                {/* Version comparison */}
                <div className="my-3 flex items-center justify-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 py-1.5 px-3 rounded-full w-fit mx-auto border border-gray-100">
                  <span>v{currentVersion}</span>
                  <FaArrowRight className="h-3 w-3 text-gray-400" />
                  <span className="font-bold text-primary">v{latestVersion}</span>
                </div>

                {/* Description */}
                <p className="mb-4 text-sm leading-relaxed text-gray-600">
                  {isForce
                    ? 'A mandatory new version of Star Habit is available. Please update to continue using the app.'
                    : 'A new version with fresh features and improvements is ready for your family!'}
                </p>

                {/* Release Notes Card */}
                {releaseNotes && (
                  <div className="mb-6 text-left bg-gray-50/80 rounded-2xl p-3.5 text-xs text-gray-600 border border-gray-100 max-h-28 overflow-y-auto">
                    <p className="font-semibold text-gray-800 mb-1">What\'s new:</p>
                    <p className="leading-relaxed whitespace-pre-line">{releaseNotes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <PrimaryButton
                    onClick={handleUpdateClick}
                    className="w-full rounded-2xl text-base py-3.5 shadow-lg shadow-primary/25 flex items-center justify-center gap-2 font-bold"
                  >
                    <FaDownload className="h-4 w-4" />
                    Update Now
                  </PrimaryButton>

                  {!isForce && onClose && (
                    <SecondaryButton
                      onClick={onClose}
                      className="w-full rounded-2xl text-base py-3"
                    >
                      Maybe Later
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

export default ForceUpdateModal;
