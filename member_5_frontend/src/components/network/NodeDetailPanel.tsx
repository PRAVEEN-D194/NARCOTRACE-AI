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
    <div className="absolute right-4 top-4 bottom-4 w-96 bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur z-30 flex flex-col overflow-hidden text-slate-100 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
        <div className="flex items-center space-x-2">
          <Network className="w-5 h-5 text-cyan-400" />
          <h3 className="font-mono font-bold text-sm text-slate-100 uppercase tracking-wider">
            Entity Intelligence
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Name & Type Title */}
        <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">{node.type} ENTITY</span>
            <Badge variant={node.riskLevel === 'HIGH' ? 'high' : 'medium'}>{node.riskLevel} RISK</Badge>
          </div>
          <h4 className="text-xl font-extrabold font-mono text-cyan-400 flex items-center space-x-2">
            <span>{node.label}</span>
            {node.isSubject && (
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/40">
                PRIMARY SUBJECT
              </span>
            )}
          </h4>
          {node.platform && (
            <p className="text-xs text-slate-400 font-mono">Platform: {node.platform}</p>
          )}
        </div>

        {/* Risk Score */}
        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-mono text-slate-300">Target Threat Index</span>
          </div>
          <span className="font-mono font-bold text-rose-400 text-sm">{node.riskScore} / 100</span>
        </div>

        {/* Aliases */}
        {node.aliases && node.aliases.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Resolved Aliases</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {node.aliases.map((alias, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-slate-800 text-cyan-300 text-xs font-mono rounded border border-slate-700"
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
            <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Wallet className="w-3.5 h-3.5 text-amber-400" />
              <span>Associated Crypto Wallets</span>
            </label>
            <div className="space-y-1">
              {node.connectedWallets.map((wallet, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-slate-950 text-slate-300 text-xs font-mono rounded border border-slate-800 break-all flex items-center justify-between"
                >
                  <span className="truncate">{wallet}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Connection Metrics */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <p className="text-slate-400 text-[10px]">TOTAL EDGES</p>
            <p className="text-base font-bold text-slate-100">{node.connectionCount} Connections</p>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <p className="text-slate-400 text-[10px]">LINKED EVIDENCE</p>
            <p className="text-base font-bold text-cyan-400">{node.evidenceCount} Items</p>
          </div>
        </div>

        {/* Linked Evidence Files */}
        {node.evidenceIds && node.evidenceIds.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Attached Evidence Dossiers</span>
            </label>
            <div className="space-y-1">
              {node.evidenceIds.map((evId) => (
                <button
                  key={evId}
                  onClick={() => onNavigateEvidence && onNavigateEvidence(evId)}
                  className="w-full p-2 bg-slate-950 hover:bg-cyan-950/40 text-cyan-400 hover:text-cyan-300 text-xs font-mono rounded border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between transition-colors"
                >
                  <span>Evidence File: {evId}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-[10px] font-mono text-slate-400 text-center">
        Restricted Entity File // Member 3 Network Node
      </div>
    </div>
  );
};
