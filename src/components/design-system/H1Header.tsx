import React from 'react';

interface H1HeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const H1Header: React.FC<H1HeaderProps> = ({ children, className = '' }) => {
  return (
    <h1 className={`text-2xl font-bold text-neutral ${className}`}>
      {children}
    </h1>
  );
};

