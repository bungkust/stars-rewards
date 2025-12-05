import React from 'react';

interface ToggleButtonProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
    className?: string;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({ label, isActive, onClick, className = '' }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`btn btn-sm rounded-full normal-case transition-all ${isActive
                    ? 'btn-primary text-white shadow-md'
                    : 'btn-outline border-gray-300 text-gray-600 hover:bg-gray-50'
                } ${className}`}
        >
            {label}
        </button>
    );
};
