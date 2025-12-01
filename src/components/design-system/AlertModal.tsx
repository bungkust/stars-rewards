import React from 'react';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';

interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger' | 'success';
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const AlertModal: React.FC<AlertModalProps> = ({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Yes',
  cancelText = 'Cancel',
  type = 'warning',
  onClose, 
  onConfirm,
  isLoading 
}) => {
  if (!isOpen) return null;

  const getColorClass = () => {
    switch (type) {
      case 'danger': return 'text-error';
      case 'success': return 'text-success';
      case 'info': return 'text-info';
      default: return 'text-warning';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xs text-center transform scale-100 transition-transform">
        <h2 className={`text-xl font-bold mb-2 ${getColorClass()}`}>{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="flex flex-col gap-3">
          <PrimaryButton 
            onClick={onConfirm} 
            disabled={isLoading} 
            className={`rounded-xl text-lg ${type === 'danger' ? 'bg-error border-error hover:bg-error/90' : ''}`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </PrimaryButton>
          <SecondaryButton onClick={onClose} disabled={isLoading} className="rounded-xl">
            {cancelText}
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;

