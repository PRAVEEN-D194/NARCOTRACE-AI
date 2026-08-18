import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Network, Clock } from 'lucide-react';
import { Case } from '../../types';
import { Badge } from '../common/Badge';

interface PriorityCasesTableProps {
  cases: Case[];
}

export const PriorityCasesTable: React.FC<PriorityCasesTableProps> = ({ cases }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm dark:shadow-xl transition-colors duration-200">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            High Priority Active Cases
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Target cases requiring active correlation & network analysis</p>
        </div>
        <button
          onClick={() => navigate('/cases')}
          className="text-xs font-mono text-cyan-600 dark:text-cyan-400 hover:underline flex items-center space-x-1"
        >
          <span>View All Cases</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950/80 text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <th className="py-3 px-4">Case ID</th>
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4">Risk</th>
              <th className="py-3 px-4">Network</th>
              <th className="py-3 px-4">Last Activity</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {cases.map((c) => (
              <tr
                key={c.id}
                onClick={() => navigate(`/cases/${c.id}`)}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
              >
                <td className="py-3.5 px-4 font-mono font-bold text-cyan-600 dark:text-cyan-400 group-hover:underline">
                  {c.id}
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                  <div>
                    <span className="font-semibold">{c.subject}</span>
                    {c.aliases.length > 0 && (
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        Alias: {c.aliases[0].name}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">{c.riskScore}/100</span>
                    <Badge variant={c.priority === 'HIGH' ? 'high' : 'medium'}>{c.priority}</Badge>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                  <div className="flex items-center space-x-1.5">
                    <Network className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    <span>{c.nodeCount} Nodes</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">({c.forwardConnectionsCount}F / {c.backwardConnectionsCount}B)</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>{c.lastActivity.substring(11, 16)}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <Badge variant={c.status === 'ACTIVE' ? 'active' : 'review'}>
                    {c.status}
                  </Badge>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/cases/${c.id}`);
                    }}
                    className="px-3 py-1 bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 text-cyan-600 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-500/40 rounded text-xs font-mono font-semibold transition-colors"
                  >
                    Open Case
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
