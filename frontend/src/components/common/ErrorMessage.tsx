import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Button } from './Button';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Unable to load investigation data.',
  message = 'Please try again or contact the system administrator.',
  onRetry,
}) => {
  return (
    <div className="p-8 text-center bg-white dark:bg-slate-900 border border-rose-500/30 rounded-xl space-y-4 max-w-md mx-auto shadow-md">
      <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto" />
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">{message}</p>
      </div>
      {onRetry && (
        <div className="pt-2">
          <Button variant="danger" size="sm" onClick={onRetry}>
            Retry Connection
          </Button>
        </div>
      )}
    </div>
  );
};
