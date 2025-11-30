import React from 'react';
import { FaGift, FaStar } from 'react-icons/fa';
import { PrimaryButton } from '../design-system/PrimaryButton';
import { SecondaryButton } from '../design-system/SecondaryButton';

interface RewardConfirmationModalProps {
  isOpen: boolean;
  rewardName: string;
  cost: number;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const RewardConfirmationModal: React.FC<RewardConfirmationModalProps> = ({ 
  isOpen, 
  rewardName, 
  cost, 
  onClose, 
  onConfirm,
  isLoading 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center transform scale-100 transition-transform">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center animate-bounce-subtle">
            <FaGift className="w-10 h-10 text-purple-500" />
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-gray-800 mb-2">Buy this reward?</h2>
        <p className="text-lg font-bold text-primary mb-1">{rewardName}</p>
        
        <div className="flex justify-center items-center gap-2 text-warning font-bold text-xl mb-8">
          <FaStar /> {cost} Stars
        </div>
        
        <div className="flex flex-col gap-3">
          <PrimaryButton onClick={onConfirm} disabled={isLoading} className="rounded-xl text-lg">
            {isLoading ? 'Buying...' : 'Yes, I want it!'}
          </PrimaryButton>
          <SecondaryButton onClick={onClose} disabled={isLoading} className="rounded-xl">
            Maybe later
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
};

export default RewardConfirmationModal;

