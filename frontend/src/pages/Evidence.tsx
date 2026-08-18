import React, { useEffect, useState } from 'react';
import { ShieldAlert, Hash, Search } from 'lucide-react';
import { api } from '../services/api';
import { Evidence } from '../types';
import { Badge } from '../components/common/Badge';
import { EvidenceDetailModal } from '../components/evidence/EvidenceDetailModal';
import { SkeletonTable } from '../components/common/SkeletonLoader';

export const EvidencePage: React.FC = () => {
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvidence = async () => {
      try {
        setIsLoading(true);
        const data = await api.getEvidence();
        setEvidenceList(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvidence();
  }, []);

  const filteredEvidence = evidenceList.filter((ev) => {
    const matchesSearch =
      ev.id.toLowerCase().includes(search.toLowerCase()) ||
      ev.title.toLowerCase().includes(search.toLowerCase()) ||
      ev.relatedEntityName.toLowerCase().includes(search.toLowerCase()) ||
      ev.relatedCaseId.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'ALL' || ev.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-mono text-xs font-bold mb-2 border border-amber-500/20">
            PROVENANCE & INTEGRITY DOSSIER
          </span>
          <h1 className="font-headline text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center space-x-3">
            <ShieldAlert className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            <span>Evidence</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-sans mt-1">
            Review evidence linked to active investigations.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Evidence ID, Title, Entity, Case..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-lg border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:outline-none placeholder-slate-400 dark:placeholder-slate-500 font-sans"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs font-sans">
          <span className="text-slate-500 dark:text-slate-400 font-mono uppercase">Filter Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:outline-none"
          >
            <option value="ALL">All Evidence Types</option>
            <option value="Dark-Web Listing">Dark-Web Listing</option>
            <option value="Telegram Identity">Platform Identity</option>
            <option value="Wallet Transaction">Wallet Transaction</option>
            <option value="Financial Transfer">Financial Transfer</option>
          </select>
        </div>
      </div>

      {/* Evidence Table View */}
      {isLoading ? (
        <SkeletonTable rows={5} />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/60 text-xs font-sans text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 font-semibold">
                  <th className="py-3.5 px-4">Evidence ID</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Related Case</th>
                  <th className="py-3.5 px-4">Related Entity</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Integrity</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-sans">
                {filteredEvidence.map((ev) => (
                  <tr
                    key={ev.id}
                    onClick={() => setSelectedEvidence(ev)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
                      {ev.id}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {ev.type === 'Telegram Identity' ? 'Platform Identity' : ev.type}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">{ev.relatedCaseId}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-100">{ev.relatedEntityName}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant="verified">{ev.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-600 dark:text-emerald-400 text-xs">
                      <div className="flex items-center space-x-1">
                        <Hash className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>SHA-256 Verified</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvidence(ev);
                        }}
                        className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-700 transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {selectedEvidence && (
        <EvidenceDetailModal
          evidence={selectedEvidence}
          onClose={() => setSelectedEvidence(null)}
        />
      )}
    </div>
  );
};
