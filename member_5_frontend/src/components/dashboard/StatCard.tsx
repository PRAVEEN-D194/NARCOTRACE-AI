import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'cyan' | 'rose' | 'amber' | 'emerald' | 'purple';
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'cyan',
  trend,
}) => {
  const colorStyles = {
    cyan: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      text: 'text-cyan-600 dark:text-cyan-400',
      glow: 'shadow-[0_0_15px_rgba(6,182,212,0.1)]',
    },
    rose: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      text: 'text-rose-600 dark:text-rose-400',
      glow: 'shadow-[0_0_15px_rgba(244,63,94,0.1)]',
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-600 dark:text-amber-400',
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.1)]',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-600 dark:text-emerald-400',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.1)]',
    },
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      text: 'text-purple-600 dark:text-purple-400',
      glow: 'shadow-[0_0_15px_rgba(139,92,246,0.1)]',
    },
  }[color];

  return (
    <div
      className={`p-5 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 ${colorStyles.glow} relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 shadow-sm`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100 mt-2 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colorStyles.bg} ${colorStyles.text} border ${colorStyles.border}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center text-[11px] font-mono text-slate-500 dark:text-slate-400">
          <span className={`${colorStyles.text} font-semibold mr-1.5`}>{trend}</span>
          <span>vs previous 24h</span>
        </div>
      )}
    </div>
  );
};
