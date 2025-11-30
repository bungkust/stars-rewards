import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { PrimaryButton } from '../design-system/PrimaryButton';

interface VerificationSuccessModalProps {
  isOpen: boolean;
  type: 'approve' | 'reject';
  onClose: () => void;
}

const VerificationSuccessModal: React.FC<VerificationSuccessModalProps> = ({ isOpen, type, onClose }) => {
  if (!isOpen) return null;

  const isApprove = type === 'approve';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center transform scale-100 transition-transform">
        <div className="flex justify-center mb-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isApprove ? 'bg-green-100' : 'bg-red-100'}`}>
            <FaCheckCircle className={`w-10 h-10 ${isApprove ? 'text-green-500' : 'text-red-500'}`} />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {isApprove ? 'Mission Approved!' : 'Mission Rejected'}
        </h2>
        <p className="text-gray-500 mb-6">
          {isApprove 
            ? 'Stars have been added to the child\'s balance.' 
            : 'The child will see the reason in their dashboard.'}
        </p>
        
        <PrimaryButton onClick={onClose} className="rounded-xl text-lg">
          Done
        </PrimaryButton>
      </div>
    </div>
  );
};

export default VerificationSuccessModal;

