import React from 'react';
import type { IconType } from 'react-icons';

interface IconWrapperProps {
  icon: IconType;
  className?: string;
}

export const IconWrapper: React.FC<IconWrapperProps> = ({ icon: Icon, className = '' }) => {
  return (
    <Icon className={`h-6 w-6 text-primary ${className}`} />
  );
};

