import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'high' | 'medium' | 'low' | 'active' | 'review' | 'closed' | 'verified' | 'cyan' | 'slate';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'slate', size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  const variantClasses = {
    high: 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/30',
    medium: 'bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-300 dark:border-amber-500/30',
    low: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    active: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30',
    review: 'bg-purple-100 dark:bg-purple-500/10 text-purple-800 dark:text-purple-400 border-purple-300 dark:border-purple-500/30',
    closed: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700',
    verified: 'bg-cyan-100 dark:bg-cyan-500/10 text-cyan-800 dark:text-cyan-400 border-cyan-300 dark:border-cyan-500/30',
    cyan: 'bg-cyan-100 dark:bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/30',
    slate: 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
  }[variant];

  return (
    <span className={`inline-flex items-center font-mono font-semibold rounded border ${sizeClasses} ${variantClasses}`}>
      {children}
    </span>
  );
};
