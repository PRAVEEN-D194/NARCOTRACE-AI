import React, { useEffect, useState } from 'react';
import { BrainCircuit, Lock, ShieldCheck, Key } from 'lucide-react';
import { api } from '../services/api';
import { IntelligenceFinding } from '../types';
import { SkeletonCard } from '../components/common/SkeletonLoader';

export const IntelligenceCell: React.FC = () => {
  const [findings, setFindings] = useState<IntelligenceFinding[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchIntel = async () => {
      try {
        setIsLoading(true);
        const data = await api.getIntelligence();
        setFindings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchIntel();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 font-mono text-xs font-bold mb-2 border border-blue-500/20">
            SANITIZED CLEARANCE FEED
          </span>
          <h1 className="font-headline text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center space-x-3">
            <BrainCircuit className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <span>Intelligence Cell</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-sans mt-1">
            Review validated intelligence before it is shared with investigators.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-sans text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800/40 font-semibold">
          <Key className="w-3.5 h-3.5" />
          <span>Access Control Active</span>
        </div>
      </div>

      {/* Controlled vs Restricted Information Banner */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start space-x-4 text-xs shadow-sm">
        <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="font-headline text-base font-bold text-slate-900 dark:text-slate-200">
            Controlled Intelligence & Access Information
          </h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
            Information displayed here is passed directly through backend clearance authorization. Restricted intelligence is kept securely hidden until authorized.
          </p>
        </div>
      </div>

      {/* Findings Cards */}
      {isLoading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="space-y-5">
          {findings.map((item) => (
            <div
              key={item.id}
              className={`p-6 rounded-xl border space-y-4 shadow-sm transition-colors ${
                item.isControlled
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  : 'bg-slate-50 dark:bg-slate-950 border-amber-300 dark:border-amber-900/40 opacity-90'
              }`}
            >
              {/* Classification & Confidence Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 font-sans text-xs">
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded border ${
                      item.isControlled
                        ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800/60'
                        : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800/60'
                    }`}
                  >
                    {item.isControlled ? 'Controlled Intelligence' : 'Restricted Information'}
                  </span>
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    Confidence: <strong className="text-blue-600 dark:text-blue-400 font-mono">{item.confidence}%</strong>
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
                  <span>Timestamp: {item.timestamp}</span>
                </div>
              </div>

              {/* Finding Title */}
              <div className="space-y-2">
                <span className="text-slate-500 dark:text-slate-400 text-xs font-mono uppercase font-semibold block">Finding</span>
                <h3 className="font-headline text-xl font-bold text-slate-900 dark:text-slate-100">
                  {item.finding}
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans bg-slate-50 dark:bg-slate-950/60 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                  {item.summary}
                </p>
              </div>

              {/* Structured Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-sans pt-2">
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-semibold block">Related Entities</span>
                  <p className="font-semibold text-blue-600 dark:text-blue-400 mt-0.5 truncate">
                    {item.relatedEntities.join(', ')}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-semibold block">Supporting Evidence</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 font-mono truncate">
                    {item.evidenceIds.join(', ') || 'None'}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-semibold block">Validation Status</span>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{item.validationStatus}</span>
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-semibold block">Access Status</span>
                  <p className="font-semibold text-amber-600 dark:text-amber-400 mt-0.5 truncate">
                    {item.isControlled ? 'Authorized' : 'Restricted'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
