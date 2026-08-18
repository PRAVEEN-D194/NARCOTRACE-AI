import React from 'react';
import { X, ShieldAlert, Wallet, ExternalLink, Network, FileText, UserCheck } from 'lucide-react';
import { NetworkNode } from '../../types';
import { Badge } from '../common/Badge';

interface NodeDetailPanelProps {
  node: NetworkNode | null;
  onClose: () => void;
  onNavigateEvidence?: (evidenceId: string) => void;
}

export const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({ node, onClose, onNavigateEvidence }) => {
  if (!node) return null;

  return (
    <div className="absolute right-2 sm:right-4 top-2 sm:top-4 bottom-2 sm:bottom-4 w-full sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl backdrop-blur z-30 flex flex-col overflow-hidden text-slate-100 font-sans transition-all duration-150">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
        <div className="flex items-center space-x-2">
          <Network className="w-5 h-5 text-blue-400" />
          <h3 className="font-bold text-base text-slate-100">
            Entity Details
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
        {/* Name & Type Title */}
        <div className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">{node.type} Entity</span>
            <Badge variant={node.riskLevel === 'HIGH' ? 'high' : 'medium'}>{node.riskLevel} Risk</Badge>
          </div>
          <h4 className="text-lg font-bold font-sans text-blue-400 flex items-center space-x-2">
            <span>{node.label}</span>
            {node.isSubject && (
              <span className="text-[10px] bg-rose-950/60 text-rose-400 px-2 py-0.5 rounded border border-rose-800/60 font-semibold">
                Target Subject
              </span>
            )}
          </h4>
          {node.platform && (
            <p className="text-xs text-slate-400 font-sans">Platform: <strong className="text-slate-200">{node.platform}</strong></p>
          )}
        </div>

        {/* Risk Score */}
        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span className="text-xs text-slate-300">Risk Score</span>
          </div>
          <span className="font-mono font-bold text-rose-400 text-sm">{node.riskScore} / 100</span>
        </div>

        {/* Aliases */}
        {node.aliases && node.aliases.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Alias</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {node.aliases.map((alias, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-slate-800 text-blue-300 text-xs rounded border border-slate-700"
                >
                  {alias}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Connected Wallets */}
        {node.connectedWallets && node.connectedWallets.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Wallet className="w-3.5 h-3.5 text-amber-400" />
              <span>Wallet</span>
            </label>
            <div className="space-y-1">
              {node.connectedWallets.map((wallet, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-slate-950/60 text-slate-300 text-xs font-mono rounded border border-slate-800 truncate"
                >
                  {wallet}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Connection Metrics */}
        <div className="grid grid-cols-2 gap-2 text-xs font-sans">
          <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
            <p className="text-slate-400 text-[10px]">Connections</p>
            <p className="text-sm font-bold text-slate-200 mt-0.5">{node.connectionCount} nodes</p>
          </div>
          <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
            <p className="text-slate-400 text-[10px]">Evidence</p>
            <p className="text-sm font-bold text-blue-400 mt-0.5">{node.evidenceCount} items</p>
          </div>
        </div>

        {/* Attached Evidence Items */}
        {node.evidenceIds && node.evidenceIds.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Evidence Items</span>
            </label>
            <div className="space-y-1">
              {node.evidenceIds.map((evId) => (
                <button
                  key={evId}
                  onClick={() => onNavigateEvidence && onNavigateEvidence(evId)}
                  className="w-full p-2 bg-slate-950/60 hover:bg-slate-800 text-blue-400 hover:text-blue-300 text-xs font-mono rounded border border-slate-800 flex items-center justify-between transition-colors"
                >
                  <span>{evId}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
