import React from 'react';

interface WarningCTAButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const WarningCTAButton: React.FC<WarningCTAButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <button 
      className={`btn btn-lg btn-warning rounded-full shadow-lg fixed bottom-24 right-4 z-40 disabled:bg-gray-300 disabled:text-gray-500 disabled:border-none ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

