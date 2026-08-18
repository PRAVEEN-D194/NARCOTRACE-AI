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
  Download,
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
import { Button } from '../components/common/Button';
import { SkeletonCard } from '../components/common/SkeletonLoader';
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
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!caseData || !networkData || !riskAssessment) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 max-w-md mx-auto shadow-md">
        <FolderKanban className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto" />
        <h2 className="font-headline text-lg font-bold text-slate-900 dark:text-slate-100">Case Workspace Unavailable</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Unable to load case information for {caseId}.</p>
        <Button onClick={() => navigate('/cases')} variant="secondary" size="sm">
          Return to Cases
        </Button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: FolderKanban },
    { id: 'network', name: 'Network Graph', icon: Network, badge: `${caseData.nodeCount} Nodes` },
    { id: 'evidence', name: 'Evidence', icon: ShieldAlert, badge: `${evidenceList.length}` },
    { id: 'intelligence', name: 'Intelligence Cell', icon: BrainCircuit },
    { id: 'financial', name: 'Financial Telemetry', icon: Wallet },
    { id: 'timeline', name: 'Timeline', icon: Clock },
    { id: 'report', name: 'Report Preview', icon: FileSpreadsheet },
  ];

  const handleExportPDF = async () => {
    const reportData = await api.generateReport(caseData.id);
    generateInvestigationReportPDF(reportData);
    api.logAuditEvent('Generated Report', caseData.id, 'Exported PDF dossier from Case Workspace.');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans pb-12">
      {/* Workspace Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
        {/* Page Title & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/cases')}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors"
              title="Back to Cases"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">Investigation Workspace</span>
                <span className="text-slate-400 dark:text-slate-600">•</span>
                <span className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400">{caseData.id}</span>
              </div>
              <h1 className="font-headline text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">{caseData.title}</h1>
            </div>
          </div>

          {/* Key Quick Badges */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">Subject:</span>
              <strong className="text-sm text-slate-800 dark:text-slate-100 font-semibold">{caseData.subject}</strong>
            </div>
            <Badge variant="active">{caseData.status}</Badge>
            <Badge variant={caseData.priority === 'HIGH' ? 'high' : 'medium'}>{caseData.priority}</Badge>
            <Button variant="primary" size="sm" icon={Download} onClick={handleExportPDF}>
              Export PDF
            </Button>
          </div>
        </div>

        {/* Investigation Summary Information Grid */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Investigation Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Subject</span>
              <p className="font-semibold text-slate-800 dark:text-slate-100 truncate mt-0.5">{caseData.subject}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Known Alias</span>
              <p className="font-semibold text-blue-600 dark:text-blue-400 truncate mt-0.5">
                {caseData.aliases[0]?.name || 'Wolf_23'}
              </p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Connected Wallet</span>
              <p className="font-semibold text-amber-600 dark:text-amber-400 truncate mt-0.5">Wallet-X</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Network Size</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{caseData.nodeCount} nodes</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Forward Connections</span>
              <p className="font-semibold text-blue-600 dark:text-blue-400 mt-0.5">{caseData.forwardConnectionsCount}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Backward Connections</span>
              <p className="font-semibold text-purple-600 dark:text-purple-400 mt-0.5">{caseData.backwardConnectionsCount}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex overflow-x-auto space-x-1 border-b border-slate-200 dark:border-slate-800 pt-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as WorkspaceTab)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-lg text-xs font-medium transition-colors border-t border-x whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-50 dark:bg-slate-950 text-blue-600 dark:text-blue-400 border-slate-200 dark:border-slate-800 border-b-slate-50 dark:border-b-slate-950 -mb-px shadow-sm font-semibold'
                    : 'bg-white dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{tab.name}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] rounded font-mono border border-slate-300 dark:border-slate-700">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Summary Description */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-3 shadow-sm">
                <h3 className="font-headline text-lg font-bold text-slate-900 dark:text-slate-100">
                  Case Summary & Background
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans bg-slate-50 dark:bg-slate-950/60 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                  {caseData.summary}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {caseData.tags.map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-mono rounded border border-blue-200 dark:border-blue-800/60">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Identified Handles & Wallets Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-sm">
                  <div className="flex items-center space-x-2 text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase">
                    <UserCheck className="w-4 h-4" />
                    <span>Identified Aliases</span>
                  </div>
                  <div className="space-y-2">
                    {caseData.aliases.map((alias, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{alias.name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Platform: {alias.platform}</p>
                        </div>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">{alias.confidence}% Match</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-sm">
                  <div className="flex items-center space-x-2 text-xs text-amber-600 dark:text-amber-400 font-semibold uppercase">
                    <Wallet className="w-4 h-4" />
                    <span>Connected Crypto Wallets</span>
                  </div>
                  <div className="space-y-2">
                    {caseData.wallets.map((wallet, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-amber-600 dark:text-amber-300">{wallet.blockchain}</span>
                          <span className="text-rose-600 dark:text-rose-400 font-mono font-semibold">{wallet.riskScore}/100 Risk</span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-700 dark:text-slate-300 truncate">{wallet.address}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Balance: {wallet.balance}</p>
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
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl p-5 shadow-sm transition-all cursor-pointer space-y-3 flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm group-hover:underline">{ev.id}</span>
                    <Badge variant="verified">{ev.status}</Badge>
                  </div>
                  <h4 className="font-headline text-base font-bold text-slate-900 dark:text-slate-100">{ev.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Type: {ev.type}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed font-sans">{ev.details}</p>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                  <span className="text-emerald-600 dark:text-emerald-400">{ev.integrityStatus}</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold group-hover:underline">View Evidence →</span>
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
                className={`p-6 rounded-xl border space-y-3 shadow-sm ${
                  finding.isControlled
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    : 'bg-slate-50 dark:bg-slate-950 border-amber-300 dark:border-amber-900/40 opacity-90'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${finding.isControlled ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800/60' : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800/60'}`}>
                      {finding.isControlled ? 'CONTROLLED INTELLIGENCE' : 'RESTRICTED INFORMATION'}
                    </span>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Confidence: {finding.confidence}%</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{finding.timestamp}</span>
                </div>
                <h4 className="font-headline text-lg font-bold text-slate-900 dark:text-slate-100 font-sans">{finding.finding}</h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-sans leading-relaxed">{finding.summary}</p>
                <div className="flex items-center space-x-4 text-xs font-sans text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>Related Entities: <strong className="text-slate-800 dark:text-slate-200">{finding.relatedEntities.join(', ')}</strong></span>
                  <span>Supporting Evidence: <strong className="text-blue-600 dark:text-blue-400 font-mono">{finding.evidenceIds.join(', ') || 'None'}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FINANCIAL TAB */}
        {activeTab === 'financial' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
            <h3 className="font-headline text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Wallet className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span>Financial & Cryptocurrency Telemetry</span>
            </h3>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">ORIGIN WALLET</span>
                <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">Wallet-X (0x71C7656EC8ab88c098defB751B7401B5f6d8976F)</p>
              </div>
              <div className="text-center font-bold text-amber-600 dark:text-amber-400">
                → Transfer 14.8 ETH →
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">DESTINATION MIXER</span>
                <p className="font-semibold text-rose-600 dark:text-rose-400 mt-0.5">Wallet-Y (0x882A...5512)</p>
              </div>
            </div>
          </div>
        )}

        {/* TIMELINE TAB */}
        {activeTab === 'timeline' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
            <h3 className="font-headline text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Investigation Chronology</span>
            </h3>

            <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 pl-6 space-y-6 text-xs font-sans">
              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900" />
                <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">2026-02-15 08:44 UTC</span>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">Wallet-X Tumbler Transfer (14.8 ETH)</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs">On-chain transaction recorded entering mixer address.</p>
              </div>

              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-purple-500 border-2 border-white dark:border-slate-900" />
                <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">2026-02-12 14:02 UTC</span>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">Telegram Handle Wolf_23 Resolved</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Cross-platform match score 96% linked to DarkWolf23.</p>
              </div>

              <div className="relative">
                <span className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white dark:border-slate-900" />
                <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">2026-02-10 10:14 UTC</span>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">Darknet Vendor Listing Discovered</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Tor Onion listing archive collected by NLP engine.</p>
              </div>
            </div>
          </div>
        )}

        {/* REPORT TAB */}
        {activeTab === 'report' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-headline text-xl font-bold text-slate-900 dark:text-slate-100">Investigation Report Summary</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Case ID: {caseData.id} // Subject: {caseData.subject}</p>
              </div>
              <Button variant="primary" icon={Download} onClick={handleExportPDF}>
                Export PDF
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-500 dark:text-slate-400 text-[11px] block">SUBJECT TARGET</span>
                <p className="text-base font-bold text-blue-600 dark:text-blue-400 font-sans">{caseData.subject}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-500 dark:text-slate-400 text-[11px] block">RISK SCORE</span>
                <p className="text-base font-bold text-rose-600 dark:text-rose-400 font-mono">{caseData.riskScore} / 100 ({caseData.priority})</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-xs text-slate-700 dark:text-slate-300 uppercase">Key Findings</h4>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-sans bg-slate-50 dark:bg-slate-950/60 p-4 rounded-lg border border-slate-200 dark:border-slate-800 leading-relaxed">
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
