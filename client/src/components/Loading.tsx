import React from 'react';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({ size = 'medium', className = '' }) => {
  // Determine size based on prop
  const sizeClass = {
    small: 'w-5 h-5',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  }[size];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClass} border-4 border-slate-300/20 border-t-blue-500 rounded-full animate-spin`}></div>
    </div>
  );
};

export default Loading;