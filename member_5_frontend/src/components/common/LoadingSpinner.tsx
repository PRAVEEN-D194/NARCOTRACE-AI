import React from 'react';
import { Radio } from 'lucide-react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Correlating Intelligence Feeds...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
        <Radio className="w-5 h-5 text-cyan-400 absolute animate-pulse" />
      </div>
      <p className="text-sm font-mono text-cyan-400/80 animate-pulse tracking-wide">{message}</p>
    </div>
  );
};
