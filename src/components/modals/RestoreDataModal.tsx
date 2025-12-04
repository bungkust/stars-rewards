import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCloudUploadAlt, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaCloudDownloadAlt, FaFileAlt } from 'react-icons/fa';
import { useAppStore } from '../../store/useAppStore';

interface RestoreDataModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type RestoreState = 'upload' | 'confirm' | 'restoring' | 'success' | 'error';

const RestoreDataModal = ({ isOpen, onClose, onSuccess }: RestoreDataModalProps) => {
    const { importData } = useAppStore();
    const [state, setState] = useState<RestoreState>('upload');
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [restoreData, setRestoreData] = useState<any>(null);
    const [filename, setFilename] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const json = JSON.parse(text);

            // Handle wrapped data (e.g. { version: 1, data: { ... } })
            const payload = json.data || json;

            // Basic validation
            if (!payload.children && !payload.tasks) {
                throw new Error('Invalid backup format: Missing children or tasks');
            }

            setRestoreData(payload);
            setFilename(file.name);
            setState('confirm');
        } catch (error) {
            console.error('File parsing error:', error);
            setErrorMsg('Invalid backup file. Please select a valid JSON file.');
            setState('error');
        }
    };

    const handleConfirm = async () => {
        setState('restoring');
        try {
            const { error } = await importData(restoreData);
            if (error) throw error;
            setState('success');
        } catch (error: any) {
            console.error('Restore error:', error);
            setErrorMsg(error.message || 'Unknown error occurred');
            setState('error');
        }
    };

    const handleClose = () => {
        if (state === 'restoring') return;
        setState('upload');
        setErrorMsg('');
        setRestoreData(null);
        setFilename('');
        onClose();
    };

    const handleRetry = () => {
        setState('upload');
        setErrorMsg('');
        setRestoreData(null);
        setFilename('');
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
                        {/* 1. Upload State */}
                        {state === 'upload' && (
                            <div className="text-center space-y-6">
                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                                    <FaCloudUploadAlt className="text-4xl text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Restore Data</h3>
                                    <p className="text-gray-500 mt-2 text-sm">
                                        Upload your backup file (.json) to restore your family data.
                                    </p>
                                </div>

                                <div
                                    className="border-2 border-dashed border-base-300 rounded-xl p-8 cursor-pointer hover:border-primary hover:bg-base-50 transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <p className="text-primary font-bold">Click to Select File</p>
                                    <p className="text-xs text-gray-400 mt-1">Supported format: .json</p>
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept=".json"
                                    className="hidden"
                                />

                                <button onClick={handleClose} className="btn btn-ghost w-full">
                                    Cancel
                                </button>
                            </div>
                        )}

                        {/* 2. Confirm State */}
                        {state === 'confirm' && (
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto">
                                    <FaExclamationTriangle className="text-3xl text-warning" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Confirm Restore?</h3>

                                <div className="bg-base-100 p-3 rounded-xl flex items-center gap-3 text-left">
                                    <FaFileAlt className="text-gray-400 text-xl" />
                                    <div className="overflow-hidden">
                                        <p className="font-bold text-sm truncate">{filename}</p>
                                        <p className="text-xs text-gray-500">Ready to restore</p>
                                    </div>
                                </div>

                                <div className="text-gray-600 text-sm bg-error/5 p-3 rounded-xl border border-error/10">
                                    <p className="font-bold text-error mb-1">Warning:</p>
                                    <p>This will <b>overwrite</b> all current data on this device.</p>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button onClick={handleRetry} className="btn btn-ghost flex-1">
                                        Back
                                    </button>
                                    <button onClick={handleConfirm} className="btn btn-primary flex-1">
                                        Restore Now
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 3. Restoring State */}
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
                                    <p className="text-sm text-gray-500 mt-2">Please wait while we process your file.</p>
                                </div>
                            </div>
                        )}

                        {/* 4. Success State */}
                        {state === 'success' && (
                            <div className="text-center space-y-4 py-4">
                                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                                    <FaCheckCircle className="text-3xl text-success" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Restore Complete!</h3>
                                <p className="text-gray-600">Your family data has been successfully restored.</p>
                                <button onClick={onSuccess} className="btn btn-primary w-full mt-4">
                                    Continue to App
                                </button>
                            </div>
                        )}

                        {/* 5. Error State */}
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
                                <button onClick={handleRetry} className="btn btn-outline w-full mt-4">
                                    Try Again
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default RestoreDataModal;
