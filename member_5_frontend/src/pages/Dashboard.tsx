import React, { useEffect, useState } from 'react';
import {
  FolderKanban,
  ShieldAlert,
  FileSearch,
  Network,
  Activity,
  BrainCircuit,
  ArrowUpRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Case, AuditLog } from '../types';
import { StatCard } from '../components/dashboard/StatCard';
import { PriorityCasesTable } from '../components/dashboard/PriorityCasesTable';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<{
    activeCasesCount: number;
    highPriorityCount: number;
    mediumPriorityCount: number;
    totalEvidenceCount: number;
    networkAlertsCount: number;
    recentCases: Case[];
    recentActivity: AuditLog[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const data = await api.getDashboard();
        setStats(data);
      } catch (err) {
        setError('Unable to load dashboard intelligence feeds. Please check system integration API.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Fetching Investigator Dashboard Intelligence Feeds..." />;
  }

  if (error || !stats) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 border border-rose-500/30 rounded-xl space-y-4 shadow-md">
        <ShieldAlert className="w-12 h-12 text-rose-500 dark:text-rose-400 mx-auto" />
        <h2 className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100">Telemetry Feed Error</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-semibold rounded-lg transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Overview Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-mono font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            INVESTIGATOR COMMAND DASHBOARD
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            Real-time Threat Intelligence & Cross-Module Correlation Feed
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-400 text-xs font-mono rounded-lg">
            <span className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-ping mr-2" />
            SYNTHETIC DEMO ACTIVE
          </span>
        </div>
      </div>

      {/* KPI Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Cases"
          value={stats.activeCasesCount}
          subtitle="24 Total System Targets"
          icon={FolderKanban}
          color="cyan"
          trend="+2 New"
        />
        <StatCard
          title="High Priority"
          value={stats.highPriorityCount}
          subtitle="Critical Action Required"
          icon={ShieldAlert}
          color="rose"
          trend="7 Active"
        />
        <StatCard
          title="Evidence Items"
          value={stats.totalEvidenceCount}
          subtitle="138 Verified Dossiers"
          icon={FileSearch}
          color="amber"
          trend="+14 Validated"
        />
        <StatCard
          title="Network Alerts"
          value={stats.networkAlertsCount}
          subtitle="Cross-platform Anomalies"
          icon={Network}
          color="purple"
          trend="12 Flagged"
        />
      </div>

      {/* Main Grid Section: Priority Cases Table & Intelligence Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: High Priority Cases Table */}
        <div className="lg:col-span-2 space-y-6">
          <PriorityCasesTable cases={stats.recentCases} />
        </div>

        {/* Right Col: Recent Intelligence & Live Audit Activity */}
        <div className="space-y-6">
          {/* Quick Demo Case Highlight Box */}
          <div className="bg-white dark:bg-slate-900 border border-cyan-400/40 dark:border-cyan-500/40 rounded-xl p-5 shadow-md dark:shadow-2xl relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <BrainCircuit className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <h3 className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">PRIMARY DEMO CASE</h3>
              </div>
              <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-[10px] font-mono rounded border border-rose-300 dark:border-rose-500/40 font-bold">
                94/100 RISK
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Case ID:</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">CASE-2026-041</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Target Subject:</span>
                <span className="text-slate-900 dark:text-slate-100 font-bold">DarkWolf23</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Primary Alias:</span>
                <span className="text-slate-700 dark:text-slate-300">Wolf_23 (Telegram)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Primary Wallet:</span>
                <span className="text-slate-700 dark:text-slate-300">Wallet-X (0x71C7...976F)</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/cases/CASE-2026-041')}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-extrabold text-xs rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              <span>Launch Case Workspace</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Recent Audit Activity Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm dark:shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <h3 className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Investigator Activity Audit
                </h3>
              </div>
              <button
                onClick={() => navigate('/audit')}
                className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 hover:underline"
              >
                Full Log
              </button>
            </div>

            <div className="space-y-3">
              {stats.recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 bg-slate-50 dark:bg-slate-950/80 rounded-lg border border-slate-200 dark:border-slate-800/80 space-y-1 text-xs font-mono"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{log.action}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">{log.timestamp.substring(11, 19)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{log.caseId}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{log.result}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
