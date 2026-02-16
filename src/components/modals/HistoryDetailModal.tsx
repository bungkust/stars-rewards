import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaTrash, FaTimes, FaChild, FaCalendarAlt, FaStar, FaCheckCircle, FaExclamationTriangle, FaSlidersH, FaTrophy, FaShareAlt } from 'react-icons/fa';
import { useAppStore } from '../../store/useAppStore';
import type { HistoryItemEntry } from '../shared/HistoryList';
import ConfirmationModal from './ConfirmationModal';

interface HistoryDetailModalProps {
    isOpen: boolean;
    item: HistoryItemEntry | null;
    onClose: () => void;
    onDelete: (item: HistoryItemEntry) => Promise<void>;
    readOnly?: boolean;
}

const HistoryDetailModal: React.FC<HistoryDetailModalProps> = ({ isOpen, item, onClose, onDelete, readOnly = false }) => {
    const { updateTransaction, updateChildLog } = useAppStore();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Confirmation Modal States
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmLabel: string;
        variant: 'danger' | 'warning' | 'info' | 'success';
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        confirmLabel: '',
        variant: 'info',
        onConfirm: () => { },
    });

    React.useEffect(() => {
        if (item && isEditing) {
            if (item.type === 'verified' || item.type === 'redeemed' || item.type === 'manual') {
                setEditValue(item.description || '');
            } else {
                setEditValue(item.rejectionReason || item.notes || '');
            }
        }
    }, [item, isEditing]);

    if (!item) return null;

    const handleDeleteClick = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete History?',
            message: 'Are you sure you want to delete this history item? This action cannot be undone and will revert the star balance.',
            confirmLabel: 'Delete',
            variant: 'danger',
            onConfirm: async () => {
                setIsDeleting(true);
                await onDelete(item);
                setIsDeleting(false);
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                onClose();
            }
        });
    };

    const handleMarkFailed = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Mark as Failed?',
            message: 'Are you sure you want to mark this mission as FAILED? This will revert the awarded stars.',
            confirmLabel: 'Mark as Failed',
            variant: 'danger',
            onConfirm: async () => {
                setIsSaving(true);
                try {
                    await useAppStore.getState().markVerifiedTaskAsFailed(item.id, item.referenceId || '');
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    onClose();
                } catch (error) {
                    alert('Failed to change status.');
                } finally {
                    setIsSaving(false);
                }
            }
        });
    };

    const handleMarkSuccess = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Mark as Success?',
            message: 'Are you sure you want to mark this mission as SUCCESS? This will award stars to the child.',
            confirmLabel: 'Mark as Success',
            variant: 'success',
            onConfirm: async () => {
                setIsSaving(true);
                try {
                    const { tasks } = useAppStore.getState();
                    const task = tasks.find(t => t.id === item.taskId);
                    const rewardValue = task?.reward_value || 0;
                    await useAppStore.getState().verifyTask(item.id, item.childId || '', rewardValue);
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    onClose();
                } catch (error) {
                    alert('Failed to change status.');
                } finally {
                    setIsSaving(false);
                }
            }
        });
    };

    const handleShare = async () => {
        if (!item) return;

        const shareData = {
            title: 'Reward Achievement!',
            text: `Hooray! ${item.childName} just got "${item.title}"! So proud of this achievement. 🌟 #StarHabit #ParentingSuccess`,
            url: window.location.origin
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareData.text);
                alert('Share message copied to clipboard!');
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <Dialog
                    key="admin-history-detail-dialog"
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
                                <div className="border-b border-gray-100 pb-4">
                                    <div className="flex justify-between items-start gap-2">
                                        <Dialog.Title as="h3" className="text-xl font-bold text-gray-900 leading-snug flex-1 pr-8">
                                            {item.title}
                                        </Dialog.Title>
                                        <button onClick={onClose} className="btn btn-ghost btn-circle btn-sm -mr-1 -mt-1 shrink-0">
                                            <FaTimes className="text-gray-400" />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-y-1 gap-x-3 mt-2">
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                            <FaChild className="text-primary/60" />
                                            <span>For: <span className="font-bold text-gray-700">{item.childName || 'Unknown'}</span></span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                            <FaCalendarAlt className="text-secondary/60" />
                                            <span>Date: <span className="font-bold text-gray-700">{item.dateLabel || 'Unknown'}</span></span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-4">
                                    {/* Category (if applicable) */}
                                    {item.categoryName && (
                                        <div className="flex items-center gap-2 px-1">
                                            <span className="text-xs font-bold text-gray-400 uppercase">Category:</span>
                                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                                {item.categoryName}
                                            </span>
                                        </div>
                                    )}

                                    {/* Redeemed Reward Congratulations Banner (Child View) */}
                                    {readOnly && item.type === 'redeemed' && (
                                        <div className="flex flex-col items-center text-center space-y-6 py-6 px-1">
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
                                                className="relative"
                                            >
                                                <div className="w-28 h-28 bg-warning/10 rounded-full flex items-center justify-center border-4 border-warning/20 shadow-inner">
                                                    <FaTrophy className="text-warning w-14 h-14 drop-shadow-md" />
                                                </div>
                                                <motion.div
                                                    animate={{ rotate: [0, 15, -15, 0] }}
                                                    transition={{ repeat: Infinity, duration: 3 }}
                                                    className="absolute -top-2 -right-2 bg-white p-2 rounded-full shadow-lg border border-warning/10"
                                                >
                                                    <FaStar className="text-warning w-5 h-5" />
                                                </motion.div>
                                            </motion.div>

                                            <div className="space-y-3">
                                                <motion.h4
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.4 }}
                                                    className="text-3xl font-black text-neutral uppercase tracking-tight"
                                                >
                                                    Amazing Work!
                                                </motion.h4>
                                                <motion.p
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.5 }}
                                                    className="text-gray-500 font-medium px-4"
                                                >
                                                    You've earned <span className="text-secondary font-black italic text-xl underline decoration-warning/30 underline-offset-4 decoration-2">"{item.title}"</span>. Enjoy your well-deserved reward!
                                                </motion.p>
                                                <motion.p
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 0.6 }}
                                                    transition={{ delay: 0.8 }}
                                                    className="text-[10px] text-neutral uppercase font-bold tracking-widest"
                                                >
                                                    Redeemed on {item.dateLabel}
                                                </motion.p>
                                            </div>

                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.7 }}
                                                className="w-full bg-secondary/5 border-2 border-dashed border-secondary/20 p-5 rounded-3xl relative overflow-hidden group"
                                            >
                                                <div className="absolute inset-0 bg-secondary/5 translate-y-full group-hover:translate-y-0 transition-transform" />
                                                <p className="text-sm font-bold text-neutral leading-relaxed relative z-10">
                                                    Don't forget to show this screen to your parent to claim your reward! 🎁
                                                </p>
                                            </motion.div>
                                        </div>
                                    )}

                                    {!isEditing && item.type !== 'redeemed' && (
                                        <div className="bg-base-100 p-4 rounded-xl border border-base-200">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Description</h4>
                                            <p className="text-gray-700 text-sm">
                                                {item.description || "No specific details available."}
                                            </p>
                                        </div>
                                    )}

                                    {!isEditing && (item.notes || item.rejectionReason || (item.targetValue !== undefined && item.currentValue !== undefined)) && (
                                        <div className="space-y-3">
                                            {item.notes && (
                                                <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                                                    <h4 className="text-[10px] font-bold text-amber-600 uppercase mb-1">Child's Note</h4>
                                                    <p className="text-amber-900 text-sm italic">"{item.notes}"</p>
                                                </div>
                                            )}

                                            {item.rejectionReason && (
                                                <div className="bg-error/5 p-3 rounded-xl border border-error/10">
                                                    <h4 className="text-[10px] font-bold text-error uppercase mb-1">Rejection Reason</h4>
                                                    <p className="text-error text-sm">{item.rejectionReason}</p>
                                                </div>
                                            )}

                                            {item.targetValue !== undefined && item.currentValue !== undefined && (
                                                <div className="bg-info/5 p-3 rounded-xl border border-info/10">
                                                    <h4 className="text-[10px] font-bold text-info uppercase mb-1">Impact / Progress</h4>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-bold text-info/80">
                                                            {item.currentValue} / {item.targetValue} {item.unit || 'Units'}
                                                        </span>
                                                        <div className="w-24 bg-info/10 h-1.5 rounded-full overflow-hidden">
                                                            <div
                                                                className="bg-info h-full transition-all duration-500"
                                                                style={{ width: `${Math.min(100, (item.currentValue / item.targetValue) * 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        <div className="flex-1 bg-base-100 p-3 rounded-xl flex flex-col items-center justify-center text-center border border-base-200">
                                            <span className="text-xs text-gray-400 uppercase font-bold mb-1">
                                                {item.type === 'redeemed' ? 'Cost' : 'Value'}
                                            </span>
                                            <div className={`flex items-center gap-1 font-black text-lg ${item.type === 'redeemed' && readOnly ? 'text-warning' : (item.amount !== undefined && item.amount > 0 ? 'text-success' : item.amount !== undefined && item.amount < 0 ? 'text-error' : 'text-gray-400')}`}>
                                                {item.amount !== undefined ? (
                                                    <>
                                                        <FaStar className="w-4 h-4" />
                                                        <span>{item.type === 'redeemed' && readOnly ? Math.abs(item.amount) : (item.amount > 0 ? '+' : '') + item.amount}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-sm">{item.amountLabel || '-'}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-1 bg-base-100 p-3 rounded-xl flex flex-col items-center justify-center text-center border border-base-200">
                                            <span className="text-xs text-gray-400 uppercase font-bold mb-1">Status</span>
                                            <div className="font-bold text-gray-700 capitalize">
                                                {item.type.replace('_', ' ')}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {!readOnly ? (
                                    <div className="mt-8 flex flex-col gap-3">
                                        {/* Status Toggle Buttons */}
                                        <div className="flex flex-col gap-2 p-3 bg-base-100 rounded-xl border border-base-200">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase ml-1">Change Status</span>
                                            <div className="flex gap-2">
                                                {(item.type === 'verified') ? (
                                                    <button
                                                        onClick={handleMarkFailed}
                                                        disabled={isSaving}
                                                        className="btn btn-outline btn-error btn-sm flex-1 rounded-lg"
                                                    >
                                                        <FaExclamationTriangle className="mr-1" /> Mark as Failed
                                                    </button>
                                                ) : (item.type === 'failed' || item.type === 'rejected' || item.type === 'excused') ? (
                                                    <button
                                                        onClick={handleMarkSuccess}
                                                        disabled={isSaving}
                                                        className="btn btn-outline btn-success btn-sm flex-1 rounded-lg"
                                                    >
                                                        <FaCheckCircle className="mr-1" /> Mark as Success
                                                    </button>
                                                ) : null}
                                            </div>
                                        </div>

                                        {!isEditing ? (
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setIsEditing(true)}
                                                    className="btn btn-ghost flex-1 rounded-xl bg-base-200 text-neutral"
                                                >
                                                    <FaSlidersH className="w-4 h-4 mr-2" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={handleDeleteClick}
                                                    disabled={isDeleting}
                                                    className="btn btn-error btn-outline flex-1 rounded-xl"
                                                >
                                                    {isDeleting ? <span className="loading loading-spinner loading-sm" /> : <FaTrash className="w-4 h-4 mr-2" />}
                                                    Delete
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setIsEditing(false)}
                                                    disabled={isSaving}
                                                    className="btn btn-ghost flex-1 rounded-xl"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        setIsSaving(true);
                                                        try {
                                                            if (item.type === 'verified' || item.type === 'redeemed' || item.type === 'manual') {
                                                                await updateTransaction(item.id, { description: editValue });
                                                            } else {
                                                                if (item.type === 'rejected' || item.type === 'failed') {
                                                                    await updateChildLog(item.id, { rejection_reason: editValue });
                                                                } else if (item.type === 'excused') {
                                                                    await updateChildLog(item.id, { notes: editValue });
                                                                }
                                                            }
                                                            setIsEditing(false);
                                                        } catch (error) {
                                                            console.error('Failed to save edit:', error);
                                                            alert('Failed to save changes.');
                                                        } finally {
                                                            setIsSaving(false);
                                                        }
                                                    }}
                                                    disabled={isSaving || !editValue.trim()}
                                                    className="btn btn-primary flex-1 rounded-xl"
                                                >
                                                    {isSaving ? <span className="loading loading-spinner loading-sm" /> : 'Save Changes'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    item.type === 'redeemed' && (
                                        <div className="mt-8 flex flex-col gap-3">
                                            <motion.button
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.9 }}
                                                onClick={handleShare}
                                                className="btn btn-outline btn-secondary w-full rounded-2xl h-12 text-sm font-bold border-2"
                                            >
                                                <FaShareAlt className="mr-2" /> Share Achievement
                                            </motion.button>
                                            <motion.button
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 1 }}
                                                onClick={onClose}
                                                className="btn btn-primary w-full rounded-2xl h-14 text-lg font-bold shadow-lg shadow-primary/20"
                                            >
                                                Yay! Done
                                            </motion.button>
                                        </div>
                                    )
                                )}
                            </Dialog.Panel>
                        </div>
                    </div>
                </Dialog>
            )}

            <ConfirmationModal
                key="admin-history-delete-confirm"
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmLabel={confirmModal.confirmLabel}
                variant={confirmModal.variant}
                isLoading={isSaving || isDeleting}
            />
        </AnimatePresence>
    );
};

export default HistoryDetailModal;
