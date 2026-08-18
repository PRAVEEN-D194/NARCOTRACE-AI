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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-colors duration-150">
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100 font-sans">
            High-Priority Cases
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-1">
            Cases requiring immediate investigator attention.
          </p>
        </div>
        <button
          onClick={() => navigate('/cases')}
          className="text-xs font-sans font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
        >
          <span>View All Cases</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[650px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950/60 text-xs font-sans text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <th className="py-3 px-4">Case ID</th>
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4">Risk</th>
              <th className="py-3 px-4">Network</th>
              <th className="py-3 px-4">Last Activity</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-sans">
            {cases.map((c) => (
              <tr
                key={c.id}
                onClick={() => navigate(`/cases/${c.id}`)}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
              >
                <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
                  {c.id}
                </td>
                <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                  {c.subject}
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-xs">{c.riskScore} / {c.priority}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                  <div className="flex items-center space-x-1.5 font-sans">
                    <Network className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>{c.nodeCount} nodes</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                  <div className="flex items-center space-x-1 font-sans">
                    <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>Today</span>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <Badge variant={c.status === 'ACTIVE' ? 'active' : 'review'}>
                    {c.status === 'ACTIVE' ? 'Active' : c.status}
                  </Badge>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/cases/${c.id}`);
                    }}
                    className="px-3 py-1 bg-blue-50 dark:bg-blue-600/20 hover:bg-blue-100 dark:hover:bg-blue-600/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 rounded-lg text-xs font-medium transition-colors"
                  >
                    View Case
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
