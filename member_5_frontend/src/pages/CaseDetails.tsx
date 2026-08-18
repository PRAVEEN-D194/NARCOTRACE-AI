import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Network,
  ShieldAlert,
  BrainCircuit,
  Wallet,
  Clock,
  FileSpreadsheet,
  ArrowLeft,
  UserCheck,
  Building,
} from 'lucide-react';
import { api } from '../services/api';
import {
  Case,
  NetworkData,
  NetworkNode,
  Evidence,
  RiskAssessment,
  IntelligenceFinding,
} from '../types';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { RiskIndicator } from '../components/dashboard/RiskIndicator';
import { NetworkGraph } from '../components/network/NetworkGraph';
import { NodeDetailPanel } from '../components/network/NodeDetailPanel';
import { EvidenceDetailModal } from '../components/evidence/EvidenceDetailModal';
import { generateInvestigationReportPDF } from '../utils/pdfExport';

type WorkspaceTab = 'overview' | 'network' | 'evidence' | 'intelligence' | 'financial' | 'timeline' | 'report';

export const CaseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const caseId = id || 'CASE-2026-041';
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [intelFindings, setIntelFindings] = useState<IntelligenceFinding[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selected Node state for Network Graph
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  // Selected Evidence state for Modal
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);

  useEffect(() => {
    const fetchAllCaseData = async () => {
      try {
        setIsLoading(true);
        const [c, net, ev, risk, intel] = await Promise.all([
          api.getCaseById(caseId),
          api.getNetwork(caseId),
          api.getEvidence(caseId),
          api.getRisk(caseId),
          api.getIntelligence(caseId),
        ]);
        setCaseData(c);
        setNetworkData(net);
        setEvidenceList(ev);
        setRiskAssessment(risk);
        setIntelFindings(intel);

        api.logAuditEvent('Opened Case', caseId, `Loaded complete workspace for ${caseId}.`);
      } catch (err) {
        console.error('Error fetching case workspace:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllCaseData();
  }, [caseId]);

  if (isLoading) {
    return <LoadingSpinner message={`Loading Case Workspace Dossier for ${caseId}...`} />;
  }

  if (!caseData || !networkData || !riskAssessment) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <FolderKanban className="w-12 h-12 text-slate-500 mx-auto" />
        <h2 className="text-lg font-mono font-bold text-slate-100">Case Information Unavailable</h2>
        <p className="text-sm text-slate-400">Unable to load case information for {caseId}. Please try again.</p>
        <button
          onClick={() => navigate('/cases')}
          className="px-4 py-2 bg-slate-800 text-slate-200 font-mono text-xs rounded-lg"
        >
          Return to Cases
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: FolderKanban },
    { id: 'network', name: 'Network Graph', icon: Network, badge: `${caseData.nodeCount} Nodes` },
    { id: 'evidence', name: 'Evidence Dossier', icon: ShieldAlert, badge: `${evidenceList.length} Items` },
    { id: 'intelligence', name: 'Intelligence Cell', icon: BrainCircuit },
    { id: 'financial', name: 'Financial Telemetry', icon: Wallet },
    { id: 'timeline', name: 'Timeline', icon: Clock },
    { id: 'report', name: 'Report Summary', icon: FileSpreadsheet },
  ];

  const handleExportPDF = async () => {
    const reportData = await api.generateReport(caseData.id);
    generateInvestigationReportPDF(reportData);
    api.logAuditEvent('Generated Report', caseData.id, 'Exported PDF dossier from Case Workspace.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Workspace Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/cases')}
              className="p-2 text-slate-400 hover:text-slate-100 bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
              title="Back to Cases"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-mono font-bold text-cyan-400">{caseData.id}</span>
                <Badge variant={caseData.priority === 'HIGH' ? 'high' : 'medium'}>{caseData.priority}</Badge>
                <Badge variant="active">{caseData.status}</Badge>
              </div>
              <h1 className="text-lg font-bold text-slate-100 mt-0.5">{caseData.title}</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right font-mono">
              <span className="text-[10px] text-slate-400 uppercase">Backend Threat Score</span>
              <p className="text-2xl font-extrabold text-rose-400 tracking-tight">{caseData.riskScore} / 100</p>
            </div>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs rounded-lg transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center space-x-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export PDF Report</span>
            </button>
          </div>
        </div>

        {/* Quick Key Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs font-mono">
          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px]">TARGET SUBJECT</span>
            <p className="font-bold text-slate-100 truncate">{caseData.subject}</p>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px]">RESOLVED ALIAS</span>
            <p className="font-bold text-cyan-300 truncate">
              {caseData.aliases[0]?.name || 'N/A'}
            </p>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px]">PRIMARY WALLET</span>
            <p className="font-bold text-amber-400 truncate">Wallet-X</p>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px]">GRAPH TOPOLOGY</span>
            <p className="font-bold text-slate-200">{caseData.nodeCount} Nodes</p>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px]">FORWARD CONNECTIONS</span>
            <p className="font-bold text-cyan-400">{caseData.forwardConnectionsCount} Forward</p>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px]">BACKWARD CONNECTIONS</span>
            <p className="font-bold text-purple-400">{caseData.backwardConnectionsCount} Backward</p>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex overflow-x-auto space-x-1 border-b border-slate-800 pt-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as WorkspaceTab)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-lg text-xs font-mono font-semibold transition-colors border-t border-x whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-950 text-cyan-400 border-cyan-500/40 border-b-slate-950 -mb-px shadow-[0_-4px_12px_rgba(6,182,212,0.1)]'
                    : 'bg-slate-900/50 text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.name}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 text-[10px] rounded border border-slate-700">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Summary Dossier */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <h3 className="font-mono font-bold text-sm text-slate-100 uppercase tracking-wider">
                  Operational Summary Dossier
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950 p-4 rounded-lg border border-slate-800">
                  {caseData.summary}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {caseData.tags.map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-cyan-950/60 text-cyan-300 text-xs font-mono rounded border border-cyan-500/30">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Resolved Aliases & Connected Wallets Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-bold uppercase">
                    <UserCheck className="w-4 h-4" />
                    <span>Identified Handles & Aliases</span>
                  </div>
                  <div className="space-y-2">
                    {caseData.aliases.map((alias, idx) => (
                      <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono">
                        <div>
                          <p className="font-bold text-slate-100">{alias.name}</p>
                          <p className="text-[10px] text-slate-400">Platform: {alias.platform}</p>
                        </div>
                        <span className="text-[11px] text-emerald-400 font-bold">{alias.confidence}% Match</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-mono text-amber-400 font-bold uppercase">
                    <Wallet className="w-4 h-4" />
                    <span>Target Financial Wallets</span>
                  </div>
                  <div className="space-y-2">
                    {caseData.wallets.map((wallet, idx) => (
                      <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1 text-xs font-mono">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-300">{wallet.blockchain}</span>
                          <span className="text-rose-400 font-bold">{wallet.riskScore}/100 Risk</span>
                        </div>
                        <p className="text-[11px] text-slate-300 truncate">{wallet.address}</p>
                        <p className="text-[10px] text-slate-400">Balance: {wallet.balance}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Risk Indicator */}
            <div className="space-y-6">
              <RiskIndicator assessment={riskAssessment} />
            </div>
          </div>
        )}

        {/* NETWORK TAB */}
        {activeTab === 'network' && (
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
                onNavigateEvidence={(evId) => {
                  const ev = evidenceList.find((e) => e.id === evId);
                  if (ev) setSelectedEvidence(ev);
                }}
              />
            )}
          </div>
        )}

        {/* EVIDENCE TAB */}
        {activeTab === 'evidence' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {evidenceList.map((ev) => (
              <div
                key={ev.id}
                onClick={() => setSelectedEvidence(ev)}
                className="bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-5 shadow-xl transition-all cursor-pointer space-y-3 flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-cyan-400 text-sm group-hover:text-cyan-300">{ev.id}</span>
                    <Badge variant="verified">{ev.status}</Badge>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100">{ev.title}</h4>
                  <p className="text-xs font-mono text-slate-400">Type: {ev.type}</p>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans">{ev.details}</p>
                </div>
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="text-emerald-400">{ev.integrityStatus}</span>
                  <span className="text-cyan-400 font-semibold group-hover:underline">View Dossier →</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* INTELLIGENCE TAB */}
        {activeTab === 'intelligence' && (
          <div className="space-y-4">
            {intelFindings.map((finding) => (
              <div
                key={finding.id}
                className={`p-5 rounded-xl border space-y-3 ${
                  finding.isControlled
                    ? 'bg-slate-900 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                    : 'bg-slate-950 border-amber-500/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${finding.isControlled ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                      {finding.isControlled ? 'CONTROLLED INTELLIGENCE' : 'RAW / RESTRICTED SIGNAL'}
                    </span>
                    <span className="text-xs font-mono text-slate-400">Confidence: {finding.confidence}%</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{finding.timestamp}</span>
                </div>
                <h4 className="text-base font-bold text-slate-100 font-sans">{finding.finding}</h4>
                <p className="text-xs text-slate-300 font-sans">{finding.summary}</p>
                <div className="flex items-center space-x-4 text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">
                  <span>Entities: {finding.relatedEntities.join(', ')}</span>
                  <span>Evidence: {finding.evidenceIds.join(', ') || 'None'}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FINANCIAL TAB */}
        {activeTab === 'financial' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="font-mono font-bold text-sm text-slate-100 uppercase tracking-wider flex items-center space-x-2">
              <Wallet className="w-4 h-4 text-amber-400" />
              <span>Blockchain & Financial Flow Analysis</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              On-chain transaction telemetry provided by Member 3 Graph Engine.
            </p>

            <div className="space-y-3">
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-400 text-[10px]">ORIGIN WALLET</span>
                  <p className="font-bold text-slate-100">Wallet-X (0x71C7656EC8ab88c098defB751B7401B5f6d8976F)</p>
                </div>
                <div className="text-center font-bold text-amber-400">
                  → Transfer 14.8 ETH →
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">DESTINATION MIXER</span>
                  <p className="font-bold text-rose-400">Wallet-Y (0x882A...5512)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TIMELINE TAB */}
        {activeTab === 'timeline' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="font-mono font-bold text-sm text-slate-100 uppercase tracking-wider flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Investigation Chronology</span>
            </h3>

            <div className="relative border-l border-slate-800 ml-4 pl-6 space-y-6 font-mono text-xs">
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-cyan-400 border-2 border-slate-900" />
                <span className="text-slate-400 text-[10px]">2026-02-15 08:44 UTC</span>
                <h4 className="font-bold text-slate-100 mt-0.5">Wallet-X Tumbler Transfer (14.8 ETH)</h4>
                <p className="text-slate-400 text-[11px] font-sans">On-chain transaction recorded entering mixer address.</p>
              </div>

              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-purple-400 border-2 border-slate-900" />
                <span className="text-slate-400 text-[10px]">2026-02-12 14:02 UTC</span>
                <h4 className="font-bold text-slate-100 mt-0.5">Telegram Handle Wolf_23 Resolved</h4>
                <p className="text-slate-400 text-[11px] font-sans">Cross-platform match score 96% linked to DarkWolf23.</p>
              </div>

              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-slate-900" />
                <span className="text-slate-400 text-[10px]">2026-02-10 10:14 UTC</span>
                <h4 className="font-bold text-slate-100 mt-0.5">Darknet Vendor Listing Discovered</h4>
                <p className="text-slate-400 text-[11px] font-sans">Tor Onion listing archive collected by Member 1 NLP engine.</p>
              </div>
            </div>
          </div>
        )}

        {/* REPORT TAB */}
        {activeTab === 'report' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-mono font-bold text-lg text-slate-100">NARCO-TRACE INVESTIGATION REPORT SUMMARY</h3>
                <p className="text-xs text-slate-400 font-mono">Case ID: {caseData.id} // Subject: {caseData.subject}</p>
              </div>
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs rounded-lg transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center space-x-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export PDF Report</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-500">SUBJECT TARGET</span>
                <p className="text-base font-bold text-cyan-400">{caseData.subject}</p>
              </div>
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-500">BACKEND THREAT LEVEL</span>
                <p className="text-base font-bold text-rose-400">{caseData.riskScore} / 100 ({caseData.priority})</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-mono font-bold text-xs text-slate-300 uppercase">Key Tactical Findings</h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 font-sans bg-slate-950 p-4 rounded-lg border border-slate-800">
                <li>Direct correlation confirmed between Dark Web handle DarkWolf23 and Telegram account Wolf_23 (91% confidence).</li>
                <li>Primary financial siphon wallet Wallet-X (0x71C7...976F) identified transferring 14.8 ETH into tumbler protocols.</li>
                <li>Eigenvector graph centrality designates subject node as primary logistical bottleneck for regional distribution.</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Evidence Modal */}
      {selectedEvidence && (
        <EvidenceDetailModal
          evidence={selectedEvidence}
          onClose={() => setSelectedEvidence(null)}
        />
      )}
    </div>
  );
};
