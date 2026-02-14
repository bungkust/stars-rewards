import React from 'react';

interface ToggleButtonProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
    className?: string;
    variant?: 'primary' | 'warning';
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({ label, isActive, onClick, className = '', variant = 'primary' }) => {
    const activeClass = variant === 'warning'
        ? 'btn-warning text-gray-900'
        : 'btn-primary text-white';

    return (
        <button
            type="button"
            onClick={onClick}
            className={`btn btn-sm rounded-full normal-case transition-all ${isActive
                ? `${activeClass} shadow-md`
                : 'bg-white border text-gray-600 border-gray-300 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-400'
                } ${className}`}
        >
            {label}
        </button>
    );
};
