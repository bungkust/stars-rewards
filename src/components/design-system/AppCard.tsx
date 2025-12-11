import React from 'react';

interface AppCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const AppCard: React.FC<AppCardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-white rounded-xl shadow-md p-4 md:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

