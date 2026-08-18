import React, { useEffect, useState } from 'react';
import { History, Search } from 'lucide-react';
import { api } from '../services/api';
import { AuditLog } from '../types';
import { Badge } from '../components/common/Badge';
import { SkeletonTable } from '../components/common/SkeletonLoader';

export const Audit: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        setIsLoading(true);
        const data = await api.getAuditLogs();
        setAuditLogs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAudit();
  }, []);

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.investigatorName.toLowerCase().includes(search.toLowerCase()) ||
      log.caseId.toLowerCase().includes(search.toLowerCase()) ||
      log.ipAddress.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 font-mono text-xs font-bold mb-2 border border-blue-500/20">
            IMMUTABLE COMPLIANCE TELEMETRY
          </span>
          <h1 className="font-headline text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center space-x-3">
            <History className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <span>Audit Activity</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-sans mt-1">
            Review investigator actions and system activity.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Investigator, Action, Case..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-lg border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:outline-none placeholder-slate-400 dark:placeholder-slate-500 font-sans"
          />
        </div>
      </div>

      {/* Audit Activity Table */}
      {isLoading ? (
        <SkeletonTable rows={5} />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/60 text-xs font-sans text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 font-semibold">
                  <th className="py-3.5 px-4">Time</th>
                  <th className="py-3.5 px-4">Investigator</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Case</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-sans">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 text-xs">
                      {log.timestamp.length > 10 ? log.timestamp.substring(11, 16) : log.timestamp}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">{log.investigatorName}</td>
                    <td className="py-3.5 px-4 font-semibold text-blue-600 dark:text-blue-400">{log.action}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">{log.caseId}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant={log.result === 'Success' ? 'active' : 'high'}>
                        {log.result}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
