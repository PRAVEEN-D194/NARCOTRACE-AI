import React, { useEffect, useState } from 'react';
import {
  FolderKanban,
  ShieldAlert,
  FileSearch,
  Network,
  Activity,
  BrainCircuit,
  ArrowUpRight,
  TrendingUp,
  Radio,
  Zap,
  Lock,
  ArrowRight,
  ShieldCheck,
  Globe,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Case, AuditLog } from '../types';
import { PriorityCasesTable } from '../components/dashboard/PriorityCasesTable';
import { SkeletonCard, SkeletonTable } from '../components/common/SkeletonLoader';
import { ErrorMessage } from '../components/common/ErrorMessage';

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

  // Active target toggle states for demo interactive controls
  const [activeTargets, setActiveTargets] = useState<{ [key: string]: boolean }>({
    'CASE-2026-041': true,
    'CASE-2026-042': true,
    'CASE-2026-044': true,
  });

  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getDashboard();
      setStats(data);
    } catch (err) {
      setError('Unable to load investigation data. Please try again or contact the system administrator.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const toggleTarget = (caseId: string) => {
    setActiveTargets((prev) => ({ ...prev, [caseId]: !prev[caseId] }));
  };

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto">
        <div className="flex flex-col items-center justify-center p-12">
          <div className="w-48 h-48 rounded-full bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonTable rows={5} />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="py-12">
        <ErrorMessage
          title="Unable to load investigation data."
          message="Please try again or contact the system administrator."
          onRetry={fetchDashboardData}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 font-sans pb-12">
      {/* Header Title Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 font-mono text-xs font-bold mb-2 border border-blue-500/20">
            SYSTEM INTELLIGENCE OVERVIEW
          </span>
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Investigation Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 font-sans">
            Monitor active cases, high-risk entities, network activity, and intelligence findings.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/cases')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all shadow-sm flex items-center space-x-2 text-sm font-sans"
          >
            <span>View All Cases</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Centerpiece: Luminous Intelligence Engine Dial */}
      <section className="flex flex-col items-center pt-2">
        <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center">
          {/* Shadow Glow */}
          <div className="absolute inset-0 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

          {/* Outer Ring: Threat Score Gauge (Primary Rose Accent) */}
          <svg className="absolute w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            <circle className="text-slate-200 dark:text-slate-900" cx="50" cy="50" fill="transparent" r="45" stroke="currentColor" strokeWidth="5" />
            <circle
              className="text-rose-600 dark:text-rose-500"
              cx="50"
              cy="50"
              fill="transparent"
              r="45"
              stroke="currentColor"
              strokeDasharray="282.7"
              strokeDashoffset="17"
              strokeLinecap="round"
              strokeWidth="5"
            />
          </svg>

          {/* Inner Ring: Network Correlation Centrality (Blue Accent) */}
          <svg className="absolute w-3/4 h-3/4 -rotate-90 transform" viewBox="0 0 100 100">
            <circle className="text-slate-200 dark:text-slate-800" cx="50" cy="50" fill="transparent" r="45" stroke="currentColor" strokeWidth="7" />
            <circle
              className="text-blue-600 dark:text-blue-500"
              cx="50"
              cy="50"
              fill="transparent"
              r="45"
              stroke="currentColor"
              strokeDasharray="282.7"
              strokeDashoffset="34"
              strokeLinecap="round"
              strokeWidth="7"
            />
          </svg>

          {/* Central Dial Display Content */}
          <div className="z-10 text-center space-y-0.5">
            <div className="font-headline text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              94
            </div>
            <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">
              THREAT INDEX
            </div>
            <div className="mt-3 flex items-center justify-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold font-sans text-sm">
              <Network className="w-4 h-4" />
              <span className="font-headline text-lg">7 Nodes</span>
            </div>
          </div>
        </div>

        {/* Stats Metadata Breakdown Under Dial */}
        <div className="grid grid-cols-2 gap-8 mt-8 w-full max-w-md">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-tight text-slate-500 dark:text-slate-400 font-mono">
              Risk Severity Rate
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-headline text-2xl font-bold text-rose-600 dark:text-rose-400">94 / 100</span>
              <TrendingUp className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
          <div className="space-y-1 text-right">
            <span className="text-xs font-bold uppercase tracking-tight text-slate-500 dark:text-slate-400 font-mono">
              System Status
            </span>
            <div className="flex items-baseline justify-end gap-1.5">
              <span className="font-headline text-2xl font-bold text-slate-900 dark:text-slate-100">Optimal</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Top 4 Quick Statistics Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-mono uppercase font-semibold">Active Cases</span>
            <FolderKanban className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="font-headline text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.activeCasesCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Cases currently under investigation.</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-mono uppercase font-semibold">High-Risk Cases</span>
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <p className="font-headline text-3xl font-bold text-rose-600 dark:text-rose-400">{stats.highPriorityCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Cases requiring immediate attention.</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-mono uppercase font-semibold">Network Alerts</span>
            <Network className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="font-headline text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.networkAlertsCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Important network changes detected.</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-mono uppercase font-semibold">Evidence Items</span>
            <FileSearch className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="font-headline text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.totalEvidenceCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Evidence linked to active cases.</p>
        </div>
      </section>

      {/* Active Target Monitored Systems */}
      <section className="space-y-6">
        <div className="flex items-end justify-between px-1">
          <div>
            <h2 className="font-headline text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Active Monitored Targets
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">3 high-risk entities actively drawing network correlation telemetry</p>
          </div>
          <button
            onClick={() => navigate('/cases')}
            className="text-blue-600 dark:text-blue-400 font-semibold text-xs hover:underline font-sans"
          >
            View All Targets
          </button>
        </div>

        {/* Horizontal Card Scroll Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Target 1: DarkWolf23 */}
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700 space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400">
                <Radio className="w-5 h-5" />
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeTargets['CASE-2026-041']}
                  onChange={() => toggleTarget('CASE-2026-041')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>
            <div>
              <h3 className="font-headline text-lg font-bold text-slate-900 dark:text-slate-100">DarkWolf23</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">CASE-2026-041 // Telegram & Dark Net</p>
            </div>
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-sans">
                <span className="text-slate-500 dark:text-slate-400">Risk Score</span>
                <span className="font-headline font-bold text-rose-600 dark:text-rose-400">94 / 100</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                <div className="bg-rose-500 h-full w-[94%]" />
              </div>
            </div>
          </div>

          {/* Target 2: SpectreNode_99 */}
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700 space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 text-blue-600 dark:text-blue-400">
                <Zap className="w-5 h-5" />
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeTargets['CASE-2026-042']}
                  onChange={() => toggleTarget('CASE-2026-042')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>
            <div>
              <h3 className="font-headline text-lg font-bold text-slate-900 dark:text-slate-100">SpectreNode_99</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">CASE-2026-042 // DEX Tumbler</p>
            </div>
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-sans">
                <span className="text-slate-500 dark:text-slate-400">Risk Score</span>
                <span className="font-headline font-bold text-rose-600 dark:text-rose-400">88 / 100</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                <div className="bg-rose-500 h-full w-[88%]" />
              </div>
            </div>
          </div>

          {/* Target 3: ViperX_Supplier */}
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700 space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400">
                <Globe className="w-5 h-5" />
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeTargets['CASE-2026-044']}
                  onChange={() => toggleTarget('CASE-2026-044')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>
            <div>
              <h3 className="font-headline text-lg font-bold text-slate-900 dark:text-slate-100">ViperX_Supplier</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">CASE-2026-044 // Session & Solana</p>
            </div>
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-sans">
                <span className="text-slate-500 dark:text-slate-400">Risk Score</span>
                <span className="font-headline font-bold text-rose-600 dark:text-rose-400">91 / 100</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                <div className="bg-rose-500 h-full w-[91%]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Asymmetric Bento Grid Insights Section */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Featured Large Card: Primary Tactical Case Action */}
        <div className="md:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm flex flex-col justify-between min-h-[300px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-blue-600/20 transition-all duration-700 pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                PRIMARY DEMO CASE // HIGH RISK
              </span>
              <h3 className="font-headline text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
                Operation DarkWolf Target Analysis
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm mt-2 max-w-lg leading-relaxed font-sans">
                High-priority target orchestrating cross-platform contraband distribution via Telegram relay nodes and multi-sig crypto wallets.
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs font-mono text-slate-500 dark:text-slate-400">
              <span>Target: <strong className="text-slate-800 dark:text-slate-200">DarkWolf23</strong></span>
              <span>•</span>
              <span>Risk: <strong className="text-rose-600 dark:text-rose-400">94 / 100</strong></span>
            </div>
            <button
              onClick={() => navigate('/cases/CASE-2026-041')}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors flex items-center space-x-2 text-sm"
            >
              <span>View Case Workspace</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Side Card: Controlled Intelligence Status */}
        <div className="md:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col justify-between min-h-[300px] shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Lock className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-200 dark:border-emerald-800/60">
              AUTHORIZED
            </span>
          </div>

          <div>
            <h3 className="font-headline text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">
              Controlled Intelligence
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed font-sans">
              Sanitized findings ready for investigator review. Raw restricted signals are isolated securely by the backend firewall.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Confidence Match</span>
            <span className="font-headline font-bold text-blue-600 dark:text-blue-400 text-lg">91%</span>
          </div>
        </div>
      </section>

      {/* Main High Priority Cases Table */}
      <section className="space-y-6">
        <PriorityCasesTable cases={stats.recentCases} />
      </section>

      {/* Audit Activity Summary Bar */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 rounded-full flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-headline text-lg font-bold text-slate-900 dark:text-slate-100">Investigator Action Telemetry</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                All investigator actions are securely logged in backend immutable compliance records.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/audit')}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 px-5 py-2.5 rounded-lg font-semibold text-xs whitespace-nowrap transition-colors"
          >
            Review Audit Activity
          </button>
        </div>
      </section>
    </div>
  );
};
