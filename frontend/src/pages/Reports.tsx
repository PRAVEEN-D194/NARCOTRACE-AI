import React, { useEffect, useState } from 'react';
import { FileSpreadsheet, Download, RefreshCw, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { Case, ReportSummary } from '../types';
import { Button } from '../components/common/Button';
import { generateInvestigationReportPDF } from '../utils/pdfExport';
import { SkeletonCard } from '../components/common/SkeletonLoader';

export const Reports: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('CASE-2026-041');
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchCases = async () => {
      const c = await api.getCases();
      setCases(c);
    };
    fetchCases();
  }, []);

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      const data = await api.generateReport(selectedCaseId);
      setReport(data);
      api.logAuditEvent('Generated Report', selectedCaseId, `Compiled investigation summary for ${selectedCaseId}.`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    handleGenerateReport();
  }, [selectedCaseId]);

  const handleExportPDF = () => {
    if (report) {
      generateInvestigationReportPDF(report);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 font-mono text-xs font-bold mb-2 border border-blue-500/20">
            AUTOMATED DOSSIER GENERATOR
          </span>
          <h1 className="font-headline text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center space-x-3">
            <FileSpreadsheet className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <span>Investigation Report</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-sans mt-1">
            Review and generate a summary of the current investigation.
          </p>
        </div>

        {/* Target Case Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="px-3.5 py-2 bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 font-semibold text-xs rounded-lg border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:outline-none"
          >
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} - {c.subject}
              </option>
            ))}
          </select>

          <Button variant="secondary" icon={RefreshCw} onClick={handleGenerateReport} isLoading={isGenerating}>
            Generate Report
          </Button>

          <Button variant="primary" icon={Download} onClick={handleExportPDF} disabled={!report || isGenerating}>
            Export PDF
          </Button>
        </div>
      </div>

      {/* Report Preview Container */}
      {isGenerating || !report ? (
        <div className="max-w-4xl mx-auto space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-sm space-y-6 max-w-4xl mx-auto transition-colors font-sans">
          {/* Action Confirmation Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm text-slate-800 dark:text-slate-200 font-semibold">Report Generated & Ready</span>
            </div>
            <Button variant="primary" size="sm" icon={Download} onClick={handleExportPDF}>
              Export PDF
            </Button>
          </div>

          {/* Dossier Header Box */}
          <div className="p-5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="font-headline text-lg font-bold text-slate-900 dark:text-slate-100">NARCO-TRACE AI INVESTIGATION REPORT</h2>
              <span className="text-xs text-amber-700 dark:text-amber-400 font-mono font-semibold">LAW ENFORCEMENT SENSITIVE</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans">
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Case ID</span>
                <p className="font-bold text-blue-600 dark:text-blue-400 font-mono mt-0.5">{report.caseId}</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Subject</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{report.subject}</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Risk Score</span>
                <p className="font-bold text-rose-600 dark:text-rose-400 font-mono mt-0.5">{report.riskScore} / 100 ({report.riskLevel})</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Generated By</span>
                <p className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">{report.generatedBy}</p>
              </div>
            </div>
          </div>

          {/* Detailed Sections */}
          <div className="space-y-5 font-sans text-xs">
            {/* 1. Case Summary */}
            <div className="space-y-2">
              <h3 className="font-headline text-base font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">1. Case Summary</h3>
              <p className="p-4 bg-slate-50 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-800 leading-relaxed font-sans">
                {report.summary}
              </p>
            </div>

            {/* 2. Risk Assessment */}
            <div className="space-y-2">
              <h3 className="font-headline text-base font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">2. Risk Assessment</h3>
              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">Threat Score:</span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">{report.riskScore} / 100 ({report.riskLevel})</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed pt-1">
                  High-risk indicators resolved automatically across dark net contraband listings, cross-platform aliases, and Ethereum tumbler siphon transactions.
                </p>
              </div>
            </div>

            {/* 3. Network Summary */}
            <div className="space-y-2">
              <h3 className="font-headline text-base font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">3. Network Summary</h3>
              <p className="p-4 bg-slate-50 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-800 leading-relaxed font-sans">
                {report.networkSummary} ({report.forwardCount} forward connections, {report.backwardCount} backward connections).
              </p>
            </div>

            {/* 4. Key Findings */}
            <div className="space-y-2">
              <h3 className="font-headline text-base font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">4. Key Findings</h3>
              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                {report.keyFindings.map((f, i) => (
                  <p key={i} className="flex items-start space-x-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold font-mono">•</span>
                    <span>{f}</span>
                  </p>
                ))}
              </div>
            </div>

            {/* 5. Evidence Summary */}
            <div className="space-y-2">
              <h3 className="font-headline text-base font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">5. Evidence Summary</h3>
              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                <p className="text-slate-700 dark:text-slate-300">
                  Total verified evidence files linked to target: <strong className="text-blue-600 dark:text-blue-400 font-mono">{report.evidenceCount} items</strong>.
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  All evidence files verified with SHA-256 cryptographic checksum audit trail.
                </p>
              </div>
            </div>

            {/* 6. Investigation Timeline */}
            <div className="space-y-2">
              <h3 className="font-headline text-base font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">6. Investigation Timeline</h3>
              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2 font-mono text-xs">
                <p className="text-slate-500 dark:text-slate-400">• 2026-02-15 08:44 UTC: Wallet-X Tumbler Transfer (14.8 ETH)</p>
                <p className="text-slate-500 dark:text-slate-400">• 2026-02-12 14:02 UTC: Telegram Handle Wolf_23 Resolved</p>
                <p className="text-slate-500 dark:text-slate-400">• 2026-02-10 10:14 UTC: Darknet Vendor Listing Index #892 Discovered</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
