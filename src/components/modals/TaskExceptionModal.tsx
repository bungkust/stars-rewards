import React, { useState } from 'react';
import { Modal } from '../design-system';

interface TaskExceptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string) => void;
    taskName: string;
}

const REASONS = [
    'Sick',
    'Vacation / Away',
    'Other'
];

export const TaskExceptionModal: React.FC<TaskExceptionModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    taskName
}) => {
    const [selectedReason, setSelectedReason] = useState<string>('');
    const [customReason, setCustomReason] = useState('');

    const handleSubmit = () => {
        if (!selectedReason) return;

        const finalReason = selectedReason === 'Other' ? customReason : selectedReason;
        if (!finalReason.trim()) return;

        onSubmit(finalReason);
        // Reset state
        setSelectedReason('');
        setCustomReason('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Request Exception">
            <div className="space-y-4">
                <p className="text-gray-600">
                    Why can't you complete <b>{taskName}</b> today?
                </p>

                <div className="space-y-2">
                    {REASONS.map((reason) => (
                        <label
                            key={reason}
                            className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${selectedReason === reason
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            <input
                                type="radio"
                                name="reason"
                                value={reason}
                                checked={selectedReason === reason}
                                onChange={(e) => setSelectedReason(e.target.value)}
                                className="radio radio-primary mr-3"
                            />
                            <span className="text-gray-700 font-medium">{reason}</span>
                        </label>
                    ))}
                </div>

                {selectedReason === 'Other' && (
                    <textarea
                        className="textarea textarea-bordered w-full"
                        placeholder="Please explain why..."
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        rows={3}
                    />
                )}

                <div className="flex gap-3 mt-6">
                    <button className="btn btn-ghost flex-1" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary flex-1"
                        onClick={handleSubmit}
                        disabled={!selectedReason || (selectedReason === 'Other' && !customReason.trim())}
                    >
                        Send to Admin
                    </button>
                </div>
            </div>
        </Modal>
    );
};
