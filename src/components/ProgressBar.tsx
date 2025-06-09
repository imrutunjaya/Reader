import React from 'react';

interface ProgressBarProps {
  progress: number;
  showProgress: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, showProgress }) => {
  if (!showProgress) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-gray-200 dark:bg-gray-700">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};