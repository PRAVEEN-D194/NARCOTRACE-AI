import React from 'react';

export const SkeletonCard: React.FC = () => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" />
      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-16" />
    </div>
    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
    <div className="pt-3 flex justify-between">
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" />
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" />
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4 animate-pulse">
    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-48 mb-4" />
    {Array.from({ length: rows }).map((_, idx) => (
      <div key={idx} className="flex items-center space-x-4 py-2 border-b border-slate-100 dark:border-slate-800/60">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32 flex-1" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" />
      </div>
    ))}
  </div>
);
