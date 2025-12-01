import React from 'react';
import { FaStar } from 'react-icons/fa';
import { PrimaryButton } from '../design-system/PrimaryButton';

interface TaskCompletionModalProps {
  isOpen: boolean;
  taskName: string;
  rewardValue: number;
  onClose: () => void;
}

const TaskCompletionModal: React.FC<TaskCompletionModalProps> = ({ isOpen, taskName, rewardValue, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center transform scale-100 transition-transform">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center animate-pulse">
              <FaStar className="w-12 h-12 text-warning" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
              +{rewardValue}
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Good Job!</h2>
        <p className="text-gray-500 mb-6">
          You finished <span className="font-bold text-primary">"{taskName}"</span>.
          <br/>
          Ask your parent to approve it to get your stars!
        </p>
        
        <PrimaryButton onClick={onClose} className="rounded-xl text-lg">
          Okay, Got it!
        </PrimaryButton>
      </div>
    </div>
  );
};

export default TaskCompletionModal;

