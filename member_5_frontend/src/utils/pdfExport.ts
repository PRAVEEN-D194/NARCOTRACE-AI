import { jsPDF } from 'jspdf';
import { ReportSummary } from '../types';

export const generateInvestigationReportPDF = (report: ReportSummary) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Dark slate header styling
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 38, 'F');

  // Title & Classification
  doc.setTextColor(0, 240, 255); // Cyan accent
  doc.setFont('courier', 'bold');
  doc.setFontSize(16);
  doc.text('NARCO-TRACE AI | LAW ENFORCEMENT DOSSIER', 14, 16);

  doc.setTextColor(245, 158, 11); // Amber
  doc.setFontSize(9);
  doc.text('CLASSIFICATION: LAW ENFORCEMENT SENSITIVE // RESTRICTED DISPATCH', 14, 23);

  doc.setTextColor(148, 163, 184); // Slate-400
  doc.setFontSize(8);
  doc.text(`GENERATED: ${report.generatedAt} | AGENT: ${report.generatedBy}`, 14, 30);

  // Divider line
  doc.setDrawColor(0, 240, 255);
  doc.setLineWidth(0.5);
  doc.line(14, 38, 196, 38);

  let y = 48;

  // Case Metadata Box
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 32, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, y, 182, 32, 'S');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`CASE ID: ${report.caseId}`, 18, y + 8);
  doc.text(`TARGET SUBJECT: ${report.subject}`, 18, y + 16);
  doc.text(`RISK SCORE: ${report.riskScore}/100 (${report.riskLevel} PRIORITY)`, 18, y + 24);

  y += 42;

  // Section 1: Operational Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Operational Executive Summary', 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  const summaryLines = doc.splitTextToSize(report.summary, 182);
  doc.text(summaryLines, 14, y);
  y += summaryLines.length * 5 + 8;

  // Section 2: Key Tactical Findings
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Key Tactical Findings & Correlation', 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  report.keyFindings.forEach((finding, idx) => {
    const lines = doc.splitTextToSize(`• ${finding}`, 178);
    doc.text(lines, 18, y);
    y += lines.length * 5 + 2;
  });

  y += 6;

  // Section 3: Graph Topology Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Network Graph & Flow Topology', 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(`• Graph Topology Summary: ${report.networkSummary}`, 18, y);
  y += 6;
  doc.text(`• Forward Tracing Connections: ${report.forwardCount} downstream entities`, 18, y + 6);
  doc.text(`• Backward Tracing Connections: ${report.backwardCount} upstream supplier sources`, 18, y + 12);

  y += 24;

  // Section 4: Interdiction Recommendations
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('4. Recommended Interdiction & Action Plan', 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  report.recommendations.forEach((rec) => {
    const lines = doc.splitTextToSize(`[ACTION] ${rec}`, 178);
    doc.text(lines, 18, y);
    y += lines.length * 5 + 2;
  });

  // Footer Disclaimer
  doc.setFont('courier', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('NARCO-TRACE AI // OFFICIAL LAW ENFORCEMENT INVESTIGATION REPORT // SYNTHETIC DEMO DATA', 14, 285);

  // Save PDF
  doc.save(`NARCO-TRACE_REPORT_${report.caseId}.pdf`);
};
