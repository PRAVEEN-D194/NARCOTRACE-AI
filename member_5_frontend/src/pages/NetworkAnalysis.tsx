import React, { useEffect, useState } from 'react';
import { Network, Filter } from 'lucide-react';
import { api } from '../services/api';
import { Case, NetworkData, NetworkNode } from '../types';
import { NetworkGraph } from '../components/network/NetworkGraph';
import { NodeDetailPanel } from '../components/network/NodeDetailPanel';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-mono font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center space-x-2">
            <Network className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            <span>INTERACTIVE NETWORK TOPOLOGY</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            Member 3 Graph Algorithm Integration // Directed Entity Relationship Tracer
          </p>
        </div>

        {/* Case Switcher */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <Filter className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span className="text-slate-500 dark:text-slate-400">Select Target Case:</span>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 text-cyan-700 dark:text-cyan-400 font-bold rounded-lg border border-slate-200 dark:border-slate-800 focus:border-cyan-500 focus:outline-none"
          >
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} - {c.subject}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Canvas View */}
      {isLoading || !networkData ? (
        <LoadingSpinner message="Rendering Cytoscape Entity Graph..." />
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
