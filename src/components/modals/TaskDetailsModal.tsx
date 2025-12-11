import React from 'react';
import { Dialog } from '@headlessui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaStar, FaClock, FaRedo, FaCalendarWeek, FaCalendarAlt, FaBolt, FaInfoCircle } from 'react-icons/fa';
import { PrimaryButton } from '../design-system/PrimaryButton';

interface TaskDetailsModalProps {
    isOpen: boolean;
    task: {
        name: string;
        reward_value: number;
        recurrence_rule?: string;
        expiry_time?: string;
        description?: string;
    } | null;
    onClose: () => void;
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ isOpen, task, onClose }) => {
    if (!task) return null;

    const getRecurrenceIcon = (rule?: string) => {
        switch (rule) {
            case 'Once': return <FaBolt className="w-5 h-5 text-accent" />;
            case 'Daily': return <FaRedo className="w-5 h-5 text-primary" />;
            case 'Weekly': return <FaCalendarWeek className="w-5 h-5 text-secondary" />;
            case 'Monthly': return <FaCalendarAlt className="w-5 h-5 text-info" />;
            default: return <FaClock className="w-5 h-5 text-gray-400" />;
        }
    };

    const getRecurrenceLabel = (rule?: string) => {
        if (!rule) return 'One Time';
        return rule === 'Once' ? 'One Time Mission' : `Repeats ${rule}`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <Dialog
                    static
                    open={true}
                    as={motion.div}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative z-50"
                    onClose={onClose}
                >
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Dialog.Panel
                                as={motion.div}
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    y: 0,
                                    transition: { type: 'spring', damping: 20, stiffness: 300 }
                                }}
                                className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl"
                            >
                                <div className="flex flex-col gap-4">
                                    {/* Header with Icon */}
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-primary/10 rounded-full">
                                            <FaInfoCircle className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <Dialog.Title as="h3" className="text-xl font-bold text-gray-900 leading-tight">
                                                {task.name}
                                            </Dialog.Title>
                                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                                {getRecurrenceIcon(task.recurrence_rule)}
                                                <span>{getRecurrenceLabel(task.recurrence_rule)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 gap-3 mt-2">
                                        <div className="bg-base-100 p-3 rounded-xl flex flex-col items-center justify-center text-center">
                                            <span className="text-xs text-gray-500 uppercase font-bold mb-1">Reward</span>
                                            <div className="flex items-center gap-1 text-warning font-black text-lg">
                                                <FaStar />
                                                <span>{task.reward_value}</span>
                                            </div>
                                        </div>

                                        <div className="bg-base-100 p-3 rounded-xl flex flex-col items-center justify-center text-center">
                                            <span className="text-xs text-gray-500 uppercase font-bold mb-1">Due By</span>
                                            <div className="flex items-center gap-1 text-gray-700 font-bold text-lg">
                                                <FaClock className="text-gray-400 w-4 h-4" />
                                                <span>{task.expiry_time || 'Anytime'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Close Button */}
                                    <div className="mt-4">
                                        <PrimaryButton onClick={onClose} className="w-full rounded-xl">
                                            Close
                                        </PrimaryButton>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </div>
                    </div>
                </Dialog>
            )}
        </AnimatePresence>
    );
};

export default TaskDetailsModal;
