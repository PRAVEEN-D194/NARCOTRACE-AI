import React, { useEffect, useState } from 'react';
import { BrainCircuit, ShieldAlert, Lock, CheckCircle2, AlertTriangle, Key } from 'lucide-react';
import { api } from '../services/api';
import { IntelligenceFinding } from '../types';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-mono font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center space-x-2">
            <BrainCircuit className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            <span>INTELLIGENCE CELL FIREWALL & FINDINGS</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            Member 4 Controlled Intelligence Dispatch & Authorized Information Pipeline
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-3 py-1.5 rounded-lg border border-cyan-300 dark:border-cyan-500/30">
          <Key className="w-3.5 h-3.5" />
          <span>FIREWALL FILTER ACTIVE</span>
        </div>
      </div>

      {/* Security Classification Explanatory Banner */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start space-x-3 text-xs shadow-sm dark:shadow-md transition-colors duration-200">
        <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="font-mono font-bold text-slate-900 dark:text-slate-100 uppercase">
            Strict Security & Clearance Boundary Enforced
          </h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
            The platform strictly isolates <strong>RAW / RESTRICTED SIGNAL DATA</strong> from <strong>CONTROLLED INTELLIGENCE</strong>. Investigators only receive findings sanitized and authorized by the Member 4 backend risk engine.
          </p>
        </div>
      </div>

      {/* Intelligence Findings Cards */}
      {isLoading ? (
        <LoadingSpinner message="Sanitizing Intelligence Cell Findings..." />
      ) : (
        <div className="space-y-4">
          {findings.map((item) => (
            <div
              key={item.id}
              className={`p-6 rounded-xl border space-y-4 shadow-sm dark:shadow-xl relative overflow-hidden transition-colors duration-200 ${
                item.isControlled
                  ? 'bg-white dark:bg-slate-900 border-cyan-300 dark:border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                  : 'bg-slate-50 dark:bg-slate-950/90 border-rose-300 dark:border-rose-500/40 opacity-90'
              }`}
            >
              {/* Classification & Status Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 font-mono">
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded border ${
                      item.isControlled
                        ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/40'
                        : 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-500/40'
                    }`}
                  >
                    {item.isControlled ? '✓ CONTROLLED INTELLIGENCE' : '🔒 RAW / RESTRICTED SIGNAL'}
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Confidence: <strong className="text-cyan-600 dark:text-cyan-400">{item.confidence}%</strong>
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Classification: <strong className="text-amber-600 dark:text-amber-400">{item.classification}</strong></span>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <span className="text-slate-500 dark:text-slate-400">{item.timestamp}</span>
                </div>
              </div>

              {/* Main Finding Text */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-sans tracking-tight">
                  {item.finding}
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans bg-slate-50 dark:bg-slate-950 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  {item.summary}
                </p>
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono pt-2">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500 text-[10px]">CORRELATED ENTITIES</span>
                  <p className="font-bold text-cyan-700 dark:text-cyan-300 truncate">{item.relatedEntities.join(', ')}</p>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500 text-[10px]">ATTACHED EVIDENCE</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.evidenceIds.join(', ') || 'None'}</p>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500 text-[10px]">VALIDATION STATUS</span>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 truncate">{item.validationStatus}</p>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 dark:text-slate-500 text-[10px]">BACKEND CLEARANCE</span>
                  <p className="font-bold text-amber-600 dark:text-amber-400 truncate">{item.authorizationStatus}</p>
                </div>
              </div>

              {/* Security Warning for RAW signal */}
              {!item.isControlled && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 rounded-lg flex items-center space-x-2 text-xs font-mono text-rose-700 dark:text-rose-300">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Restricted Access Signal: Requires Member 4 authorization approval prior to inclusion in court dossier.</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
