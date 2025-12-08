import { useState } from 'react';
import { Modal } from '../design-system/Modal';


interface ExemptionModalProps {
    isOpen: boolean;
    taskName: string;
    onClose: () => void;
    onSubmit: (reason: string) => void;
    isLoading?: boolean;
}

const REASONS = [
    'Sick',
    'Traveling/Away',
    'Other Reason'
];

const ExemptionModal = ({ isOpen, taskName, onClose, onSubmit, isLoading }: ExemptionModalProps) => {
    const [selectedReason, setSelectedReason] = useState<string>(REASONS[0]);
    const [customReason, setCustomReason] = useState('');

    const handleSubmit = () => {
        const finalReason = selectedReason === 'Other Reason' && customReason
            ? customReason
            : selectedReason;
        onSubmit(finalReason);
        setCustomReason('');
        setSelectedReason(REASONS[0]);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Skip Mission?"
        >
            <div className="flex flex-col gap-4">
                <p className="text-gray-600">
                    Why can't you do <span className="font-bold text-gray-800">{taskName}</span> today?
                </p>

                <div className="flex flex-col gap-2">
                    {REASONS.map((reason) => (
                        <label key={reason} className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-base-100 transition-colors">
                            <input
                                type="radio"
                                name="exemption-reason"
                                className="radio radio-primary"
                                checked={selectedReason === reason}
                                onChange={() => setSelectedReason(reason)}
                            />
                            <span className="text-gray-700 font-medium">{reason}</span>
                        </label>
                    ))}
                </div>

                {selectedReason === 'Other Reason' && (
                    <textarea
                        className="textarea textarea-bordered w-full"
                        placeholder="Tell us why..."
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        rows={3}
                    />
                )}

                <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || (selectedReason === 'Other Reason' && !customReason.trim())}
                        className="btn btn-lg btn-warning rounded-full shadow-lg disabled:bg-gray-300 disabled:text-gray-500 disabled:border-none flex-1"
                    >
                        Send to Parent
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ExemptionModal;
