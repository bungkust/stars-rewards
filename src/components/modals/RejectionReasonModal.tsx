import React, { useState } from 'react';
import { PrimaryButton } from '../design-system/PrimaryButton';
import { SecondaryButton } from '../design-system/SecondaryButton';
import { H1Header } from '../design-system/H1Header';

interface RejectionReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
}

const RejectionReasonModal: React.FC<RejectionReasonModalProps> = ({ isOpen, onClose, onConfirm, isLoading }) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onConfirm(reason.trim());
      setReason(''); // Reset after submit
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm transform scale-100 transition-transform">
        <H1Header className="text-center mb-2 !text-xl">Reject Task?</H1Header>
        <p className="text-gray-500 text-center mb-6 text-sm">
          Help your child understand why this task wasn't approved so they can try again.
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            className="textarea textarea-bordered h-24 w-full rounded-xl"
            placeholder="e.g. You forgot to put the toys in the bin..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            autoFocus
            required
          />

          <div className="flex flex-col gap-2 mt-2">
            <PrimaryButton 
              type="submit"
              disabled={!reason.trim() || isLoading}
              className="bg-error border-error hover:bg-red-600 hover:border-red-600 text-white"
            >
              {isLoading ? 'Rejecting...' : 'Reject Task'}
            </PrimaryButton>
            <SecondaryButton type="button" onClick={onClose} disabled={isLoading}>
              Cancel
            </SecondaryButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectionReasonModal;

