import React, { useEffect, useState } from 'react';
import { History, ShieldCheck, Database, Search } from 'lucide-react';
import { api } from '../services/api';
import { AuditLog } from '../types';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-mono font-extrabold text-slate-100 tracking-tight flex items-center space-x-2">
            <History className="w-6 h-6 text-cyan-400" />
            <span>INVESTIGATOR ACTIVITY AUDIT LOGS</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Frontend display of backend immutable compliance & action telemetry
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-500/30">
          <Database className="w-3.5 h-3.5" />
          <span>BACKEND AUDIT FEED</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-4 shadow-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Action, Investigator, Case ID, IP Address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 text-slate-100 font-mono text-xs rounded-lg border border-slate-800 focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Audit Table */}
      {isLoading ? (
        <LoadingSpinner message="Fetching Audit Activity Log..." />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-[11px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Investigator</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Case ID</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">{log.timestamp}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-200">{log.investigatorName}</td>
                    <td className="py-3.5 px-4 font-bold text-cyan-400">{log.action}</td>
                    <td className="py-3.5 px-4 text-slate-300">{log.caseId}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant={log.result === 'Success' ? 'active' : 'high'}>
                        {log.result}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">{log.ipAddress}</td>
                    <td className="py-3.5 px-4 text-slate-400 font-sans text-xs">{log.details || '—'}</td>
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
