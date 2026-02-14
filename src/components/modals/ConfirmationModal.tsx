import React from 'react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle, FaQuestionCircle } from 'react-icons/fa';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info' | 'success';
    isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'info',
    isLoading = false
}) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'danger':
                return {
                    icon: <FaExclamationTriangle className="w-6 h-6 text-error" />,
                    iconBg: 'bg-error/10',
                    btn: 'btn btn-error text-white'
                };
            case 'warning':
                return {
                    icon: <FaExclamationTriangle className="w-6 h-6 text-warning" />,
                    iconBg: 'bg-warning/10',
                    btn: 'btn btn-warning text-white'
                };
            case 'success':
                return {
                    icon: <FaQuestionCircle className="w-6 h-6 text-success" />,
                    iconBg: 'bg-success/10',
                    btn: 'btn btn-success text-white'
                };
            default:
                return {
                    icon: <FaQuestionCircle className="w-6 h-6 text-primary" />,
                    iconBg: 'bg-primary/10',
                    btn: 'btn btn-primary text-white'
                };
        }
    };

    const styles = getVariantStyles();

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
                    className="relative z-[100]"
                    onClose={onClose}
                >
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />

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
                                className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`p-3 rounded-full ${styles.iconBg}`}>
                                        {styles.icon}
                                    </div>
                                    <Dialog.Title as="h3" className="text-xl font-bold text-gray-900 leading-tight">
                                        {title}
                                    </Dialog.Title>
                                </div>

                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        {message}
                                    </p>
                                </div>

                                <div className="mt-8 flex gap-3">
                                    <button
                                        type="button"
                                        className="btn btn-ghost flex-1 rounded-xl"
                                        onClick={onClose}
                                        disabled={isLoading}
                                    >
                                        {cancelLabel}
                                    </button>
                                    <button
                                        type="button"
                                        className={`${styles.btn} flex-1 rounded-xl`}
                                        onClick={onConfirm}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <span className="loading loading-spinner loading-sm" />
                                        ) : (
                                            confirmLabel
                                        )}
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

export default ConfirmationModal;
