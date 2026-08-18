import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Network, Clock, ArrowUpRight, X, FolderKanban } from 'lucide-react';
import { api } from '../services/api';
import { Case, PriorityLevel } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { SkeletonCard } from '../components/common/SkeletonLoader';
import { EmptyState } from '../components/common/EmptyState';

export const Cases: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Case form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newPriority, setNewPriority] = useState<PriorityLevel>('HIGH');

  const navigate = useNavigate();

  const loadCases = async () => {
    try {
      setIsLoading(true);
      const data = await api.getCases({
        search,
        priority: riskFilter !== 'ALL' && ['HIGH', 'MEDIUM', 'LOW'].includes(riskFilter) ? riskFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });

      let filtered = data;
      if (riskFilter === 'HIGH') filtered = filtered.filter((c: Case) => c.priority === 'HIGH');
      if (riskFilter === 'MEDIUM') filtered = filtered.filter((c: Case) => c.priority === 'MEDIUM');
      if (riskFilter === 'LOW') filtered = filtered.filter((c: Case) => c.priority === 'LOW');

      setCases(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, [search, riskFilter, statusFilter]);

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;

    const newCase: Case = {
      id: `CASE-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: newTitle || `Investigation ${newSubject}`,
      subject: newSubject,
      priority: newPriority,
      status: 'ACTIVE',
      riskScore: Math.floor(70 + Math.random() * 25),
      aliases: [{ name: `${newSubject}_Alias`, platform: 'Telegram', confidence: 88 }],
      wallets: [{ address: '0x' + Math.random().toString(16).substring(2, 34), blockchain: 'Ethereum', riskScore: 85 }],
      nodeCount: 8,
      forwardConnectionsCount: 5,
      backwardConnectionsCount: 3,
      evidenceIds: ['E-17'],
      lastActivity: new Date().toISOString().replace('T', ' ').substring(0, 19),
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      assignedInvestigator: 'Agent J. Miller',
      summary: `Newly initialized investigation dossier targeting ${newSubject}.`,
      tags: ['New Target', 'Cross-Platform'],
    };

    setCases([newCase, ...cases]);
    setShowCreateModal(false);
    setNewTitle('');
    setNewSubject('');
    api.logAuditEvent('Created Case', newCase.id, `Initialized dossier for subject ${newSubject}.`);
  };

  const handleClearFilters = () => {
    setSearch('');
    setRiskFilter('ALL');
    setStatusFilter('ALL');
  };

  const riskFiltersList = [
    { label: 'All', value: 'ALL' },
    { label: 'High Risk', value: 'HIGH' },
    { label: 'Medium Risk', value: 'MEDIUM' },
    { label: 'Low Risk', value: 'LOW' },
  ];

  const statusFiltersList = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Closed', value: 'CLOSED' },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 font-mono text-xs font-bold mb-2 border border-blue-500/20">
            ACTIVE TARGET REPOSITORY
          </span>
          <h1 className="font-headline text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Cases
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-sans mt-1">
            Search and manage active investigations.
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setShowCreateModal(true)}
        >
          Create Case
        </Button>
      </div>

      {/* Filter & Search Controls */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search Cases..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-lg border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:outline-none placeholder-slate-400 dark:placeholder-slate-500 font-sans"
            />
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase mr-1">Risk:</span>
            {riskFiltersList.map((rf) => (
              <button
                key={rf.value}
                onClick={() => setRiskFilter(rf.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  riskFilter === rf.value
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {rf.label}
              </button>
            ))}

            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase ml-2 mr-1">Status:</span>
            {statusFiltersList.map((sf) => (
              <button
                key={sf.value}
                onClick={() => setStatusFilter(sf.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === sf.value
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {sf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Case List Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : cases.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={FolderKanban}
            title="No Cases Found"
            description="No investigations match your current filters."
            actionLabel="Clear Filters"
            onAction={handleClearFilters}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/cases/${c.id}`)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl p-6 shadow-sm transition-all duration-150 cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* ID & Priority Header */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
                    {c.id}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                      {c.riskScore}/100 Risk
                    </span>
                    <Badge variant={c.priority === 'HIGH' ? 'high' : 'medium'}>{c.priority}</Badge>
                  </div>
                </div>

                {/* Title & Subject */}
                <div>
                  <h3 className="font-headline text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-1">
                    Subject: <strong className="text-slate-800 dark:text-slate-200">{c.subject}</strong>
                  </p>
                </div>

                {/* Summary */}
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-sans">
                  {c.summary}
                </p>

                {/* Topology Network Depth Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] font-sans text-slate-500 dark:text-slate-400">
                    <span>Graph Topology</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{c.nodeCount} nodes</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                    <div
                      className="bg-blue-600 dark:bg-blue-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, c.nodeCount * 6.5)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer Info */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-sans text-slate-500 dark:text-slate-400">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>Today</span>
                  </span>
                  <Badge variant={c.status === 'ACTIVE' ? 'active' : 'review'}>
                    {c.status === 'ACTIVE' ? 'Active' : c.status}
                  </Badge>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/cases/${c.id}`);
                  }}
                  className="px-3 py-1 bg-blue-50 dark:bg-blue-600/20 hover:bg-blue-100 dark:hover:bg-blue-600/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1"
                >
                  <span>View Case</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Case Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-headline text-lg font-bold text-slate-900 dark:text-slate-100">Create New Investigation Case</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-4 font-sans text-xs">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Target Subject / Handle</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DarkWolf23"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs rounded-lg border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Investigation Title</label>
                <input
                  type="text"
                  placeholder="e.g. Operation Synthetic Dispersal"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs rounded-lg border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Priority Level</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as PriorityLevel)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs rounded-lg border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  <option value="HIGH">HIGH PRIORITY</option>
                  <option value="MEDIUM">MEDIUM PRIORITY</option>
                  <option value="LOW">LOW PRIORITY</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                <Button variant="secondary" type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Dispatch Case
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
