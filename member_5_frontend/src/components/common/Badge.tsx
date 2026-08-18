import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'high' | 'medium' | 'low' | 'active' | 'review' | 'closed' | 'verified' | 'cyan' | 'slate';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'slate', size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  const variantClasses = {
    high: 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.15)]',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.15)]',
    low: 'bg-slate-800 text-slate-300 border-slate-700',
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.15)]',
    review: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    closed: 'bg-slate-800 text-slate-400 border-slate-700',
    verified: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    cyan: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    slate: 'bg-slate-800/80 text-slate-300 border-slate-700',
  }[variant];

  return (
    <span className={`inline-flex items-center font-mono font-semibold rounded border ${sizeClasses} ${variantClasses}`}>
      {children}
    </span>
  );
};
