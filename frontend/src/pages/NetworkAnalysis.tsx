import React, { useEffect, useState } from 'react';
import { Network, Filter } from 'lucide-react';
import { api } from '../services/api';
import { Case, NetworkData, NetworkNode } from '../types';
import { NetworkGraph } from '../components/network/NetworkGraph';
import { NodeDetailPanel } from '../components/network/NodeDetailPanel';
import { SkeletonCard } from '../components/common/SkeletonLoader';

export const NetworkAnalysis: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('CASE-2026-041');
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      const c = await api.getCases();
      setCases(c);
    };
    fetchCases();
  }, []);

  useEffect(() => {
    const fetchNetwork = async () => {
      try {
        setIsLoading(true);
        const net = await api.getNetwork(selectedCaseId);
        setNetworkData(net);
        setSelectedNode(null);
        api.logAuditEvent('Viewed Network', selectedCaseId, 'Executed graph analysis view.');
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNetwork();
  }, [selectedCaseId]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 font-mono text-xs font-bold mb-2 border border-blue-500/20">
            GRAPH TOPOLOGY VISUALIZER
          </span>
          <h1 className="font-headline text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center space-x-3">
            <Network className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <span>Network Analysis</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-sans mt-1">
            Explore relationships between entities, accounts, wallets, and platforms.
          </p>
        </div>

        {/* Case Switcher */}
        <div className="flex items-center space-x-2 font-sans text-xs">
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-slate-600 dark:text-slate-400 font-medium">Select Case:</span>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="px-3.5 py-2 bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 font-semibold text-xs rounded-lg border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:outline-none"
          >
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} - {c.subject}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Graph View Canvas */}
      {isLoading || !networkData ? (
        <SkeletonCard />
      ) : (
        <div className="relative">
          <NetworkGraph
            data={networkData}
            onSelectNode={(node) => setSelectedNode(node)}
            selectedNodeId={selectedNode?.id}
          />
          {selectedNode && (
            <NodeDetailPanel
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
            />
          )}
        </div>
      )}
    </div>
  );
};
