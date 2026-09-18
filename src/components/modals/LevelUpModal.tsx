import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FaAward, FaStar, FaTrophy } from 'react-icons/fa';
import { PrimaryButton } from '../design-system/PrimaryButton';
import type { LevelReward } from '../../utils/xpUtils';

interface LevelUpModalProps {
    milestone: {
        childName: string;
        previousLevel: number;
        level: number;
        levelName: string;
        totalXp: number;
        rewards: LevelReward[];
    } | null;
    onClose: () => void;
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({ milestone, onClose }) => {
    return (
        <Transition appear show={!!milestone} as={Fragment}>
            <Dialog as="div" className="relative z-[60]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-90"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-90"
                        >
                            <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-3xl bg-white p-7 text-center align-middle shadow-2xl transition-all">
                                {milestone && (
                                    <>
                                        <div className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-warning/20 text-warning">
                                            <FaTrophy className="h-12 w-12" />
                                            <div className="absolute -right-2 -top-2 rounded-full bg-primary px-3 py-1 text-sm font-black text-white">
                                                Lv {milestone.level}
                                            </div>
                                        </div>

                                        <Dialog.Title as="h2" className="mb-1 text-2xl font-black text-gray-900">
                                            Level Up!
                                        </Dialog.Title>
                                        <p className="mb-4 text-sm font-semibold text-gray-500">
                                            {milestone.childName} reached <span className="text-primary">Level {milestone.level} {milestone.levelName}</span>
                                        </p>

                                        <div className="mb-5 rounded-2xl bg-base-100 p-4">
                                            <div className="mb-3 flex items-center justify-center gap-2 text-sm font-bold text-gray-700">
                                                <FaStar className="text-warning" />
                                                {milestone.totalXp} total XP
                                            </div>
                                            {milestone.rewards.length > 0 ? (
                                                <div className="space-y-2 text-left">
                                                    {milestone.rewards.map(reward => (
                                                        <div key={`${reward.level}-${reward.title}`} className="flex gap-3 rounded-xl bg-white p-3">
                                                            <div className="mt-0.5 text-primary">
                                                                <FaAward />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-800">{reward.title}</p>
                                                                <p className="text-xs text-gray-500">{reward.description}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs font-medium text-gray-500">
                                                    New level title unlocked.
                                                </p>
                                            )}
                                        </div>

                                        <PrimaryButton onClick={onClose} className="w-full rounded-xl text-lg">
                                            Awesome!
                                        </PrimaryButton>
                                    </>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default LevelUpModal;
