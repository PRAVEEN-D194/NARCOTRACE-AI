export type PriorityLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type CaseStatus = 'ACTIVE' | 'UNDER_REVIEW' | 'CLOSED' | 'ARCHIVED';
export type EntityType = 'Person' | 'Account' | 'Wallet' | 'Platform' | 'Organization' | 'Location';
export type VerificationStatus = 'Verified' | 'Pending' | 'Flagged' | 'Unverified';
export type IntelligenceStatus = 'Validated' | 'Pending Review' | 'Flagged' | 'Restricted';
export type ClassificationLevel = 'LAW ENFORCEMENT SENSITIVE' | 'RESTRICTED INTELLIGENCE' | 'CONTROLLED ACCESS';

export interface Investigator {
  id: string;
  name: string;
  badgeNumber: string;
  agency: string;
  clearanceLevel: string;
  avatarUrl?: string;
}

export interface Alias {
  name: string;
  platform: string;
  firstSeen?: string;
  confidence: number;
}

export interface Wallet {
  address: string;
  blockchain: string;
  balance?: string;
  riskScore: number;
}

export interface Case {
  id: string;
  title: string;
  subject: string;
  priority: PriorityLevel;
  status: CaseStatus;
  riskScore: number; // e.g. 94/100
  aliases: Alias[];
  wallets: Wallet[];
  nodeCount: number;
  forwardConnectionsCount: number;
  backwardConnectionsCount: number;
  evidenceIds: string[];
  lastActivity: string;
  createdAt: string;
  assignedInvestigator: string;
  summary: string;
  tags: string[];
}

export interface NetworkNode {
  id: string;
  label: string;
  type: EntityType;
  platform?: string;
  riskScore: number;
  riskLevel: PriorityLevel;
  aliases?: string[];
  connectedWallets?: string[];
  connectionCount: number;
  evidenceCount: number;
  evidenceIds: string[];
  isSubject?: boolean;
}

export interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  relationship: string; // e.g. 'Telegram Alias', 'Transaction', 'Supplier Link'
  direction: 'forward' | 'backward' | 'bidirectional';
  confidence: number;
  transactionAmount?: string;
  timestamp?: string;
}

export interface NetworkData {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

export interface Evidence {
  id: string;
  title: string;
  type: 'Dark-Web Listing' | 'Telegram Identity' | 'Wallet Transaction' | 'Encrypted Chat' | 'IP Access Log' | 'Financial Transfer';
  relatedCaseId: string;
  relatedEntityId: string;
  relatedEntityName: string;
  status: VerificationStatus;
  integrityStatus: 'SHA-256 Validated' | 'Chain Intact' | 'Verification Pending';
  sha256Hash: string; // Clearly labeled as synthetic demo hash when in mock mode
  timestamp: string;
  source: string;
  details: string;
  classification: ClassificationLevel;
}

export interface RiskFactor {
  category: string;
  points: number;
  description: string;
}

export interface RiskAssessment {
  caseId: string;
  overallScore: number; // 94
  maxScore: number; // 100
  riskLevel: PriorityLevel;
  engineVersion: string;
  generatedBy: string; // "Backend Member 4 Risk Engine"
  factors: RiskFactor[];
  lastUpdated: string;
}

export interface IntelligenceFinding {
  id: string;
  finding: string;
  confidence: number; // e.g. 91 (for 91%)
  relatedEntities: string[];
  evidenceIds: string[];
  validationStatus: IntelligenceStatus;
  authorizationStatus: 'AUTHORIZED' | 'RESTRICTED_ACCESS' | 'PENDING_APPROVAL';
  classification: ClassificationLevel;
  isControlled: boolean; // true = CONTROLLED INTELLIGENCE, false = RAW/RESTRICTED
  timestamp: string;
  summary: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  investigatorId: string;
  investigatorName: string;
  action: string;
  caseId: string;
  result: 'Success' | 'Denied' | 'Warning';
  ipAddress: string;
  details?: string;
}

export interface ReportSummary {
  caseId: string;
  generatedAt: string;
  generatedBy: string;
  subject: string;
  riskScore: number;
  riskLevel: PriorityLevel;
  summary: string;
  keyFindings: string[];
  evidenceCount: number;
  networkSummary: string;
  forwardCount: number;
  backwardCount: number;
  recommendations: string[];
}
