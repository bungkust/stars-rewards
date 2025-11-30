import React from 'react';
import { FaTrophy } from 'react-icons/fa';
import { PrimaryButton } from '../design-system/PrimaryButton';

interface RewardRedemptionSuccessModalProps {
  isOpen: boolean;
  rewardName: string;
  onClose: () => void;
}

const RewardRedemptionSuccessModal: React.FC<RewardRedemptionSuccessModalProps> = ({ isOpen, rewardName, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center transform scale-100 transition-transform">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center animate-bounce">
            <FaTrophy className="w-12 h-12 text-warning" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Congratulation!</h2>
        <p className="text-lg text-gray-600 mb-4">
          You bought <span className="font-bold text-primary">"{rewardName}"</span>
        </p>
        
        <div className="bg-base-100 p-4 rounded-xl mb-6 border-2 border-dashed border-primary/30">
          <p className="text-sm text-gray-500 font-medium">
            Show this screen to your parent to get your reward!
          </p>
        </div>
        
        <PrimaryButton onClick={onClose} className="rounded-xl text-lg">
          Yay! Done
        </PrimaryButton>
      </div>
    </div>
  );
};

export default RewardRedemptionSuccessModal;

