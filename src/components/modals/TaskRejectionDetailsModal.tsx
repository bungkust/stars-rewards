import React from 'react';
import { PrimaryButton } from '../design-system/PrimaryButton';

interface TaskRejectionDetailsModalProps {
  isOpen: boolean;
  taskName: string;
  reason: string;
  onClose: () => void;
}

const TaskRejectionDetailsModal: React.FC<TaskRejectionDetailsModalProps> = ({ isOpen, taskName, reason, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center transform scale-100 transition-transform">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Mission Not Approved</h2>
        
        <div className="bg-base-100 p-4 rounded-xl mb-6">
          <p className="text-sm text-gray-500 mb-1">Mission:</p>
          <p className="font-bold text-gray-800 mb-3">{taskName}</p>
          
          <div className="divider my-2"></div>
          
          <p className="text-sm text-gray-500 mb-1">Parent's Note:</p>
          <p className="text-error font-medium italic">"{reason || 'Try again!'}"</p>
        </div>
        
        <PrimaryButton onClick={onClose} className="rounded-xl text-lg">
          I'll Try Again
        </PrimaryButton>
      </div>
    </div>
  );
};

export default TaskRejectionDetailsModal;

