import React from 'react';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <button 
      className={`btn btn-primary w-full disabled:bg-gray-300 disabled:text-gray-500 disabled:border-none ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

