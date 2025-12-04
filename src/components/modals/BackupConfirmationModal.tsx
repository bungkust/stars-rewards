import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCloudDownloadAlt, FaCheckCircle, FaTimesCircle, FaFileExport } from 'react-icons/fa';

interface BackupConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}

type BackupState = 'confirm' | 'processing' | 'success' | 'error';

const BackupConfirmationModal = ({ isOpen, onClose, onConfirm }: BackupConfirmationModalProps) => {
    const [state, setState] = useState<BackupState>('confirm');
    const [errorMsg, setErrorMsg] = useState<string>('');

    const handleConfirm = async () => {
        setState('processing');
        try {
            // Add a small delay to show the animation (backup is usually too fast)
            await new Promise(resolve => setTimeout(resolve, 1500));
            await onConfirm();
            setState('success');
        } catch (error: any) {
            console.error('Backup error:', error);
            setErrorMsg(error.message || 'Unknown error occurred');
            setState('error');
        }
    };

    const handleClose = () => {
        if (state === 'processing') return;
        setState('confirm');
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
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                                    <FaFileExport className="text-3xl text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Download Backup?</h3>
                                <div className="text-gray-600 text-sm space-y-2">
                                    <p>This will generate a JSON file containing all your family data, including:</p>
                                    <ul className="text-xs text-gray-500 list-disc list-inside text-left bg-base-100 p-3 rounded-lg">
                                        <li>Children profiles & balances</li>
                                        <li>Tasks & Rewards</li>
                                        <li>Transaction history</li>
                                        <li>App settings</li>
                                    </ul>
                                    <p>You can use this file to restore your data later.</p>
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
                                        className="btn btn-primary flex-1"
                                    >
                                        Yes, Download
                                    </button>
                                </div>
                            </div>
                        )}

                        {state === 'processing' && (
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
                                    <h3 className="text-lg font-bold text-gray-900">Generating Backup...</h3>
                                    <p className="text-sm text-gray-500 mt-2">Packaging your stars and rewards...</p>
                                </div>
                            </div>
                        )}

                        {state === 'success' && (
                            <div className="text-center space-y-4 py-4">
                                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                                    <FaCheckCircle className="text-3xl text-success" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Backup Ready!</h3>
                                <p className="text-gray-600">Your backup file has been downloaded.</p>
                                <button
                                    onClick={handleClose}
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
                                <h3 className="text-xl font-bold text-gray-900">Backup Failed</h3>
                                <p className="text-gray-600">Something went wrong while generating the backup.</p>
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

export default BackupConfirmationModal;
