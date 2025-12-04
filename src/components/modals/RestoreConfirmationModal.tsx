import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaCloudDownloadAlt } from 'react-icons/fa';

interface RestoreConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    onSuccess?: () => void;
    filename?: string;
}

type RestoreState = 'confirm' | 'restoring' | 'success' | 'error';

const RestoreConfirmationModal = ({ isOpen, onClose, onConfirm, onSuccess, filename }: RestoreConfirmationModalProps) => {
    const [state, setState] = useState<RestoreState>('confirm');
    const [errorMsg, setErrorMsg] = useState<string>('');

    const handleConfirm = async () => {
        setState('restoring');
        try {
            await onConfirm();
            setState('success');
        } catch (error: any) {
            console.error('Restore error:', error);
            setErrorMsg(error.message || 'Unknown error occurred');
            setState('error');
        }
    };

    const handleClose = () => {
        if (state === 'restoring') return; // Prevent closing while restoring
        setState('confirm'); // Reset for next time
        setErrorMsg('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden"
                >
                    <div className="p-6">
                        {state === 'confirm' && (
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto">
                                    <FaExclamationTriangle className="text-3xl text-warning" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Restore Data?</h3>
                                <div className="text-gray-600 text-sm space-y-2">
                                    <p>You are about to restore data from:</p>
                                    <p className="font-mono bg-base-100 p-2 rounded text-xs break-all">{filename || 'Backup File'}</p>
                                    <p className="font-medium text-error">
                                        Warning: This will completely replace all current data (Children, Tasks, Rewards, History) with the backup data.
                                    </p>
                                    <p>This action cannot be undone.</p>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={handleClose}
                                        className="btn btn-ghost flex-1"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        className="btn btn-error flex-1"
                                    >
                                        Yes, Restore
                                    </button>
                                </div>
                            </div>
                        )}

                        {state === 'restoring' && (
                            <div className="text-center space-y-6 py-8">
                                <div className="relative w-20 h-20 mx-auto">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 border-4 border-primary/30 border-t-primary rounded-full"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <FaCloudDownloadAlt className="text-2xl text-primary" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Restoring Data...</h3>
                                    <p className="text-sm text-gray-500 mt-2">Please wait while we rewrite the stars...</p>
                                </div>
                            </div>
                        )}

                        {state === 'success' && (
                            <div className="text-center space-y-4 py-4">
                                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                                    <FaCheckCircle className="text-3xl text-success" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Restore Complete!</h3>
                                <p className="text-gray-600">Your data has been successfully restored.</p>
                                <button
                                    onClick={() => {
                                        if (onSuccess) onSuccess();
                                        else handleClose();
                                    }}
                                    className="btn btn-primary w-full mt-4"
                                >
                                    Done
                                </button>
                            </div>
                        )}

                        {state === 'error' && (
                            <div className="text-center space-y-4 py-4">
                                <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto">
                                    <FaTimesCircle className="text-3xl text-error" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Restore Failed</h3>
                                <p className="text-gray-600">Something went wrong during the restore process.</p>
                                {errorMsg && (
                                    <p className="text-xs text-error bg-error/5 p-2 rounded">{errorMsg}</p>
                                )}
                                <button
                                    onClick={handleClose}
                                    className="btn btn-outline w-full mt-4"
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default RestoreConfirmationModal;
