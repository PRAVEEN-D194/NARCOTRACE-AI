import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'cyan' | 'rose' | 'amber' | 'emerald' | 'purple' | 'blue';
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  trend,
}) => {
  const colorStyles = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'border-blue-200 dark:border-blue-800/40',
      text: 'text-blue-600 dark:text-blue-400',
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'border-rose-200 dark:border-rose-800/40',
      text: 'text-rose-600 dark:text-rose-400',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-200 dark:border-amber-800/40',
      text: 'text-amber-600 dark:text-amber-400',
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-200 dark:border-emerald-800/40',
      text: 'text-emerald-600 dark:text-emerald-400',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      border: 'border-purple-200 dark:border-purple-800/40',
      text: 'text-purple-600 dark:text-purple-400',
    },
    cyan: {
      bg: 'bg-cyan-50 dark:bg-cyan-950/40',
      border: 'border-cyan-200 dark:border-cyan-800/40',
      text: 'text-cyan-600 dark:text-cyan-400',
    },
  }[color];

  return (
    <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors duration-150 flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold font-sans text-slate-900 dark:text-slate-100 tracking-tight">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-lg ${colorStyles.bg} ${colorStyles.text} border ${colorStyles.border}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {subtitle && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 font-sans leading-relaxed">{subtitle}</p>
      )}
      {trend && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center text-xs font-mono text-slate-500 dark:text-slate-400">
          <span className={`${colorStyles.text} font-medium mr-1.5`}>{trend}</span>
        </div>
      )}
    </div>
  );
};
