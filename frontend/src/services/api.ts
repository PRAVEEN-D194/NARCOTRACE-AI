import axios from 'axios';
import {
  Case,
  NetworkData,
  Evidence,
  RiskAssessment,
  IntelligenceFinding,
  AuditLog,
  ReportSummary,
} from '../types';
import {
  MOCK_CASES,
  MOCK_NETWORK_DATA,
  MOCK_EVIDENCE,
  MOCK_RISK_ASSESSMENTS,
  MOCK_INTELLIGENCE_FINDINGS,
  MOCK_AUDIT_LOGS,
  CURRENT_INVESTIGATOR,
} from '../data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA !== 'false';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor to inject investigator headers for RBAC gating
apiClient.interceptors.request.use((config) => {
  const userJson = localStorage.getItem('narco_trace_user');
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      if (user.role) {
        config.headers['X-Investigator-Role'] = user.role;
      }
      if (user.name) {
        config.headers['X-Investigator-Name'] = user.name;
      }
      if (user.badgeNumber) {
        config.headers['X-Investigator-Badge'] = user.badgeNumber;
      }
      const token = localStorage.getItem('narco_trace_token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Error parsing user JSON from localStorage:', e);
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Helper for realistic async delay during mock mode
const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  // 1. Dashboard Overview Stats
  async getDashboard() {
    if (USE_MOCK) {
      await delay(200);
      return {
        activeCasesCount: MOCK_CASES.filter((c) => c.status === 'ACTIVE').length,
        highPriorityCount: MOCK_CASES.filter((c) => c.priority === 'HIGH').length,
        mediumPriorityCount: MOCK_CASES.filter((c) => c.priority === 'MEDIUM').length,
        totalEvidenceCount: 138, // Synthetic total count as per prompt
        networkAlertsCount: 12,
        recentCases: MOCK_CASES.slice(0, 5),
        recentActivity: MOCK_AUDIT_LOGS.slice(0, 5),
      };
    }
    const response = await apiClient.get('/dashboard');
    return response.data;
  },

  // 2. Cases Management
  async getCases(params?: { search?: string; priority?: string; status?: string }) {
    if (USE_MOCK) {
      await delay(200);
      let cases = [...MOCK_CASES];
      if (params?.search) {
        const query = params.search.toLowerCase();
        cases = cases.filter(
          (c) =>
            c.id.toLowerCase().includes(query) ||
            c.title.toLowerCase().includes(query) ||
            c.subject.toLowerCase().includes(query)
        );
      }
      if (params?.priority && params.priority !== 'ALL') {
        cases = cases.filter((c) => c.priority === params.priority);
      }
      if (params?.status && params.status !== 'ALL') {
        cases = cases.filter((c) => c.status === params.status);
      }
      return cases;
    }
    const response = await apiClient.get('/cases', { params });
    return response.data;
  },

  // 3. Single Case Details by ID
  async getCaseById(caseId: string): Promise<Case | null> {
    if (USE_MOCK) {
      await delay(200);
      const found = MOCK_CASES.find((c) => c.id === caseId);
      return found || MOCK_CASES[0];
    }
    const response = await apiClient.get(`/cases/${caseId}`);
    return response.data;
  },

  // 4. Network Graph Visualization Data
  async getNetwork(caseId: string): Promise<NetworkData> {
    if (USE_MOCK) {
      await delay(300);
      return MOCK_NETWORK_DATA[caseId] || MOCK_NETWORK_DATA['CASE-2026-041'];
    }
    const response = await apiClient.get(`/network/${caseId}`);
    return response.data;
  },

  // 5. Evidence Viewer
  async getEvidence(caseId?: string): Promise<Evidence[]> {
    if (USE_MOCK) {
      await delay(250);
      if (caseId) {
        return MOCK_EVIDENCE.filter((e) => e.relatedCaseId === caseId);
      }
      return MOCK_EVIDENCE;
    }
    const response = await apiClient.get('/evidence', { params: { caseId } });
    return response.data;
  },

  // 6. Intelligence Cell Findings
  async getIntelligence(caseId?: string): Promise<IntelligenceFinding[]> {
    if (USE_MOCK) {
      await delay(250);
      return MOCK_INTELLIGENCE_FINDINGS;
    }
    const response = await apiClient.get('/intelligence', { params: { caseId } });
    return response.data;
  },

  // 7. Risk / Threat Intelligence
  async getRisk(caseId: string): Promise<RiskAssessment> {
    if (USE_MOCK) {
      await delay(200);
      return MOCK_RISK_ASSESSMENTS[caseId] || MOCK_RISK_ASSESSMENTS['CASE-2026-041'];
    }
    const response = await apiClient.get(`/risk/${caseId}`);
    return response.data;
  },

  // 8. Report Generation
  async generateReport(caseId: string): Promise<ReportSummary> {
    if (USE_MOCK) {
      await delay(400);
      const c = MOCK_CASES.find((item) => item.id === caseId) || MOCK_CASES[0];
      return {
        caseId: c.id,
        generatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        generatedBy: 'Agent J. Miller (Badge #LE-8902)',
        subject: c.subject,
        riskScore: c.riskScore,
        riskLevel: c.priority,
        summary: c.summary,
        keyFindings: [
          'Direct correlation confirmed between Dark Web handle DarkWolf23 and Telegram account Wolf_23 (91% confidence).',
          'Primary financial siphon wallet Wallet-X (0x71C7...976F) identified transferring 14.8 ETH into tumbler protocols.',
          'Eigenvector graph centrality designates subject node as primary logistical bottleneck for regional distribution.',
        ],
        evidenceCount: c.evidenceIds.length,
        networkSummary: `Analyzed graph of ${c.nodeCount} total connected nodes (${c.forwardConnectionsCount} forward, ${c.backwardConnectionsCount} backward).`,
        forwardCount: c.forwardConnectionsCount,
        backwardCount: c.backwardConnectionsCount,
        recommendations: [
          'Issue international multi-jurisdictional freeze order on Ethereum wallet 0x71C7656EC8ab88c098defB751B7401B5f6d8976F.',
          'Subpoena Telegram API relay telemetry logs for node @Wolf_Relay_Bot.',
          'Escalated to High Priority tactical interdiction team.',
        ],
      };
    }
    const response = await apiClient.post(`/reports/${caseId}/generate`);
    return response.data;
  },

  // 9. Audit Trail Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    if (USE_MOCK) {
      await delay(200);
      return MOCK_AUDIT_LOGS;
    }
    const response = await apiClient.get('/audit');
    return response.data;
  },

  // Helper for logging audit event
  async logAuditEvent(action: string, caseId: string, details?: string): Promise<void> {
    if (USE_MOCK) {
      MOCK_AUDIT_LOGS.unshift({
        id: `AUD-${Math.floor(8800 + Math.random() * 1000)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        investigatorId: 'INV-8902',
        investigatorName: 'Agent J. Miller',
        action,
        caseId,
        result: 'Success',
        ipAddress: '10.240.18.42',
        details,
      });
      return;
    }
    await apiClient.post('/audit', { action, caseId, details });
  },

  // 10. Login Authentication
  async login(badgeNumber: string, secretKey: string) {
    if (USE_MOCK) {
      await delay(200);
      return {
        user: CURRENT_INVESTIGATOR,
        access_token: 'MOCK-TOKEN'
      };
    }
    const response = await apiClient.post('/auth/login', {
      username: badgeNumber,
      password: secretKey
    });
    return response.data;
  }
};
