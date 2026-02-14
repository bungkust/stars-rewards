import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaTrash, FaTimes, FaChild, FaCalendarAlt, FaStar, FaCheckCircle, FaExclamationTriangle, FaSlidersH } from 'react-icons/fa';
import { useAppStore } from '../../store/useAppStore';
import type { HistoryItemEntry } from '../shared/HistoryList';
import ConfirmationModal from './ConfirmationModal';

interface AdminHistoryDetailModalProps {
    isOpen: boolean;
    item: HistoryItemEntry | null;
    onClose: () => void;
    onDelete: (item: HistoryItemEntry) => Promise<void>;
}

const AdminHistoryDetailModal: React.FC<AdminHistoryDetailModalProps> = ({ isOpen, item, onClose, onDelete }) => {
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

                                    {!isEditing ? (
                                        <div className="bg-base-100 p-4 rounded-xl border border-base-200">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Description</h4>
                                            <p className="text-gray-700 text-sm">
                                                {item.description || "No specific details available."}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase ml-1">Edit Description / Reason</h4>
                                            <textarea
                                                className="textarea textarea-bordered w-full rounded-xl text-sm min-h-[100px]"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                placeholder="Enter new description or reason..."
                                            />
                                        </div>
                                    )}

                                    {/* Additional info (Notes, Rejection, Progress) - Hide while editing to focus */}
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
                                            <span className="text-xs text-gray-400 uppercase font-bold mb-1">Value</span>
                                            <div className={`flex items-center gap-1 font-black text-lg ${item.amount !== undefined && item.amount > 0 ? 'text-success' : item.amount !== undefined && item.amount < 0 ? 'text-error' : 'text-gray-400'}`}>
                                                {item.amount !== undefined ? (
                                                    <>
                                                        <FaStar className="w-4 h-4" />
                                                        <span>{item.amount > 0 ? '+' : ''}{item.amount}</span>
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

export default AdminHistoryDetailModal;
