import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import QRCode from 'react-qr-code';
import { AnimatePresence, motion } from 'framer-motion';
import { FaTrash, FaTimes, FaChild, FaCalendarAlt, FaStar, FaCheckCircle, FaExclamationTriangle, FaSlidersH, FaTrophy, FaShareAlt } from 'react-icons/fa';
import { useAppStore } from '../../store/useAppStore';
import type { HistoryItemEntry } from '../shared/HistoryList';
import ConfirmationModal from './ConfirmationModal';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';

import * as htmlToImage from 'html-to-image';
import achievementBg from '../../assets/achievement_bg.png';

interface HistoryDetailModalProps {
    isOpen: boolean;
    item: HistoryItemEntry | null;
    onClose: () => void;
    onDelete: (item: HistoryItemEntry) => Promise<void>;
    readOnly?: boolean;
}

const HistoryDetailModal: React.FC<HistoryDetailModalProps> = ({ isOpen, item, onClose, onDelete, readOnly = false }) => {
    const { updateTransaction, updateChildLog } = useAppStore();
    const isCelebration = readOnly && item?.type === 'redeemed';

    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

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
        setIsSharing(true);

        try {
            // Give a moment for animations and layout
            await new Promise(resolve => setTimeout(resolve, 500));

            // Capture the designated poster element
            const posterElement = document.getElementById('achievement-poster');
            if (!posterElement) throw new Error('Poster element not found');

            // WARM UP: First capture ensuring assets are loaded and rendered
            try {
                await htmlToImage.toPng(posterElement, { pixelRatio: 1, backgroundColor: '#ffffff' });
            } catch (e) {
                console.warn('Warmup capture failed, proceeding to main capture', e);
            }

            // Short delay after warmup
            await new Promise(resolve => setTimeout(resolve, 100));

            // FINAL CAPTURE: High quality blob
            const blob = await htmlToImage.toBlob(posterElement, {
                pixelRatio: 3, // High quality for sharing
                backgroundColor: '#ffffff',
            });

            if (!blob) throw new Error('Failed to generate image');

            // Use Capacitor Share for native sharing
            const safeChildName = item.childName || 'Child';
            const fileName = `achievement-${safeChildName.replace(/\s+/g, '-').toLowerCase()}.png`;

            // Check if we can share using Capacitor
            const canShare = await Share.canShare();

            if (canShare.value) {
                // For Capacitor Share, we need to write the file to the filesystem first
                const base64Data = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });

                const savedFile = await Filesystem.writeFile({
                    path: fileName,
                    data: base64Data,
                    directory: Directory.Cache
                });

                await Share.share({
                    title: 'Reward Achievement!',
                    text: `Hooray! ${safeChildName} just got "${item.title}"! So proud of this achievement. 🌟 #StarHabit #Parenting`,
                    url: savedFile.uri, // Some apps prefer url
                    dialogTitle: 'Share Achievement'
                });
            } else {
                const file = new File([blob], fileName, { type: 'image/png' });
                // Fallback for web/desktop where native share might not be available
                if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: 'Reward Achievement!',
                        text: `Hooray! ${safeChildName} just got "${item.title}"! So proud of this achievement. 🌟 #StarHabit #Parenting`,
                    });
                } else {
                    // Final Fallback: Download
                    const dataUrl = await htmlToImage.toPng(posterElement, { pixelRatio: 3 });
                    const link = document.createElement('a');
                    link.download = fileName;
                    link.href = dataUrl;
                    link.click();
                    alert('Sharing directly is not supported in this browser. The achievement poster has been saved to your device!');
                }
            }
        } catch (error) {
            console.error('Error sharing:', error);
            // If Capacitor Share fails (e.g. file sharing not supported on web), try download fallback
            try {
                const posterElement = document.getElementById('achievement-poster');
                if (posterElement) {
                    const safeChildName = item.childName || 'Child';
                    const dataUrl = await htmlToImage.toPng(posterElement, { pixelRatio: 3 });
                    const link = document.createElement('a');
                    link.download = `achievement-${safeChildName.replace(/\s+/g, '-').toLowerCase()}.png`;
                    link.href = dataUrl;
                    link.click();
                }
            } catch (e) {
                alert('Could not create the shareable image. Please try again.');
            }
        } finally {
            setIsSharing(false);
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
                    {/* ... (rest of the modal remains same) ... */}
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
                                className={`w-full max-w-sm transform overflow-hidden rounded-3xl bg-white text-left align-middle shadow-xl ${isCelebration ? 'p-0' : 'p-6'}`}
                            >
                                {isCelebration ? (
                                    <div
                                        className="relative w-full flex flex-col items-center text-center p-8 min-h-[500px]"
                                        style={{
                                            backgroundImage: `url(${achievementBg})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                        }}
                                    >
                                        <button
                                            onClick={onClose}
                                            className="absolute top-4 right-4 btn btn-circle btn-sm btn-ghost bg-white/50 backdrop-blur-sm border-0 shadow-sm z-10"
                                        >
                                            <FaTimes className="text-gray-600" />
                                        </button>

                                        {/* Hidden Poster Template for Image Generation */}
                                        {/* REMOVED: -left-[9999px] */}
                                        {/* ADDED: left-0 top-0 -z-50 (Behind everything but in viewport) */}
                                        {/* Hidden Poster Template for Image Generation */}
                                        {/* REMOVED: -left-[9999px] */}
                                        {/* ADDED: left-0 top-0 -z-50 (Behind everything but in viewport) */}
                                        <div
                                            id="achievement-poster"
                                            className="fixed left-0 top-0 w-[600px] h-[800px] bg-white text-center flex flex-col items-center justify-between p-8 overflow-hidden -z-50"
                                            style={{
                                                fontFamily: 'system-ui, sans-serif',
                                            }}
                                        >
                                            <img
                                                src={achievementBg}
                                                alt="Background"
                                                className="absolute inset-0 w-full h-full object-cover -z-10"
                                            />

                                            {/* Header Content - Reduced Top Margin and Spacing */}
                                            <div className="mt-8 space-y-4 w-full relative z-10 flex flex-col items-center">
                                                <div className="inline-block bg-white/90 backdrop-blur-sm px-6 py-2 rounded-full shadow-lg border-2 border-warning/20">
                                                    <h2 className="text-3xl font-black text-warning uppercase tracking-widest drop-shadow-sm">
                                                        CONGRATULATIONS!
                                                    </h2>
                                                </div>

                                                <div className="relative pt-4">
                                                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto shadow-xl border-[6px] border-warning/20">
                                                        <FaTrophy className="text-warning w-16 h-16 drop-shadow-md" />
                                                    </div>
                                                    <div className="absolute top-2 right-[25%] bg-warning text-white p-1.5 rounded-full shadow-lg rotate-12">
                                                        <FaStar className="w-5 h-5 animate-bounce" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Middle Content - Reduced Spacing */}
                                            <div className="space-y-4 w-full px-4 relative z-10">
                                                <p className="text-2xl text-gray-500/80 font-bold uppercase tracking-widest font-serif italic drop-shadow-sm mb-2">Superstar Achiever</p>
                                                <div className="bg-white/80 backdrop-blur-md px-8 py-4 rounded-[2rem] shadow-lg border-2 border-white/50 transform -rotate-2 inline-block max-w-full">
                                                    <h3 className="text-5xl font-black text-neutral break-words leading-tight drop-shadow-sm truncate px-2">
                                                        {item.childName?.split(' ')[0]}
                                                    </h3>
                                                </div>
                                            </div>

                                            {/* Footer Content - Reordered and Spaced Correctly */}
                                            <div className="mb-8 space-y-4 w-full relative z-10 flex flex-col items-center">
                                                <div className="space-y-2 w-full">
                                                    <p className="text-xl text-gray-500/80 font-medium tracking-wide">Has earned with Hard Work & Discipline</p>
                                                    <div className="bg-secondary/10 inline-block px-6 py-3 rounded-2xl border-2 border-secondary/20 shadow-sm mt-1 max-w-[90%]">
                                                        <h3 className="text-3xl font-black text-secondary uppercase tracking-tight leading-snug line-clamp-2">"{item.title}"</h3>
                                                    </div>
                                                </div>

                                                <div className="pt-2 opacity-90 w-full flex flex-col items-center">
                                                    <div className="flex items-center justify-center gap-3 mb-2 opacity-60">
                                                        <div className="w-8 h-1 bg-neutral/20 rounded-full" />
                                                        <span className="text-sm font-bold text-neutral/50 uppercase tracking-[0.15em]">Star Habit</span>
                                                        <div className="w-8 h-1 bg-neutral/20 rounded-full" />
                                                    </div>

                                                    <div className="bg-white p-3 rounded-xl shadow-md border border-neutral/10">
                                                        <QRCode
                                                            value="https://star-habit.kulino.tech/"
                                                            size={80}
                                                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                                            viewBox={`0 0 256 256`}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-400 font-medium mt-2 tracking-wide">Scan to start your journey</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Visible Celebration Content */}
                                        <div className="mt-8 mb-auto w-full space-y-6">
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
                                                className="relative inline-block"
                                            >
                                                <div className="inline-block bg-white/90 backdrop-blur-sm px-6 py-2 rounded-full shadow-lg border-2 border-warning/20 mb-6 transform -rotate-2">
                                                    <h2 className="text-xl font-black text-warning uppercase tracking-widest drop-shadow-sm">
                                                        CONGRATULATIONS!
                                                    </h2>
                                                </div>

                                                <div className="relative">
                                                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto shadow-xl border-[6px] border-warning/20">
                                                        <FaTrophy className="text-warning w-16 h-16 drop-shadow-md" />
                                                    </div>
                                                    <motion.div
                                                        animate={{ rotate: [0, 15, -15, 0] }}
                                                        transition={{ repeat: Infinity, duration: 3 }}
                                                        className="absolute -top-1 -right-1 bg-white p-2 rounded-full shadow-lg border border-warning/10"
                                                    >
                                                        <FaStar className="text-warning w-5 h-5" />
                                                    </motion.div>
                                                </div>
                                            </motion.div>

                                            <div className="space-y-2">
                                                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest font-serif italic">Superstar Achiever</p>
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.3 }}
                                                    className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/50"
                                                >
                                                    <h3 className="text-3xl font-black text-neutral break-words leading-tight">
                                                        {item.childName}
                                                    </h3>
                                                </motion.div>
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-sm text-gray-500 font-medium">Has earned with Hard Work & Discipline</p>
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.4 }}
                                                    className="bg-secondary/10 inline-block px-4 py-1.5 rounded-xl border border-secondary/20"
                                                >
                                                    <h3 className="text-xl font-black text-secondary uppercase tracking-tight">"{item.title}"</h3>
                                                </motion.div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="w-full mt-8 space-y-3">
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.6 }}
                                                className="w-full bg-white/60 backdrop-blur-sm border border-white/50 p-3 rounded-xl mb-4"
                                            >
                                                <p className="text-xs font-bold text-neutral leading-relaxed">
                                                    Don't forget to show this screen to your parent to claim your reward! 🎁
                                                </p>
                                            </motion.div>

                                            <motion.button
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.8 }}
                                                onClick={handleShare}
                                                disabled={isSharing}
                                                className="btn btn-outline btn-secondary w-full rounded-2xl h-12 text-sm font-bold border-2 bg-white/80 hover:bg-white"
                                            >
                                                {isSharing ? (
                                                    <span className="loading loading-spinner loading-sm" />
                                                ) : (
                                                    <>
                                                        <FaShareAlt className="mr-2" /> Share as Image
                                                    </>
                                                )}
                                            </motion.button>
                                            <motion.button
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.9 }}
                                                onClick={onClose}
                                                className="btn btn-primary w-full rounded-2xl h-12 text-lg font-bold shadow-lg shadow-primary/20"
                                            >
                                                Yay! Done
                                            </motion.button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
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
                                        ) : null}
                                    </>
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
