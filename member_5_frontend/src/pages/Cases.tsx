import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Network, Clock, ArrowUpRight, X } from 'lucide-react';
import { api } from '../services/api';
import { Case, PriorityLevel, CaseStatus } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const Cases: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
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
        priority: priorityFilter,
        status: statusFilter,
      });
      setCases(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, [search, priorityFilter, statusFilter]);

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-mono font-extrabold text-slate-100 tracking-tight">
            CASE MANAGEMENT DOSSIER
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Search, filter, prioritize and dispatch target investigations
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setShowCreateModal(true)}
        >
          Create New Case
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-2 flex-1 min-w-[260px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by Case ID, Subject name or Alias..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 text-slate-100 font-mono text-xs rounded-lg border border-slate-800 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 text-slate-200 rounded border border-slate-800 focus:border-cyan-500 focus:outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 text-slate-200 rounded border border-slate-800 focus:border-cyan-500 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Case List Grid */}
      {isLoading ? (
        <LoadingSpinner message="Querying Case Database..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cases.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/cases/${c.id}`)}
              className="bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-5 shadow-xl transition-all duration-200 hover:shadow-2xl cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* ID & Priority Header */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono font-bold text-cyan-400 group-hover:text-cyan-300">
                    {c.id}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-rose-400">
                      {c.riskScore}/100 Risk
                    </span>
                    <Badge variant={c.priority === 'HIGH' ? 'high' : 'medium'}>{c.priority}</Badge>
                  </div>
                </div>

                {/* Subject Title */}
                <div>
                  <h3 className="text-lg font-bold text-slate-100 tracking-tight leading-snug">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    Subject: <strong className="text-slate-200">{c.subject}</strong>
                  </p>
                </div>

                {/* Summary */}
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans">
                  {c.summary}
                </p>

                {/* Aliases & Wallets Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {c.aliases.map((a, i) => (
                    <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800">
                      @{a.name} ({a.platform})
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Info */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center space-x-1">
                    <Network className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{c.nodeCount} Nodes</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{c.lastActivity.substring(0, 10)}</span>
                  </span>
                </div>
                <span className="text-cyan-400 group-hover:translate-x-1 transition-transform">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Case Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-mono font-bold text-base text-slate-100">Initialize New Case Dossier</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">Target Subject / Handle</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DarkWolf23 or GhostNode"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 text-slate-100 text-xs font-mono rounded border border-slate-800 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">Investigation Title</label>
                <input
                  type="text"
                  placeholder="e.g. Operation Synthetic Dispersal"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 text-slate-100 text-xs font-mono rounded border border-slate-800 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">Initial Priority Level</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as PriorityLevel)}
                  className="w-full px-3 py-2 bg-slate-950 text-slate-100 text-xs font-mono rounded border border-slate-800 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="HIGH">HIGH PRIORITY</option>
                  <option value="MEDIUM">MEDIUM PRIORITY</option>
                  <option value="LOW">LOW PRIORITY</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
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
