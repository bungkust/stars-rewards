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
                : 'btn-outline border-gray-300 text-gray-600 hover:bg-gray-50'
                } ${className}`}
        >
            {label}
        </button>
    );
};
