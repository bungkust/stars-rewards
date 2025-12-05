import React from 'react';

interface AppCardProps {
  children: React.ReactNode;
  className?: string;
}

export const AppCard: React.FC<AppCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-xl shadow-md p-4 md:p-6 ${className}`}>
      {children}
    </div>
  );
};

