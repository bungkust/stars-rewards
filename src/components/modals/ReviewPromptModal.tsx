import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FaHeart, FaStar } from 'react-icons/fa';
import { PrimaryButton } from '../design-system/PrimaryButton';
import { SecondaryButton } from '../design-system/SecondaryButton';

interface ReviewPromptModalProps {
    isOpen: boolean;
    onRateNow: () => void;
    onMaybeLater: () => void;
    onNoThanks: () => void;
}

const ReviewPromptModal: React.FC<ReviewPromptModalProps> = ({
    isOpen,
    onRateNow,
    onMaybeLater,
    onNoThanks
}) => {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onMaybeLater}>
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
                            <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 text-center align-middle shadow-2xl transition-all">
                                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <FaHeart className="h-9 w-9" />
                                </div>

                                <div className="mb-3 flex justify-center gap-1 text-warning">
                                    {[0, 1, 2, 3, 4].map(item => (
                                        <FaStar key={item} className="h-5 w-5" />
                                    ))}
                                </div>

                                <Dialog.Title as="h2" className="mb-2 text-2xl font-bold text-gray-900">
                                    Enjoying Star Habit?
                                </Dialog.Title>

                                <p className="mb-6 text-sm leading-relaxed text-gray-600">
                                    If Star Habit helps your family build better routines, a quick review would mean a lot.
                                </p>

                                <div className="flex flex-col gap-3">
                                    <PrimaryButton onClick={onRateNow} className="rounded-xl text-base">
                                        Rate now
                                    </PrimaryButton>
                                    <SecondaryButton onClick={onMaybeLater} className="rounded-xl">
                                        Maybe later
                                    </SecondaryButton>
                                    <button
                                        type="button"
                                        onClick={onNoThanks}
                                        className="btn btn-ghost btn-sm text-gray-500"
                                    >
                                        No thanks
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default ReviewPromptModal;
