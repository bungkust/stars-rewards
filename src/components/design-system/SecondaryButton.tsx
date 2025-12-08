import React from 'react';

interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <button
      className={`btn btn-outline btn-primary w-full disabled:bg-transparent disabled:text-gray-400 disabled:border-gray-300 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

