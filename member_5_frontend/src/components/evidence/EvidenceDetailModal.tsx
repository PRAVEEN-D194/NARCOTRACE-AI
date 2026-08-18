import React from 'react';
import { X, ShieldCheck, Hash, FileText } from 'lucide-react';
import { Evidence } from '../../types';
import { Badge } from '../common/Badge';

interface EvidenceDetailModalProps {
  evidence: Evidence;
  onClose: () => void;
}

export const EvidenceDetailModal: React.FC<EvidenceDetailModalProps> = ({ evidence, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">{evidence.id}</span>
            <Badge variant="verified">{evidence.status}</Badge>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title & Metadata */}
        <div>
          <h3 className="font-headline text-lg font-bold text-slate-900 dark:text-slate-100">{evidence.title}</h3>
          <div className="grid grid-cols-2 gap-3 mt-3 text-xs font-sans">
            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Related Case</span>
              <p className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{evidence.relatedCaseId}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Related Entity</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{evidence.relatedEntityName}</p>
            </div>
          </div>
        </div>

        {/* Details & Chain of Custody */}
        <div className="space-y-3 font-sans text-xs">
          <div>
            <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Evidence Description & Content</span>
            </h4>
            <p className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed">
              {evidence.details}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Chain of Custody Source</span>
            </h4>
            <p className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              Source: {evidence.source} • Classification: {evidence.classification}
            </p>
          </div>
        </div>

        {/* Cryptographic Hash Verification Box */}
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800/60 space-y-1 font-mono text-xs">
          <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-400 font-semibold">
            <span className="flex items-center space-x-1">
              <Hash className="w-3.5 h-3.5" />
              <span>Cryptographic SHA-256 Verified Checksum</span>
            </span>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700">
              TAMPER PROOF
            </span>
          </div>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-300/80 truncate pt-0.5">{evidence.sha256Hash}</p>
        </div>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors border border-slate-300 dark:border-slate-700"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
