import React from 'react';
import { X, ShieldCheck, FileCheck, Hash, Database, Clock, Lock } from 'lucide-react';
import { Evidence } from '../../types';
import { Badge } from '../common/Badge';

interface EvidenceDetailModalProps {
  evidence: Evidence | null;
  onClose: () => void;
}

export const EvidenceDetailModal: React.FC<EvidenceDetailModalProps> = ({ evidence, onClose }) => {
  if (!evidence) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden text-slate-900 dark:text-slate-100 space-y-0 transition-colors duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30 text-cyan-600 dark:text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-mono font-bold text-lg text-slate-900 dark:text-slate-100">{evidence.id}</h3>
                <Badge variant="verified">{evidence.status}</Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{evidence.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 dark:text-slate-500 text-[10px]">EVIDENCE TYPE</span>
              <p className="font-semibold text-cyan-700 dark:text-cyan-400 mt-0.5">{evidence.type}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 dark:text-slate-500 text-[10px]">RELATED CASE</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{evidence.relatedCaseId}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 dark:text-slate-500 text-[10px]">TARGET ENTITY</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{evidence.relatedEntityName}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 dark:text-slate-500 text-[10px]">CLASSIFICATION</span>
              <p className="font-semibold text-amber-600 dark:text-amber-400 mt-0.5">{evidence.classification}</p>
            </div>
          </div>

          {/* Cryptographic SHA-256 Provenance Box */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-cyan-300 dark:border-cyan-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-mono text-cyan-700 dark:text-cyan-400 font-semibold">
                <Hash className="w-4 h-4" />
                <span>Cryptographic Hash Checksum (SHA-256)</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono rounded border border-emerald-300 dark:border-emerald-500/40">
                {evidence.integrityStatus}
              </span>
            </div>
            <div className="p-2.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300 break-all select-all">
              {evidence.sha256Hash}
            </div>
            <p className="text-[11px] text-amber-700 dark:text-amber-400/90 font-mono flex items-center space-x-1">
              <Lock className="w-3 h-3 shrink-0" />
              <span>Note: Cryptographic checksum strictly used for verification audit compliance.</span>
            </p>
          </div>

          {/* Details & Provenance Text */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <FileCheck className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Evidence Narrative & Chain of Custody</span>
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 leading-relaxed font-sans">
              {evidence.details}
            </p>
          </div>

          {/* Timestamp & Source */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>Ingested: {evidence.timestamp}</span>
            </span>
            <span className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
              <Database className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Source: {evidence.source}</span>
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-mono font-semibold rounded-lg transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
