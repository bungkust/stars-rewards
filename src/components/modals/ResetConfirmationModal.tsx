import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface ResetConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const ResetConfirmationModal: React.FC<ResetConfirmationModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [confirmText, setConfirmText] = useState('');
    const isConfirmed = confirmText === 'RESET';

    const handleConfirm = () => {
        if (isConfirmed) {
            onConfirm();
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
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    y: 0,
                                    transition: { type: 'spring', damping: 25, stiffness: 300 }
                                }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl"
                            >
                                <div className="flex items-center gap-4 mb-4 text-error">
                                    <div className="p-3 bg-red-100 rounded-full">
                                        <FaExclamationTriangle className="w-6 h-6" />
                                    </div>
                                    <Dialog.Title as="h3" className="text-xl font-bold">
                                        Reset Application?
                                    </Dialog.Title>
                                </div>

                                <div className="mt-2">
                                    <p className="text-sm text-gray-500 mb-4">
                                        This will <span className="font-bold text-error">PERMANENTLY DELETE</span> all data, including:
                                    </p>
                                    <ul className="list-disc list-inside text-sm text-gray-500 mb-6 pl-2 space-y-1">
                                        <li>All family profiles and settings</li>
                                        <li>All missions and rewards</li>
                                        <li>All star history and logs</li>
                                    </ul>
                                    <p className="text-sm text-gray-600 font-medium mb-2">
                                        This action cannot be undone. Please type <span className="font-mono font-bold select-all">RESET</span> to confirm.
                                    </p>

                                    <input
                                        type="text"
                                        className="input input-bordered w-full input-error"
                                        placeholder="Type RESET"
                                        value={confirmText}
                                        onChange={(e) => setConfirmText(e.target.value)}
                                    />
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        className="btn btn-ghost"
                                        onClick={onClose}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-error text-white"
                                        disabled={!isConfirmed}
                                        onClick={handleConfirm}
                                    >
                                        Reset Everything
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </div>
                    </div>
                </Dialog>
            )}
        </AnimatePresence>
    );
};

export default ResetConfirmationModal;
