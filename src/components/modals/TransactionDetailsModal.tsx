import React from 'react';
import { Dialog } from '@headlessui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaStar, FaClock, FaInfoCircle, FaSlidersH, FaGift, FaCheckCircle } from 'react-icons/fa';
import { PrimaryButton } from '../design-system/PrimaryButton';

interface TransactionDetailsModalProps {
    isOpen: boolean;
    transaction: {
        id: string;
        type: string;
        amount: number;
        created_at: string;
        description?: string;
        reference_id?: string;
    } | null;
    onClose: () => void;
}

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({ isOpen, transaction, onClose }) => {
    if (!transaction) return null;

    const getIcon = () => {
        switch (transaction.type) {
            case 'TASK_VERIFIED': return <FaCheckCircle className="w-6 h-6 text-success" />;
            case 'REWARD_REDEEMED': return <FaGift className="w-6 h-6 text-warning" />;
            case 'MANUAL_ADJ': return <FaSlidersH className="w-6 h-6 text-info" />;
            default: return <FaInfoCircle className="w-6 h-6 text-gray-400" />;
        }
    };

    const getTitle = () => {
        switch (transaction.type) {
            case 'TASK_VERIFIED': return 'Mission Completed';
            case 'REWARD_REDEEMED': return 'Reward Redeemed';
            case 'MANUAL_ADJ': return 'Manual Adjustment';
            default: return 'Transaction Details';
        }
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
                                        <div className="p-3 bg-base-200 rounded-full">
                                            {getIcon()}
                                        </div>
                                        <div className="flex-1">
                                            <Dialog.Title as="h3" className="text-xl font-bold text-gray-900 leading-tight">
                                                {getTitle()}
                                            </Dialog.Title>
                                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                                <FaClock className="w-3 h-3" />
                                                <span>{new Date(transaction.created_at).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-1 gap-3 mt-2">
                                        <div className="bg-base-100 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                                            <span className="text-xs text-gray-500 uppercase font-bold mb-1">Amount</span>
                                            <div className={`flex items-center gap-1 font-black text-2xl ${transaction.amount > 0 ? 'text-success' : 'text-error'}`}>
                                                <FaStar className="w-5 h-5" />
                                                <span>{transaction.amount > 0 ? '+' : ''}{transaction.amount}</span>
                                            </div>
                                        </div>

                                        {transaction.description && (
                                            <div className="bg-base-100 p-4 rounded-xl">
                                                <span className="text-xs text-gray-500 uppercase font-bold mb-1 block">Reason / Description</span>
                                                <p className="text-gray-700 font-medium italic">"{transaction.description}"</p>
                                            </div>
                                        )}
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

export default TransactionDetailsModal;
